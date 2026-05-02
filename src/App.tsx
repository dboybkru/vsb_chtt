import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import Catalog from './pages/Catalog'
import Solutions from './pages/Solutions'
import Estimate from './pages/Estimate'
import AiAgent from './pages/AiAgent'
import Admin from './pages/Admin'
import About from './pages/About'
import Contact from './pages/Contact'
import Prices from './pages/Prices'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/estimate" element={<Estimate />} />
        <Route path="/ai" element={<AiAgent />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/prices" element={<Prices />} />
      </Routes>
    </Layout>
  )
}
