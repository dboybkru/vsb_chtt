import { normalize } from './formatters'
import { estimateRates } from '@/data/constants'
import type { Product, EstimateLine, AutoEstimateResult } from '@/types'

export function productText(product: Product): string {
  return normalize(
    [product.name, product.brand, product.category, product.resolution, product.analytics, product.description, product.codec, ...(product.tags || [])].join(' ')
  )
}

export function productChannels(product: Product): number {
  const direct = Number(product.channels || 0)
  if (direct > 0) return direct
  const match = productText(product).match(/(\d+)\s*(канал|ch|channel)/)
  return match ? Number(match[1]) : 0
}

export function isIpCamera(product: Product): boolean {
  const text = productText(product)
  return (
    product.category === 'Камеры' &&
    (product.tags?.includes('ip') || text.includes(' ip ') || text.includes('ip-') || text.includes('poe') || text.includes('сетевая'))
  )
}

export function hasResolution(product: Product, resolution: string): boolean {
  const wanted = normalize(resolution)
  const text = productText(product)
  return normalize(product.resolution).includes(wanted) || text.includes(wanted)
}

export function cheapestProduct(products: Product[], predicate: (p: Product) => boolean): Product | null {
  return (Array.isArray(products) ? products : [])
    .filter(p => Number(p.price) > 0 && predicate(p))
    .sort((a, b) => a.price - b.price)[0] || null
}

export function fallbackProduct(
  id: string,
  name: string,
  price: number,
  unit = 'шт',
  category = 'Разное',
  description = ''
): Product {
  return {
    id,
    name,
    price,
    unit,
    category,
    description,
    source: 'расчёт ВСБ39',
    brand: name.split(/\s+/)[0],
    resolution: '-',
    poe: false,
    outdoor: false,
    analytics: description,
    stock: 0,
    specFilters: [],
    tags: [],
    wdr: false,
    mic: false,
    audio: false,
    ik: false,
    colorNight: false,
  }
}

export function pickCamera(products: Product[], complexity: string): Product {
  const targetResolution = complexity === 'simple' ? '2MP' : '4MP'
  return (
    cheapestProduct(products, p => isIpCamera(p) && hasResolution(p, targetResolution)) ||
    cheapestProduct(products, isIpCamera) ||
    fallbackProduct('estimate-camera-ip', `IP-камера ${targetResolution}`, 0, 'шт', 'Камеры', 'Не найдена в базе: добавьте подходящую IP-камеру в прайс.')
  )
}

export function pickNvr(products: Product[], cameraCount: number): Product {
  const byName =
    cameraCount <= 10
      ? cheapestProduct(products, p => productText(p).includes('nvr-5101'))
      : cameraCount <= 16
        ? cheapestProduct(products, p => productText(p).includes('nvr-5161'))
        : null
  if (byName) return byName
  return (
    cheapestProduct(products, p => {
      const text = productText(p)
      return (
        p.category === 'Регистраторы' &&
        (text.includes('nvr') || text.includes('ip-видеорегистратор')) &&
        productChannels(p) >= cameraCount
      )
    }) ||
    fallbackProduct('estimate-nvr', `NVR на ${cameraCount} камер`, 0, 'шт', 'Регистраторы', 'Не найден в базе: подберите NVR по количеству каналов.')
  )
}

export function pickSwitch(products: Product[]): Product {
  return (
    cheapestProduct(products, p => productText(p).includes('optimus u1i-4f/2f')) ||
    fallbackProduct('estimate-poe-switch', 'Коммутатор Optimus U1I-4F/2F', 0, 'шт', 'Сеть', '1 шт на каждые 4 камеры.')
  )
}

export function pickCable(products: Product[]): Product {
  return (
    cheapestProduct(products, p => productText(p).includes('optimus u5e-4x2x0.48 cu')) ||
    fallbackProduct('estimate-cable-u5e', 'Кабель Optimus U5e-4x2x0.48 Cu (IN)', estimateRates.cableMaterial, 'м', 'Сеть', 'Материал кабеля по нормативу 15 м на камеру.')
  )
}

