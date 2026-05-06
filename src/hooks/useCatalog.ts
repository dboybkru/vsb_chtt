import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  products as fallbackProducts,
  normalizeExternalProduct,
  type ExternalCatalogProduct,
  type Product,
  type Category,
  type Brand,
} from '@/data/products'
import { apiRequest, type MaterialsResponse } from '@/lib/api'

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
const CATALOG_PAGE_SIZE = 120
let catalogSessionCache: Product[] | null = null

const RU_TO_EN_LAYOUT: Record<string, string> = {
  й: 'q', ц: 'w', у: 'e', к: 'r', е: 't', н: 'y', г: 'u', ш: 'i', щ: 'o', з: 'p', х: '[', ъ: ']',
  ф: 'a', ы: 's', в: 'd', а: 'f', п: 'g', р: 'h', о: 'j', л: 'k', д: 'l', ж: ';', э: "'",
  я: 'z', ч: 'x', с: 'c', м: 'v', и: 'b', т: 'n', ь: 'm', б: ',', ю: '.', ё: '`',
}
const EN_TO_RU_LAYOUT = Object.fromEntries(Object.entries(RU_TO_EN_LAYOUT).map(([ru, en]) => [en, ru])) as Record<string, string>
const LATIN_TO_CYRILLIC_LOOKALIKE: Record<string, string> = {
  a: 'а', b: 'в', c: 'с', e: 'е', h: 'н', k: 'к', m: 'м', o: 'о', p: 'р', t: 'т', x: 'х', y: 'у',
}
const CYRILLIC_TO_LATIN_LOOKALIKE = Object.fromEntries(Object.entries(LATIN_TO_CYRILLIC_LOOKALIKE).map(([latin, cyrillic]) => [cyrillic, latin])) as Record<string, string>

const SEARCH_SYNONYMS: Record<string, string[]> = {
  камера: ['камера', 'камеры', 'видеокамера', 'видеокамеры'],
  камеры: ['камера', 'камеры', 'видеокамера', 'видеокамеры'],
  видеокамера: ['камера', 'камеры', 'видеокамера', 'видеокамеры'],
  регистратор: ['регистратор', 'регистраторы', 'видеорегистратор', 'nvr', 'dvr'],
  регистр: ['регистратор', 'регистраторы', 'видеорегистратор', 'nvr', 'dvr'],
  видеорегистратор: ['регистратор', 'регистраторы', 'видеорегистратор', 'nvr', 'dvr'],
  скуд: ['скуд', 'считыватель', 'контроллер', 'замок'],
  ибп: ['ибп', 'источник', 'блок питания', 'аккумулятор'],
  hdd: ['hdd', 'жд', 'диск', 'жесткий'],
  жд: ['hdd', 'жд', 'диск', 'жесткий'],
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/ё/g, 'е').replace(/[^0-9a-zа-я]+/g, ' ').trim()
}

function switchLayout(value: string, map: Record<string, string>) {
  return value.toLowerCase().split('').map((char) => map[char] ?? char).join('')
}

function queryGroups(query: string) {
  return normalizeSearch(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const variants = new Set<string>([
        token,
        switchLayout(token, RU_TO_EN_LAYOUT),
        switchLayout(token, EN_TO_RU_LAYOUT),
        switchLayout(token, LATIN_TO_CYRILLIC_LOOKALIKE),
        switchLayout(token, CYRILLIC_TO_LATIN_LOOKALIKE),
        ...(SEARCH_SYNONYMS[token] || []),
      ])
      return Array.from(variants).map(normalizeSearch).filter(Boolean)
    })
}

function productSearchText(product: Product) {
  return normalizeSearch([
    product.name,
    product.sku,
    product.brand,
    product.category,
    product.description,
  ].join(' '))
}

function productSearchScore(product: Product, query: string, groups: string[][]) {
  const name = normalizeSearch(product.name)
  const sku = normalizeSearch(product.sku)
  const brand = normalizeSearch(product.brand)
  const text = productSearchText(product)
  const normalizedQuery = normalizeSearch(query)
  if (!groups.every((group) => group.some((term) => text.includes(term)))) return -1
  let score = 0
  if (sku === normalizedQuery) score += 500
  if (name === normalizedQuery) score += 450
  if (sku.includes(normalizedQuery)) score += 220
  if (name.startsWith(normalizedQuery)) score += 200
  if (name.includes(normalizedQuery)) score += 140
  if (brand.includes(normalizedQuery)) score += 80
  for (const group of groups) {
    if (group.some((term) => name.includes(term))) score += 40
    if (group.some((term) => sku.includes(term))) score += 60
  }
  return score
}

