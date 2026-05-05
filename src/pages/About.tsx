import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Calculator,
  Headset,
  ClipboardCheck,
} from 'lucide-react'

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
const stats = [
  { value: '2016', label: 'основание' },
  { value: '7+', label: 'лет на рынке' },
  { value: '500+', label: 'объектов' },
  { value: '6', label: 'брендов' },
]

const milestones = [
  {
    year: '2016',
    heading: 'Основание компании',
    body: 'VSB39 начала работу как небольшая монтажная бригада. Первые проекты — частные дома и малый бизнес.',
  },
  {
    year: '2018',
    heading: 'Партнёрство с ведущими брендами',
    body: 'Заключены дилерские соглашения с Hikvision и Dahua. Расширили команду до 10 человек.',
  },
  {
    year: '2021',
    heading: '100+ крупных объектов',
    body: 'Портфолио включает торговые центры, склады, производства, жилые комплексы. Запущено направление ОПС.',
  },
  {
    year: '2024',
    heading: 'ИИ-Агент и цифровая трансформация',
    body: 'Внедрён ИИ-консультант для клиентов. Автоматизирован расчёт смет, парсинг прайсов, SEO-оптимизация.',
  },
]

const team = [
  {
    photo: '/catalog-camera-1.jpg',
    name: 'Алексей Козлов',
    role: 'Основатель, технический директор',
    bio: '15 лет в системах безопасности. Сертифицированный инженер Hikvision и Dahua.',
  },
  {
    photo: '/catalog-skud-1.jpg',
    name: 'Дмитрий Соловьёв',
    role: 'Руководитель монтажа',
    bio: 'Руководит бригадой из 8 монтажников. Специализация — сложные объекты и промышленные системы.',
  },
  {
    photo: '/catalog-nvr-1.jpg',
    name: 'Елена Морозова',
    role: 'Менеджер проектов',
    bio: 'Сопровождает проекты от заявки до сдачи. Эксперт по документации и согласованиям.',
  },
  {
    photo: '/catalog-network-1.jpg',
    name: 'Иван Петров',
    role: 'Специалист по СКУД и сетям',
    bio: 'Сертифицированный специалист BOLID и Cabeus. Проектирует СКУД и СКС любой сложности.',
  },
]

const values = [
  {
    icon: Shield,
    heading: 'Качество без компромиссов',
    body: 'Используем только сертифицированное оборудование и материалы. Даём гарантию на монтаж до 3 лет.',
  },
  {
    icon: Calculator,
    heading: 'Прозрачные цены и сроки',
    body: 'Фиксируем стоимость в договоре. Никаких скрытых платежей. Работаем по утверждённому графику.',
  },
  {
    icon: Headset,
    heading: 'Клиент всегда на связи',
    body: 'Личный менеджер на каждый проект. Техподдержка 24/7. Выезд на объект в день обращения.',
  },
  {
    icon: ClipboardCheck,
    heading: 'Постоянное развитие',
    body: 'Обучаемся новым технологиям, получаем сертификаты производителей, внедряем ИИ-инструменты.',
  },
]

const brands = [
  { name: 'Hikvision', color: '#0066B3' },
  { name: 'Dahua', color: '#D52429' },
  { name: 'RVi', color: '#E31E24' },
  { name: 'BOLID', color: '#0058A3' },
  { name: 'Рубеж', color: '#006633' },
  { name: 'Cabeus', color: '#F7941D' },
]

