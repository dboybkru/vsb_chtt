import { useState, useEffect, useCallback, useMemo } from 'react'
import { mapMaterialToProduct, type Product, type Category, type Brand } from '@/data/products'

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc'
export type ViewMode = 'grid' | 'compact' | 'list'

export interface CartItem {
  product: Product
  quantity: number
}

export interface EstimateState {
  items: CartItem[]
  includeLabor: boolean
}

const STORAGE_KEY = 'vsb39_cart'
const ITEMS_PER_PAGE = 12
const API_PAGE_SIZE = 50

function loadEstimateFromStorage(products: Product[]): EstimateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // New format: full objects with id
      if (parsed.items && parsed.items.length > 0 && parsed.items[0].id !== undefined && parsed.items[0].productId === undefined) {
        const items = parsed.items
          .map((item: any) => {
            const product = products.find((p) => p.id === item.id)
            if (product) {
              return { product, quantity: item.quantity || 1 }
            }
            // Fallback: reconstruct Product from stored fields
            const synthetic: Product = {
              id: item.id || '',
              name: item.name || '',
              sku: item.sku || '',
              brand: item.brand || '',
              price: item.price || 0,
              image: item.image || '',
              category: item.category || '',
              description: '',
              priceTier: 'Розница',
            }
            return { product: synthetic, quantity: item.quantity || 1 }
          })
          .filter((item: any): item is CartItem => item !== null)
        return { items, includeLabor: parsed.includeLabor ?? false }
      }
      // Old format: productId only
      if (parsed.items && parsed.items.length > 0 && parsed.items[0].productId !== undefined) {
        const items = parsed.items
          .map((item: any) => {
            const product = products.find((p) => p.id === item.productId)
            return product ? { product, quantity: item.quantity } : null
          })
          .filter((item: any): item is CartItem => item !== null)
        return { items, includeLabor: parsed.includeLabor ?? false }
      }
      if (parsed.items) {
        return { items: [], includeLabor: parsed.includeLabor ?? false }
      }
    }
  } catch {
    // ignore
  }
  return { items: [], includeLabor: false }
}

function saveEstimateToStorage(state: EstimateState) {
  try {
    const serializable = {
      items: state.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        category: item.product.category,
        unit: 'шт.',
      })),
      includeLabor: state.includeLabor,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {
    // ignore
  }
}

