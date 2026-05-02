import { normalize, parseNumber, cellText, isImageUrl } from './formatters'
import type { Product } from '@/types'

// --- helpers ---
export function firstNumeric(values: unknown[]): string {
  for (const value of values) {
    const cleaned = String(value || '').replace(/[^\d.,]/g, '').replace(',', '.')
    if (cleaned && Number(cleaned) > 0) return cleaned
  }
  return ''
}

export function priceTierIndexes(headers: unknown[]): { retail?: number; installer?: number; opt?: number; bulk?: number; partner?: number } {
  const result: Record<string, number> = {}
  const map: Record<string, string[]> = {
    retail: ['розничная цена', 'розница', 'retail'],
    installer: ['монтажник', 'установщик', 'installer'],
    opt: ['оптовая цена', 'опт', 'opt'],
    bulk: ['крупный опт', 'крупнооптовая цена', 'bulk'],
    partner: ['партнёрская цена', 'партнёр', 'partner'],
  }
  headers.forEach((header, index) => {
    const lower = normalize(header)
    for (const [tier, keywords] of Object.entries(map)) {
      if (keywords.some(k => lower.includes(k))) result[tier] = index
    }
  })
  return result
}

export function normalizePhoto(value: unknown): string | undefined {
  const text = cellText(value)
  if (isImageUrl(text)) return text
  return undefined
}

export function normalizeProductUrl(value: unknown): string | undefined {
  const text = cellText(value)
  if (/^https?:\/\/.+/i.test(text)) return text
  return undefined
}

export function photoSearchQuery(value: unknown): string | undefined {
  const text = cellText(value)
  if (text.length < 3) return undefined
  return text.replace(/[<>]/g, '').trim()
}

export function findHeaderIndex(headers: unknown[], keywords: string[]): number {
  return headers.findIndex(header =>
    keywords.some(keyword => normalize(header).includes(keyword))
  )
}

export function columnIndex(headers: unknown[], keywords: string[]): number {
  return findHeaderIndex(headers, keywords)
}

export function inferCategory(name: unknown): string {
  const text = normalize(name)
  const categories: { keywords: string[]; category: string }[] = [
    { keywords: ['камера', 'ip-камера', 'камера ip', 'видеокамера', 'ptz'], category: 'Камеры' },
    { keywords: ['видеорегистратор', 'nvr', 'регистратор', 'видеосервер', 'видеорегистратор ip'], category: 'Регистраторы' },
    { keywords: ['домофон', 'трубка', 'вызывная панель', 'ab'], category: 'Домофония' },
    { keywords: ['датчик', 'извещатель', 'датчик движения', 'дымовой'], category: 'Датчики' },
    { keywords: ['скуд', 'контроль доступа', 'считыватель', 'замок', 'с2000'], category: 'СКУД' },
    { keywords: ['охранная сигнализация', 'пожарная сигнализация', 'рпд', 'сирена', 'прибор'], category: 'ОПС' },
    { keywords: ['кронштейн', 'кронштейна', 'кронштейн'], category: 'Монтаж' },
    { keywords: ['кабель', 'витая пара', 'utp', 'ftp', 'sftp', 'патч-корд'], category: 'Сеть' },
    { keywords: ['питания', 'блок питания', 'adp', 'ипр'], category: 'БП' },
    { keywords: ['коммутатор', 'switch', 'роутер', 'маршрутизатор'], category: 'Сеть' },
  ]
  for (const rule of categories) {
    if (rule.keywords.some(keyword => text.includes(keyword))) return rule.category
  }
  return 'Разное'
}

export function extractResolution(name: unknown): string {
  const text = normalize(name)
  const match = text.match(/(\d+)[\s.]*(?:mp|мп|megapixel|мегапиксель)/i)
  if (match) return `${match[1]}MP`
  if (text.includes('4k') || text.includes('8 mp')) return '8MP'
  if (text.includes('2k') || text.includes('5 mp')) return '5MP'
  if (text.includes('2 mp') || text.includes('1080p')) return '2MP'
  if (text.includes('1 mp')) return '1MP'
  return '-'
}

