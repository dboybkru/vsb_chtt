import type { FC } from 'react'
import { useState, useEffect, useRef } from 'react'
import {
  Package,
  Calculator,
  MessageSquare,
  Eye,
  Upload,
  Plus,
  Bot,
  Download,
} from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix: string
}

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return value
}

const StatCard: FC<StatCardProps> = ({ icon, value, label, suffix }) => {
  const animated = useCountUp(value)
  return (
    <div className="bg-charcoal rounded-xl p-6 border border-border-subtle">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-guard-green">{icon}</div>
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <div className="font-mono text-[32px] font-semibold text-pure-white leading-tight">
        {animated.toLocaleString('ru-RU')}
      </div>
      <div className="text-sm text-text-muted mt-1">{suffix}</div>
    </div>
  )
}

const activities = [
  { text: 'Новая смета #124 — Офис на Ленина', time: '2 мин назад' },
  { text: 'ИИ-Агент: подбор камер для склада', time: '15 мин назад' },
  { text: 'Загружен прайс Hikvision — 45 позиций', time: '1 ч назад' },
  { text: 'Новый заказ: СКУД для магазина', time: '3 ч назад' },
  { text: 'Обновлена SEO-метка для каталога', time: '5 ч назад' },
]

const quickActions = [
  { label: 'Загрузить прайс', icon: <Upload size={16} />, variant: 'primary' as const },
  { label: 'Добавить товар', icon: <Plus size={16} />, variant: 'secondary' as const },
  { label: 'Проверить ИИ-Агента', icon: <Bot size={16} />, variant: 'secondary' as const },
  { label: 'Экспорт смет', icon: <Download size={16} />, variant: 'secondary' as const },
]

const DashboardOverview: FC = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package size={32} />}
          value={1247}
          label="В каталоге"
          suffix="товаров"
        />
        <StatCard
          icon={<Calculator size={32} />}
          value={38}
          label="Активных смет"
          suffix="смет"
        />
        <StatCard
          icon={<MessageSquare size={32} />}
          value={156}
          label="ИИ-диалогов (7д)"
          suffix="диалогов"
        />
        <StatCard
          icon={<Eye size={32} />}
          value={4820}
          label="Визитов (30д)"
          suffix="визитов"
        />
      </div>

      {/* Two Column: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="bg-charcoal rounded-xl border border-border-subtle p-6">
          <h2 className="font-display text-[20px] font-semibold text-pure-white mb-4">
            Последняя активность
          </h2>
          <div className="space-y-0">
            {activities.map((item, i) => (
              <div
                key={i}
                className="py-3 border-b border-border-subtle last:border-b-0"
                style={{
                  animation: `slideIn 0.3s ease-out ${i * 60}ms both`,
                }}
              >
                <p className="text-sm text-pure-white">{item.text}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-charcoal rounded-xl border border-border-subtle p-6">
          <h2 className="font-display text-[20px] font-semibold text-pure-white mb-4">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  action.variant === 'primary'
                    ? 'bg-guard-green text-white hover:bg-guard-green-dim'
                    : 'bg-charcoal border border-guard-green text-guard-green hover:bg-guard-green/10'
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default DashboardOverview
