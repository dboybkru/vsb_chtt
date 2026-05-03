import { motion } from 'framer-motion'
import { useEstimate } from './EstimateContext'

const objectTypes = [
  'Офис',
  'Магазин',
  'Склад',
  'Производство',
  'Жилой комплекс',
  'Частный дом',
  'Другое',
]

export default function ObjectParams() {
  const { params, setParams } = useEstimate()

  const fields = [
    { label: 'Тип объекта', type: 'select', key: 'type' as const },
    { label: 'Площадь, м²', type: 'number', key: 'area' as const },
    { label: 'Количество камер', type: 'number', key: 'cameras' as const },
    { label: 'Точек доступа', type: 'number', key: 'accessPoints' as const },
    { label: 'Адрес', type: 'text', key: 'address' as const },
    { label: 'Телефон', type: 'tel', key: 'phone' as const },
    { label: 'Контактное имя', type: 'text', key: 'name' as const },
  ]

  return (
    <section className="border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="section-label mb-3">Параметры объекта</p>
          <h3 className="font-display text-2xl font-semibold text-pure-white mb-2">
            Расскажите о вашем объекте
          </h3>
          <p className="text-sm text-text-muted">
            Это поможет нам уточнить смету при обращении.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map((field, i) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <label className="block text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-2">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={params.type}
                  onChange={(e) => setParams({ type: e.target.value })}
                  className="w-full bg-charcoal border border-border-subtle rounded-lg px-4 py-3 text-pure-white focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Выберите тип</option>
                  {objectTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={params[field.key] || ''}
                  onChange={(e) =>
                    setParams({
                      [field.key]:
                        field.type === 'number'
                          ? parseInt(e.target.value) || 0
                          : e.target.value,
                    })
                  }
                  className="w-full bg-charcoal border border-border-subtle rounded-lg px-4 py-3 text-pure-white focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 outline-none transition-all"
                />
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: fields.length * 0.05 }}
            className="flex items-center gap-4 sm:col-span-2"
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.fireAlarm}
                onChange={(e) => setParams({ fireAlarm: e.target.checked })}
                className="w-5 h-5 rounded border-border-subtle bg-charcoal text-guard-green focus:ring-guard-green/20"
              />
              <span className="text-base text-text-body">Пожарная сигнализация нужна</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.network}
                onChange={(e) => setParams({ network: e.target.checked })}
                className="w-5 h-5 rounded border-border-subtle bg-charcoal text-guard-green focus:ring-guard-green/20"
              />
              <span className="text-base text-text-body">Сетевая инфраструктура нужна</span>
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: (fields.length + 1) * 0.05 }}
            className="sm:col-span-2"
          >
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-2">
              Примечания
            </label>
            <textarea
              rows={3}
              value={params.notes}
              onChange={(e) => setParams({ notes: e.target.value })}
              className="w-full bg-charcoal border border-border-subtle rounded-lg px-4 py-3 text-pure-white focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 outline-none transition-all resize-none"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
