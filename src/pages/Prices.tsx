import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, ArrowRight, FileSpreadsheet, Cpu } from 'lucide-react'

const easeSnap = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: easeSnap },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ── data ── */
const priceCards = [
  {
    brand: 'Hikvision',
    color: '#0066B3',
    formats: ['XLSX', 'CSV', 'JSON'],
    updated: '15 января 2025',
  },
  {
    brand: 'Dahua',
    color: '#D52429',
    formats: ['XLSX', 'CSV'],
    updated: '12 января 2025',
  },
  {
    brand: 'RVi',
    color: '#E31E24',
    formats: ['XLSX', 'CSV'],
    updated: '10 января 2025',
  },
  {
    brand: 'BOLID',
    color: '#0058A3',
    formats: ['XLSX', 'CSV', 'JSON'],
    updated: '8 января 2025',
  },
  {
    brand: 'Рубеж',
    color: '#006633',
    formats: ['XLSX'],
    updated: '5 января 2025',
  },
  {
    brand: 'Cabeus',
    color: '#F7941D',
    formats: ['XLSX', 'CSV'],
    updated: '3 января 2025',
  },
]

const aiSteps = [
  'Загружаем Excel/CSV от поставщика',
  'ИИ извлекает названия, артикулы, цены, фото',
  'Автоматическое обновление каталога и ценовых уровней',
  'SEO-оптимизация новых карточек товаров',
]

/* ── page ── */
export default function Prices() {
  return (
    <main className="bg-deep-navy">
      {/* ========== HERO ========== */}
      <section
        className="relative pt-[72px] pb-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(0,208,132,0.05) 0%, transparent 70%), #0A0E1A',
        }}
      >
        <div className="max-w-[1280px] mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeSnap }}
            className="text-sm text-text-muted mb-4"
          >
            Главная / Прайсы
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeSnap }}
            className="font-display text-[48px] font-semibold text-pure-white leading-[1.1] tracking-[-0.01em] mb-4"
          >
            Актуальные прайс-листы
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeSnap }}
            className="text-lg text-text-body leading-relaxed max-w-[600px]"
          >
            Скачайте текущие цены на оборудование ведущих производителей. Для индивидуального расчёта обратитесь к ИИ-Агенту или менеджеру.
          </motion.p>
        </div>
      </section>

      {/* ========== PRICE CARDS ========== */}
      <section className="bg-off-white py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mb-12"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="section-label text-guard-green mb-4"
            >
              ПРАЙС-ЛИСТЫ
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[36px] font-semibold text-text-dark leading-[1.15] tracking-[-0.005em]"
            >
              Цены от официальных дилеров
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {priceCards.map((card) => (
              <motion.div
                key={card.brand}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: easeSnap },
                  },
                }}
                className="bg-pure-white border border-border-light rounded-2xl p-8 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:border-guard-green transition-all duration-250 flex flex-col"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
              >
                {/* Brand logo placeholder */}
                <div className="text-center mb-6">
                  <span
                    className="inline-block px-4 py-2 rounded-lg font-display font-bold text-2xl"
                    style={{ color: card.color, backgroundColor: `${card.color}10` }}
                  >
                    {card.brand}
                  </span>
                </div>

                <h3 className="font-display text-[28px] font-semibold text-text-dark text-center leading-[1.2] mb-4">
                  {card.brand}
                </h3>

                <div className="flex items-center justify-center gap-2 mb-4">
                  {card.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-1 rounded text-xs font-medium uppercase tracking-wider bg-charcoal text-text-muted"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-text-dark-secondary text-center mb-6">
                  Обновлён: {card.updated}
                </p>

                <button
                  className="mt-auto w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-guard-green text-white font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-150"
                >
                  <Download size={16} />
                  Скачать
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== AI PRICE PARSING ========== */}
      <section className="border-t border-border-subtle py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerContainer}
            >
              <motion.p
                variants={fadeUp}
                custom={0}
                className="section-label text-guard-green mb-4"
              >
                ИИ-АВТОМАТИЗАЦИЯ
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="font-display text-[36px] font-semibold text-pure-white leading-[1.15] tracking-[-0.005em] mb-4"
              >
                Как мы поддерживаем цены в актуальном состоянии
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-base text-text-body leading-relaxed mb-8"
              >
                Наш ИИ-Агент автоматически обрабатывает прайс-листы поставщиков, извлекает цены, фото и характеристики, обновляет каталог в реальном времени.
              </motion.p>

              <motion.div
                variants={staggerContainer}
                className="space-y-4"
              >
                {aiSteps.map((step, i) => (
                  <motion.div
                    key={step}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { delay: i * 0.1, duration: 0.4, ease: easeSnap },
                      },
                    }}
                    className="flex items-center gap-4"
                  >
                    <span className="w-8 h-8 rounded-full bg-guard-green flex items-center justify-center text-pure-white text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-base text-pure-white">{step}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Visual Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: easeSnap }}
              className="bg-charcoal rounded-2xl p-8 border border-border-subtle"
            >
              <div className="relative h-[320px] flex items-center justify-center">
                {/* Upload zone animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-24 h-24 rounded-2xl bg-deep-navy border-2 border-dashed border-guard-green/40 flex flex-col items-center justify-center gap-2"
                  >
                    <FileSpreadsheet size={32} className="text-guard-green" />
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      XLSX
                    </span>
                  </motion.div>
                </div>

                {/* Processing text */}
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-8 left-0 right-0 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-guard-green font-mono text-sm">
                    <Cpu size={16} />
                    <span>Обработка</span>
                    <span className="flex gap-0.5">
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      >
                        .
                      </motion.span>
                    </span>
                  </div>
                </motion.div>

                {/* Product card preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute top-8 right-4 w-36 bg-deep-navy rounded-xl border border-border-subtle overflow-hidden shadow-lg"
                >
                  <div className="h-20 bg-gradient-to-br from-guard-green/20 to-aurora-teal/10 flex items-center justify-center">
                    <FileSpreadsheet size={24} className="text-guard-green/50" />
                  </div>
                  <div className="p-3">
                    <div className="h-2.5 bg-text-muted/20 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-text-muted/10 rounded w-1/2" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,208,132,0.06) 0%, transparent 70%), #0A0E1A',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="max-w-[720px] mx-auto text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-display text-[36px] font-semibold text-pure-white leading-[1.15] tracking-[-0.005em] mb-4"
          >
            Нужен индивидуальный расчёт?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-base text-text-body leading-relaxed mb-8"
          >
            Прайс-листы содержат базовые цены. Итоговая стоимость зависит от объёма, сложности монтажа и обслуживания. ИИ-Агент рассчитает точную смету за минуты.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/ai"
              className="px-8 py-3.5 rounded-lg gradient-guard text-white font-semibold hover:scale-[1.02] transition-transform duration-150"
            >
              Рассчитать с ИИ-Агентом
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-lg border border-guard-green text-guard-green font-semibold hover:bg-guard-green/10 transition-colors duration-150"
            >
              Консультация менеджера
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
