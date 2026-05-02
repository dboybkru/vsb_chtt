// ==================== DOMAIN TYPES ====================

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  oldPrice?: number
  unit?: string
  code?: string
  photo?: string
  marketingPhotos?: string[]
  productUrl?: string
  photoQuery?: string
  photoStatus?: 'ready' | 'needs-search' | 'ai-found'
  resolution: string
  lens?: string
  megapixels?: number
  formFactor?: string
  ipRating?: string
  codec?: string
  irDistance?: number
  channels?: number
  poe: boolean
  poePorts?: number
  outdoor: boolean
  wdr: boolean
  mic: boolean
  audio: boolean
  ik: boolean
  colorNight: boolean
  analytics: string
  stock: number
  source: string
  specFilters: string[]
  tags: string[]
  description?: string
  priceTiers?: PriceTiers
  searchScore?: number
  similarScore?: number
}

export interface PriceTiers {
  retail: number
  installer?: number
  opt?: number
  bulk?: number
  partner?: number
}

export interface EstimateLine {
  id: string
  type: 'equipment' | 'work'
  name: string
  note: string
  qty: number
  unit: string
  price: number
}

export interface EstimateItem extends Product {
  qty: number
}

export interface AutoEstimateResult {
  buildingLength: number
  baseCameraCount: number
  perimeterCameraCount: number
  workAttention: number
  pointAttention: number
  cameraCount: number
  switchCount: number
  cableMeters: number
  lines: EstimateLine[]
}

export interface EstimateTotals {
  equipment: number
  work: number
  manual: number
  total: number
}

export interface FilterState {
  category: string
  brand: string
  resolution: string
  formFactor: string
  lens: string
  ipRating: string
  channels: string
  codec: string
  spec: string
  minPrice: string
  maxPrice: string
  poe: boolean
  outdoor: boolean
  wdr: boolean
  mic: boolean
  audio: boolean
  ik: boolean
  colorNight: boolean
  hasPhoto: boolean
}

export type RouteKey = 'home' | 'catalog' | 'prices' | 'estimate' | 'about' | 'admin'

export interface RouteMeta {
  title: string
  description: string
}

export interface AIProfile {
  role: string
  model: string
  endpoint: string
  why: string
}

export interface ServiceCard {
  icon: string // Lucide icon name
  title: string
  text: string
  link: string
}

export interface PhotoEnrichmentResult {
  count: number
  updates: Map<string, string>
  total: number
}
