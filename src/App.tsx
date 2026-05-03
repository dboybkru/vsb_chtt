import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Catalog = lazy(() => import('./pages/Catalog'))
const Estimate = lazy(() => import('./pages/Estimate'))
const AiAgent = lazy(() => import('./pages/AiAgent'))
const Admin = lazy(() => import('./pages/Admin'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Prices = lazy(() => import('./pages/Prices'))

const Loader = () => (
  <div className="min-h-screen bg-deep-navy flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-guard-green border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/estimate" element={<Estimate />} />
          <Route path="/ai" element={<AiAgent />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/prices" element={<Prices />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
