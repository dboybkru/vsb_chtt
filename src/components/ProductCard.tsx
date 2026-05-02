import { Plus, ArrowRight } from 'lucide-react'
import { ProductVisual } from './ProductVisual'
import { formatMoney } from '@/utils/formatters'
import { gtagEvent } from '@/config/analytics'
import type { Product } from '@/types'

export function ProductCard({
  product,
  onAdd,
  onSelect,
}: {
  product: Product
  onAdd: (p: Product) => void
  onSelect: (p: Product) => void
}) {
  const tiers = (product.priceTiers || {}) as { retail?: number; installer?: number; opt?: number; bulk?: number }
  const altPrices = [
    ['розн', tiers.retail],
    ['инст', tiers.installer],
    ['опт', tiers.opt],
    ['кр.опт', tiers.bulk],
  ].filter(([, value]) => value && value !== product.price) as [string, number][]

  return (
    <article className="product-card">
      <button className="product-open" type="button" onClick={() => onSelect(product)} aria-label={`Открыть ${product.name}`}>
        <ProductVisual category={product.category} photo={product.photo} />
        {!!product.marketingPhotos?.length && <span className="marketing-count">+{product.marketingPhotos.length}</span>}
      </button>
      <div className="product-body">
        <div className="product-meta">
          <span className="tag">{product.category}</span>
          {product.stock > 0 && <span className="muted">на складе {product.stock}</span>}
        </div>
        <h3>{product.name}</h3>
        <p>{product.brand} · {product.resolution} · {product.analytics}</p>
        {!!product.specFilters?.length && (
          <div className="spec-chips">
            {product.specFilters.slice(0, 4).map(spec => <span key={spec}>{spec}</span>)}
          </div>
        )}
        <div className="price-row">
          <strong>{formatMoney(product.price, product.unit)}</strong>
          {product.oldPrice && <s>{formatMoney(product.oldPrice)}</s>}
        </div>
        {!!altPrices.length && (
          <div className="tier-prices">
            {altPrices.slice(0, 3).map(([label, value]) => (
              <span key={label}>{label}: {formatMoney(value, product.unit)}</span>
            ))}
          </div>
        )}
        <div className="card-actions">
          <button className="btn btn-blue" onClick={() => { onAdd(product); gtagEvent('add_to_estimate', { product: product.name }) }}>
            <Plus size={16} />В смету
          </button>
          <button className="icon-button" onClick={() => onSelect(product)} aria-label="Подробнее">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
