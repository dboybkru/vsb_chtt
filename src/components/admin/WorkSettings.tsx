import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Save, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiRequest, type LaborRates } from '@/lib/api'

const defaults: LaborRates = { simple_percent: 20, medium_percent: 30, complex_percent: 50 }

const WorkSettings: FC = () => {
  const [rates, setRates] = useState<LaborRates>(defaults)
  const [status, setStatus] = useState('')
  const token = localStorage.getItem('vsb39_admin_token') || ''
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined

  useEffect(() => {
    apiRequest<LaborRates>('/settings/labor')
      .then(setRates)
      .catch(() => setStatus('Не удалось загрузить проценты монтажных работ'))
  }, [])

  const setRate = (key: keyof LaborRates, value: string) => {
    setRates((prev) => ({ ...prev, [key]: Number(value) || 0 }))
  }

  const save = async () => {
    if (!token) {
      setStatus('Сначала войдите в backend в разделе ИИ-Агент')
      return
    }
    try {
      const saved = await apiRequest<LaborRates>('/settings/labor', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(rates),
      })
      setRates(saved)
      setStatus('Проценты монтажных работ сохранены')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось сохранить')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-charcoal rounded-xl border border-border-subtle p-6">
        <div className="flex items-center gap-3 mb-6">
          <Wrench size={22} className="text-guard-green" />
          <div>
            <h3 className="font-display text-[20px] font-semibold text-pure-white">Монтажные работы</h3>
            <p className="text-sm text-text-muted">Проценты для автоматического расчёта в калькуляторе.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-text-body">Простой монтаж, %</Label>
            <Input type="number" min={0} max={100} value={rates.simple_percent} onChange={(e) => setRate('simple_percent', e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-text-body">Средний монтаж, %</Label>
            <Input type="number" min={0} max={100} value={rates.medium_percent} onChange={(e) => setRate('medium_percent', e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-text-body">Сложный монтаж, %</Label>
            <Input type="number" min={0} max={150} value={rates.complex_percent} onChange={(e) => setRate('complex_percent', e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={save} className="gradient-guard text-white hover:brightness-110">
            <Save size={16} className="mr-1" />
            Сохранить
          </Button>
          {status && <span className="text-sm text-text-body">{status}</span>}
        </div>
      </div>
    </div>
  )
}

export default WorkSettings
