import { motion } from 'framer-motion'
import { Calculator, Download, Save } from 'lucide-react'
import { useState } from 'react'
import { useEstimate } from './EstimateContext'

export default function EstimateHeader() {
  const { itemCount, equipmentTotal, laborTotal, grandTotal, smetaName, setSmetaName, smetaDate, setSmetaDate, saveSmeta } = useEstimate()
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName] = useState('')

  const handleSave = () => {
    const name = saveName.trim() || smetaName || `Смета от ${new Date().toLocaleDateString('ru-RU')}`
    saveSmeta(name)
    setSaveName('')
    setShowSaveInput(false)
  }

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
          Предварительный расчет
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-text-body max-w-2xl mb-8"
        >
          Составьте детальную смету на оборудование и монтаж. Сохраните расчет или скачайте PDF.
        </motion.p>

        {/* Smeta Name & Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-2">
              Название сметы
            </label>
            <input
              type="text"
              value={smetaName}
              onChange={(e) => setSmetaName(e.target.value)}
              placeholder="Например: Офис на Ленина"
              className="w-full bg-charcoal border border-border-subtle rounded-lg px-4 py-3 text-pure-white focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-2">
              Дата
            </label>
            <input
              type="date"
              value={smetaDate}
              onChange={(e) => setSmetaDate(e.target.value)}
              className="w-full bg-charcoal border border-border-subtle rounded-lg px-4 py-3 text-pure-white focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 outline-none transition-all"
            />
          </div>
        </motion.div>

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
          <div className="flex items-center gap-3 shrink-0">
            {showSaveInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Название сохранения"
                  className="w-48 bg-deep-navy border border-border-subtle rounded-lg px-3 py-2 text-pure-white text-sm focus:border-guard-green outline-none"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-guard-green text-deep-navy text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <Save size={14} />
                  Сохранить
                </button>
                <button
                  onClick={() => { setShowSaveInput(false); setSaveName('') }}
                  className="text-sm text-text-muted hover:text-pure-white px-2"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-guard-green text-guard-green text-sm font-semibold hover:bg-guard-green/10 transition-all"
              >
                <Save size={16} />
                Сохранить смету
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg gradient-guard text-white text-sm font-semibold hover:brightness-110 transition-all shrink-0"
            >
              <Download size={16} />
              Скачать PDF
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
