import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Logo'
import { idbGet, idbSet, idbDelete, loadDefaultCatalog } from '@/utils/db'
import { CATALOG_VERSION } from '@/data/constants'
import type { Product, EstimateItem } from '@/types'
import './styles/global.css'

const HomePage = lazy(() => import('@/pages/HomePage'))
const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const PricesPage = lazy(() => import('@/pages/PricesPage'))
const EstimatePage = lazy(() => import('@/pages/EstimatePage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

function Layout({ estimateCount, route }: { estimateCount: number; route: string }) {
  return (
    <>
      <ScrollToTop />
      <Header route={route} estimateCount={estimateCount} />
      <Outlet />
      <Footer />
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([])
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      const [storedProducts, storedEstimate, storedVersion] = await Promise.all([
        idbGet<Product[]>('products', []),
        idbGet<EstimateItem[]>('estimateItems', []),
        idbGet<string>('catalogVersion', ''),
      ])
      if (cancelled) return

      if (storedVersion !== CATALOG_VERSION) {
        try {
          const defaultProducts = await loadDefaultCatalog()
          if (cancelled) return
          setProducts(defaultProducts)
          setEstimateItems([])
          await Promise.all([
            idbSet('products', defaultProducts),
            idbSet('estimateItems', []),
            idbSet('catalogVersion', CATALOG_VERSION),
          ])
        } catch {
          setProducts(storedProducts)
          if (storedEstimate.length) setEstimateItems(storedEstimate)
        }
        setDbReady(true)
        return
      }

      if (storedProducts.length) setProducts(storedProducts)
      if (storedEstimate.length) setEstimateItems(storedEstimate)
      setDbReady(true)
    }
    hydrate()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!dbReady) return
    const timer = window.setTimeout(() => idbSet('products', products), 350)
    return () => window.clearTimeout(timer)
  }, [products, dbReady])

  useEffect(() => {
    if (!dbReady) return
    const timer = window.setTimeout(() => idbSet('estimateItems', estimateItems), 250)
    return () => window.clearTimeout(timer)
  }, [estimateItems, dbReady])

  const estimateCount = estimateItems.reduce((sum, item) => sum + item.qty, 0)
  const route = location.pathname.replace('/', '') || 'home'

  function addToEstimate(product: Product) {
    setEstimateItems(current => {
      const existing = current.find(item => item.id === product.id)
      if (existing) {
        return current.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...current, { ...product, qty: product.unit === 'м' ? 50 : 1 }]
    })
  }

  function importProducts(imported: Product[]) {
    if (!imported.length) return
    setProducts(current => {
      const incoming = new Map(imported.map(item => [item.id, item]))
      const updatedCurrent = current.map(item => incoming.get(item.id) || item)
      const appended = imported.filter(item => !current.some(c => c.id === item.id))
      const next = [...updatedCurrent, ...appended]
      idbSet('products', next)
      return next
    })
  }

  function addProduct(product: Product) {
    setProducts(current => {
      const next = [product, ...current.filter(item => item.id !== product.id)]
      idbSet('products', next)
      return next
    })
  }

  function updateProducts(updater: Product[] | ((current: Product[]) => Product[])) {
    setProducts(current => {
      const next = typeof updater === 'function' ? updater(current) : updater
      idbSet('products', next)
      return next
    })
  }

  function resetLocalDb() {
    idbDelete('products')
    idbDelete('estimateItems')
    idbDelete('catalogVersion')
    setProducts([])
    setEstimateItems([])
  }

  if (!dbReady) {
    return (
      <div className="app-loader">
        <Logo />
        <span>Загружаю локальную базу ВСБ39...</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout estimateCount={estimateCount} route={route} />}>
        <Route path="/" element={<HomePage products={products} />} />
        <Route
          path="/catalog"
          element={
            <CatalogPage products={products} onAdd={addToEstimate} onUpdateProducts={updateProducts} />
          }
        />
        <Route path="/prices" element={<PricesPage />} />
        <Route
          path="/estimate"
          element={<EstimatePage products={products} items={estimateItems} setItems={setEstimateItems} />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <AdminPage
            products={products}
            onImport={importProducts}
            onAddProduct={addProduct}
            onUpdateProducts={updateProducts}
            productsCount={products.length}
            estimateCount={estimateItems.length}
            onResetLocalDb={resetLocalDb}
          />
        }
      />
    </Routes>
  )
}

export function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="app-loader">
              <span>Загрузка...</span>
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  )
}
