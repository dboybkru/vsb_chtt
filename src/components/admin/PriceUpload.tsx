import type { FC } from 'react'
import { useState, useCallback, useRef } from 'react'
import { Upload, X, FileSpreadsheet, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiRequest, type MaterialsResponse } from '@/lib/api'

interface PreviewRow {
  id: number
  name: string
  sku: string
  retail: string
  installer: string
  wholesale: string
}

const PRICE_LEVELS = ['Розница', 'Инсталлятор', 'Опт', 'Крупный опт', 'Партнёрская']
const CHUNK_SIZE = 128 * 1024
const DIRECT_UPLOAD_LIMIT = 512 * 1024

const PriceUpload: FC = () => {
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsing, setParsing] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [sheetName, setSheetName] = useState('Sheet1')
  const [headerRow, setHeaderRow] = useState('1')
  const [nameCol, setNameCol] = useState('A')
  const [priceCol, setPriceCol] = useState('B')
  const [skuCol, setSkuCol] = useState('C')
  const [extractPhotos, setExtractPhotos] = useState(true)
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['Розница', 'Инсталлятор', 'Опт'])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.match(/\.(xlsx|xls|pdf)$/i)
    )
    if (dropped.length) {
      setFiles((prev) => [...prev, ...dropped])
      void importFiles(dropped)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(
      (f) => f.name.match(/\.(xlsx|xls|pdf)$/i)
    )
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected])
      void importFiles(selected)
    }
  }, [])

  const importFiles = async (selectedFiles: File[]) => {
    setUploadProgress(5)
    setParsing(true)
    setStatusText('Загружаем и парсим прайс...')
    setPreviewData([])

    try {
      let imported = 0
      let skipped = 0
      let enriched = 0
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index]
        if (!file.name.match(/\.(xlsx|xls|pdf)$/i)) {
          throw new Error('Сейчас поддерживаются Excel (.xlsx, .xls) и PDF. CSV/JSON подключу отдельным парсером.')
        }
        const result = await importPriceFile(file)
        imported += result.imported || 0
        skipped += result.skipped || 0
        enriched += result.enriched || 0
        setUploadProgress(Math.round(((index + 1) / selectedFiles.length) * 100))
      }

      const materials = await apiRequest<MaterialsResponse>('/materials?item_type=equipment&limit=5&offset=0')
      setPreviewData(
        materials.items.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku || String(item.id),
          retail: `${Math.round(item.price).toLocaleString('ru-RU')} ₽`,
          installer: '-',
          wholesale: '-',
        })),
      )
      setStatusText(`Импортировано: ${imported}, пропущено: ${skipped}. Оборудование добавлено в базу.`)
      if (extractPhotos && imported > 0 && enriched < imported) {
        void startPhotoEnrichment(imported)
      }
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : 'Не удалось импортировать прайс')
    } finally {
      setParsing(false)
      setUploadProgress(0)
    }
  }

  const startPhotoEnrichment = async (imported: number) => {
    try {
      setStatusText(`Импортировано: ${imported}. Фото ищутся в фоне, прайс уже сохранён.`)
      await apiRequest('/materials/enrich-photos/background', {
        method: 'POST',
        body: JSON.stringify({ limit: Math.min(imported, 1000), min_score: 0.7, check_prices: true }),
      })
      setStatusText(`Импортировано: ${imported}. Поиск фото запущен в фоне, можно продолжать работу.`)
    } catch {
      setStatusText(`Импортировано: ${imported}. Фото не удалось запустить автоматически, но прайс сохранён.`)
    }
  }

  const importPriceFile = async (file: File) => {
    if (file.name.match(/\.(xlsx|xls)$/i) && file.size > DIRECT_UPLOAD_LIMIT) {
      setStatusText('Большой Excel загружаем частями, чтобы не упереться в лимит HTTP 413...')
      return importPriceFileInChunks(file)
    }

    const form = new FormData()
    form.append('file', file)
    form.append('search_photos', 'false')
    try {
      return await apiRequest<{ imported: number; skipped: number; enriched?: number }>('/materials/import-ai', {
        method: 'POST',
        body: form,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (!message.includes('413') || !file.name.match(/\.(xlsx|xls)$/i)) throw error
      setStatusText('Сервер отклонил большой файл одним запросом. Загружаем прайс частями...')
      return importPriceFileInChunks(file)
    }
  }

  const importPriceFileInChunks = async (file: File) => {
    const total = Math.ceil(file.size / CHUNK_SIZE)
    const uploadId = `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`
    let finalResult: { imported: number; skipped: number; enriched?: number } | null = null

    for (let index = 0; index < total; index += 1) {
      setStatusText(`Загружаем часть ${index + 1} из ${total}...`)
      const chunk = file.slice(index * CHUNK_SIZE, Math.min(file.size, (index + 1) * CHUNK_SIZE))
      const form = new FormData()
      form.append('upload_id', uploadId)
      form.append('index', String(index))
      form.append('total', String(total))
      form.append('filename', file.name)
      form.append('search_photos', 'false')
      form.append('chunk', chunk, `${file.name}.part${index}`)
      const response = await apiRequest<{ imported?: number; skipped?: number; enriched?: number; status?: string }>(
        '/materials/import-ai-chunk',
        {
          method: 'POST',
          body: form,
        },
      )
      setUploadProgress(Math.max(5, Math.round(((index + 1) / total) * 100)))
      if (response.status === 'ok' || typeof response.imported === 'number') {
        finalResult = {
          imported: response.imported || 0,
          skipped: response.skipped || 0,
          enriched: response.enriched || 0,
        }
      }
    }

    if (!finalResult) throw new Error('Файл загружен частями, но backend не вернул результат импорта')
    return finalResult
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
              isDragOver
                ? 'border-guard-green bg-[rgba(0,208,132,0.05)]'
                : 'border-border-subtle bg-charcoal hover:border-text-muted'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-guard-green/10 flex items-center justify-center">
                <Upload size={24} className="text-guard-green" />
              </div>
              <h3 className="font-display text-[20px] font-semibold text-pure-white">
                Перетащите файлы сюда
              </h3>
              <p className="text-sm text-text-muted">
                XLSX, XLS, PDF — до 50 МБ
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx,.xls,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                className="mt-2 gradient-guard text-white hover:brightness-110"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Выбрать файл
              </Button>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-charcoal rounded-xl border border-border-subtle p-4 space-y-2">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-midnight border border-border-subtle"
                  style={{
                    animation: `slideDown 0.25s ease-out ${i * 50}ms both`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={16} className="text-guard-green" />
                    <span className="text-sm text-pure-white">{file.name}</span>
                    <span className="text-xs text-text-muted">
                      {(file.size / 1024).toFixed(0)} КБ
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 rounded hover:bg-charcoal text-text-muted hover:text-pure-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="bg-charcoal rounded-xl border border-border-subtle p-4">
              <div className="h-2 bg-midnight rounded-full overflow-hidden">
                <div
                  className="h-full bg-guard-green transition-all duration-100"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-2 text-center">
                Загрузка... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {parsing && (
            <div className="bg-charcoal rounded-xl border border-border-subtle p-4 text-center">
              <p className="text-sm text-text-body">{statusText || 'Парсинг файла...'}</p>
            </div>
          )}

          {!parsing && statusText && (
            <div className="bg-charcoal rounded-xl border border-border-subtle p-4 text-center">
              <p className="text-sm text-text-body">{statusText}</p>
            </div>
          )}

          {/* Parsing Settings */}
          <div className="bg-charcoal rounded-xl border border-border-subtle p-5 space-y-4">
            <h3 className="font-display text-[16px] font-medium text-pure-white">
              Настройки парсинга
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-text-muted">Имя листа</Label>
                <Input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="bg-midnight border-border-subtle text-pure-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-muted">Строка заголовков</Label>
                <Input
                  type="number"
                  value={headerRow}
                  onChange={(e) => setHeaderRow(e.target.value)}
                  className="bg-midnight border-border-subtle text-pure-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-muted">Колонка названия</Label>
                <Input
                  value={nameCol}
                  onChange={(e) => setNameCol(e.target.value)}
                  className="bg-midnight border-border-subtle text-pure-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-muted">Колонка цены</Label>
                <Input
                  value={priceCol}
                  onChange={(e) => setPriceCol(e.target.value)}
                  className="bg-midnight border-border-subtle text-pure-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-muted">Колонка артикула</Label>
                <Input
                  value={skuCol}
                  onChange={(e) => setSkuCol(e.target.value)}
                  className="bg-midnight border-border-subtle text-pure-white"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={extractPhotos} onCheckedChange={setExtractPhotos} />
                <Label className="text-xs text-text-muted">
                  Найти фото в интернете
                </Label>
              </div>
            </div>
            <p className="text-xs text-text-muted">
              Фото не берём из прайса: ищем по наименованию. Для Optimus/Оптимус сначала optimus-cctv.ru, для Bolid/Болид сначала bolid.ru, затем tinko.ru.
            </p>

            {/* Price levels */}
            <div className="space-y-2">
              <Label className="text-xs text-text-muted">Ценовые уровни</Label>
              <div className="flex flex-wrap gap-2">
                {PRICE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedLevels.includes(level)
                        ? 'bg-guard-green/20 text-guard-green border border-guard-green'
                        : 'bg-midnight text-text-muted border border-border-subtle hover:text-pure-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Table */}
        <div className="space-y-4">
          <h3 className="font-display text-[16px] font-medium text-pure-white">
            Предпросмотр данных
          </h3>
          <div className="bg-charcoal rounded-xl border border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead className="text-text-muted text-xs">Фото</TableHead>
                    <TableHead className="text-text-muted text-xs">Название</TableHead>
                    <TableHead className="text-text-muted text-xs">Артикул</TableHead>
                    <TableHead className="text-text-muted text-xs">Розница</TableHead>
                    <TableHead className="text-text-muted text-xs">Инсталлятор</TableHead>
                    <TableHead className="text-text-muted text-xs">Опт</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.length > 0 ? (
                    previewData.map((row, i) => (
                      <TableRow
                        key={row.id}
                        className="border-border-subtle hover:bg-midnight/50"
                        style={{
                          animation: `fadeIn 0.3s ease-out ${i * 50}ms both`,
                        }}
                      >
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg bg-midnight flex items-center justify-center">
                            <FileSpreadsheet size={14} className="text-text-muted" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-pure-white">{row.name}</TableCell>
                        <TableCell className="text-sm text-text-body font-mono">{row.sku}</TableCell>
                        <TableCell className="text-sm text-guard-green font-mono">{row.retail}</TableCell>
                        <TableCell className="text-sm text-text-body font-mono">{row.installer}</TableCell>
                        <TableCell className="text-sm text-text-body font-mono">{row.wholesale}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-text-muted text-sm">
                        Загрузите файл для предпросмотра
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {previewData.length > 0 && (
            <Button className="w-full gradient-guard text-white hover:brightness-110">
              <Save size={16} className="mr-2" />
              Уже сохранено в каталог
            </Button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default PriceUpload
