import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader2, ShoppingCart, Check, ShieldCheck } from 'lucide-react'
import { apiRequest, type ApiMaterial } from '@/lib/api'
import { useEstimate, type EstimateItem } from '@/components/estimate/EstimateContext'
import { cn } from '@/lib/utils'

const fallbackImageByCategory: Record<string, string> = {
  Камеры: '/catalog-camera-1.jpg',
  Регистраторы: '/catalog-nvr-1.jpg',
  СКУД: '/catalog-skud-1.jpg',
  ОПС: '/catalog-skud-1.jpg',
  Сеть: '/catalog-network-1.jpg',
  Кабель: '/catalog-network-1.jpg',
}

function materialToEstimateItem(material: ApiMaterial): EstimateItem {
  return {
    id: String(material.id),
    name: material.name,
    sku: material.sku || String(material.id),
    brand: material.brand || 'Без бренда',
    price: Math.round(material.price || 0),
    quantity: 1,
    image: material.image_url || fallbackImageByCategory[material.category || ''] || '/catalog-camera-1.jpg',
    category: material.category || 'Оборудование',
  }
}

function splitCharacteristics(value?: string) {
  const text = (value || '').replace(/\r/g, '\n').trim()
  if (!text) return []
  const parts = text
    .split(/\n|;| • | \| /)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  if (parts.length > 1) return parts.slice(0, 18)
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 10)
}

export default function ProductDetails() {
  const { id } = useParams()
  const { addItem, items } = useEstimate()
  const [material, setMaterial] = useState<ApiMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiRequest<ApiMaterial>(`/materials/${id}`)
      .then((data) => {
        if (!cancelled) setMaterial(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось открыть товар')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const estimateItem = useMemo(() => material ? materialToEstimateItem(material) : null, [material])
  const inEstimate = Boolean(estimateItem && items.some((item) => item.id === estimateItem.id))
  const characteristicRows = splitCharacteristics(material?.characteristics)
  const image = material?.image_url || fallbackImageByCategory[material?.category || ''] || '/catalog-camera-1.jpg'

  const handleAdd = () => {
    if (!estimateItem) return
    addItem(estimateItem)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div className="min-h-screen bg-midnight pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-text-body hover:text-guard-green transition-colors mb-6">
          <ArrowLeft size={16} /> Назад в каталог
        </Link>

        {loading && (
          <div className="min-h-[420px] flex items-center justify-center text-text-body">
            <Loader2 size={22} className="animate-spin mr-2 text-guard-green" /> Загружаем карточку товара...
          </div>
        )}

        {!loading && error && (
          <div className="border border-border-subtle bg-charcoal rounded-xl p-8 text-text-body">
            {error}
          </div>
        )}

        {!loading && material && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,520px)_1fr] gap-8 items-start">
            <div className="bg-charcoal border border-border-subtle rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-deep-navy">
                <img src={image} alt={material.name} className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-guard-green/15 text-guard-green text-xs uppercase tracking-wide">
                    {material.brand || 'Без бренда'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-pure-white/10 text-text-body text-xs uppercase tracking-wide">
                    {material.category || 'Оборудование'}
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-pure-white leading-tight mb-3">
                  {material.name}
                </h1>
                <p className="text-sm text-text-muted">Артикул: {material.sku || material.id}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="font-mono text-3xl font-semibold text-guard-green">
                  {Math.round(material.price || 0).toLocaleString('ru-RU')} ₽
                </div>
                <button
                  onClick={handleAdd}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition-all',
                    added || inEstimate
                      ? 'bg-guard-green/20 text-guard-green'
                      : 'bg-guard-green text-deep-navy hover:brightness-110'
                  )}
                >
                  {added || inEstimate ? <Check size={18} /> : <ShoppingCart size={18} />}
                  {added || inEstimate ? 'В смете' : 'Добавить в смету'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border border-border-subtle rounded-lg p-4">
                  <div className="text-xs text-text-muted mb-1">Источник</div>
                  <div className="text-sm text-pure-white break-words">{material.source || 'Прайс / интернет'}</div>
                </div>
                <div className="border border-border-subtle rounded-lg p-4">
                  <div className="text-xs text-text-muted mb-1">Фото</div>
                  <div className="text-sm text-pure-white">{material.photo_status === 'ready' ? 'Найдено' : 'Нет / ищется'}</div>
                </div>
                <div className="border border-border-subtle rounded-lg p-4">
                  <div className="text-xs text-text-muted mb-1">Ед. изм.</div>
                  <div className="text-sm text-pure-white">{material.unit || 'шт'}</div>
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="font-display text-xl text-pure-white">Характеристики и описание</h2>
                {characteristicRows.length > 0 ? (
                  <div className="border border-border-subtle rounded-xl overflow-hidden">
                    {characteristicRows.map((row, index) => (
                      <div key={`${row}-${index}`} className="px-4 py-3 border-b border-border-subtle last:border-b-0 text-sm text-text-body">
                        {row}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-border-subtle rounded-xl p-5 text-text-body">
                    Характеристик пока нет в базе. При открытии карточки система пробует найти их на сайте производителя или Tinko.
                  </div>
                )}
              </section>

              {material.product_url && (
                <a
                  href={material.product_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-guard-green hover:underline"
                >
                  <ExternalLink size={16} /> Открыть источник характеристик
                </a>
              )}

              <div className="flex items-start gap-3 text-sm text-text-muted">
                <ShieldCheck size={18} className="text-guard-green mt-0.5 shrink-0" />
                <p>Перед закупкой лучше сверить совместимость с объектом: питание, PoE/Wi-Fi, регистратор, условия установки и кабельные трассы.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
