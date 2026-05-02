import { normalize } from './formatters'
import type { Product, FilterState } from '@/types'

export const selectFilterKeys = [
  'category',
  'brand',
  'resolution',
  'formFactor',
  'lens',
  'ipRating',
  'channels',
  'codec',
  'spec',
] as const

export const booleanFilterKeys = [
  'poe',
  'outdoor',
  'wdr',
  'mic',
  'audio',
  'ik',
  'colorNight',
  'hasPhoto',
] as const

export function optionValue(product: Product, key: string): string | string[] {
  if (key === 'channels') return product.channels ? String(product.channels) : ''
  if (key === 'spec') return product.specFilters || []
  if (key === 'category') return product.category || ''
  return (product as unknown as Record<string, unknown>)[key] as string || ''
}

export function optionValues(product: Product, key: string): string[] {
  const value = optionValue(product, key)
  return Array.isArray(value) ? value : [value]
}

export function hasFilterValue(product: Product, key: string, value: string): boolean {
  if (!value || value === 'Все') return true
  return optionValues(product, key)
    .map(String)
    .includes(String(value))
}

export function matchesProductFilters(
  product: Product,
  filters: FilterState,
  ignoredKey = ''
): boolean {
  if (filters.category !== 'Все' && ignoredKey !== 'category' && product.category !== filters.category) return false
  if (filters.brand !== 'Все' && ignoredKey !== 'brand' && product.brand !== filters.brand) return false
  if (filters.resolution !== 'Все' && ignoredKey !== 'resolution' && product.resolution !== filters.resolution) return false
  if (filters.formFactor !== 'Все' && ignoredKey !== 'formFactor' && product.formFactor !== filters.formFactor) return false
  if (filters.lens !== 'Все' && ignoredKey !== 'lens' && product.lens !== filters.lens) return false
  if (filters.ipRating !== 'Все' && ignoredKey !== 'ipRating' && product.ipRating !== filters.ipRating) return false
  if (filters.channels !== 'Все' && ignoredKey !== 'channels' && String(product.channels || '') !== filters.channels) return false
  if (filters.codec !== 'Все' && ignoredKey !== 'codec' && product.codec !== filters.codec) return false
  if (filters.spec !== 'Все' && ignoredKey !== 'spec' && !hasFilterValue(product, 'spec', filters.spec)) return false
  if (filters.poe && ignoredKey !== 'poe' && !product.poe) return false
  if (filters.outdoor && ignoredKey !== 'outdoor' && !product.outdoor) return false
  if (filters.wdr && ignoredKey !== 'wdr' && !product.wdr) return false
  if (filters.mic && ignoredKey !== 'mic' && !product.mic) return false
  if (filters.audio && ignoredKey !== 'audio' && !product.audio) return false
  if (filters.ik && ignoredKey !== 'ik' && !product.ik) return false
  if (filters.colorNight && ignoredKey !== 'colorNight' && !product.colorNight) return false
  if (filters.hasPhoto && ignoredKey !== 'hasPhoto' && !product.photo) return false
  if (filters.minPrice && ignoredKey !== 'minPrice' && product.price < Number(filters.minPrice)) return false
  if (filters.maxPrice && ignoredKey !== 'maxPrice' && product.price > Number(filters.maxPrice)) return false
  return true
}

export function scoreProduct(product: Product, query: string, filters: FilterState): number {
  let score = 0
  const text = normalize(
    [product.name, product.brand, product.category, product.resolution, product.lens, product.analytics, ...(product.tags || [])].join(' ')
  )
  const words = normalize(query)
    .split(/\s+/)
    .filter(Boolean)
  words.forEach(word => {
    if (text.includes(word)) score += product.name.toLowerCase().includes(word) ? 7 : 3
  })
  if (!matchesProductFilters(product, filters)) return -1
  if (filters.category !== 'Все') score += 2
  if (filters.brand !== 'Все') score += 2
  return score
}

export function sortFilterValues(key: string, values: string[]): string[] {
  const clean = values.filter(Boolean).filter(v => v !== '-')
  if (key === 'channels') return clean.sort((a, b) => Number(a) - Number(b))
  if (key === 'resolution') {
    return clean.sort((a, b) => {
      const parse = (value: string) =>
        Number(String(value).replace(',', '.').match(/\d+(?:\.\d+)?/)?.[0] || 0)
      return parse(a) - parse(b) || String(a).localeCompare(String(b), 'ru')
    })
  }
  return clean.sort((a, b) => String(a).localeCompare(String(b), 'ru'))
}

export function buildFilterOptions(
  products: Product[],
  filters: FilterState,
  key: string
): { value: string; count: number }[] {
  const counts = new Map<string, number>()
  products
    .filter(product => matchesProductFilters(product, filters, key))
    .forEach(product => {
      optionValues(product, key).forEach(value => {
        const clean = String(value || '').trim()
        if (!clean || clean === '-') return
        counts.set(clean, (counts.get(clean) || 0) + 1)
      })
    })
  return sortFilterValues(key, Array.from(counts.keys())).map(value => ({
    value,
    count: counts.get(value) || 0,
  }))
}

export function availableBooleanFilters(products: Product[], filters: FilterState): Record<string, number> {
  return booleanFilterKeys.reduce((acc, key) => {
    const count = products.filter(
      product => matchesProductFilters(product, filters, key) && (key === 'hasPhoto' ? product.photo : product[key as keyof Product])
    ).length
    acc[key] = count
    return acc
  }, {} as Record<string, number>)
}

export function similarProducts(product: Product | null, list: Product[]): Product[] {
  if (!product) return []
  return list
    .filter(item => item.id !== product.id)
    .map(item => {
      let score = 0
      if (item.category === product.category) score += 6
      if (item.brand === product.brand) score += 3
      if (item.resolution === product.resolution) score += 3
      if (item.poe === product.poe) score += 2
      if (item.outdoor === product.outdoor) score += 2
      score -= Math.abs(item.price - product.price) / 3000
      return { ...item, similarScore: score }
    })
    .sort((a, b) => (b.similarScore || 0) - (a.similarScore || 0))
    .slice(0, 4)
}

export const defaultFilters: FilterState = {
  category: 'Все',
  brand: 'Все',
  resolution: 'Все',
  formFactor: 'Все',
  lens: 'Все',
  ipRating: 'Все',
  channels: 'Все',
  codec: 'Все',
  spec: 'Все',
  minPrice: '',
  maxPrice: '',
  poe: false,
  outdoor: false,
  wdr: false,
  mic: false,
  audio: false,
  ik: false,
  colorNight: false,
  hasPhoto: false,
}

export function withCategoryFilter(current: FilterState, category: string): FilterState {
  return {
    ...current,
    category,
    resolution: defaultFilters.resolution,
    formFactor: defaultFilters.formFactor,
    lens: defaultFilters.lens,
    ipRating: defaultFilters.ipRating,
    channels: defaultFilters.channels,
    codec: defaultFilters.codec,
    spec: defaultFilters.spec,
    poe: defaultFilters.poe,
    outdoor: defaultFilters.outdoor,
    wdr: defaultFilters.wdr,
    mic: defaultFilters.mic,
    audio: defaultFilters.audio,
    ik: defaultFilters.ik,
    colorNight: defaultFilters.colorNight,
    hasPhoto: defaultFilters.hasPhoto,
  }
}
