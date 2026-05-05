import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { apiRequest, type LaborRates } from '@/lib/api'

export interface EstimateItem {
  id: string
  name: string
  sku: string
  brand: string
  price: number
  quantity: number
  image: string
  category: string
}

export interface LaborSettings {
  auto: boolean
  complexity: 'simple' | 'medium' | 'complex'
  manualCost: number
}

export interface EstimateServices {
  design: boolean
  training: boolean
  commissioning: boolean
  warranty: boolean
}

export interface ObjectParams {
  type: string
  area: number
  cameras: number
  accessPoints: number
  fireAlarm: boolean
  network: boolean
  address: string
  phone: string
  name: string
  notes: string
}

interface EstimateContextValue {
  items: EstimateItem[]
  estimate: {
    items: EstimateItem[]
    includeLabor: boolean
  }
  labor: LaborSettings
  services: EstimateServices
  params: ObjectParams
  addItem: (item: EstimateItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearEstimate: () => void
  setLabor: (labor: Partial<LaborSettings>) => void
  setServices: (services: Partial<EstimateServices>) => void
  setParams: (params: Partial<ObjectParams>) => void
  equipmentTotal: number
  laborTotal: number
  servicesTotal: number
  grandTotal: number
  itemCount: number
  laborRates: LaborRates
}

const STORAGE_KEY = 'vsb39_estimate'

function isEstimateItem(item: unknown): item is EstimateItem {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<EstimateItem>
  return Boolean(candidate.id && candidate.name && candidate.sku && candidate.brand && Number.isFinite(candidate.price))
}

function loadFromStorage(): {
  items?: EstimateItem[]
  labor?: LaborSettings
  services?: EstimateServices
  params?: ObjectParams
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      items?: Array<Partial<EstimateItem> & { productId?: string; product?: EstimateItem }>
      labor?: LaborSettings
      services?: EstimateServices
      params?: ObjectParams
    }

    const items = parsed.items
      ?.map((item) => {
        const candidate = item.product || item
        const product = isEstimateItem(candidate) ? candidate : null
        if (!product) return null
        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          brand: product.brand,
          price: product.price,
          quantity: Number.isFinite(item.quantity) && item.quantity ? Number(item.quantity) : 1,
          image: product.image,
          category: product.category,
        }
      })
      .filter((item): item is EstimateItem => item !== null)

    return {
      items: items && items.length > 0 ? items : undefined,
      labor: parsed.labor,
      services: parsed.services,
      params: parsed.params,
    }
  } catch { /* ignore */ }
  return null
}

function saveToStorage(state: { items: EstimateItem[]; labor: LaborSettings; services: EstimateServices; params: ObjectParams }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

const defaultItems: EstimateItem[] = []

const defaultLabor: LaborSettings = { auto: true, complexity: 'medium', manualCost: 0 }
const defaultLaborRates: LaborRates = { simple_percent: 20, medium_percent: 30, complex_percent: 50 }
const defaultServices: EstimateServices = { design: false, training: false, commissioning: false, warranty: false }
const defaultParams: ObjectParams = { type: '', area: 0, cameras: 0, accessPoints: 0, fireAlarm: false, network: false, address: '', phone: '', name: '', notes: '' }

const EstimateContext = createContext<EstimateContextValue | null>(null)

export function EstimateProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage()
  const [items, setItems] = useState<EstimateItem[]>(stored?.items ?? defaultItems)
  const [labor, setLaborState] = useState<LaborSettings>(stored?.labor ?? defaultLabor)
  const [laborRates, setLaborRates] = useState<LaborRates>(defaultLaborRates)
  const [services, setServicesState] = useState<EstimateServices>(stored?.services ?? defaultServices)
  const [params, setParamsState] = useState<ObjectParams>(stored?.params ?? defaultParams)

  useEffect(() => {
    saveToStorage({ items, labor, services, params })
  }, [items, labor, services, params])

  useEffect(() => {
    let cancelled = false
    apiRequest<LaborRates>('/settings/labor')
      .then((rates) => {
        if (!cancelled) setLaborRates(rates)
      })
      .catch(() => {
        if (!cancelled) setLaborRates(defaultLaborRates)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addItem = useCallback((item: EstimateItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }, [])

  const clearEstimate = useCallback(() => {
    setItems([])
  }, [])

  const setLabor = useCallback((partial: Partial<LaborSettings>) => {
    setLaborState(prev => ({ ...prev, ...partial }))
  }, [])

  const setServices = useCallback((partial: Partial<EstimateServices>) => {
    setServicesState(prev => ({ ...prev, ...partial }))
  }, [])

  const setParams = useCallback((partial: Partial<ObjectParams>) => {
    setParamsState(prev => ({ ...prev, ...partial }))
  }, [])

  const equipmentTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const laborPercent =
    (labor.complexity === 'simple'
      ? laborRates.simple_percent
      : labor.complexity === 'medium'
        ? laborRates.medium_percent
        : laborRates.complex_percent) / 100
  const laborTotal = labor.auto ? Math.round(equipmentTotal * laborPercent) : labor.manualCost

  const servicesTotal =
    (services.design ? 5000 : 0) +
    (services.training ? 3000 : 0) +
    (services.commissioning ? 7000 : 0) +
    (services.warranty ? 10000 : 0)

  const grandTotal = equipmentTotal + laborTotal + servicesTotal
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <EstimateContext.Provider value={{
      items,
      estimate: { items, includeLabor: labor.auto },
      labor,
      services,
      params,
      addItem,
      removeItem,
      updateQuantity,
      updateItemQuantity: updateQuantity,
      clearEstimate,
      setLabor,
      setServices,
      setParams,
      equipmentTotal, laborTotal, servicesTotal, grandTotal, itemCount, laborRates,
    }}>
      {children}
    </EstimateContext.Provider>
  )
}

export function useEstimate() {
  const ctx = useContext(EstimateContext)
  if (!ctx) throw new Error('useEstimate must be used within EstimateProvider')
  return ctx
}
