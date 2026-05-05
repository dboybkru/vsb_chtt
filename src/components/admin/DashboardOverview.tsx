import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Bot, Calculator, Package, Upload, Wrench } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { AdminSection } from './AdminSidebar'

interface OverviewPayload {
  materials: number
  works: number
  smetas: number
  ai_configured: boolean
  labor: {
    simple_percent: number
    medium_percent: number
    complex_percent: number
  }
}

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix: string
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      setValue(Math.floor((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) requestAnimationFrame(animate)
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

const DashboardOverview: FC<{ onNavigate: (section: AdminSection) => void }> = ({ onNavigate }) => {
  const [data, setData] = useState<OverviewPayload | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('vsb39_admin_token') || ''
    if (!token) {
      setStatus('Для живых показателей войдите в backend в разделе ИИ-Агент')
      return
    }
    apiRequest<OverviewPayload>('/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((payload) => {
        setData(payload)
        setStatus('')
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : 'Не удалось загрузить обзор'))
  }, [])

  const overview = data ?? {
    materials: 0,
    works: 0,
    smetas: 0,
    ai_configured: false,
    labor: { simple_percent: 20, medium_percent: 30, complex_percent: 50 },
  }

  return (
    <div className="p-8 space-y-8">
      {status && (
        <div className="bg-charcoal rounded-xl border border-border-subtle px-4 py-3 text-sm text-text-body">
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Package size={32} />} value={overview.materials} label="В каталоге" suffix="товаров из базы" />
        <StatCard icon={<Wrench size={32} />} value={overview.works} label="Монтаж" suffix="работ в базе" />
        <StatCard icon={<Calculator size={32} />} value={overview.smetas} label="Сметы" suffix="сохранено" />
        <StatCard icon={<Bot size={32} />} value={overview.ai_configured ? 1 : 0} label="ИИ" suffix={overview.ai_configured ? 'ключ настроен' : 'ключ не настроен'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-charcoal rounded-xl border border-border-subtle p-6">
          <h2 className="font-display text-[20px] font-semibold text-pure-white mb-4">Состояние базы</h2>
          <div className="space-y-3 text-sm text-text-body">
            <p>Каталог сайта берёт товары из `/api/materials`.</p>
            <p>Калькулятор использует проценты монтажа: простой {overview.labor.simple_percent}%, средний {overview.labor.medium_percent}%, сложный {overview.labor.complex_percent}%.</p>
            <p>Загрузка прайсов сохраняет позиции сразу в backend-БД.</p>
          </div>
        </div>

        <div className="bg-charcoal rounded-xl border border-border-subtle p-6">
          <h2 className="font-display text-[20px] font-semibold text-pure-white mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => onNavigate('prices')} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-guard-green text-white hover:bg-guard-green-dim">
              <Upload size={16} /> Загрузить прайс
            </button>
            <button onClick={() => onNavigate('catalog')} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-charcoal border border-guard-green text-guard-green hover:bg-guard-green/10">
              <Package size={16} /> Каталог
            </button>
            <button onClick={() => onNavigate('works')} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-charcoal border border-guard-green text-guard-green hover:bg-guard-green/10">
              <Wrench size={16} /> Монтаж
            </button>
            <button onClick={() => onNavigate('ai')} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-charcoal border border-guard-green text-guard-green hover:bg-guard-green/10">
              <Bot size={16} /> ИИ-Агент
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
