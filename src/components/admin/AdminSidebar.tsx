import type { FC } from 'react'
import {
  LayoutDashboard,
  FileSpreadsheet,
  Bot,
  Package,
  Calculator,
  Search,
  Settings,
  LogOut,
} from 'lucide-react'

export type AdminSection =
  | 'overview'
  | 'prices'
  | 'ai'
  | 'catalog'
  | 'estimates'
  | 'seo'
  | 'settings'

interface AdminSidebarProps {
  active: AdminSection
  onChange: (section: AdminSection) => void
}

const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Обзор', icon: <LayoutDashboard size={18} /> },
  { id: 'prices', label: 'Прайсы', icon: <FileSpreadsheet size={18} /> },
  { id: 'ai', label: 'ИИ-Агент', icon: <Bot size={18} /> },
  { id: 'catalog', label: 'Каталог', icon: <Package size={18} /> },
  { id: 'estimates', label: 'Сметы', icon: <Calculator size={18} /> },
  { id: 'seo', label: 'SEO', icon: <Search size={18} /> },
  { id: 'settings', label: 'Настройки', icon: <Settings size={18} /> },
]

const AdminSidebar: FC<AdminSidebarProps> = ({ active, onChange }) => {
  return (
    <aside className="w-[260px] min-w-[260px] bg-deep-navy border-r border-border-subtle flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-[20px] text-guard-green tracking-tight">
            VSB39
          </span>
          <span className="text-[10px] text-text-muted tracking-[0.05em] uppercase">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-charcoal text-pure-white border-l-[3px] border-guard-green'
                  : 'text-text-muted hover:bg-charcoal hover:text-pure-white border-l-[3px] border-transparent'
              }`}
            >
              <span className={isActive ? 'text-guard-green' : 'text-text-muted'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border-subtle">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-charcoal hover:text-pure-white transition-all duration-200">
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
