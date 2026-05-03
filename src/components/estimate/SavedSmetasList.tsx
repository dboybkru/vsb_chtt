import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Trash2, Calendar, ChevronRight } from 'lucide-react'
import { useEstimate } from './EstimateContext'

export default function SavedSmetasList() {
  const { savedSmetas, loadSmeta, deleteSmeta } = useEstimate()

  if (savedSmetas.length === 0) return null

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="font-display text-lg font-semibold text-pure-white mb-4 flex items-center gap-2">
          <FolderOpen size={20} className="text-guard-green" />
          Сохраненные расчеты
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {savedSmetas.map((smeta) => (
              <motion.div
                key={smeta.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group bg-charcoal rounded-lg border border-border-subtle p-4 hover:border-guard-green/50 transition-all cursor-pointer"
                onClick={() => loadSmeta(smeta.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-pure-white truncate group-hover:text-guard-green transition-colors">
                      {smeta.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {smeta.date}
                      </span>
                      <span>{smeta.items.length} поз.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm font-medium text-guard-green">
                      {smeta.total.toLocaleString('ru-RU')} ₽
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm('Удалить сохраненный расчет?')) {
                          deleteSmeta(smeta.id)
                        }
                      }}
                      className="text-text-muted hover:text-red-400 transition-colors p-1"
                      aria-label="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-guard-green transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