export function extractLens(name: unknown): string {
  const text = normalize(name)
  const match = text.match(/(\d+(?:\.\d+)?)\s*(mm|мм)/)
  return match ? `${match[1]} мм` : '-'
}

export function extractFormFactor(name: unknown): string {
  const text = normalize(name)
  if (text.includes('купольная')) return 'купольная'
  if (text.includes('цилиндрическая') || text.includes('bullet')) return 'цилиндрическая'
  if (text.includes('корпусная')) return 'корпусная'
  if (text.includes('mini')) return 'mini'
  return '-'
}

export function extractIpRating(name: unknown): string {
  const text = normalize(name)
  const match = text.match(/ip6\d/i)
  return match ? match[0].toUpperCase() : '-'
}

export function extractCodec(name: unknown): string {
  const text = normalize(name)
  if (text.includes('h.265')) return 'H.265'
  if (text.includes('h.264')) return 'H.264'
  return '-'
}

export function extractIrDistance(name: unknown): string {
  const text = normalize(name)
  const match = text.match(/(\d+)\s*m\s*ir/i)
  return match ? `${match[1]} м` : '-'
}

export function extractSpecFilters(name: unknown, description: unknown, tags: string[]): string[] {
  const text = normalize(`${name || ''} ${description || ''}`)
  const specFilters = new Set<string>()
  if (text.includes('poe')) specFilters.add('PoE')
  if (text.includes('wdr')) specFilters.add('WDR')
  if (text.includes('ик')) specFilters.add('ИК-подсветка')
  if (text.includes('микрофон') || text.includes('встроенный микрофон')) specFilters.add('Микрофон')
  if (text.includes('цветная ночь') || text.includes('color night')) specFilters.add('Цветная ночь')
  if (text.includes('audio') || text.includes('аудио')) specFilters.add('Аудио')
  tags?.forEach(tag => {
    if (tag) specFilters.add(tag)
  })
  return Array.from(specFilters)
}

export function normalizeStoredProduct(raw: Product): Product {
  const p: Product = {
    id: raw.id || '',
    name: raw.name || '',
    brand: raw.brand || '',
    category: raw.category || 'Разное',
    price: Number(raw.price || 0),
    resolution: raw.resolution || '-',
    poe: Boolean(raw.poe),
    outdoor: Boolean(raw.outdoor),
    wdr: Boolean(raw.wdr),
    analytics: raw.analytics || '',
    stock: Number(raw.stock || 0),
    source: raw.source || '',
    specFilters: Array.isArray(raw.specFilters) ? raw.specFilters : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    photo: raw.photo,
    oldPrice: raw.oldPrice,
    lens: raw.lens,
    channels: raw.channels,
    formFactor: raw.formFactor,
    ipRating: raw.ipRating,
    codec: raw.codec,
    irDistance: raw.irDistance,
    mic: Boolean(raw.mic),
    audio: Boolean(raw.audio),
    ik: Boolean(raw.ik),
    colorNight: Boolean(raw.colorNight),
    unit: raw.unit,
    code: raw.code,
    productUrl: raw.productUrl,
    description: raw.description,
    priceTiers: raw.priceTiers,
  }
  return p
}

