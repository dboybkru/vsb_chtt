import { motion } from 'framer-motion'
import { Wrench, ClipboardCheck } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useEstimate } from './EstimateContext'

const complexityOptions = [
  { key: 'simple' as const, label: 'Простой', percent: 20 },
  { key: 'medium' as const, label: 'Средний', percent: 30 },
  { key: 'complex' as const, label: 'Сложный', percent: 50 },
]

const serviceList = [
  { key: 'design' as const, label: 'Проектирование системы', price: 5000 },
  { key: 'training' as const, label: 'Обучение персонала', price: 3000 },
  { key: 'commissioning' as const, label: 'Пусконаладка ОПС', price: 7000 },
  { key: 'warranty' as const, label: 'Гарантийное обслуживание 1 год', price: 10000 },
]

export default function LaborServices() {
  const { labor, setLabor, services, setServices, laborTotal, servicesTotal } = useEstimate()

  return (
    <section className="border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Labor Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Wrench size={24} className="text-guard-green" />
              <h3 className="font-display text-2xl font-semibold text-pure-white">
                Монтажные работы
              </h3>
            </div>

            <div className="flex items-center justify-between bg-charcoal rounded-lg p-4 border border-border-subtle mb-6">
              <span className="text-sm text-text-body">
                Автоматический расчёт ({labor.complexity === 'simple' ? 20 : labor.complexity === 'medium' ? 30 : 50}% от оборудования)
              </span>
              <Switch
                checked={labor.auto}
                onCheckedChange={(checked) => setLabor({ auto: checked })}
              />
            </div>

            {labor.auto && (
              <div className="flex flex-wrap gap-3 mb-6">
                {complexityOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setLabor({ complexity: opt.key })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      labor.complexity === opt.key
                        ? 'bg-guard-green text-deep-navy border-guard-green'
                        : 'bg-charcoal text-text-body border-border-subtle hover:border-guard-green'
                    }`}
                  >
                    {opt.label} ({opt.percent}%)
                  </button>
                ))}
              </div>
            )}

            {!labor.auto && (
              <div className="mb-6">
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-2">
                  Стоимость работы, ₽
                </label>
                <input
                  type="number"
                  value={labor.manualCost || ''}
                  onChange={(e) => setLabor({ manualCost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-charcoal border border-border-subtle rounded-lg px-4 py-3 text-pure-white focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 outline-none transition-all font-mono"
                />
              </div>
            )}

            <div className="bg-charcoal/50 rounded-lg p-4 border border-border-subtle">
              <span className="text-sm text-text-muted">Расчёт работ:</span>
              <p className="font-mono text-3xl font-semibold text-guard-green mt-1">
                {laborTotal.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </motion.div>

          {/* Additional Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <ClipboardCheck size={24} className="text-guard-green" />
              <h3 className="font-display text-2xl font-semibold text-pure-white">
                Дополнительные услуги
              </h3>
            </div>

            <div className="space-y-3">
              {serviceList.map((svc) => {
                const checked = services[svc.key]
                return (
                  <motion.div
                    key={svc.key}
                    animate={checked ? { borderLeftColor: '#00D084' } : { borderLeftColor: 'transparent' }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-between bg-charcoal rounded-lg p-4 border border-border-subtle ${
                      checked ? 'border-l-4 border-l-guard-green' : ''
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setServices({ [svc.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-border-subtle bg-charcoal text-guard-green focus:ring-guard-green/20"
                      />
                      <span className="text-base text-text-body">{svc.label}</span>
                    </label>
                    <span className="font-mono text-base font-medium text-guard-green">
                      {svc.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-4 bg-charcoal/50 rounded-lg p-4 border border-border-subtle">
              <span className="text-sm text-text-muted">Услуги:</span>
              <p className="font-mono text-3xl font-semibold text-guard-green mt-1">
                {servicesTotal.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
