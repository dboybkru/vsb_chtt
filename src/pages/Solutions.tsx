import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Video,
  DoorOpen,
  Flame,
  Network,
  Home,
  MessageSquare,
  FileSpreadsheet,
  Shield,
  ChevronDown,
} from 'lucide-react'

const easeSnap = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ── animation variants ── */
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
const solutions = [
  {
    id: 'retail',
    label: 'ТОРГОВЛЯ',
    heading: 'Безопасность магазинов и ТЦ',
    body: 'Антикраж, видеонаблюдение, аналитика посетителей, интеграция с кассами.',
    image: '/catalog-camera-1.jpg',
    detailHeading: 'Комплексная безопасность магазина',
    detailBody:
      'Для ритейла критичны антикраж, контроль кассовых операций, аналитика трафика и защита от внутренних хищений.',
    equipment: ['Купольная камера Hikvision', 'IP-регистратор', 'Антикражные ворота', 'Кассовая камера'],
    services: ['Проектирование', 'Монтаж', 'Настройка', 'Обучение', 'Годовое обслуживание'],
    caseStudy: 'Сеть продуктовых магазинов, 12 точек, 48 камер, централизованный мониторинг.',
    metric: 'Снижение краж на 85%',
  },
  {
    id: 'office',
    label: 'ОФИСЫ',
    heading: 'Офисы и бизнес-центры',
    body: 'СКУД, видеонаблюдение, охрана периметра, интеграция с СКУД лифтов и парковки.',
    image: '/catalog-skud-1.jpg',
    detailHeading: 'Безопасность бизнес-центра',
    detailBody:
      'Многоуровневая система контроля доступа, видеонаблюдение общих зон, охрана периметра и парковки.',
    equipment: ['Считыватель BOLID', 'Турникет', 'IP-камера', 'Контроллер СКУД'],
    services: ['Проектирование', 'Монтаж', 'Настройка', 'Обучение', 'Годовое обслуживание'],
    caseStudy: 'Бизнес-центр класса А, 8 этажей, 120 сотрудников, интеграция с лифтами.',
    metric: 'Сокращение инцидентов на 90%',
  },
  {
    id: 'industrial',
    label: 'ПРОИЗВОДСТВО',
    heading: 'Производство и склады',
    body: 'Промышленные камеры, контроль доступа на территорию, пожарная сигнализация, видеоаналитика.',
    image: '/catalog-nvr-1.jpg',
    detailHeading: 'Промышленная безопасность',
    detailBody:
      'Защита крупных территорий, контроль рабочих процессов, охрана складских помещений и пожарная безопасность.',
    equipment: ['Промышленная IP-камера', 'Тепловизор', 'Пожарный извещатель', 'Шлагбаум'],
    services: ['Проектирование', 'Монтаж', 'Настройка', 'Обучение', 'Годовое обслуживание'],
    caseStudy: 'Складской комплекс 12 000 м², 86 камер, интеграция ОПС и СКУД.',
    metric: 'Покрытие 100% территории',
  },
  {
    id: 'residential',
    label: 'ЖИЛЫЕ КОМПЛЕКСЫ',
    heading: 'Жилые комплексы и коттеджи',
    body: 'Видеонаблюдение во дворе, домофония, шлагбаумы, охрана подъездов, умный дом.',
    image: '/catalog-camera-1.jpg',
    detailHeading: 'Безопасность жилого комплекса',
    detailBody:
      'Комплексная защита жилых объектов: видеонаблюдение, домофония, контроль доступа, охрана периметра.',
    equipment: ['IP-камера', 'Домофон', 'Шлагбаум', 'Считыватель'],
    services: ['Проектирование', 'Монтаж', 'Настройка', 'Обучение', 'Годовое обслуживание'],
    caseStudy: 'ЖК на 240 квартир, 32 камеры, умный домофон с распознаванием лиц.',
    metric: 'Удовлетворённость жильцов 98%',
  },
  {
    id: 'hotel',
    label: 'ГОСТИНИЦЫ',
    heading: 'Отели и гостиницы',
    body: 'СКУД для номеров, видеонаблюдение общих зон, охрана периметра, интеграция с PMS.',
    image: '/catalog-skud-1.jpg',
    detailHeading: 'Гостиничная безопасность',
    detailBody:
      'Многоуровневая защита гостиничного бизнеса: контроль номеров, видеонаблюдение, охрана периметра.',
    equipment: ['Считыватель номеров', 'IP-камера', 'Домофон', 'Контрольлер'],
    services: ['Проектирование', 'Монтаж', 'Настройка', 'Обучение', 'Годовое обслуживание'],
    caseStudy: 'Гостиница на 80 номеров, интеграция с PMS, 45 камер.',
    metric: 'Сокращение внештатных ситуаций на 75%',
  },
  {
    id: 'education',
    label: 'ОБРАЗОВАНИЕ',
    heading: 'Школы и университеты',
    body: 'Безопасность территории, контроль доступа, охрана пожарной безопасности, видеонаблюдение.',
    image: '/catalog-network-1.jpg',
    detailHeading: 'Безопасность образовательных учреждений',
    detailBody:
      'Защита детей и студентов: видеонаблюдение, контроль доступа, пожарная безопасность, тревожные кнопки.',
    equipment: ['IP-камера', 'Тревожная кнопка', 'Пожарный извещатель', 'Считыватель'],
    services: ['Проектирование', 'Монтаж', 'Настройка', 'Обучение', 'Годовое обслуживание'],
    caseStudy: 'Школа на 800 учеников, 36 камер, интеграция ОПС с выводом на пульт МЧС.',
    metric: 'Реакция на тревогу 30 сек',
  },
]

