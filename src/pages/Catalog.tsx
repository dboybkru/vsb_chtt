import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  Grid3X3,
  LayoutList,
  Rows3,
  ShoppingCart,
  Check,
  Minus,
  Plus,
  Trash2,
  ChevronUp,
  ArrowRight,
  FileText,
  Heart,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { useCatalog } from '@/hooks/useCatalog'
import { tierColorClass, type Brand, type Category, type Product } from '@/data/products'
import { cn } from '@/lib/utils'
import { apiRequest, type ApiMaterial } from '@/lib/api'

const easeSnap = [0.16, 1, 0.3, 1] as [number, number, number, number]

function splitCharacteristics(value?: string) {
  const text = (value || '').replace(/\r/g, '\n').trim()
  if (!text) return []
  const rows = text
    .split(/\n|;| • | \| /)
    .map((row) => row.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  if (rows.length > 1) return rows.slice(0, 18)
  return text
    .split(/(?<=[.!?])\s+/)
    .map((row) => row.trim())
    .filter(Boolean)
    .slice(0, 10)
}

function ProductDetailsModal({
  product,
  onClose,
  onAdd,
  inEstimate,
}: {
  product: Product | null
  onClose: () => void
  onAdd: (p: Product) => void
  inEstimate: boolean
}) {
  const [material, setMaterial] = useState<ApiMaterial | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product) return
    let cancelled = false
    setLoading(true)
    setError('')
    setMaterial(null)
    apiRequest<ApiMaterial>(`/materials/${product.id}`)
      .then((data) => {
        if (!cancelled) setMaterial(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось открыть характеристики')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [product])

  useEffect(() => {
    if (!product) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, product])

  if (!product) return null

  const rows = splitCharacteristics(material?.characteristics || product.description)
  const image = material?.image_url || product.image
  const handleAdd = () => {
    onAdd(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className="w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-xl border border-border-glow bg-deep-navy shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.22, ease: easeSnap }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-guard-green/15 text-guard-green text-[10px] uppercase tracking-wide">
                  {material?.brand || product.brand}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-pure-white/10 text-text-body text-[10px] uppercase tracking-wide">
                  {material?.category || product.category}
                </span>
              </div>
              <h2 className="font-display text-xl md:text-2xl text-pure-white truncate">{material?.name || product.name}</h2>
              <p className="text-xs text-text-muted mt-1">Артикул: {material?.sku || product.sku}</p>
            </div>
            <button onClick={onClose} className="shrink-0 p-2 rounded-lg text-text-muted hover:text-pure-white hover:bg-pure-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0 overflow-y-auto max-h-[calc(88vh-88px)]">
            <div className="p-5 border-b lg:border-b-0 lg:border-r border-border-subtle">
              <div className="aspect-[4/3] rounded-lg bg-midnight overflow-hidden mb-4">
                <img src={image} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <div className="font-mono text-2xl font-semibold text-guard-green mb-4">
                {Math.round(material?.price || product.price).toLocaleString('ru-RU')} ₽
              </div>
              <button
                onClick={handleAdd}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                  added || inEstimate ? 'bg-guard-green/20 text-guard-green' : 'bg-guard-green text-deep-navy hover:brightness-110'
                )}
              >
                {added || inEstimate ? <Check size={18} /> : <ShoppingCart size={18} />}
                {added || inEstimate ? 'В смете' : 'Добавить в смету'}
              </button>
              {material?.product_url && (
                <a href={material.product_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-guard-green hover:underline">
                  <ExternalLink size={15} /> Источник характеристик
                </a>
              )}
            </div>

            <div className="p-5">
              {loading && (
                <div className="flex items-center gap-2 text-text-body py-8">
                  <Loader2 size={18} className="animate-spin text-guard-green" /> Подтягиваем характеристики...
                </div>
              )}
              {error && <div className="text-sm text-caution-amber mb-4">{error}</div>}
              <h3 className="font-display text-lg text-pure-white mb-3">Характеристики и описание</h3>
              {rows.length > 0 ? (
                <div className="border border-border-subtle rounded-xl overflow-hidden">
                  {rows.map((row, index) => (
                    <div key={`${row}-${index}`} className="px-4 py-3 border-b border-border-subtle last:border-b-0 text-sm text-text-body">
                      {row}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-border-subtle rounded-xl p-5 text-sm text-text-body">
                  Характеристик пока нет в базе. При открытии система пробует найти их на сайте производителя или Tinko.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="rounded-lg border border-border-subtle p-3">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide">Источник</div>
                  <div className="text-sm text-pure-white break-words mt-1">{material?.source || 'Прайс / интернет'}</div>
                </div>
                <div className="rounded-lg border border-border-subtle p-3">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide">Фото</div>
                  <div className="text-sm text-pure-white mt-1">{material?.photo_status === 'ready' ? 'Найдено' : 'Нет / ищется'}</div>
                </div>
                <div className="rounded-lg border border-border-subtle p-3">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide">Ед. изм.</div>
                  <div className="text-sm text-pure-white mt-1">{material?.unit || 'шт'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Category Pills                                                      */
/* ------------------------------------------------------------------ */
function CategoryPills({
  active,
  onChange,
  counts,
  options,
}: {
  active: string
  onChange: (c: Category | 'Все') => void
  counts: Record<string, number>
  options: Category[]
}) {
  const allPills = ['Все', ...options]
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {allPills.map((pill, i) => {
        const isActive = active === pill
        return (
          <motion.button
            key={pill}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: easeSnap }}
            onClick={() => onChange(pill as Category | 'Все')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.05em] transition-all duration-200 border',
              isActive
                ? 'bg-charcoal text-guard-green border-guard-green'
                : 'bg-transparent text-text-muted border-border-subtle hover:bg-charcoal hover:text-pure-white'
            )}
          >
            {pill}
            {pill !== 'Все' && (
              <span className={cn('ml-1.5', isActive ? 'text-guard-green/70' : 'text-text-muted/60')}>
                {counts[pill] ?? 0}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Brand Filter Dropdown                                             */
/* ------------------------------------------------------------------ */
function BrandFilter({
  selected,
  toggle,
  options,
}: {
  selected: string[]
  toggle: (b: Brand) => void
  options: Brand[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-charcoal border border-border-subtle text-pure-white text-sm hover:border-guard-green/50 transition-colors"
      >
        <span className="text-text-muted text-xs uppercase tracking-[0.05em] mr-1">Бренд</span>
        <span className="text-sm">
          {selected.length === 0 ? 'Все бренды' : selected.length === 1 ? selected[0] : `${selected.length} бренда`}
        </span>
        <ChevronDown size={14} className={cn('text-text-muted transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: easeSnap }}
            className="absolute top-full left-0 mt-2 w-56 bg-charcoal border border-border-subtle rounded-xl shadow-2xl z-50 p-2"
          >
            {options.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-pure-white/5 transition-colors"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    selected.includes(brand)
                      ? 'bg-guard-green border-guard-green'
                      : 'border-text-muted/40 bg-transparent'
                  )}
                >
                  {selected.includes(brand) && <Check size={10} className="text-deep-navy" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected.includes(brand)}
                  onChange={() => toggle(brand)}
                />
                <span className="text-sm text-pure-white">{brand}</span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sort Dropdown                                                     */
/* ------------------------------------------------------------------ */
const sortOptions: { value: ReturnType<typeof useCatalog>['sort']; label: string }[] = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Цена ↑' },
  { value: 'price-desc', label: 'Цена ↓' },
  { value: 'name-asc', label: 'Название А–Я' },
]

function SortFilter({
  value,
  onChange,
}: {
  value: ReturnType<typeof useCatalog>['sort']
  onChange: (v: ReturnType<typeof useCatalog>['sort']) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const activeLabel = sortOptions.find((o) => o.value === value)?.label ?? 'По умолчанию'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-charcoal border border-border-subtle text-pure-white text-sm hover:border-guard-green/50 transition-colors"
      >
        <span className="text-text-muted text-xs uppercase tracking-[0.05em] mr-1">Сортировка</span>
        <span className="text-sm">{activeLabel}</span>
        <ChevronDown size={14} className={cn('text-text-muted transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: easeSnap }}
            className="absolute top-full left-0 mt-2 w-48 bg-charcoal border border-border-subtle rounded-xl shadow-2xl z-50 p-1"
          >
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  value === opt.value ? 'text-guard-green bg-guard-green/10' : 'text-pure-white hover:bg-pure-white/5'
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Product Card — Grid Mode                                          */
/* ------------------------------------------------------------------ */
function ProductCardGrid({
  product,
  index,
  inEstimate,
  quantity,
  onAdd,
  onUpdateQty,
  onOpenDetails,
}: {
  product: Product
  index: number
  inEstimate: boolean
  quantity: number
  onAdd: (p: Product) => void
  onUpdateQty: (id: string, q: number) => void
  onOpenDetails: (p: Product) => void
}) {
  const [addedFlash, setAddedFlash] = useState(false)

  const handleAdd = () => {
    onAdd(product)
    setAddedFlash(true)
    setTimeout(() => setAddedFlash(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: easeSnap }}
      layout
      className={cn(
        'group rounded-xl overflow-hidden border transition-all duration-250',
        'bg-charcoal border-border-subtle',
        'hover:border-border-glow hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,208,132,0.06)]'
      )}
    >
      {/* Image Area */}
      <button type="button" onClick={() => onOpenDetails(product)} className="relative block w-full aspect-[4/3] overflow-hidden text-left">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Brand badge */}
        <div className="absolute top-0 left-0 bg-midnight text-guard-green text-[10px] font-medium uppercase tracking-[0.05em] px-2.5 py-1 rounded-br-lg">
          {product.brand}
        </div>
        {/* Favorite */}
        <span
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-midnight/60 text-text-muted hover:text-guard-green transition-colors"
        >
          <Heart size={16} />
        </span>
      </button>

      {/* Info Area */}
      <div className="p-4">
        <button type="button" onClick={() => onOpenDetails(product)} className="block text-left font-display font-medium text-base text-pure-white leading-snug line-clamp-2 mb-1 hover:text-guard-green transition-colors">
          {product.name}
        </button>
        <p className="text-xs text-text-muted mb-3">Артикул: {product.sku}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xl font-semibold text-guard-green">
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide', tierColorClass[product.priceTier])}>
            {product.priceTier}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.05em] text-text-muted">{product.category}</span>
        </div>
      </div>

      {/* Action Area */}
      <div className="px-4 pb-4">
        {!inEstimate ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className={cn(
              'w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
              addedFlash
                ? 'bg-guard-green/20 text-guard-green'
                : 'bg-guard-green text-deep-navy hover:brightness-110 hover:-translate-y-0.5'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              {addedFlash ? (
                <>
                  <Check size={16} /> Добавлено
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> В смету
                </>
              )}
            </span>
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQty(product.id, quantity - 1)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-midnight border border-border-subtle text-pure-white hover:border-guard-green transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center font-mono text-sm text-pure-white">{quantity}</span>
            <button
              onClick={() => onUpdateQty(product.id, quantity + 1)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-midnight border border-border-subtle text-pure-white hover:border-guard-green transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Product Card — List Mode                                          */
/* ------------------------------------------------------------------ */
function ProductCardList({
  product,
  index,
  inEstimate,
  quantity,
  onAdd,
  onUpdateQty,
  onOpenDetails,
}: {
  product: Product
  index: number
  inEstimate: boolean
  quantity: number
  onAdd: (p: Product) => void
  onUpdateQty: (id: string, q: number) => void
  onOpenDetails: (p: Product) => void
}) {
  const [addedFlash, setAddedFlash] = useState(false)

  const handleAdd = () => {
    onAdd(product)
    setAddedFlash(true)
    setTimeout(() => setAddedFlash(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: easeSnap }}
      layout
      className={cn(
        'group flex flex-col sm:flex-row gap-4 rounded-xl overflow-hidden border transition-all duration-250 p-4',
        'bg-charcoal border-border-subtle',
        'hover:border-border-glow hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,208,132,0.06)]'
      )}
    >
      {/* Image */}
      <button type="button" onClick={() => onOpenDetails(product)} className="relative block w-full sm:w-[200px] shrink-0 aspect-[4/3] sm:aspect-[4/3] rounded-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-0 left-0 bg-midnight text-guard-green text-[10px] font-medium uppercase tracking-[0.05em] px-2.5 py-1 rounded-br-lg">
          {product.brand}
        </div>
      </button>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <button type="button" onClick={() => onOpenDetails(product)} className="block text-left font-display font-medium text-base text-pure-white leading-snug mb-1 hover:text-guard-green transition-colors">
            {product.name}
          </button>
          <p className="text-xs text-text-muted mb-2">Артикул: {product.sku}</p>
          <p className="text-sm text-text-body mb-3 line-clamp-2">{product.description}</p>
          <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide', tierColorClass[product.priceTier])}>
            {product.priceTier}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-xl font-semibold text-guard-green">
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          {!inEstimate ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className={cn(
                'px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                addedFlash
                  ? 'bg-guard-green/20 text-guard-green'
                  : 'bg-guard-green text-deep-navy hover:brightness-110 hover:-translate-y-0.5'
              )}
            >
              <span className="flex items-center gap-2">
                {addedFlash ? (
                  <>
                    <Check size={16} /> Добавлено
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} /> В смету
                  </>
                )}
              </span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQty(product.id, quantity - 1)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-midnight border border-border-subtle text-pure-white hover:border-guard-green transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-mono text-sm text-pure-white">{quantity}</span>
              <button
                onClick={() => onUpdateQty(product.id, quantity + 1)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-midnight border border-border-subtle text-pure-white hover:border-guard-green transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Floating Estimate Panel                                           */
/* ------------------------------------------------------------------ */
function FloatingEstimatePanel({
  estimate,
  equipmentTotal,
  laborTotal,
  grandTotal,
  itemCount,
  onRemove,
  onUpdateQty,
  onToggleLabor,
  onClear,
}: {
  estimate: ReturnType<typeof useCatalog>['estimate']
  equipmentTotal: number
  laborTotal: number
  grandTotal: number
  itemCount: number
  onRemove: (id: string) => void
  onUpdateQty: (id: string, q: number) => void
  onToggleLabor: () => void
  onClear: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  if (estimate.items.length === 0) return null

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: easeSnap }}
      className={cn(
        'fixed bottom-6 right-6 z-[50] w-[360px] max-w-[calc(100vw-48px)]',
        'bg-surface-glass backdrop-blur-[20px] border border-border-glow rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
        'overflow-hidden'
      )}
      style={{ background: 'var(--surface-glass)' } as React.CSSProperties}
    >
      {/* Collapsed Bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className="relative">
          <ShoppingCart size={20} className="text-pure-white" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-guard-green text-deep-navy text-[10px] font-bold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-sm text-pure-white flex-1 text-left">
          Смета: {itemCount} {itemCount === 1 ? 'позиция' : itemCount < 5 ? 'позиции' : 'позиций'}
        </span>
        <span className="font-mono text-base font-semibold text-guard-green">
          {grandTotal.toLocaleString('ru-RU')} ₽
        </span>
        <ChevronUp
          size={16}
          className={cn('text-text-muted transition-transform duration-300', expanded && 'rotate-180')}
        />
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeSnap }}
          >
            <div className="px-4 pb-4">
              {/* Divider */}
              <div className="border-t border-border-subtle mb-3" />

              {/* Item list */}
              <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
                <AnimatePresence mode="popLayout">
                  {estimate.items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeSnap }}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-pure-white truncate">{item.product.name}</p>
                        <p className="text-[10px] text-text-muted">
                          {item.product.price.toLocaleString('ru-RU')} ₽ × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateQty(item.product.id, item.quantity - 1)
                          }}
                          className="p-1 rounded text-text-muted hover:text-pure-white hover:bg-pure-white/10 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs text-pure-white">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateQty(item.product.id, item.quantity + 1)
                          }}
                          className="p-1 rounded text-text-muted hover:text-pure-white hover:bg-pure-white/10 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(item.product.id)
                          }}
                          className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <div className="border-t border-border-subtle mt-3 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-body">Оборудование</span>
                  <span className="text-pure-white">{equipmentTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={onToggleLabor}
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer',
                      estimate.includeLabor
                        ? 'bg-guard-green border-guard-green'
                        : 'border-text-muted/40 bg-transparent'
                    )}
                  >
                    {estimate.includeLabor && <Check size={10} className="text-deep-navy" />}
                  </div>
                  <span className="text-sm text-text-body">
                    + Монтажные работы (30%)
                  </span>
                </label>
                {estimate.includeLabor && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-body">Монтаж</span>
                    <span className="text-pure-white">{laborTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-display font-medium text-pure-white">Итого</span>
                  <span className="font-mono text-xl font-semibold text-guard-green">
                    {grandTotal.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <Link
                  to="/estimate"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl gradient-guard text-white font-semibold text-sm hover:brightness-110 transition-all"
                >
                  Перейти к смете <ArrowRight size={16} />
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={onClear}
                    className="flex-1 py-2.5 rounded-xl border border-border-subtle text-text-muted text-sm hover:text-pure-white hover:border-guard-green transition-colors"
                  >
                    Очистить
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl border border-border-subtle text-text-muted text-sm hover:text-pure-white hover:border-guard-green transition-colors flex items-center justify-center gap-2">
                    <FileText size={14} /> PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                       */
/* ------------------------------------------------------------------ */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easeSnap }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-12 h-12 rounded-full bg-charcoal border border-border-subtle flex items-center justify-center mb-4">
        <Search size={24} className="text-text-muted" />
      </div>
      <h3 className="font-display text-2xl font-semibold text-pure-white mb-2">Ничего не найдено</h3>
      <p className="text-base text-text-muted mb-6 text-center max-w-md">
        Попробуйте изменить фильтры или поисковый запрос
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-xl border border-guard-green text-guard-green text-sm font-medium hover:bg-guard-green/10 transition-colors"
      >
        Сбросить фильтры
      </button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Catalog Page                                                 */
/* ------------------------------------------------------------------ */
export default function Catalog() {
  const {
    activeCategory,
    setActiveCategory,
    selectedBrands,
    toggleBrand,
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    viewMode,
    setViewMode,
    products,
    allProducts,
    totalCount,
    hasMore,
    loadMore,
    resetFilters,
    estimate,
    addToEstimate,
    removeFromEstimate,
    updateQuantity,
    toggleLabor,
    clearEstimate,
    equipmentTotal,
    laborTotal,
    grandTotal,
    itemCount,
    isInEstimate,
    getQuantity,
    isLoadingCatalog,
    catalogError,
  } = useCatalog()

  const [filterSticky, setFilterSticky] = useState(false)
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setFilterSticky(!entry.isIntersecting),
      { rootMargin: '-72px 0px 0px 0px', threshold: 0 }
    )
    if (filterRef.current) observer.observe(filterRef.current)
    return () => observer.disconnect()
  }, [])

  const categoryCounts = allProducts.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const gridCols =
    viewMode === 'grid'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : viewMode === 'compact'
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        : 'grid-cols-1'

  const shownCount = products.length
  const categoryOptions = Array.from(new Set(allProducts.map((product) => product.category))).sort((a, b) => a.localeCompare(b, 'ru'))
  const brandOptions = Array.from(new Set(allProducts.map((product) => product.brand))).sort((a, b) => a.localeCompare(b, 'ru'))

  return (
    <div className="min-h-[100dvh] bg-deep-navy">
      {/* ========== Page Header ========== */}
      <section
        className="relative pt-[72px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(0, 208, 132, 0.04) 0%, transparent 70%), #0A0E1A',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-text-muted mb-4"
          >
            <Link to="/" className="hover:text-guard-green transition-colors">
              Главная
            </Link>
            <span className="mx-2">/</span>
            <span>Каталог</span>
          </motion.div>

          {/* Title + Count */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeSnap }}
              className="font-display text-[48px] font-semibold text-pure-white leading-tight tracking-[-0.01em]"
            >
              Каталог оборудования
            </motion.h1>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-mono text-[32px] font-semibold text-guard-green leading-none"
            >
              {totalCount} товаров
            </motion.span>
          </div>

          {/* Category Pills */}
          <CategoryPills
            active={activeCategory}
            onChange={setActiveCategory}
            counts={categoryCounts}
            options={categoryOptions}
          />
        </div>
      </section>

      {/* ========== Sticky Filter Bar ========== */}
      <div ref={filterRef} />
      <div
        className={cn(
          'sticky top-[72px] z-50 transition-shadow duration-200',
          filterSticky && 'shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
        )}
        style={{ background: 'rgba(15, 22, 41, 0.9)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, артикулу, бренду..."
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal border text-sm text-pure-white placeholder:text-text-muted/60',
                  'border-border-subtle focus:border-guard-green focus:outline-none transition-all duration-200',
                  'focus:shadow-[0_0_0_3px_rgba(0,208,132,0.15)]'
                )}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <BrandFilter selected={selectedBrands} toggle={toggleBrand} options={brandOptions} />
              <SortFilter value={sort} onChange={setSort} />

              {/* View Toggle */}
              <div className="flex items-center bg-charcoal rounded-xl border border-border-subtle p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'text-guard-green bg-guard-green/10' : 'text-text-muted hover:text-pure-white'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'compact' ? 'text-guard-green bg-guard-green/10' : 'text-text-muted hover:text-pure-white'
                  )}
                  aria-label="Compact view"
                >
                  <Rows3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'text-guard-green bg-guard-green/10' : 'text-text-muted hover:text-pure-white'
                  )}
                  aria-label="List view"
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Product Grid ========== */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <AnimatePresence mode="wait">
          {products.length === 0 ? (
            <EmptyState key="empty" onReset={resetFilters} />
          ) : (
            <motion.div
              key={`${activeCategory}-${selectedBrands.join(',')}-${sort}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Shown count */}
              <div className="text-sm text-text-muted mb-6">
                Показано {shownCount} из {totalCount}
                {isLoadingCatalog && <span className="ml-2 text-guard-green">Загружаем каталог...</span>}
                {catalogError && <span className="ml-2 text-caution-amber">Используется резервный каталог</span>}
              </div>

              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {products.map((product, i) => (
                    <ProductCardList
                      key={product.id}
                      product={product}
                      index={i}
                      inEstimate={isInEstimate(product.id)}
                      quantity={getQuantity(product.id)}
                      onAdd={addToEstimate}
                      onUpdateQty={updateQuantity}
                      onOpenDetails={setDetailsProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className={cn('grid gap-6', gridCols)}>
                  {products.map((product, i) => (
                    <ProductCardGrid
                      key={product.id}
                      product={product}
                      index={i}
                      inEstimate={isInEstimate(product.id)}
                      quantity={getQuantity(product.id)}
                      onAdd={addToEstimate}
                      onUpdateQty={updateQuantity}
                      onOpenDetails={setDetailsProduct}
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={loadMore}
                    className="px-6 py-3 rounded-xl bg-charcoal border border-border-subtle text-pure-white text-sm font-medium hover:border-guard-green hover:text-guard-green transition-colors"
                  >
                    Загрузить ещё {Math.min(12, totalCount - shownCount)}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ========== Floating Estimate Panel ========== */}
      <FloatingEstimatePanel
        estimate={estimate}
        equipmentTotal={equipmentTotal}
        laborTotal={laborTotal}
        grandTotal={grandTotal}
        itemCount={itemCount}
        onRemove={removeFromEstimate}
        onUpdateQty={updateQuantity}
        onToggleLabor={toggleLabor}
        onClear={clearEstimate}
      />
      <ProductDetailsModal
        product={detailsProduct}
        onClose={() => setDetailsProduct(null)}
        onAdd={addToEstimate}
        inEstimate={detailsProduct ? isInEstimate(detailsProduct.id) : false}
      />
    </div>
  )
}
