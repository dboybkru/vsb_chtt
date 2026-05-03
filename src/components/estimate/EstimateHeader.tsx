import { motion } from 'framer-motion'
import { Calculator, Download } from 'lucide-react'
import { useEstimate } from './EstimateContext'

export default function EstimateHeader() {
  const { itemCount, equipmentTotal, laborTotal, grandTotal } = useEstimate()

  return (
    <section className="relative pt-[72px]">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(0,208,132,0.05) 0%, transparent 70%)',
        }}
      />
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-sm text-text-muted mb-4"
        >
          Главная / Смета
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-[48px] font-semibold text-pure-white leading-tight mb-4"
        >
          Калькулятор сметы
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-text-body max-w-2xl mb-8"
        >
          Составьте детальную смету на оборудование и монтаж. Скачайте PDF или отправьте нам для уточнения.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-charcoal rounded-xl p-4 border border-border-subtle"
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-guard-green" />
              <span className="text-sm text-text-muted">Позиций:</span>
              <span className="font-mono text-base font-medium text-guard-green">{itemCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Оборудование:</span>
              <span className="font-mono text-base font-medium text-guard-green">{equipmentTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Работы:</span>
              <span className="font-mono text-base font-medium text-guard-green">{laborTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted font-semibold">Итого:</span>
              <span className="font-mono text-lg font-semibold text-guard-green">{grandTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg gradient-guard text-white text-sm font-semibold hover:brightness-110 transition-all shrink-0"
          >
            <Download size={16} />
            Скачать PDF
          </button>
        </motion.div>
      </div>
    </section>
  )
}
