import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Save, ChevronUp } from 'lucide-react'
import { useEstimate } from './EstimateContext'

export default function SummaryBar() {
  const { items, itemCount, equipmentTotal, laborTotal, servicesTotal, grandTotal, params, smetaName, smetaDate, saveSmeta } = useEstimate()
  const [showPdf, setShowPdf] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const today = smetaDate ? new Date(smetaDate).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU')

  const handleSave = () => {
    const name = saveName.trim() || smetaName || `Смета от ${new Date().toLocaleDateString('ru-RU')}`
    saveSmeta(name)
    setSaveName('')
    setShowSaveInput(false)
  }

  return (
    <>
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border-glow"
            style={{
              background: 'rgba(26,31,53,0.85)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-text-body">
                Всего позиций: {itemCount} | Оборудование: {equipmentTotal.toLocaleString('ru-RU')} ₽ | Работы: {laborTotal.toLocaleString('ru-RU')} ₽
              </div>
              <div className="flex items-center gap-3">
                {showSaveInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Название"
                      className="w-36 bg-deep-navy border border-border-subtle rounded-lg px-3 py-2 text-pure-white text-sm focus:border-guard-green outline-none"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                    />
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-guard-green text-deep-navy text-sm font-semibold hover:brightness-110 transition-all"
                    >
                      <Save size={14} />
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-guard-green text-guard-green text-sm font-semibold hover:bg-guard-green/10 transition-all"
                  >
                    <Save size={16} />
                    Сохранить
                  </button>
                )}
                <span className="font-mono text-2xl font-bold gradient-guard-text">
                  {grandTotal.toLocaleString('ru-RU')} ₽
                </span>
                <button
                  onClick={() => setShowPdf(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-guard text-white text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <Download size={16} />
                  Скачать PDF
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-2 rounded-lg border border-border-subtle text-text-muted hover:text-pure-white transition-colors"
                  aria-label="Наверх"
                >
                  <ChevronUp size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {showPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            style={{ background: 'rgba(15,22,41,0.9)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto bg-charcoal rounded-xl border border-border-subtle"
            >
              {/* PDF Content */}
              <div id="estimate-pdf-content" className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-guard-green mb-1">VSB39</h2>
                    <p className="text-sm text-text-muted">Ваша Система Безопасности</p>
                    <p className="text-sm text-text-muted">г. Калининград</p>
                    <p className="text-sm text-text-muted">+7 (4012) 39-39-39 | info@vsb39.ru</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-muted">Дата: {today}</p>
                    <p className="text-sm text-text-muted">№ КП-{Math.floor(Math.random() * 9000 + 1000)}</p>
                  </div>
                </div>

                <h1 className="font-display text-3xl font-semibold text-pure-white text-center mb-2">
                  {smetaName || 'Коммерческое предложение'}
                </h1>
                <p className="text-center text-text-muted mb-8">Предварительный расчет VSB39</p>

                {items.length > 0 && (
                  <>
                    <h3 className="font-display text-lg font-semibold text-pure-white mb-3">Оборудование</h3>
                    <table className="w-full mb-6 text-sm">
                      <thead>
                        <tr className="border-b border-border-subtle text-left">
                          <th className="py-2 text-text-muted font-medium">№</th>
                          <th className="py-2 text-text-muted font-medium">Наименование</th>
                          <th className="py-2 text-text-muted font-medium text-right">Кол-во</th>
                          <th className="py-2 text-text-muted font-medium text-right">Ед.</th>
                          <th className="py-2 text-text-muted font-medium text-right">Цена</th>
                          <th className="py-2 text-text-muted font-medium text-right">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={item.id} className="border-b border-border-subtle/50">
                            <td className="py-2 text-text-body">{i + 1}</td>
                            <td className="py-2 text-pure-white">{item.name}</td>
                            <td className="py-2 text-right text-text-body">{item.quantity}</td>
                            <td className="py-2 text-right text-text-muted">{item.unit || 'шт.'}</td>
                            <td className="py-2 text-right text-text-body">{item.price.toLocaleString('ru-RU')} ₽</td>
                            <td className="py-2 text-right text-guard-green font-medium">
                              {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                <div className="flex flex-col gap-2 mb-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Оборудование:</span>
                    <span className="text-pure-white font-medium">{equipmentTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Монтажные работы:</span>
                    <span className="text-pure-white font-medium">{laborTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Доп. услуги:</span>
                    <span className="text-pure-white font-medium">{servicesTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between border-t border-border-subtle pt-2 mt-1">
                    <span className="text-pure-white font-semibold">ИТОГО:</span>
                    <span className="text-guard-green font-bold text-xl">{grandTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                {params.name && (
                  <div className="mb-6">
                    <h3 className="font-display text-lg font-semibold text-pure-white mb-2">Параметры объекта</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {params.type && <p className="text-text-body">Тип: {params.type}</p>}
                      {params.area > 0 && <p className="text-text-body">Площадь: {params.area} м²</p>}
                      {params.cameras > 0 && <p className="text-text-body">Камеры: {params.cameras}</p>}
                      {params.accessPoints > 0 && <p className="text-text-body">Точки доступа: {params.accessPoints}</p>}
                      {params.address && <p className="text-text-body">Адрес: {params.address}</p>}
                      {params.name && <p className="text-text-body">Контакт: {params.name}</p>}
                      {params.phone && <p className="text-text-body">Телефон: {params.phone}</p>}
                    </div>
                  </div>
                )}

                <div className="border-t border-border-subtle pt-4 text-xs text-text-muted">
                  <p>Срок действия предложения: 30 дней с даты выдачи.</p>
                  <p>Окончательная стоимость может измениться после осмотра объекта.</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-border-subtle bg-midnight/50">
                <button
                  onClick={() => setShowPdf(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle text-text-body text-sm hover:text-pure-white transition-colors"
                >
                  <X size={16} />
                  Закрыть
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-guard text-white text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <Download size={16} />
                  Скачать PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
