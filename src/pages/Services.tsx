import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Check,
  Shield,
  Wrench,
  Clock,
  ClipboardCheck,
  ArrowRight,
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
const services = [
  {
    label: 'ВИДЕОНАБЛЮДЕНИЕ',
    heading: 'Системы видеонаблюдения любой сложности',
    body: 'IP- и аналоговые системы, PTZ-камеры, видеоаналитика, распознавание лиц и автомобильных номеров, тепловизоры, скрытое видеонаблюдение.',
    image: '/catalog-camera-1.jpg',
    features: [
      'Проектирование систем от 1 до 1000+ камер',
      'Монтаж и настройка под ключ',
      'Интеграция с СКУД и ОПС',
      'Удалённый мониторинг 24/7',
      'Обслуживание и модернизация',
    ],
    cta: 'Рассчитать стоимость →',
  },
  {
    label: 'КОНТРОЛЬ ДОСТУПА',
    heading: 'СКУД для бизнеса и жилых комплексов',
    body: 'Биометрические считыватели, турникеты, шлагбаумы, системы учёта рабочего времени, интеграция с 1С и ЕСИА.',
    image: '/catalog-skud-1.jpg',
    features: [
      'Проектирование СКУД любого масштаба',
      'Биометрия и карты доступа',
      'Интеграция с лифтами и парковкой',
      'Учёт рабочего времени',
      'Удалённое управление',
    ],
    cta: 'Рассчитать стоимость →',
  },
  {
    label: 'ОХРАННО-ПОЖАРНАЯ СИГНАЛИЗАЦИЯ',
    heading: 'ОПС под ключ с согласованием МЧС',
    body: 'Пожарные извещатели, оповещение и управление эвакуацией, пожаротушение, охранная сигнализация, передача на пульт вневедомственной охраны.',
    image: '/catalog-nvr-1.jpg',
    features: [
      'Проектирование с учётом норм МЧС',
      'Монтаж и пусконаладка',
      'Согласование с надзорными органами',
      'Интеграция с видеонаблюдением',
      'Ежегодное техобслуживание',
    ],
    cta: 'Рассчитать стоимость →',
  },
  {
    label: 'СТРУКТУРИРОВАННЫЕ КАБЕЛЬНЫЕ СИСТЕМЫ',
    heading: 'Сети и связь для вашего объекта',
    body: 'Прокладка кабельных трасс, оптоволокно, Wi-Fi покрытие, серверные стойки, сетевое оборудование. Сертифицированный монтаж Cat5e/Cat6/Cat6a/Optic.',
    image: '/catalog-network-1.jpg',
    features: [
      'Проектирование кабельной инфраструктуры',
      'Монтаж витой пары и оптоволокна',
      'Wi-Fi покрытие любой площади',
      'Серверные стойки и ЦОД',
      'Тестирование и сертификация',
    ],
    cta: 'Рассчитать стоимость →',
  },
  {
    label: 'ПРОЕКТИРОВАНИЕ И АУДИТ',
    heading: 'Экспертиза и технические задания',
    body: 'Разработка технических заданий, сметная документация, аудит существующих систем, экспертиза проектов сторонних организаций.',
    image: '/catalog-camera-1.jpg',
    features: [
      'Технические задания под ключ',
      'Сметы и коммерческие предложения',
      'Аудит безопасности объекта',
      'Экспертиза чужих проектов',
      'Консультации по модернизации',
    ],
    cta: 'Заказать аудит →',
  },
  {
    label: 'ОБСЛУЖИВАНИЕ И ПОДДЕРЖКА',
    heading: '24/7 — ваш объект под надёжной защитой',
    body: 'Гарантийное и постгарантийное обслуживание, выезд на объект за 2 часа, удалённый мониторинг, замена оборудования, обновление ПО.',
    image: '/catalog-skud-1.jpg',
    features: [
      'Гарантийное обслуживание 1–3 года',
      'Постгарантийная поддержка',
      'Выезд за 2 часа по Калининграду',
      'Удалённый мониторинг систем',
      'Обучение персонала',
    ],
    cta: 'Заключить договор →',
  },
]

const differentiators = [
  {
    icon: Shield,
    heading: 'Официальные дилеры',
    body: 'Прямые поставки от Hikvision, Dahua, RVi, BOLID, Рубеж, Cabeus. Гарантия и сервис от производителя.',
  },
  {
    icon: ClipboardCheck,
    heading: '7+ лет на рынке',
    body: 'Более 500 успешных проектов. Работаем с объектами любой сложности — от квартиры до промышленного завода.',
  },
  {
    icon: Clock,
    heading: 'Выезд за 2 часа',
    body: 'Оперативный выезд бригады по Калининграду. Круглосуточная техподдержка и удалённый мониторинг.',
  },
  {
    icon: Wrench,
    heading: 'Всё под одной крышей',
    body: 'Проектирование, поставка, монтаж, настройка, обслуживание — не нужно искать подрядчиков.',
  },
]

const industries = [
  'Торговля', 'Офисы', 'Производство', 'Жилые комплексы',
  'Отели', 'Образование', 'Склады', 'Медицина',
]

