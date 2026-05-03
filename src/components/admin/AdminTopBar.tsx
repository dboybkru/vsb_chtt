import type { FC } from 'react'
import { User } from 'lucide-react'
import type { AdminSection } from './AdminSidebar'

interface AdminTopBarProps {
  active: AdminSection
}

const sectionTitles: Record<AdminSection, string> = {
  overview: 'Обзор',
  prices: 'Загрузка прайсов',
  ai: 'Настройки ИИ-Агента',
  catalog: 'Управление каталогом',
  estimates: 'История смет',
  seo: 'SEO-настройки',
  settings: 'Настройки',
}

const AdminTopBar: FC<AdminTopBarProps> = ({ active }) => {
  return (
    <header className="h-16 bg-charcoal border-b border-border-subtle flex items-center justify-between px-8 shrink-0">
      <h1 className="font-display text-[20px] font-semibold text-pure-white">
        {sectionTitles[active]}
      </h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-guard-green/20 flex items-center justify-center">
          <User size={16} className="text-guard-green" />
        </div>
        <span className="text-sm text-text-body">Администратор</span>
      </div>
    </header>
  )
}

export default AdminTopBar
