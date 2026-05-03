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
  unit?: string
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

export interface SavedSmeta {
  id: string
  name: string
  date: string
  items: EstimateItem[]
  labor: LaborSettings
  services: EstimateServices
  params: ObjectParams
  total: number
}

interface EstimateContextValue {
  items: EstimateItem[]
  labor: LaborSettings
  services: EstimateServices
  params: ObjectParams
  smetaName: string
  smetaDate: string
  savedSmetas: SavedSmeta[]
  addItem: (item: EstimateItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setLabor: (labor: Partial<LaborSettings>) => void
  setServices: (services: Partial<EstimateServices>) => void
  setParams: (params: Partial<ObjectParams>) => void
  setSmetaName: (name: string) => void
  setSmetaDate: (date: string) => void
  saveSmeta: (name: string) => void
  loadSmeta: (id: string) => void
  deleteSmeta: (id: string) => void
  equipmentTotal: number
  laborTotal: number
  servicesTotal: number
  grandTotal: number
  itemCount: number
}

const STORAGE_KEY = 'vsb39_estimate'
const SAVED_SMETAS_KEY = 'vsb39_saved_smetas'

function loadFromStorage(): Partial<Omit<EstimateContextValue, 'savedSmetas' | 'saveSmeta' | 'loadSmeta' | 'deleteSmeta' | 'setSmetaName' | 'setSmetaDate'>> | null {
  // Try primary key 'vsb39_estimate' first
  const primary = loadFromKey(STORAGE_KEY)
  if (primary) return primary

  // Fallback to 'vsb39_cart' (catalog cart) for initial import
  const cart = loadFromKey('vsb39_cart')
  if (cart) return cart

  return null
}

function loadFromKey(key: string): Partial<Omit<EstimateContextValue, 'savedSmetas' | 'saveSmeta' | 'loadSmeta' | 'deleteSmeta' | 'setSmetaName' | 'setSmetaDate'>> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Validate format
    if (!parsed || typeof parsed !== 'object') {
      localStorage.removeItem(key)
      return null
    }

    // Detect broken cart data (unit but no name): clear and skip
    if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
      const first = parsed.items[0]
      if (first && first.unit !== undefined && first.productId === undefined && !first.name) {
        localStorage.removeItem(key)
        return null
      }
    }

    // Format from useCatalog: { items: [{id,name,sku,brand,price,quantity,image,category,unit}], includeLabor: boolean }
    if (parsed.includeLabor !== undefined && Array.isArray(parsed.items)) {
      const items: EstimateItem[] = parsed.items.map((item: any) => ({
        id: item.id || '',
        name: item.name || '',
        sku: item.sku || '',
        brand: item.brand || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || '',
        category: item.category || '',
        unit: item.unit || 'шт.',
      }))
      const labor: LaborSettings = {
        auto: parsed.includeLabor === true,
        complexity: 'medium',
        manualCost: 0,
      }
      return {
        items,
        labor,
        services: { design: false, training: false, commissioning: false, warranty: false },
        params: { type: '', area: 0, cameras: 0, accessPoints: 0, fireAlarm: false, network: false, address: '', phone: '', name: '', notes: '' },
      }
    }

    // Native estimate format: { items: EstimateItem[], labor: LaborSettings, services: EstimateServices, params: ObjectParams }
    if (parsed.items && Array.isArray(parsed.items)) {
      return parsed
    }
  } catch {
    localStorage.removeItem(key)
  }
  return null
}

function saveToStorage(state: { items: EstimateItem[]; labor: LaborSettings; services: EstimateServices; params: ObjectParams; smetaName: string; smetaDate: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

function loadSavedSmetas(): SavedSmeta[] {
  try {
    const raw = localStorage.getItem(SAVED_SMETAS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveSavedSmetas(smetas: SavedSmeta[]) {
  try {
    localStorage.setItem(SAVED_SMETAS_KEY, JSON.stringify(smetas))
  } catch { /* ignore */ }
}

const defaultItems: EstimateItem[] = []

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
  const [smetaName, setSmetaNameState] = useState<string>(stored?.smetaName ?? '')
  const [smetaDate, setSmetaDateState] = useState<string>(stored?.smetaDate ?? new Date().toISOString().split('T')[0])
  const [savedSmetas, setSavedSmetas] = useState<SavedSmeta[]>(loadSavedSmetas)

  useEffect(() => {
    // Очистка старых демо-данных И несовместимых форматов
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        // Если данные в формате корзины (с unit) — очистить
        if (parsed.items && parsed.items.length > 0 && parsed.items[0].unit !== undefined && parsed.items[0].productId === undefined) {
          localStorage.removeItem(STORAGE_KEY)
        }
        // Если старые демо ID
        if (parsed.items && parsed.items.some((i: any) => ['cam1','nvr1','skud1','net1'].includes(i.id))) {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    saveToStorage({ items, labor, services, params, smetaName, smetaDate })
  }, [items, labor, services, params, smetaName, smetaDate])

  // Import cart items from 'vsb39_cart' if estimate is empty
  useEffect(() => {
    if (items.length === 0) {
      const cartRaw = localStorage.getItem('vsb39_cart')
      if (cartRaw) {
        try {
          const cart = JSON.parse(cartRaw)
          if (cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
            const imported: EstimateItem[] = cart.items.map((item: any) => ({
              id: item.id || '',
              name: item.name || '',
              sku: item.sku || '',
              brand: item.brand || '',
              price: item.price || 0,
              quantity: item.quantity || 1,
              image: item.image || '',
              category: item.category || '',
              unit: item.unit || 'шт.',
            }))
            setItems(imported)
            if (cart.includeLabor) {
              setLaborState(prev => ({ ...prev, auto: true }))
            }
          }
        } catch { /* ignore */ }
      }
    }
  }, [])

  const addItem = useCallback((item: EstimateItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, { ...item, unit: item.unit || 'шт.' }]
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

  const setSmetaName = useCallback((name: string) => {
    setSmetaNameState(name)
  }, [])

  const setSmetaDate = useCallback((date: string) => {
    setSmetaDateState(date)
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

  const saveSmeta = useCallback((name: string) => {
    const newSmeta: SavedSmeta = {
      id: Date.now().toString() + '_' + Math.random().toString(36).slice(2, 8),
      name: name || smetaName || `Смета от ${new Date().toLocaleDateString('ru-RU')}`,
      date: smetaDate,
      items: [...items],
      labor: { ...labor },
      services: { ...services },
      params: { ...params },
      total: grandTotal,
    }
    setSavedSmetas(prev => {
      const next = [newSmeta, ...prev]
      saveSavedSmetas(next)
      return next
    })
  }, [items, labor, services, params, smetaName, smetaDate, grandTotal])

  const loadSmeta = useCallback((id: string) => {
    setSavedSmetas(prev => {
      const smeta = prev.find(s => s.id === id)
      if (smeta) {
        setItems(smeta.items)
        setLaborState(smeta.labor)
        setServicesState(smeta.services)
        setParamsState(smeta.params)
        setSmetaNameState(smeta.name)
        setSmetaDateState(smeta.date)
      }
      return prev
    })
  }, [])

  const deleteSmeta = useCallback((id: string) => {
    setSavedSmetas(prev => {
      const next = prev.filter(s => s.id !== id)
      saveSavedSmetas(next)
      return next
    })
  }, [])

  return (
    <EstimateContext.Provider value={{
      items, labor, services, params, smetaName, smetaDate, savedSmetas,
      addItem, removeItem, updateQuantity, setLabor, setServices, setParams,
      setSmetaName, setSmetaDate, saveSmeta, loadSmeta, deleteSmeta,
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