function loadEstimateFromStorage(): EstimateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as {
        items?: Array<{ product?: Product; quantity?: number } & Partial<Product>>
        includeLabor?: boolean
      }
      const items = parsed.items
        ?.map((item) => {
          const product = item.product || (
            item.id && item.name && item.sku ? item as Product : null
          )
          return product ? { product, quantity: item.quantity } : null
        })
        .filter((item): item is CartItem => Boolean(item?.product && item.quantity && item.quantity > 0)) ?? []
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
        ...item.product,
        quantity: item.quantity,
      })),
      labor: { auto: true, complexity: 'medium', manualCost: 0 },
      services: { design: false, training: false, commissioning: false, warranty: false },
      params: { type: '', area: 0, cameras: 0, accessPoints: 0, fireAlarm: false, network: false, address: '', phone: '', name: '', notes: '' },
      includeLabor: state.includeLabor,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {
    // ignore
  }
}

export function useCatalog() {
  const [allProducts, setAllProducts] = useState<Product[]>(fallbackProducts)
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const initialCategory = new URLSearchParams(window.location.search).get('category')

  // Filters
  const [activeCategory, setActiveCategory] = useState<Category | 'Все'>(initialCategory || 'Все')
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

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      if (catalogSessionCache?.length) {
        setAllProducts(catalogSessionCache)
        setIsLoadingCatalog(false)
        return
      }
      try {
        const firstPage = await apiRequest<MaterialsResponse>(`/materials?item_type=equipment&limit=${CATALOG_PAGE_SIZE}&offset=0`)
        const pages = [firstPage]
        const firstExternal = firstPage.items
          .map((item, index) => normalizeExternalProduct(item, index))
          .filter((item): item is Product => item !== null)

        if (!cancelled && firstExternal.length > 0) {
          const existingIds = new Set(firstExternal.map((item) => item.id))
          setAllProducts([...firstExternal, ...fallbackProducts.filter((item) => !existingIds.has(item.id))])
          setIsLoadingCatalog(false)
        }

        let offset = firstPage.offset + firstPage.limit
        while (!cancelled && firstPage.total > offset && pages.length < 20) {
          pages.push(await apiRequest<MaterialsResponse>(`/materials?item_type=equipment&limit=${CATALOG_PAGE_SIZE}&offset=${offset}`))
          offset += CATALOG_PAGE_SIZE
        }
        const external = pages.flatMap((page) => page.items)
          .map((item, index) => normalizeExternalProduct(item, index))
          .filter((item): item is Product => item !== null)

        if (!cancelled && external.length > 0) {
          const existingIds = new Set(external.map((item) => item.id))
          const merged = [...external, ...fallbackProducts.filter((item) => !existingIds.has(item.id))]
          catalogSessionCache = merged
          setAllProducts(merged)
        }
      } catch (error) {
        try {
          const response = await fetch('/data/optimus-products.json', { cache: 'no-store' })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const raw = await response.json() as ExternalCatalogProduct[]
          const external = raw
            .map((item, index) => normalizeExternalProduct(item, index))
            .filter((item): item is Product => item !== null)
          if (!cancelled) setAllProducts(external)
        } catch {
          if (!cancelled) setCatalogError(error instanceof Error ? error.message : 'Не удалось загрузить каталог')
        }
      } finally {
        if (!cancelled) setIsLoadingCatalog(false)
      }
    }

    loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  // Save to localStorage whenever estimate changes
  useEffect(() => {
    if (isEstimateLoaded) {
      saveEstimateToStorage(estimate)
    }
  }, [estimate, isEstimateLoaded])

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (activeCategory !== 'Все') {
      result = result.filter((p) => p.category === activeCategory)
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand))
    }

    if (searchQuery.trim()) {
      const groups = queryGroups(searchQuery)
      result = result
        .map((product) => ({ product, score: productSearchScore(product, searchQuery, groups) }))
        .filter((item) => item.score >= 0)
        .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
        .map((item) => item.product)
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
  }, [activeCategory, allProducts, selectedBrands, searchQuery, sort])

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
    allProducts,
    totalCount,
    hasMore,
    loadMore,
    resetFilters,
    isLoadingCatalog,
    catalogError,

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