const integrations = [
  { icon: Video, label: 'Видеонаблюдение' },
  { icon: DoorOpen, label: 'СКУД' },
  { icon: Flame, label: 'ОПС' },
  { icon: Network, label: 'СКС' },
  { icon: Home, label: 'Умный дом' },
  { icon: FileSpreadsheet, label: '1С' },
  { icon: Shield, label: 'МЧС' },
  { icon: MessageSquare, label: 'Telegram' },
]

/* ── page ── */
export default function Solutions() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <main className="bg-deep-navy">
      {/* ========== HERO ========== */}
      <section
        className="relative min-h-[60vh] flex flex-col justify-center pt-[72px] pb-16 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,208,132,0.08) 0%, transparent 70%), #0A0E1A',
        }}
      >
        <div className="max-w-[1280px] mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeSnap }}
            className="text-sm text-text-muted mb-4"
          >
            Главная / Решения
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeSnap }}
            className="font-display text-[48px] font-semibold text-pure-white leading-[1.1] tracking-[-0.01em] mb-4"
          >
            Отраслевые решения безопасности
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeSnap }}
            className="text-lg text-text-body leading-relaxed max-w-[600px]"
          >
            Каждый бизнес уникален. Мы проектируем системы безопасности с учётом специфики вашей отрасли, масштаба и бюджета.
          </motion.p>
        </div>
      </section>

      {/* ========== SOLUTIONS GRID ========== */}
      <section className="border-t border-border-subtle py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {solutions.map((sol) => (
              <motion.div
                key={sol.id}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: easeSnap },
                  },
                }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === sol.id ? null : sol.id)
                }
              >
                <div className="relative h-[400px] md:h-[320px] lg:h-[400px] overflow-hidden">
                  <img
                    src={sol.image}
                    alt={sol.heading}
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.6] group-hover:scale-[1.08] transition-transform duration-400"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.3) 50%, transparent 100%)',
                    }}
                  />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="text-xs font-medium uppercase tracking-[0.05em] text-guard-green mb-2">
                      {sol.label}
                    </p>
                    <h3 className="font-display text-[28px] font-semibold text-pure-white leading-[1.2] mb-2 group-hover:-translate-y-1 transition-transform duration-300">
                      {sol.heading}
                    </h3>
                    <p className="text-sm text-text-body leading-relaxed mb-3">
                      {sol.body}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-guard-green font-medium">
                      Подробнее
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${expandedId === sol.id ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {expandedId === sol.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: easeSnap }}
                      className="overflow-hidden bg-charcoal"
                    >
                      <div className="p-8 space-y-6">
                        <div>
                          <p className="section-label text-guard-green mb-2">
                            {sol.label}
                          </p>
                          <h2 className="font-display text-[36px] font-semibold text-pure-white leading-[1.15] mb-3">
                            {sol.detailHeading}
                          </h2>
                          <p className="text-base text-text-body leading-relaxed">
                            {sol.detailBody}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-display text-[20px] font-medium text-pure-white mb-3">
                              Типовое оборудование
                            </h4>
                            <ul className="space-y-2">
                              {sol.equipment.map((eq) => (
                                <li
                                  key={eq}
                                  className="flex items-center gap-2 text-sm text-text-body"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-guard-green" />
                                  {eq}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-display text-[20px] font-medium text-pure-white mb-3">
                              Включает услуги
                            </h4>
                            <ul className="space-y-2">
                              {sol.services.map((s) => (
                                <li
                                  key={s}
                                  className="flex items-center gap-2 text-sm text-text-body"
                                >
                                  <Check size={14} className="text-guard-green" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-deep-navy rounded-xl p-6">
                          <h4 className="font-display text-[20px] font-medium text-pure-white mb-2">
                            Пример проекта
                          </h4>
                          <p className="text-base text-text-body mb-3">
                            {sol.caseStudy}
                          </p>
                          <p className="font-mono text-[32px] font-semibold text-guard-green leading-[1.1] tracking-[-0.02em]">
                            {sol.metric}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link
                            to="/estimate"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg gradient-guard text-white font-semibold hover:scale-[1.02] transition-transform"
                          >
                            Рассчитать стоимость
                            <ArrowRight size={16} />
                          </Link>
                          <Link
                            to="/catalog"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-guard-green text-guard-green font-semibold hover:bg-guard-green/10 transition-colors"
                          >
                            Смотреть каталог
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== INTEGRATION ECOSYSTEM ========== */}
      <section className="bg-off-white py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="section-label justify-center text-guard-green mb-4"
            >
              ИНТЕГРАЦИИ
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[36px] font-semibold text-text-dark leading-[1.15] tracking-[-0.005em]"
            >
              Всё работает вместе
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            className="relative flex flex-wrap items-center justify-center gap-8 lg:gap-12"
          >
            {/* Central hub */}
            <motion.div
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.4, ease: easeSnap },
                },
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full gradient-guard flex items-center justify-center z-10 shadow-[0_0_30px_rgba(0,208,132,0.3)] animate-pulse-glow"
            >
              <span className="font-display font-bold text-pure-white text-lg">
                VSB
              </span>
            </motion.div>

            {/* Integration nodes */}
            {integrations.map((int) => (
              <motion.div
                key={int.label}
                variants={{
                  hidden: { scale: 0, opacity: 0 },
                  visible: {
                    scale: 1,
                    opacity: 1,
                    transition: { duration: 0.4, ease: easeSnap },
                  },
                }}
                className="flex flex-col items-center gap-2 w-[120px]"
              >
                <div className="w-[60px] h-[60px] rounded-full bg-charcoal border border-border-subtle flex items-center justify-center hover:border-[rgba(0,208,132,0.3)] transition-colors duration-200">
                  <int.icon size={24} className="text-guard-green" />
                </div>
                <span className="text-xs font-medium text-text-dark-secondary text-center leading-tight">
                  {int.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
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
            Найдите решение для вашей отрасли
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-base text-text-body leading-relaxed mb-8"
          >
            Расскажите о вашем бизнесе — мы предложим оптимальную систему безопасности.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-lg gradient-guard text-white font-semibold hover:scale-[1.02] transition-transform duration-150"
            >
              Получить консультацию
            </Link>
            <Link
              to="/estimate"
              className="px-8 py-3.5 rounded-lg border border-guard-green text-guard-green font-semibold hover:bg-guard-green/10 transition-colors duration-150"
            >
              Рассчитать смету
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