export function makeProduct(row: Record<string, unknown>, source: string, photoUrls: Record<string, string>): Product {
  const name = cellText(row['Название'] || row['Наименование'] || row['name'] || row['Model'] || row['model'] || '')
  const brand = cellText(row['Бренд'] || row['Brand'] || row['brand'] || '')
  const category = cellText(row['Категория'] || row['Category'] || row['category'] || inferCategory(name))
  const price = firstNumeric([row['Цена'], row['Розничная цена'], row['Цена продажи'], row['Цена 1'], row['Price']])
  const oldPrice = firstNumeric([row['Старая цена'], row['old_price']])
  const unit = cellText(row['Ед.изм.'] || row['Unit'] || row['unit'] || 'шт')
  const code = cellText(row['Артикул'] || row['Код'] || row['Code'] || row['code'] || '')
  const productUrl = normalizeProductUrl(row['Ссылка'] || row['URL'] || row['url'] || row['Product URL'] || '')
  const photoQuery = photoSearchQuery(row['Фото'] || row['Photo'] || row['photo'] || '')
  const marketingPhotos: string[] = []
  const photo = normalizePhoto(row['Фото'] || row['Photo'] || row['photo'] || '')
    || (photoQuery && photoUrls[photoQuery] ? photoUrls[photoQuery] : undefined)
    || undefined
  if (photo) marketingPhotos.push(photo)
  const description = cellText(row['Описание'] || row['Description'] || row['description'] || '')
  const specFilters = extractSpecFilters(
    name,
    row['Описание'] || row['Description'] || row['description'] || '',
    [cellText(row['Теги'] || row['Tags'] || row['tags'] || '')]
  )
  const tagsText = cellText(row['Теги'] || row['Tags'] || row['tags'] || '')
  const tags = tagsText ? tagsText.split(/[,;]/).map(t => t.trim()).filter(Boolean) : []
  const tierIndexes = priceTierIndexes([
    'Название', 'Наименование', 'name', 'Model', 'model',
    'Бренд', 'Brand', 'brand', 'Категория', 'Category', 'category',
    'Цена', 'Розничная цена', 'Цена продажи', 'Цена 1', 'Price',
    'Старая цена', 'old_price',
    'Ед.изм.', 'Unit', 'unit',
    'Артикул', 'Код', 'Code', 'code',
    'Описание', 'Description', 'description',
    'Фото', 'Photo', 'photo',
    'Ссылка', 'URL', 'url', 'Product URL',
    'Розничная цена', 'розничная цена', 'retail',
    'Монтажник', 'монтажник', 'installer',
    'Оптовая цена', 'оптовая цена', 'opt',
    'Крупный опт', 'крупный опт', 'bulk',
    'Партнёрская цена', 'партнёрская цена', 'partner',
  ])
  const priceTiers = {
    retail: price ? Number(price) : 0,
    installer: tierIndexes.installer !== undefined ? parseNumber(row[Object.keys(row)[tierIndexes.installer] as string]) : undefined,
    opt: tierIndexes.opt !== undefined ? parseNumber(row[Object.keys(row)[tierIndexes.opt] as string]) : undefined,
    bulk: tierIndexes.bulk !== undefined ? parseNumber(row[Object.keys(row)[tierIndexes.bulk] as string]) : undefined,
    partner: tierIndexes.partner !== undefined ? parseNumber(row[Object.keys(row)[tierIndexes.partner] as string]) : undefined,
  }
  const id = `${normalize(name).replace(/\W+/g, '-') || code || Math.random().toString(36).slice(2, 10)}-${source}`
  return {
    id,
    name,
    brand,
    category,
    price: Number(price) || 0,
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    unit,
    code,
    photo,
    productUrl,
    photoQuery,
    photoStatus: photo ? 'ready' : 'needs-search',
    marketingPhotos,
    description,
    resolution: extractResolution(name),
    lens: extractLens(name),
    formFactor: extractFormFactor(name),
    ipRating: extractIpRating(name),
    codec: extractCodec(name),
    irDistance: parseNumber(extractIrDistance(name)),
    channels: parseNumber(row['Каналы'] || row['Channels'] || row['channels']),
    poe: normalize(`${name} ${description}`).includes('poe'),
    outdoor: normalize(`${name} ${description}`).includes('уличн') || normalize(`${name} ${description}`).includes('наружн'),
    wdr: normalize(`${name} ${description}`).includes('wdr'),
    mic: normalize(`${name} ${description}`).includes('микрофон'),
    audio: normalize(`${name} ${description}`).includes('аудио'),
    ik: normalize(`${name} ${description}`).includes('ик-подсветк') || normalize(`${name} ${description}`).includes('ir'),
    colorNight: normalize(`${name} ${description}`).includes('цветная ночь'),
    analytics: cellText(row['Аналитика'] || row['Analytics'] || row['analytics'] || ''),
    stock: parseNumber(row['Наличие'] || row['Stock'] || row['stock'] || row['Количество']),
    source,
    specFilters,
    tags,
    priceTiers,
  }
}
