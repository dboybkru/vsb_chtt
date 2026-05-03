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

export interface MaterialItem {
  id: number
  item_type: string
  name: string
  characteristics: string
  unit: string
  price: number
  source: string
  last_update: string
}

export const categories: Category[] = ['Камеры', 'Регистраторы', 'СКУД', 'ОПС', 'Сеть']

export const brands: Brand[] = ['Hikvision', 'Dahua', 'RVi', 'BOLID', 'Рубеж', 'Cabeus']

export const priceTiers: PriceTier[] = ['Розница', 'Инсталлятор', 'Опт', 'Крупный опт', 'Партнёрская']

export const tierColorClass: Record<PriceTier, string> = {
  'Розница': 'bg-guard-green/15 text-guard-green',
  'Инсталлятор': 'bg-aurora-teal/15 text-aurora-teal',
  'Опт': 'bg-caution-amber/15 text-caution-amber',
  'Крупный опт': 'bg-text-muted/20 text-text-muted',
  'Партнёрская': 'bg-pure-white/10 text-pure-white',
}

// ---- Image mapping cache ----
let imageMapping: Record<number, string> | null = null

function getImageMapping(): Record<number, string> {
  if (imageMapping) return imageMapping
  try {
    const stored = localStorage.getItem('catalog-image-mapping')
    if (stored) {
      imageMapping = JSON.parse(stored)
      return imageMapping || {}
    }
  } catch { /* ignore */ }
  return {}
}

export async function loadImageMapping(): Promise<void> {
  try {
    const resp = await fetch('/catalog-image-mapping.json')
    if (resp.ok) {
      const data = await resp.json()
      imageMapping = data
      localStorage.setItem('catalog-image-mapping', JSON.stringify(data))
    }
  } catch (e) {
    console.error('Failed to load image mapping:', e)
  }
}

export function getProductImageById(id: number): string | undefined {
  const mapping = getImageMapping()
  return mapping[id]
}
// ------------------------------

export function getProductImage(category: string): string {
  switch (category) {
    case 'Камеры':
      return '/catalog-camera-1.jpg'
    case 'Регистраторы':
      return '/catalog-nvr-1.jpg'
    case 'СКУД':
      return '/catalog-skud-1.jpg'
    case 'ОПС':
      return '/catalog-signalization-1.jpg'
    case 'Сеть':
      return '/catalog-network-1.jpg'
    default:
      return '/catalog-camera-1.jpg'
  }
}

function getProductImageCategory(source: string, name: string): Category {
  const text = (source + ' ' + name).toLowerCase()

  if (text.includes('камер') || text.includes('камера')) {
    return 'Камеры'
  } else if (text.includes('регистратор')) {
    return 'Регистраторы'
  } else if (text.includes('скуд') || text.includes('домофон')) {
    return 'СКУД'
  } else if (text.includes('сигнализация') || text.includes('с2000') || text.includes('извещатель') || text.includes('пожар')) {
    return 'ОПС'
  } else if (
    text.includes('сетевое') ||
    text.includes('кабель') ||
    text.includes('блоки питания') ||
    text.includes('аккумулятор') ||
    text.includes('коммутатор') ||
    text.includes('патч') ||
    text.includes('poе')
  ) {
    return 'Сеть'
  }
  return 'Камеры'
}

export function mapMaterialToProduct(material: MaterialItem): Product {
  const source = material.source || ''
  const name = material.name || ''
  // Extract brand from source or name
  let brand: Brand = 'Optimus'
  const brandKeywords = [
    'EL', 'Optimus', 'Hikvision', 'Dahua', 'RVi', 'BOLID',
    'Рубеж', 'Cabeus', 'PERCo', 'РОСА', 'С2000',
  ]
  for (const kw of brandKeywords) {
    if (source.includes(kw) || name.includes(kw)) {
      brand = kw
      break
    }
  }

  // Category mapping
  const category = getProductImageCategory(source, name)

  // Get real image from mapping, fallback to category-based
  const realImage = getProductImageById(material.id)

  return {
    id: String(material.id),
    name: material.name,
    sku: `OPT-${material.id}`,
    brand,
    category,
    image: realImage || getProductImage(category),
    price: material.price,
    priceTier: 'Розница',
    description: material.characteristics || '',
  }
}
