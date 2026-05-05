import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ArrowRight, Search, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEstimate } from './EstimateContext'
import { apiRequest, type MaterialsResponse } from '@/lib/api'
import { normalizeExternalProduct, type Product } from '@/data/products'

export default function EquipmentTable() {
  const { items, updateQuantity, removeItem, addItem, equipmentTotal } = useEstimate()
  const [flashRow, setFlashRow] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)

  const handleQtyChange = (id: string, qty: number) => {
    if (qty < 1) return
    updateQuantity(id, qty)
    setFlashRow(id)
    setTimeout(() => setFlashRow(null), 300)
  }

  useEffect(() => {
    const text = query.trim()
    if (text.length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const params = new URLSearchParams({ item_type: 'equipment', limit: '8', q: text })
        const response = await apiRequest<MaterialsResponse>(`/materials?${params.toString()}`)
        const next = response.items
          .map((item, index) => normalizeExternalProduct(item, index))
          .filter((item): item is Product => item !== null)
        if (!cancelled) setResults(next)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти оборудование и добавить в смету..."
            className="w-full rounded-xl border border-border-subtle bg-charcoal py-3 pl-11 pr-4 text-sm text-pure-white placeholder:text-text-muted/60 outline-none transition-all focus:border-guard-green focus:ring-4 focus:ring-guard-green/10"
          />
        </div>
        {(results.length > 0 || searching) && (
          <div className="mt-3 grid gap-2 max-w-3xl">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  addItem({ ...product, quantity: 1 })
                  setQuery('')
                  setResults([])
                }}
                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-charcoal px-3 py-2 text-left hover:border-guard-green"
              >
                <img src={product.image} alt="" className="h-10 w-10 rounded object-cover bg-midnight" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-pure-white">{product.name}</p>
                  <p className="text-xs text-text-muted">{product.sku} · {product.brand}</p>
                </div>
                <span className="font-mono text-sm text-guard-green">{product.price.toLocaleString('ru-RU')} ₽</span>
                <ShoppingCart size={16} className="text-guard-green" />
              </button>
            ))}
            {searching && <p className="text-sm text-text-muted">Ищу в базе...</p>}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <h3 className="font-display text-2xl font-semibold text-pure-white mb-4">
              Добавьте оборудование из каталога
            </h3>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-guard-green hover:underline"
            >
              Перейти в каталог <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-charcoal rounded-t-lg">
                <th className="text-left text-xs font-medium uppercase tracking-[0.05em] text-text-muted px-4 py-3 rounded-tl-lg">
                  Товар
                </th>
                <th className="text-left text-xs font-medium uppercase tracking-[0.05em] text-text-muted px-4 py-3">
                  Кол-во
                </th>
                <th className="text-left text-xs font-medium uppercase tracking-[0.05em] text-text-muted px-4 py-3">
                  Цена
                </th>
                <th className="text-left text-xs font-medium uppercase tracking-[0.05em] text-text-muted px-4 py-3">
                  Сумма
                </th>
                <th className="text-right text-xs font-medium uppercase tracking-[0.05em] text-text-muted px-4 py-3 rounded-tr-lg">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="group hover:bg-charcoal/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-charcoal shrink-0 border border-border-subtle">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-display text-base font-medium text-pure-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-text-muted">{item.sku}</p>
                          <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-[0.05em] text-pure-white bg-midnight px-2 py-0.5 rounded">
                            {item.brand}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-pure-white hover:bg-midnight transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQtyChange(item.id, parseInt(e.target.value) || 1)
                          }
                          className="w-12 text-center bg-transparent font-mono text-pure-white text-sm border-none outline-none"
                        />
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-pure-white hover:bg-midnight transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-base text-pure-white">
                        {item.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <motion.span
                        animate={
                          flashRow === item.id
                            ? { color: '#00E5C2' }
                            : { color: '#00D084' }
                        }
                        transition={{ duration: 0.3 }}
                        className="font-mono text-base font-medium text-guard-green"
                      >
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </motion.span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-text-muted hover:text-red-400 transition-colors p-2"
                        aria-label="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            <tfoot>
              <tr className="border-t border-border-subtle">
                <td colSpan={3} className="px-4 py-4 text-right text-sm text-text-muted">
                  Оборудование:
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-lg font-semibold text-guard-green">
                    {equipmentTotal.toLocaleString('ru-RU')} ₽
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-sm text-guard-green hover:underline"
          >
            + Добавить ещё оборудование <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  )
}
