import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import { EstimateProvider } from './components/estimate/EstimateContext'
import SEO from './components/SEO'

const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Catalog = lazy(() => import('./pages/Catalog'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Estimate = lazy(() => import('./pages/Estimate'))
const AiAgent = lazy(() => import('./pages/AiAgent'))
const Admin = lazy(() => import('./pages/Admin'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Prices = lazy(() => import('./pages/Prices'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

const Loader = () => (
  <div className="min-h-screen bg-deep-navy flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-guard-green border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <EstimateProvider>
      <SEO />
      <Layout>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:id" element={<ProductDetails />} />
            <Route path="/estimate" element={<Estimate />} />
            <Route path="/ai" element={<AiAgent />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/prices" element={<Prices />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </EstimateProvider>
  )
}
