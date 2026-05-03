import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { EstimateProvider } from './components/estimate/EstimateContext'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <EstimateProvider>
      <App />
    </EstimateProvider>
  </HashRouter>,
)
