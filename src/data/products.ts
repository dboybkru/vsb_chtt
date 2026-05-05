export type Category = string

export type Brand = string

export type PriceTier = 'Розница' | 'Инсталлятор' | 'Опт' | 'Крупный опт' | 'Партнёрская'

export interface Product {
  id: string
  name: string
  sku: string
  brand: Brand
  category: Category
  image: string
  price: number
  priceTier: PriceTier
  description: string
}

export interface ExternalCatalogProduct {
  id?: string | number
  name?: string
  brand?: string
  category?: string
  price?: number
  priceTiers?: {
    retail?: number
    installer?: number
    opt?: number
    bulk?: number
    partner?: number
  }
  code?: string
  sku?: string
  photo?: string
  analytics?: string
  description?: string
  image_url?: string
  characteristics?: string
  item_type?: string
  source?: string
}

export const categories: Category[] = ['Камеры', 'Регистраторы', 'СКУД', 'ОПС', 'Сеть', 'Кабель']

export const brands: Brand[] = ['Optimus', 'Hikvision', 'Dahua', 'RVi', 'BOLID', 'Рубеж', 'Cabeus']

export const priceTiers: PriceTier[] = ['Розница', 'Инсталлятор', 'Опт', 'Крупный опт', 'Партнёрская']

export const tierColorClass: Record<PriceTier, string> = {
  'Розница': 'bg-guard-green/15 text-guard-green',
  'Инсталлятор': 'bg-aurora-teal/15 text-aurora-teal',
  'Опт': 'bg-caution-amber/15 text-caution-amber',
  'Крупный опт': 'bg-text-muted/20 text-text-muted',
  'Партнёрская': 'bg-pure-white/10 text-pure-white',
}

export const products: Product[] = []

const imageByCategory: Record<string, string> = {
  Камеры: '/catalog-camera-1.jpg',
  Регистраторы: '/catalog-nvr-1.jpg',
  СКУД: '/catalog-skud-1.jpg',
  ОПС: '/catalog-skud-1.jpg',
  Сеть: '/catalog-network-1.jpg',
  Кабель: '/catalog-network-1.jpg',
}

export function normalizeExternalProduct(raw: ExternalCatalogProduct, index: number): Product | null {
  const name = raw.name?.trim()
  if (!name) return null

  const category = raw.category?.trim() || (raw.item_type === 'work' ? 'Работы' : 'Оборудование')
  const brand = raw.brand?.trim() || 'Без бренда'
  const retail = raw.priceTiers?.retail || raw.price || 0
  const installer = raw.priceTiers?.installer

  return {
    id: String(raw.id || raw.code || `external-${index}`),
    name,
    sku: String(raw.code || raw.sku || raw.id || `EXT-${index + 1}`),
    brand,
    category,
    image: raw.image_url || raw.photo || imageByCategory[category] || '/catalog-camera-1.jpg',
    price: Math.round(retail),
    priceTier: installer && installer < retail ? 'Инсталлятор' : 'Розница',
    description: raw.description || raw.analytics || raw.characteristics || raw.source || 'Оборудование из загруженного каталога.',
  }
}