export function useCatalog() {
  // API data
  const [allApiProducts, setAllApiProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Infinite scroll API state
  const [apiOffset, setApiOffset] = useState(0)
  const [hasMoreApi, setHasMoreApi] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Filters
  const [activeCategory, setActiveCategory] = useState<Category | 'Все'>('Все')
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Pagination
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  // Cart / Estimate
  const [estimate, setEstimate] = useState<EstimateState>({ items: [], includeLabor: false })
  const [isEstimateLoaded, setIsEstimateLoaded] = useState(false)

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [activeCategory, selectedBrands, searchQuery, sort])

  // Load API data on mount (first batch)
  useEffect(() => {
    setIsLoading(true)
    setApiError(null)
    fetch(`/api/materials?limit=${API_PAGE_SIZE}&offset=0`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        const items = data.items || data
        const mapped = Array.isArray(items) ? items.map(mapMaterialToProduct) : []
        setAllApiProducts(mapped)
        setApiOffset(mapped.length)
        setHasMoreApi(data.has_more ?? (Array.isArray(items) && items.length >= API_PAGE_SIZE))
      })
      .catch((err) => setApiError(err.message || 'Ошибка загрузки каталога'))
      .finally(() => setIsLoading(false))
  }, [])

  // Background load all remaining products
  useEffect(() => {
    if (allApiProducts.length === 0) return
    const loadAll = async () => {
      let offset = allApiProducts.length
      const allItems = [...allApiProducts]
      while (true) {
        try {
          const res = await fetch(`/api/materials?limit=500&offset=${offset}`)
          const data = await res.json()
          const items = (data.items || []).map(mapMaterialToProduct)
          if (items.length === 0) break
          allItems.push(...items)
          offset += items.length
          setAllApiProducts([...allItems])
          setApiOffset(offset)
          if (!data.has_more) break
        } catch (e) {
          console.error('Background load error:', e)
          break
        }
      }
    }
    loadAll()
  }, [allApiProducts.length > 0])

  // Load more from API (for user-triggered scroll load)
  const loadMoreFromApi = useCallback(() => {
    if (isLoadingMore || !hasMoreApi) return
    setIsLoadingMore(true)
    fetch(`/api/materials?limit=${API_PAGE_SIZE}&offset=${apiOffset}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        const items = data.items || []
        const mapped = Array.isArray(items) ? items.map(mapMaterialToProduct) : []
        setAllApiProducts((prev) => [...prev, ...mapped])
        setApiOffset((prev) => prev + mapped.length)
        setHasMoreApi(data.has_more ?? (Array.isArray(items) && items.length >= API_PAGE_SIZE))
      })
      .catch((err) => {
        console.error('API load error:', err)
        setApiError(err.message || 'Ошибка дозагрузки каталога')
      })
      .finally(() => setIsLoadingMore(false))
  }, [apiOffset, isLoadingMore, hasMoreApi])

  // Load estimate from storage when allApiProducts available
  useEffect(() => {
    if (allApiProducts.length > 0 && !isEstimateLoaded) {
      const loaded = loadEstimateFromStorage(allApiProducts)
      setEstimate(loaded)
      setIsEstimateLoaded(true)
    }
  }, [allApiProducts, isEstimateLoaded])

  // Save to localStorage whenever estimate changes
  useEffect(() => {
    if (isEstimateLoaded) {
      saveEstimateToStorage(estimate)
    }
  }, [estimate, isEstimateLoaded])

  // Migrate old data from 'vsb39_estimate' to 'vsb39_cart'
  useEffect(() => {
    const oldRaw = localStorage.getItem('vsb39_estimate')
    if (oldRaw) {
      try {
        const old = JSON.parse(oldRaw)
        if (old.items && old.items.length > 0 && old.items[0].unit !== undefined && old.items[0].productId === undefined) {
          // This is cart data, migrate
          localStorage.setItem(STORAGE_KEY, oldRaw)
          localStorage.removeItem('vsb39_estimate')
        }
      } catch { /* ignore */ }
    }
  }, [])

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = [...allApiProducts]

    if (activeCategory !== 'Все') {
      result = result.filter((p) => p.category === activeCategory)
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
        break
      default:
        break
    }

    return result
  }, [activeCategory, selectedBrands, searchQuery, sort, allApiProducts])

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const hasMoreFiltered = filteredProducts.length > visibleCount
  const hasMore = hasMoreFiltered || hasMoreApi
  const totalCount = filteredProducts.length

  // Dynamic brands and categories
  const availableBrands = useMemo(() => {
    return [...new Set(allApiProducts.map((p) => p.brand))].sort()
  }, [allApiProducts])

  const availableCategories = useMemo(() => {
    return [...new Set(allApiProducts.map((p) => p.category))].sort()
  }, [allApiProducts])

  // Category counts (without category filter, but with brand/search filters)
  const categoryCounts = useMemo(() => {
    let result = [...allApiProducts]

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    return result.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }, [allApiProducts, selectedBrands, searchQuery])

  // Cart actions
  const addToEstimate = useCallback((product: Product) => {
    setEstimate((prev) => {
      const existing = prev.items.find((item) => item.product.id === product.id)
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }
      }
      return { ...prev, items: [...prev.items, { product, quantity: 1 }] }
    })
  }, [])

  const removeFromEstimate = useCallback((productId: string) => {
    setEstimate((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.product.id !== productId),
    }))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromEstimate(productId)
      return
    }
    setEstimate((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }))
  }, [removeFromEstimate])

  const toggleLabor = useCallback(() => {
    setEstimate((prev) => ({ ...prev, includeLabor: !prev.includeLabor }))
  }, [])

  const clearEstimate = useCallback(() => {
    setEstimate({ items: [], includeLabor: false })
  }, [])

  const resetFilters = useCallback(() => {
    setActiveCategory('Все')
    setSelectedBrands([])
    setSearchQuery('')
    setSort('default')
    setVisibleCount(ITEMS_PER_PAGE)
  }, [])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
    // If we're running out of filtered items and API has more, fetch next batch
    if (!hasMoreFiltered && hasMoreApi) {
      loadMoreFromApi()
    }
  }, [hasMoreFiltered, hasMoreApi, loadMoreFromApi])

  const toggleBrand = useCallback((brand: Brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }, [])

  const equipmentTotal = useMemo(() => {
    return estimate.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [estimate.items])

  const laborTotal = estimate.includeLabor ? Math.round(equipmentTotal * 0.3) : 0
  const grandTotal = equipmentTotal + laborTotal
  const itemCount = estimate.items.reduce((sum, item) => sum + item.quantity, 0)

  const isInEstimate = useCallback(
    (productId: string) => estimate.items.some((item) => item.product.id === productId),
    [estimate.items]
  )

  const getQuantity = useCallback(
    (productId: string) => estimate.items.find((item) => item.product.id === productId)?.quantity ?? 0,
    [estimate.items]
  )

  return {
    // Filters
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

    // Products
    products: paginatedProducts,
    totalCount,
    hasMore,
    loadMore,
    resetFilters,

    // API
    isLoading,
    apiError,
    isLoadingMore,
    availableBrands,
    availableCategories,
    categoryCounts,

    // Estimate
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
  }
}
