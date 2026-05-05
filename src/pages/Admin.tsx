import { useState } from 'react'
import type { AdminSection } from '@/components/admin/AdminSidebar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopBar from '@/components/admin/AdminTopBar'
import DashboardOverview from '@/components/admin/DashboardOverview'
import PriceUpload from '@/components/admin/PriceUpload'
import AISettings from '@/components/admin/AISettings'
import SEOSettings from '@/components/admin/SEOSettings'
import CatalogManagement from '@/components/admin/CatalogManagement'
import EstimatesHistory from '@/components/admin/EstimatesHistory'
import GeneralSettings from '@/components/admin/GeneralSettings'
import WorkSettings from '@/components/admin/WorkSettings'

export default function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview onNavigate={setActiveSection} />
      case 'prices':
        return <PriceUpload />
      case 'ai':
        return <AISettings />
      case 'catalog':
        return <CatalogManagement />
      case 'estimates':
        return <EstimatesHistory />
      case 'works':
        return <WorkSettings />
      case 'seo':
        return <SEOSettings />
      case 'settings':
        return <GeneralSettings />
      default:
        return <DashboardOverview onNavigate={setActiveSection} />
    }
  }

  return (
    <div className="min-h-[100dvh] bg-midnight flex overflow-hidden pt-[72px]">
      <AdminSidebar active={activeSection} onChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar active={activeSection} />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
