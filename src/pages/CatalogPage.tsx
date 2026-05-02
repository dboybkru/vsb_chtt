import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { CategoryRail } from '@/components/CategoryRail'
import { ProductCard } from '@/components/ProductCard'
import { ProductVisual } from '@/components/ProductVisual'
import { Filters } from '@/components/Filters'
import { scoreProduct, withCategoryFilter, defaultFilters, similarProducts } from '@/utils/filters'
import { SITE_URL } from '@/config/env'
import { gtagEvent } from '@/config/analytics'
import type { Product, FilterState } from '@/types'

export default function CatalogPage({
  products,
  onAdd,
}: {
  products: Product[]
  onAdd: (p: Product) => void
  onUpdateProducts: (updater: Product[] | ((current: Product[]) => Product[])) => void
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selected, setSelected] = useState<Product | null>(null)
  const [photos, setPhotos] = useState<string[]>([])

  const filtered = useMemo(() => {
    const q = search.trim()
    const scored = products.map(product => ({
      product,
      score: q ? scoreProduct(product, q, filters) : (matchesProduct(product) ? 0 : -1),
    }))
    const result = scored
      .filter(item => item.score >= 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, 'ru'))
      .map(item => item.product)
    return result
  }, [products, search, filters])

  const pageSize = 16
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageSafe = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(pageSafe * pageSize, (pageSafe + 1) * pageSize)

  function matchesProduct(product: Product): boolean {
    if (filters.category !== 'Все' && product.category !== filters.category) return false
    if (filters.brand !== 'Все' && product.brand !== filters.brand) return false
    if (filters.minPrice && product.price < Number(filters.minPrice)) return false
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false
    return true
  }

  function onSelect(product: Product) {
    setSelected(product)
    setPhotos(product.marketingPhotos || [product.photo].filter(Boolean) as string[])
    gtagEvent('view_product', { product: product.name })
  }

  const similar = selected ? similarProducts(selected, products) : []

  return (
    <main>
      <Helmet>
        <title>Каталог оборудования ВСБ39 - камеры, СКУД, ОПС</title>
        <meta name="description" content="Поиск оборудования для систем безопасности по прайсам, характеристикам и фильтрам." />
        <link rel="canonical" href={`${SITE_URL}/catalog`} />
        <meta property="og:url" content={`${SITE_URL}/catalog`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: pageItems.slice(0, 6).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}/catalog`,
              name: p.name,
            })),
          })}
        </script>
      </Helmet>
      <section className="knowledge-page">
        <div>
          <h1>Каталог оборудования</h1>
          <p>Оборудование из прайсов поставщиков с актуальными характеристиками, фильтрами и ценами.</p>
        </div>
      </section>
      <CategoryRail active={filters.category} setActive={c => setFilters(withCategoryFilter(filters, c))} products={products} />
      <section className="catalog">
        <Filters products={products} filters={filters} setFilters={setFilters} />
        <div className="catalog-main">
          <div className="search-bar">
            <Search size={20} />
            <input
              placeholder="Поиск: камера Hikvision 2MP..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
            />
            <small>{filtered.length} позиций</small>
          </div>
          <div className="catalog-grid">
            {pageItems.map(product => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} onSelect={onSelect} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(Math.max(0, pageSafe - 1))} disabled={pageSafe === 0}>
                <ArrowLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === pageSafe ? 'page-active' : ''} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages - 1, pageSafe + 1))} disabled={pageSafe === totalPages - 1}>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
      {selected && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="product-details">
            <div className="gallery">
              <ProductVisual category={selected.category} photo={selected.photo} />
              <div className="gallery-strip">
                {(photos.length ? photos : [selected.photo].filter(Boolean)).map((photo, i) => (
                  <button key={`${photo}-${i}`} className={i === 0 ? 'active-photo' : ''}>
                    <img src={photo!} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
            <div className="details-body">
              <span className="tag">{selected.category}</span>
              <h2>{selected.name}</h2>
              <p><strong>Бренд:</strong> {selected.brand}</p>
              <p><strong>Разрешение:</strong> {selected.resolution}</p>
              <p><strong>Аналитика:</strong> {selected.analytics}</p>
              {!!selected.specFilters?.length && (
                <div className="spec-chips">
                  {selected.specFilters.map(spec => <span key={spec}>{spec}</span>)}
                </div>
              )}
              <div className="price-row">
                <strong>{selected.price > 0 ? new Intl.NumberFormat('ru-RU').format(selected.price) + ' ₽' : '—'}</strong>
                {selected.oldPrice && <s>{new Intl.NumberFormat('ru-RU').format(selected.oldPrice)} ₽</s>}
              </div>
              <div className="actions-row">
                <button className="btn btn-blue" onClick={() => { onAdd(selected); setSelected(null) }}>
                  <Plus size={16} />Добавить в смету
                </button>
                <button className="btn btn-outline" onClick={() => setSelected(null)}>Закрыть</button>
              </div>
            </div>
            {similar.length > 0 && (
              <div className="similar-products">
                <h4>Похожее оборудование</h4>
                <div className="similar-grid">
                  {similar.map(product => (
                    <button key={product.id} className="similar-card" onClick={() => onSelect(product)}>
                      <ProductVisual category={product.category} photo={product.photo} />
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.price > 0 ? new Intl.NumberFormat('ru-RU').format(product.price) + ' ₽' : '—'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
