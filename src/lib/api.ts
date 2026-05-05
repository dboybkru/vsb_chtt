export const API_PREFIX = '/api'

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers || {}),
    },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.detail || payload?.error || `HTTP ${response.status}`
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message))
  }
  return payload as T
}

export interface ApiMaterial {
  id: number
  item_type?: string
  name: string
  characteristics?: string
  unit?: string
  price: number
  source?: string
  sku?: string
  brand?: string
  category?: string
  image_url?: string
  photo_score?: number
  photo_status?: string
  product_url?: string
}

export interface MaterialsResponse {
  items: ApiMaterial[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface LaborRates {
  simple_percent: number
  medium_percent: number
  complex_percent: number
}