/* ── page ── */
export default function Services() {
  return (
    <main className="bg-deep-navy">
      {/* ========== HERO ========== */}
      <section
        className="relative min-h-[50vh] flex flex-col justify-center pt-[72px] pb-16 px-4 sm:px-6 lg:px-8"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,208,132,0.06) 0%, transparent 70%), #0A0E1A',
        }}
      >
        <div className="max-w-[1280px] mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeSnap }}
            className="text-sm text-text-muted mb-4"
          >
            Главная / Услуги
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeSnap }}
            className="font-display text-[48px] font-semibold text-pure-white leading-[1.1] tracking-[-0.01em] mb-4"
          >
            Профессиональные услуги безопасности
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeSnap }}
            className="text-lg text-text-body leading-relaxed max-w-[640px]"
          >
            Полный цикл работ: от аудита и проектирования до монтажа и пожизненного обслуживания. Используем оборудование мировых брендов.
          </motion.p>
        </div>
      </section>

      {/* ========== SERVICE CATEGORIES ========== */}
      <section className="bg-off-white py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto space-y-24">
          {services.map((svc, idx) => {
            const isEven = idx % 2 === 1
            return (
              <motion.div
                key={svc.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? 'lg:[direction:rtl]' : ''}`}
              >
                {/* Image */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: isEven ? 40 : -40 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.6, ease: easeSnap },
                    },
                  }}
                  className={`overflow-hidden rounded-2xl ${isEven ? 'lg:[direction:ltr]' : ''}`}
                >
                  <img
                    src={svc.image}
                    alt={svc.heading}
                    className="w-full h-[320px] lg:h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </motion.div>

                {/* Content */}
                <div className={`space-y-5 ${isEven ? 'lg:[direction:ltr]' : ''}`}>
                  <motion.p
                    variants={fadeUp}
                    custom={0}
                    className="section-label text-guard-green"
                  >
                    {svc.label}
                  </motion.p>
                  <motion.h2
                    variants={fadeUp}
                    custom={1}
                    className="font-display text-[36px] font-semibold text-text-dark leading-[1.15] tracking-[-0.005em]"
                  >
                    {svc.heading}
                  </motion.h2>
                  <motion.p
                    variants={fadeUp}
                    custom={2}
                    className="text-base text-text-dark-secondary leading-relaxed"
                  >
                    {svc.body}
                  </motion.p>
                  <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-2.5"
                  >
                    {svc.features.map((f) => (
                      <motion.li
                        key={f}
                        variants={fadeUp}
                        className="flex items-start gap-3 text-base text-text-dark-secondary"
                      >
                        <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-guard-green/10 flex items-center justify-center">
                          <Check size={12} className="text-guard-green" />
                        </span>
                        {f}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.div variants={fadeUp} custom={5}>
                    <Link
                      to="/estimate"
                      className="inline-flex items-center gap-2 text-base text-guard-green font-medium hover:gap-3 transition-all"
                    >
                      {svc.cta}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section className="bg-deep-navy py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="section-label justify-center text-guard-green mb-4"
            >
              ПОЧЕМУ МЫ
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[36px] font-semibold text-pure-white leading-[1.15] tracking-[-0.005em]"
            >
              Работать с VSB39 — значит быть уверенным
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {differentiators.map((d) => (
              <motion.div
                key={d.heading}
                variants={fadeUp}
                className="group glass-card rounded-2xl p-8 hover:-translate-y-1 hover:border-[rgba(0,208,132,0.3)] transition-all duration-250"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
              >
                <d.icon
                  size={48}
                  className="text-guard-green mb-4 group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-250"
                  strokeWidth={1.5}
                />
                <h3 className="font-display text-[28px] font-semibold text-pure-white leading-[1.2] mb-3">
                  {d.heading}
                </h3>
                <p className="text-sm text-text-body leading-relaxed">{d.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== INDUSTRY BANNER ========== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-[1280px] mx-auto bg-charcoal rounded-[20px] p-12 mx-4 sm:mx-6 lg:mx-auto"
        >
          <motion.h3
            variants={fadeUp}
            custom={0}
            className="font-display text-[28px] font-semibold text-pure-white mb-2"
          >
            Решения для вашей отрасли
          </motion.h3>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-base text-text-muted mb-8"
          >
            Узнайте, как мы защищаем объекты в вашей сфере.
          </motion.p>
          <div className="flex flex-wrap gap-3">
            {industries.map((ind, i) => (
              <motion.span
                key={ind}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { delay: i * 0.05, duration: 0.2 },
                  },
                }}
              >
                <Link
                  to="/solutions"
                  className="inline-block px-5 py-2 rounded-[20px] bg-midnight text-pure-white text-sm font-medium hover:text-guard-green hover:border hover:border-guard-green transition-colors duration-200"
                >
                  {ind}
                </Link>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== CTA ========== */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8"
        style={{
          background:
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
            Нужна консультация?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-base text-text-body leading-relaxed mb-8"
          >
            Опишите ваш объект — мы подскажем оптимальное решение и рассчитаем предварительную стоимость.
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
              Бесплатная консультация
            </Link>
            <Link
              to="/estimate"
              className="px-8 py-3.5 rounded-lg border border-guard-green text-guard-green font-semibold hover:bg-guard-green/10 transition-colors duration-150"
            >
              Рассчитать смету онлайн
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
