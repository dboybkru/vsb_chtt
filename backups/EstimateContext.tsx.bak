import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

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
  labor: LaborSettings
  services: EstimateServices
  params: ObjectParams
  addItem: (item: EstimateItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setLabor: (labor: Partial<LaborSettings>) => void
  setServices: (services: Partial<EstimateServices>) => void
  setParams: (params: Partial<ObjectParams>) => void
  equipmentTotal: number
  laborTotal: number
  servicesTotal: number
  grandTotal: number
  itemCount: number
}

const STORAGE_KEY = 'vsb39_estimate'

function loadFromStorage(): Partial<EstimateContextValue> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(state: { items: EstimateItem[]; labor: LaborSettings; services: EstimateServices; params: ObjectParams }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

const defaultItems: EstimateItem[] = [
  { id: 'cam1', name: 'IP-камера купольная 4Мп', sku: 'DS-2CD2143G2-I', brand: 'Hikvision', price: 12800, quantity: 4, image: '/catalog-camera-1.jpg', category: 'Камеры' },
  { id: 'nvr1', name: 'Сетевой видеорегистратор 8-канальный', sku: 'DS-7608NI-K2', brand: 'Hikvision', price: 24500, quantity: 1, image: '/catalog-nvr-1.jpg', category: 'Регистраторы' },
  { id: 'skud1', name: 'Считыватель бесконтактных карт', sku: 'DS-K1107M', brand: 'Hikvision', price: 4200, quantity: 2, image: '/catalog-skud-1.jpg', category: 'СКУД' },
  { id: 'net1', name: 'Коммутатор PoE 8 портов', sku: 'DS-3E0109P-E', brand: 'Hikvision', price: 8900, quantity: 1, image: '/catalog-network-1.jpg', category: 'Сети' },
]

const defaultLabor: LaborSettings = { auto: true, complexity: 'medium', manualCost: 0 }
const defaultServices: EstimateServices = { design: false, training: false, commissioning: false, warranty: false }
const defaultParams: ObjectParams = { type: '', area: 0, cameras: 0, accessPoints: 0, fireAlarm: false, network: false, address: '', phone: '', name: '', notes: '' }

const EstimateContext = createContext<EstimateContextValue | null>(null)

export function EstimateProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage()
  const [items, setItems] = useState<EstimateItem[]>(stored?.items ?? defaultItems)
  const [labor, setLaborState] = useState<LaborSettings>(stored?.labor ?? defaultLabor)
  const [services, setServicesState] = useState<EstimateServices>(stored?.services ?? defaultServices)
  const [params, setParamsState] = useState<ObjectParams>(stored?.params ?? defaultParams)

  useEffect(() => {
    saveToStorage({ items, labor, services, params })
  }, [items, labor, services, params])

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

  const laborPercent = labor.complexity === 'simple' ? 0.2 : labor.complexity === 'medium' ? 0.3 : 0.5
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
      items, labor, services, params,
      addItem, removeItem, updateQuantity, setLabor, setServices, setParams,
      equipmentTotal, laborTotal, servicesTotal, grandTotal, itemCount,
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