/* ── page ── */
export default function About() {
  return (
    <main className="bg-deep-navy">
      {/* ========== HERO ========== */}
      <section
        className="relative min-h-[50vh] flex flex-col justify-center pt-[72px] pb-16 px-4 sm:px-6 lg:px-8"
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
            Главная / О нас
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeSnap }}
            className="font-display text-[48px] font-semibold text-pure-white leading-[1.1] tracking-[-0.01em] mb-4"
          >
            VSB39 — Ваша Система Безопасности
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeSnap }}
            className="text-lg text-text-body leading-relaxed max-w-[600px] mb-8"
          >
            Профессиональные решения для защиты вашего бизнеса и имущества. Работаем в Калининграде и области с 2016 года.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: easeSnap }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {stats.map((s, i) => (
              <span key={s.label} className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.05em] text-guard-green">
                  {s.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.05em] text-guard-green/60">
                  {s.label}
                </span>
                {i < stats.length - 1 && (
                  <span className="hidden sm:inline text-text-muted mx-2">·</span>
                )}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== TIMELINE ========== */}
      <section className="bg-off-white py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="section-label text-guard-green mb-4"
            >
              НАША ИСТОРИЯ
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[36px] font-semibold text-text-dark leading-[1.15] tracking-[-0.005em]"
            >
              От первого проекта до лидера региона
            </motion.h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 1.2, ease: easeSnap }}
              className="absolute left-[7px] sm:left-[7px] top-0 bottom-0 w-0.5 bg-guard-green origin-top"
            />

            <div className="space-y-12">
              {milestones.map((m) => (
                <motion.div
                  key={m.year}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.1, duration: 0.5, ease: easeSnap },
                    },
                  }}
                  className="relative pl-10 sm:pl-10"
                >
                  {/* Dot */}
                  <motion.div
                    variants={{
                      hidden: { scale: 0 },
                      visible: {
                        scale: 1,
                        transition: { delay: 0.2, duration: 0.3, ease: easeSnap },
                      },
                    }}
                    className="absolute left-0 top-1 w-4 h-4 rounded-full bg-guard-green shadow-[0_0_10px_rgba(0,208,132,0.4)]"
                  />
                  <span className="font-mono text-base font-medium text-guard-green tracking-normal">
                    {m.year}
                  </span>
                  <h3 className="font-display text-[28px] font-semibold text-text-dark leading-[1.2] mt-1 mb-2">
                    {m.heading}
                  </h3>
                  <p className="text-base text-text-dark-secondary leading-relaxed max-w-[640px]">
                    {m.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TEAM ========== */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
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
              НАША КОМАНДА
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[36px] font-semibold text-pure-white leading-[1.15] tracking-[-0.005em]"
            >
              Люди, которые защищают ваш бизнес
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: easeSnap },
                  },
                }}
                className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[rgba(0,208,132,0.3)] transition-all duration-250"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
              >
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-deep-navy/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                  >
                    <p className="text-sm text-text-body leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[28px] font-semibold text-pure-white leading-[1.2]">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-[0.05em] text-guard-green mt-1">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== VALUES ========== */}
      <section className="bg-off-white py-24 px-4 sm:px-6 lg:px-8">
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
              НАШИ ЦЕННОСТИ
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[36px] font-semibold text-text-dark leading-[1.15] tracking-[-0.005em]"
            >
              Принципы, которыми мы руководствуемся
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.heading}
                variants={fadeUp}
                className="bg-pure-white border border-border-light rounded-2xl p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-250"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
              >
                <v.icon
                  size={40}
                  className="text-guard-green mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="font-display text-[28px] font-semibold text-text-dark leading-[1.2] mb-3">
                  {v.heading}
                </h3>
                <p className="text-base text-text-dark-secondary leading-relaxed">
                  {v.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== CERTIFICATIONS ========== */}
      <section className="bg-charcoal py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            className="flex flex-wrap items-center justify-center gap-8 mb-8"
          >
            {brands.map((b) => (
              <motion.div
                key={b.name}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.4 } },
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-deep-navy/50 opacity-80 hover:opacity-100 transition-opacity duration-200"
              >
                <span
                  className="font-display font-bold text-lg"
                  style={{ color: b.color }}
                >
                  {b.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeSnap }}
            className="text-center text-base text-text-body"
          >
            Официальные дилеры и авторизованные установщики ведущих производителей систем безопасности.
          </motion.p>
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
            Доверьте безопасность профессионалам
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-base text-text-body leading-relaxed mb-8"
          >
            Свяжитесь с нами — мы ответим на все вопросы и подготовим предложение.
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
              Связаться с нами
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
