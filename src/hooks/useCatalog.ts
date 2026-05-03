import { useState, useEffect, useCallback, useMemo } from 'react'
import { products, type Product, type Category, type Brand } from '@/data/products'

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

const STORAGE_KEY = 'vsb39_estimate'
const ITEMS_PER_PAGE = 12

function loadEstimateFromStorage(): EstimateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { items: Array<{ productId: string; quantity: number }>; includeLabor: boolean }
      const items = parsed.items
        .map((item) => {
          const product = products.find((p) => p.id === item.productId)
          return product ? { product, quantity: item.quantity } : null
        })
        .filter((item): item is CartItem => item !== null)
      return { items, includeLabor: parsed.includeLabor ?? false }
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
        productId: item.product.id,
        quantity: item.quantity,
      })),
      includeLabor: state.includeLabor,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {
    // ignore
  }
}

export function useCatalog() {
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

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadEstimateFromStorage()
    setEstimate(loaded)
    setIsEstimateLoaded(true)
  }, [])

  // Save to localStorage whenever estimate changes
  useEffect(() => {
    if (isEstimateLoaded) {
      saveEstimateToStorage(estimate)
    }
  }, [estimate, isEstimateLoaded])

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = [...products]

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
  }, [activeCategory, selectedBrands, searchQuery, sort])

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const hasMore = filteredProducts.length > visibleCount
  const totalCount = filteredProducts.length

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
  }, [])

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
