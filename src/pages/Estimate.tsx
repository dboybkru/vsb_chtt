import { EstimateProvider } from '@/components/estimate/EstimateContext'
import EstimateHeader from '@/components/estimate/EstimateHeader'
import EquipmentTable from '@/components/estimate/EquipmentTable'
import LaborServices from '@/components/estimate/LaborServices'
import ObjectParams from '@/components/estimate/ObjectParams'
import SummaryBar from '@/components/estimate/SummaryBar'

const printStyles = `
@media print {
  header, footer, nav, button, .no-print {
    display: none !important;
  }
  body {
    background: #FFFFFF !important;
    color: #0A0E1A !important;
  }
  #estimate-pdf-content, #estimate-pdf-content * {
    color: #0A0E1A !important;
    background: transparent !important;
  }
  #estimate-pdf-content h2, #estimate-pdf-content h1, #estimate-pdf-content h3 {
    color: #0A0E1A !important;
  }
  #estimate-pdf-content .text-guard-green {
    color: #00A868 !important;
  }
  #estimate-pdf-content table {
    border-collapse: collapse;
    width: 100%;
  }
  #estimate-pdf-content th, #estimate-pdf-content td {
    border-bottom: 1px solid #ddd;
    padding: 8px;
  }
  main > section:not(:has(#estimate-pdf-content)) {
    display: none !important;
  }
}
`

export default function Estimate() {
  return (
    <EstimateProvider>
      <style>{printStyles}</style>
      <main className="min-h-[100dvh] bg-deep-navy">
        <EstimateHeader />
        <EquipmentTable />
        <LaborServices />
        <ObjectParams />
        <div className="h-32" />
        <SummaryBar />
      </main>
    </EstimateProvider>
  )
}
