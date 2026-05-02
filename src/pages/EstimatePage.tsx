import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Calculator, Plus, Minus, Trash2, Download, Printer } from 'lucide-react'
import { SITE_URL } from '@/config/env'
import { gtagEvent } from '@/config/analytics'
import { buildAutoEstimate } from '@/utils/estimate'
import { printEstimateDocument } from '@/utils/print'
import { formatMoney } from '@/utils/formatters'
import type { Product, EstimateItem, EstimateLine } from '@/types'

export default function EstimatePage({
  products,
  items,
  setItems,
}: {
  products: Product[]
  items: EstimateItem[]
  setItems: (updater: EstimateItem[] | ((prev: EstimateItem[]) => EstimateItem[])) => void
}) {
  const [area, setArea] = useState('')
  const [complexity, setComplexity] = useState('')
  const [objectType, setObjectType] = useState('Склад')
  const [autoLines, setAutoLines] = useState<EstimateLine[]>([])
  const [manualLines] = useState<EstimateLine[]>([])
  const [pdfStatus, setPdfStatus] = useState('')
  const [attention, setAttention] = useState({ workplaces: '', points: '' })

  useEffect(() => {
    const stored = localStorage.getItem('vsb39_hero_request')
    if (stored) {
      parseEstimateRequest(stored)
    }
  }, [])

  function parseEstimateRequest(request: string) {
    const lower = request.toLowerCase()
    let type = 'Склад'
    if (lower.includes('дом') || lower.includes('коттедж')) type = 'Дом'
    else if (lower.includes('офис')) type = 'Офис'
    else if (lower.includes('магазин')) type = 'Магазин'
    else if (lower.includes('производ')) type = 'Производство'
    else if (lower.includes('склад')) type = 'Склад'

    const areaMatch = lower.match(/(\d+[\s\xa0]?\d*)\s*м²?/)
    if (areaMatch) {
      const cleanArea = areaMatch[1].replace(/\s/g, '').replace(/\xa0/g, '')
      if (!area) setArea(cleanArea)
    }
    if (!objectType || objectType === 'Склад') setObjectType(type)
  }

  function handleGenerate() {
    if (!area || !complexity) return
    const result = buildAutoEstimate(products, Number(area), complexity, objectType, attention)
    setAutoLines(result.lines)
    setPdfStatus('')
    gtagEvent('generate_estimate', { area, complexity, object_type: objectType })
  }

  const autoTotals = useMemo(() => {
    return autoLines.reduce(
      (acc, line) => {
        const sum = line.price * line.qty
        if (line.type === 'equipment') acc.equipment += sum
        else if (line.type === 'work') acc.work += sum
        return acc
      },
      { equipment: 0, work: 0 }
    )
  }, [autoLines])

  const manualTotal = useMemo(
    () => manualLines.reduce((sum, line) => sum + line.price * line.qty, 0),
    [manualLines]
  )

  const totals = {
    equipment: autoTotals.equipment,
    work: autoTotals.work,
    manual: manualTotal,
    total: autoTotals.equipment + autoTotals.work + manualTotal,
  }

  const metrics = useMemo(() => {
    const cameraQty = autoLines.filter(l => l.id.startsWith('auto-camera')).reduce((s, l) => s + l.qty, 0)
    const cableQty = autoLines.filter(l => l.id.startsWith('auto-cable')).reduce((s, l) => s + l.qty, 0)
    const switchQty = autoLines.filter(l => l.id.startsWith('auto-switch')).reduce((s, l) => s + l.qty, 0)
    const buildingLength = Number(area) ? `${Math.round(Number(area) / 10)}` : '—'
    return { buildingLength, cameraQty, cableQty, switchQty }
  }, [autoLines, area])

  function handlePrint() {
    const ok = printEstimateDocument({
      objectType,
      area,
      complexity,
      autoLines,
      manualLines,
      totals,
      metrics,
    })
    setPdfStatus(ok ? 'Окно печати открыто' : 'Ошибка печати')
    gtagEvent('print_estimate')
  }

  function handleExportPDF() {
    handlePrint()
    setPdfStatus('Экспорт сметы — откройте печать и выберите «Сохранить как PDF»')
  }

  const objectTypes = ['Склад', 'Офис', 'Магазин', 'Производство', 'Дом']
  const complexityOptions = [
    { value: 'simple', label: 'Простая — 2 Мп, базовый обзор' },
    { value: 'medium', label: 'Стандартная — 4 Мп, детализация лиц и номеров' },
    { value: 'hard', label: 'Сложная — 8 Мп, аналитика, ночная съёмка, +30% камер' },
  ]

  return (
    <main>
      <Helmet>
        <title>Калькулятор сметы ВСБ39</title>
        <meta name="description" content="Предварительный расчёт стоимости оборудования, монтажа и проекта системы безопасности." />
        <link rel="canonical" href={`${SITE_URL}/estimate`} />
        <meta property="og:url" content={`${SITE_URL}/estimate`} />
      </Helmet>
      <section className="knowledge-page">
        <div>
          <h1>Калькулятор сметы</h1>
          <p>Предварительный расчёт стоимости оборудования, монтажа и проекта системы безопасности.</p>
        </div>
      </section>
      <section className="estimate-page">
        <div className="estimate-controls">
          <label>
            Тип объекта
            <select value={objectType} onChange={e => setObjectType(e.target.value)}>
              {objectTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Площадь (м²)
            <input value={area} onChange={e => setArea(e.target.value)} inputMode="numeric" placeholder="1200" />
          </label>
          <label>
            Сложность проекта
            <select value={complexity} onChange={e => setComplexity(e.target.value)}>
              <option value="">Выберите</option>
              {complexityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>
            Рабочих мест / зон внимания
            <input value={attention.workplaces} onChange={e => setAttention(a => ({ ...a, workplaces: e.target.value }))} inputMode="numeric" placeholder="8" />
          </label>
          <label>
            Точек приёма / входов
            <input value={attention.points} onChange={e => setAttention(a => ({ ...a, points: e.target.value }))} inputMode="numeric" placeholder="3" />
          </label>
          <button className="btn btn-blue" onClick={handleGenerate}>
            <Calculator size={18} />Рассчитать смету
          </button>
        </div>
        {!!autoLines.length && (
          <div className="estimate-result">
            <div className="estimate-metrics">
              {[
                ['Длина здания', metrics.buildingLength, 'м'],
                ['Камер', metrics.cameraQty, 'шт'],
                ['Кабель', metrics.cableQty, 'м'],
                ['PoE-коммутаторов', metrics.switchQty, 'шт'],
              ].map(([label, value, unit]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value} {unit}</strong>
                </div>
              ))}
            </div>
            <table className="estimate-table">
              <thead>
                <tr>
                  <th>Позиция</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {autoLines.map(line => (
                  <tr key={line.id}>
                    <td>
                      <strong>{line.name}</strong>
                      <small>{line.note}</small>
                    </td>
                    <td>{line.qty} {line.unit || 'шт'}</td>
                    <td>{formatMoney(line.price, line.unit)}</td>
                    <td>{formatMoney(line.price * line.qty)}</td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="estimate-summary">
              <div>
                <span>Оборудование</span>
                <strong>{formatMoney(totals.equipment)}</strong>
              </div>
              <div>
                <span>Монтаж и настройка</span>
                <strong>{formatMoney(totals.work)}</strong>
              </div>
              {!!manualTotal && (
                <div>
                  <span>Дополнительно</span>
                  <strong>{formatMoney(totals.manual)}</strong>
                </div>
              )}
              <div className="total-row">
                <span>Итого</span>
                <strong>{formatMoney(totals.total)}</strong>
              </div>
            </div>
            <div className="estimate-actions">
              <button className="btn btn-outline" onClick={handlePrint}>
                <Printer size={17} />Печать
              </button>
              <button className="btn btn-outline" onClick={handleExportPDF}>
                <Download size={17} />PDF
              </button>
              {pdfStatus && <span className="pdf-status">{pdfStatus}</span>}
            </div>
          </div>
        )}
        {!!items.length && (
          <div className="estimate-manual">
            <h3>Добавлено из каталога</h3>
            <table className="estimate-table">
              <thead>
                <tr>
                  <th>Позиция</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <div className="qty-controls">
                        <button onClick={() => setItems(current => current.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}>
                          <Minus size={14} />
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => setItems(current => current.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td>{formatMoney(item.price, item.unit)}</td>
                    <td>{formatMoney(item.price * item.qty)}</td>
                    <td>
                      <button onClick={() => setItems(current => current.filter(i => i.id !== item.id))}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
