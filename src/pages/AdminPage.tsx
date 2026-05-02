import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Upload, Database, Cog, Plus, Bot, Camera, Save, Trash2,
  ArrowLeft, Download, ArrowRight, Phone
} from 'lucide-react'
import { VSEGPT_PROXY_URL } from '@/config/env'
import { aiProfiles } from '@/data/constants'
import { gtagEvent } from '@/config/analytics'
import { cellText } from '@/utils/formatters'
import { makeProduct } from '@/utils/parsePrice'
import { navigateTo } from '@/utils/router'
import type { Product } from '@/types'

async function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

export default function AdminPage({
  onImport,
  onAddProduct,
  productsCount,
  estimateCount,
  onResetLocalDb,
}: {
  products: Product[]
  onImport: (imported: Product[]) => void
  onAddProduct: (product: Product) => void
  onUpdateProducts: (updater: Product[] | ((current: Product[]) => Product[])) => void
  productsCount: number
  estimateCount: number
  onResetLocalDb: () => void
}) {
  const [tab, setTab] = useState('prices')
  const [parserStatus, setParserStatus] = useState('')
  const [fileName, setFileName] = useState('')
  const [parserProducts, setParserProducts] = useState<Product[]>([])
  const [importPreview, setImportPreview] = useState(false)
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiStatus, setAiStatus] = useState('')
  const [selectedProfile, setSelectedProfile] = useState(0)
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('vsb39_vsegpt_key') || '' } catch { return '' }
  })
  const [manualProduct, setManualProduct] = useState<Partial<Product>>({
    name: '', brand: '', category: 'Камеры', price: 0, resolution: '4MP',
    poe: true, outdoor: true, analytics: '', stock: 0,
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  async function parseFile(file: File) {
    setParserStatus('Читаю файл...')
    try {
      const buffer = await readFileArrayBuffer(file)
      const isXlsx = file.name.match(/\.(xlsx?|xls)$/i)
      if (isXlsx) {
        const { read, utils } = await import('xlsx')
        const workbook = read(buffer, { type: 'array', cellFormula: true, cellNF: true, cellStyles: true })
        const photoMap: Record<string, string> = {}
        let allRows: Record<string, unknown>[] = []
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const range = utils.decode_range(worksheet['!ref'] || 'A1')
          const headers: string[] = []
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cell = worksheet[utils.encode_cell({ r: range.s.r, c: col })]
            headers.push(cellText(cell?.v))
          }
          const rows: Record<string, unknown>[] = []
          for (let row = range.s.r + 1; row <= range.e.r; row++) {
            const rowData: Record<string, unknown> = {}
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cell = worksheet[utils.encode_cell({ r: row, c: col })]
              const header = headers[col - range.s.c]
              if (cell?.v !== undefined) rowData[header] = cell.v
            }
            if (Object.keys(rowData).length > 0) rows.push(rowData)
          }
          allRows = [...allRows, ...rows]
        }
        const products = allRows.map(row => makeProduct(row, file.name, photoMap))
        setParserProducts(products)
        setParserStatus(`Найдено ${products.length} позиций из ${file.name}`)
        setImportPreview(true)
        gtagEvent('parse_file', { type: 'xlsx', count: products.length })
      } else {
        const text = new TextDecoder('utf-8').decode(buffer)
        const isJson = file.name.endsWith('.json')
        if (isJson) {
          const data = JSON.parse(text)
          const arr = Array.isArray(data) ? data : data.products || data.items || []
          const parsed = arr.map((item: Record<string, unknown>) => makeProduct(item, file.name, {}))
          setParserProducts(parsed)
          setParserStatus(`Найдено ${parsed.length} позиций из JSON`)
        } else {
          const lines = text.split('\n').filter(Boolean)
          const sep = lines[0]?.includes('\t') ? '\t' : ';'
          const headers = lines[0]?.split(sep).map(h => h.trim()) || []
          const rows = lines.slice(1).map(line => {
            const values = line.split(sep)
            return headers.reduce((obj, h, i) => {
              obj[h] = values[i]?.trim() || ''
              return obj
            }, {} as Record<string, unknown>)
          })
          const parsed = rows.map(row => makeProduct(row, file.name, {}))
          setParserProducts(parsed)
          setParserStatus(`Найдено ${parsed.length} позиций из CSV`)
        }
        setImportPreview(true)
        gtagEvent('parse_file', { type: isJson ? 'json' : 'csv', count: parserProducts.length })
      }
    } catch (err) {
      setParserStatus(`Ошибка парсинга: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async function submitAi() {
    const text = aiInput.trim()
    if (!text) return
    setAiMessages(current => [...current, { role: 'user', text }])
    setAiInput('')
    setAiStatus('Отправляю запрос...')
    const profile = aiProfiles[selectedProfile]
    try {
      const response = await fetch(`${VSEGPT_PROXY_URL}/${profile.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: profile.model,
          messages: [
            { role: 'system', content: `Ты — ${profile.role} для ВСБ39.` },
            ...aiMessages.slice(-6).map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: text },
          ],
        }),
      })
      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || 'Нет ответа от модели'
      setAiMessages(current => [...current, { role: 'assistant', text: reply }])
      setAiStatus('')
    } catch {
      setAiMessages(current => [...current, { role: 'assistant', text: 'Ошибка соединения. Проверьте настройки прокси.' }])
      setAiStatus('Ошибка')
    }
  }

  function importFromParser() {
    onImport(parserProducts)
    setParserProducts([])
    setImportPreview(false)
    setParserStatus('Импортировано в каталог')
  }

  const tabs = [
    ['prices', 'Прайсы', Database],
    ['ai', 'AI', Bot],
    ['settings', 'Настройки', Cog],
    ['manual', 'Ручной ввод', Plus],
    ['marketing', 'Маркетинг', Camera],
    ['calls', 'Звонки', Phone],
  ] as const

  return (
    <main className="admin-page">
      <Helmet>
        <title>Админка ВСБ39</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-head">
        <button onClick={() => navigateTo('home')}>
          <ArrowLeft size={18} /> На сайт
        </button>
        <span>Админка ВСБ39</span>
        <small>{productsCount} товаров · {estimateCount} в смете</small>
      </div>
      <div className="admin-tabs">
        {tabs.map(([key, label, Icon]) => (
          <button key={key} className={tab === key ? 'tab-active' : ''} onClick={() => setTab(key)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
      {tab === 'prices' && (
        <div className="admin-section">
          <div className="parser-form">
            <h3><Upload size={18} /> Загрузить прайс</h3>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.json" onChange={e => {
              const file = e.target.files?.[0]
              if (file) { setFileName(file.name); parseFile(file) }
            }} />
            <button onClick={() => fileRef.current?.click()}>Выбрать файл</button>
            <small>{fileName || 'XLSX, CSV, JSON'}</small>
          </div>
          {parserStatus && <div className="parser-status">{parserStatus}</div>}
          {importPreview && !!parserProducts.length && (
            <div className="import-preview">
              <div className="preview-header">
                <h4>Найдено {parserProducts.length} позиций</h4>
                <button className="btn btn-blue" onClick={importFromParser}>
                  <Download size={16} /> Импортировать
                </button>
              </div>
              <div className="preview-grid">
                {parserProducts.slice(0, 10).map(product => (
                  <div key={product.id} className="preview-item">
                    <strong>{product.name}</strong>
                    <span>{product.brand} · {product.category} · {product.price > 0 ? product.price + ' ₽' : '—'}</span>
                  </div>
                ))}
                {parserProducts.length > 10 && (
                  <div className="preview-more">...и ещё {parserProducts.length - 10} позиций</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === 'ai' && (
        <div className="admin-section">
          <div className="ai-config">
            <label>API-ключ VseGPT</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); try { localStorage.setItem('vsb39_vsegpt_key', e.target.value) } catch {} }}
              placeholder="sk-..."
            />
            <select value={selectedProfile} onChange={e => setSelectedProfile(Number(e.target.value))}>
              {aiProfiles.map((p, i) => <option key={i} value={i}>{p.role} — {p.model}</option>)}
            </select>
          </div>
          <div className="ai-chat">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>{msg.text}</div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="ai-input">
            <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitAi()} placeholder="Вопрос для AI..." />
            <button onClick={submitAi}><ArrowRight size={18} /></button>
          </div>
          {aiStatus && <div className="ai-status">{aiStatus}</div>}
        </div>
      )}
      {tab === 'manual' && (
        <div className="admin-section">
          <h3>Добавить товар вручную</h3>
          <div className="manual-form">
            <input value={manualProduct.name || ''} onChange={e => setManualProduct(p => ({ ...p, name: e.target.value }))} placeholder="Название" />
            <input value={manualProduct.brand || ''} onChange={e => setManualProduct(p => ({ ...p, brand: e.target.value }))} placeholder="Бренд" />
            <select value={manualProduct.category || 'Камеры'} onChange={e => setManualProduct(p => ({ ...p, category: e.target.value }))}>
              {['Камеры', 'Регистраторы', 'СКУД', 'ОПС', 'Сеть', 'Работы', 'Разное'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={manualProduct.price || 0} onChange={e => setManualProduct(p => ({ ...p, price: Number(e.target.value) }))} placeholder="Цена" inputMode="numeric" />
            <input value={manualProduct.resolution || ''} onChange={e => setManualProduct(p => ({ ...p, resolution: e.target.value }))} placeholder="Разрешение" />
            <label><input type="checkbox" checked={manualProduct.poe} onChange={e => setManualProduct(p => ({ ...p, poe: e.target.checked }))} /> PoE</label>
            <label><input type="checkbox" checked={manualProduct.outdoor} onChange={e => setManualProduct(p => ({ ...p, outdoor: e.target.checked }))} /> Уличная</label>
            <input value={manualProduct.analytics || ''} onChange={e => setManualProduct(p => ({ ...p, analytics: e.target.value }))} placeholder="Аналитика" />
            <button className="btn btn-blue" onClick={() => {
              if (!manualProduct.name) return
              const id = `manual-${Date.now()}`
              onAddProduct({ ...manualProduct, id, source: 'manual', stock: manualProduct.stock || 0, specFilters: [], tags: [], wdr: false, mic: false, audio: false, ik: false, colorNight: false } as Product)
              setManualProduct({ name: '', brand: '', category: 'Камеры', price: 0, resolution: '4MP', poe: true, outdoor: true, analytics: '', stock: 0 })
            }}><Save size={16} /> Сохранить</button>
          </div>
        </div>
      )}
      {tab === 'settings' && (
        <div className="admin-section">
          <h3>Системные настройки</h3>
          <button className="btn btn-outline" onClick={onResetLocalDb}>
            <Trash2 size={16} /> Сбросить локальную базу
          </button>
          <p><small>Все товары и сметы будут удалены. База пересоздастся при следующем запуске.</small></p>
        </div>
      )}
    </main>
  )
}