export function buildAutoEstimate(
  products: Product[],
  area: number | string,
  complexity: string,
  objectType = 'Склад',
  attention: { workplaces?: number | string; points?: number | string } = {}
): AutoEstimateResult {
  const numericArea = Math.max(0, Number(area) || 0)
  const workAttention = Math.max(0, Math.round(Number(attention.workplaces) || 0))
  const pointAttention = Math.max(0, Math.round(Number(attention.points) || 0))
  const buildingLength = numericArea / 10
  const perimeterCameraCount = Math.max(1, Math.ceil(buildingLength / estimateRates.cameraStepMeters) + 1)
  const baseCameraCount =
    objectType === 'Дом'
      ? 4
      : perimeterCameraCount +
        (['Офис', 'Производство'].includes(objectType) ? workAttention : 0) +
        (['Магазин', 'Производство'].includes(objectType) ? pointAttention : 0)
  const cameraCount = complexity === 'hard' && baseCameraCount > 10 ? Math.ceil(baseCameraCount * 1.3) : baseCameraCount
  const switchCount = Math.max(1, Math.ceil(cameraCount / 4))
  const cableMeters = cameraCount * estimateRates.cablePerCamera
  const camera = pickCamera(products, complexity)
  const nvr = pickNvr(products, cameraCount)
  const poeSwitch = pickSwitch(products)
  const cable = pickCable(products)
  const lines: EstimateLine[] = [
    {
      id: 'auto-camera',
      type: 'equipment',
      name: camera.name,
      note: `IP-камера ${complexity === 'simple' ? '2 Мп' : '4 Мп'}; шаг между камерами до ${estimateRates.cameraStepMeters} м.`,
      qty: cameraCount,
      unit: camera.unit || 'шт',
      price: Number(camera.price || 0),
    },
    {
      id: 'auto-nvr',
      type: 'equipment',
      name: nvr.name,
      note: `NVR под ${cameraCount} камер. Нужен жёсткий диск для архива; диск указан в описании, но не включён в стоимость.`,
      qty: 1,
      unit: nvr.unit || 'шт',
      price: Number(nvr.price || 0),
    },
    {
      id: 'auto-switch',
      type: 'equipment',
      name: poeSwitch.name,
      note: 'PoE-коммутатор: 1 шт на каждые 4 камеры.',
      qty: switchCount,
      unit: poeSwitch.unit || 'шт',
      price: Number(poeSwitch.price || 0),
    },
    {
      id: 'auto-cable',
      type: 'equipment',
      name: cable.name,
      note: `${estimateRates.cablePerCamera} м на каждую камеру.`,
      qty: cableMeters,
      unit: 'м',
      price: estimateRates.cableMaterial,
    },
    {
      id: 'work-camera',
      type: 'work',
      name: 'Монтаж камеры',
      note: `${cameraCount} точек установки.`,
      qty: cameraCount,
      unit: 'шт',
      price: estimateRates.cameraInstall,
    },
    {
      id: 'work-nvr',
      type: 'work',
      name: 'Монтаж регистратора',
      note: 'Установка и подключение NVR.',
      qty: 1,
      unit: 'шт',
      price: estimateRates.nvrInstall,
    },
    {
      id: 'work-switch',
      type: 'work',
      name: 'Монтаж PoE-коммутатора',
      note: `${switchCount} коммутаторов.`,
      qty: switchCount,
      unit: 'шт',
      price: estimateRates.switchInstall,
    },
    {
      id: 'work-cable',
      type: 'work',
      name: 'Прокладка кабеля витая пара',
      note: `${estimateRates.cablePerCamera} м на камеру.`,
      qty: cableMeters,
      unit: 'м',
      price: estimateRates.cableInstall,
    },
    {
      id: 'work-remote',
      type: 'work',
      name: 'Настройка удалённого доступа',
      note: 'Мобильное приложение, доступ клиента и базовая проверка.',
      qty: 1,
      unit: 'шт',
      price: estimateRates.remoteAccess,
    },
  ]
  return {
    buildingLength,
    baseCameraCount,
    perimeterCameraCount,
    workAttention,
    pointAttention,
    cameraCount,
    switchCount,
    cableMeters,
    lines,
  }
}
