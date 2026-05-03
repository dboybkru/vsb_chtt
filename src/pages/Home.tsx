import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Video,
  DoorOpen,
  Bell,
  Network,
  ClipboardCheck,
  FileText,
  Wrench,
  Calculator,
  LayoutGrid,
  ChevronRight,
  Check,
  Phone,
  Headset,
  Building2,
  Factory,
  Home as HomeIcon,
  Hotel,
  GraduationCap,
  Star,
} from 'lucide-react'
import HeroGrid3D from '../components/HeroGrid3D'
import ParticleCanvas from '../components/ParticleCanvas'
import AIPreviewOrb from '../components/AIPreviewOrb'

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

const fadeLeftVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

/* ─── Section Reusable Wrapper ─── */
function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number | string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!isInView) return

    // If target is a string like '24/7', just show it
    if (typeof target === 'string') {
      setDisplay(target)
      return
    }

    const startTime = Date.now()
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * target)
      setDisplay(current.toString())
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, target, duration])

  return <span ref={ref}>{display}{suffix}</span>
}

/* ─── Services Data ─── */
const services = [
  {
    icon: Video,
    title: 'Видеонаблюдение',
    body: 'IP-камеры, аналоговые системы, видеоаналитика, распознавание лиц и номеров. Проекты от 1 до 1000+ камер.',
  },
  {
    icon: DoorOpen,
    title: 'Контроль доступа',
    body: 'Биометрия, турникеты, шлагбаумы, СКУД с интеграцией в ЕСИА и 1С. Управление доступом в реальном времени.',
  },
  {
    icon: Bell,
    title: 'Охранно-пожарная сигнализация',
    body: 'Проектирование и монтаж ОПС под ключ. Пожарные извещатели, оповещение, интеграция с МЧС.',
  },
  {
    icon: Network,
    title: 'СКС и сети',
    body: 'Структурированные кабельные системы, оптоволокно, Wi-Fi покрытие, серверные стойки. Сертифицированный монтаж.',
  },
  {
    icon: FileText,
    title: 'Проектирование и аудит',
    body: 'Технические задания, сметная документация, аудит существующих систем, экспертиза проектов.',
  },
  {
    icon: ClipboardCheck,
    title: 'Обслуживание и поддержка',
    body: '24/7 техническая поддержка, выезд на объект за 2 часа, гарантийный и постгарантийный сервис.',
  },
]

/* ─── Brand Logos (SVG placeholders) ─── */
function BrandLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-10 opacity-60 hover:opacity-100 transition-opacity duration-200 grayscale hover:grayscale-0 cursor-default">
      <span className="font-display font-semibold text-sm text-text-dark tracking-wide">{name}</span>
    </div>
  )
}

const brands = ['HIKVISION', 'DAHUA', 'RVi', 'BOLID', 'РУБЕЖ', 'Cabeus']

/* ─── Catalog Categories ─── */
const catalogCategories = [
  { image: '/catalog-camera-1.jpg', label: 'КАМЕРЫ', count: '120+ моделей', link: '/catalog?category=cameras' },
  { image: '/catalog-nvr-1.jpg', label: 'РЕГИСТРАТОРЫ', count: '45+ моделей', link: '/catalog?category=nvr' },
  { image: '/catalog-skud-1.jpg', label: 'СКУД', count: '80+ моделей', link: '/catalog?category=skud' },
  { image: '/catalog-network-1.jpg', label: 'СЕТЕВОЕ ОБОРУДОВАНИЕ', count: '60+ моделей', link: '/catalog?category=network' },
]

/* ─── Metrics Data ─── */
const metrics = [
  { number: 500, suffix: '+', label: 'Установленных систем', desc: 'Видеонаблюдение, СКУД, ОПС на объектах Калининграда и области' },
  { number: 7, suffix: '+', label: 'Лет на рынке', desc: 'С 2016 года обеспечиваем безопасность бизнеса и частных клиентов' },
  { number: '24/7' as const, suffix: '', label: 'Техподдержка', desc: 'Мониторинг и удалённая диагностика систем в режиме реального времени' },
  { number: 6, suffix: '', label: 'Официальных брендов', desc: 'Hikvision, Dahua, RVi, BOLID, Рубеж, Cabeus — прямые поставки' },
]

/* ─── Testimonials Data ─── */
const testimonials = [
  {
    quote: 'VSB39 установили систему видеонаблюдения на нашем складе за 3 дня. Качество монтажа и настройки на высшем уровне. Техподдержка отвечает мгновенно.',
    author: 'Алексей Петров',
    role: 'Директор, ООО «ЛогистикПро»',
    avatar: '/testimonial-avatar-1.jpg',
  },
  {
    quote: 'Проектирование СКУД для бизнес-центра выполнили профессионально — учли все нюансы доступа, интеграцию с лифтами и парковкой.',
    author: 'Марина Соколова',
    role: 'Технический директор, «СитиПарк»',
    avatar: '/testimonial-avatar-2.jpg',
  },
  {
    quote: 'Обратились за аудитом существующей охранной системы. Получили детальный отчёт с конкретными рекомендациями. Сэкономили 40% на модернизации.',
    author: 'Игорь Власов',
    role: 'Собственник, сеть магазинов',
    avatar: '/testimonial-avatar-3.jpg',
  },
]

/* ─── Workflow Steps ─── */
const workflowSteps = [
  { number: '01', title: 'Бесплатная консультация', body: 'Обсуждаем задачу, объект, бюджет. Выезд на объект при необходимости.', icon: Headset },
  { number: '02', title: 'Проектирование и смета', body: 'Готовим техническое решение, подбираем оборудование, считаем смету с учётом монтажа.', icon: Calculator },
  { number: '03', title: 'Монтаж и пусконаладка', body: 'Профессиональная установка, настройка программного обеспечения, обучение персонала.', icon: Wrench },
  { number: '04', title: 'Обслуживание 24/7', body: 'Гарантийное и постгарантийное обслуживание, удалённый мониторинг, оперативный выезд.', icon: ClipboardCheck },
]

/* ─── Industry Sectors ─── */
const industries = [
  { icon: Building2, label: 'ТОРГОВЛЯ' },
  { icon: HomeIcon, label: 'ОФИСЫ' },
  { icon: Factory, label: 'ПРОИЗВОДСТВО' },
  { icon: Hotel, label: 'ЖИЛЫЕ КОМПЛЕКСЫ' },
  { icon: Hotel, label: 'ОТЕЛИ' },
  { icon: GraduationCap, label: 'ОБРАЗОВАНИЕ' },
]

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative">
      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 208, 132, 0.06) 0%, transparent 70%), #0A0E1A' }}
      >
        <HeroGrid3D />
        <ParticleCanvas />

        <div className="relative z-10 max-w-[900px] px-[6vw] pt-[120px] pb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="section-label mb-6"
          >
            СИСТЕМЫ БЕЗОПАСНОСТИ КАЛИНИНГРАД
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-display font-bold leading-[0.95] tracking-[-0.02em] break-words"
            style={{ fontSize: 'clamp(48px, 7vw, 88px)' }}
          >
            <span className="text-pure-white block">Защитим ваш бизнес</span>
            <span className="gradient-guard-text block">на уровне технологий</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-lg text-text-body max-w-[560px] mt-6 leading-relaxed"
          >
            Проектируем, монтируем и обслуживаем системы видеонаблюдения, контроля доступа, охранно-пожарной сигнализации и структурированных сетей. Работаем в Калининграде и области с 2016 года.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <Link
              to="/estimate"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[10px] gradient-guard text-white font-semibold text-sm hover:brightness-110 transition-all"
            >
              <Calculator size={16} />
              Предварительный расчет
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[10px] border border-guard-green text-guard-green font-semibold text-sm hover:bg-guard-green/10 transition-all"
            >
              <LayoutGrid size={16} />
              Каталог оборудования
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="flex flex-wrap items-center gap-4 mt-8 text-xs font-medium uppercase tracking-[0.05em] text-text-muted"
          >
            <span>Более 500 объектов</span>
            <span className="text-text-muted/50">&#8226;</span>
            <span>7+ лет опыта</span>
            <span className="text-text-muted/50">&#8226;</span>
            <span>Официальные дилеры</span>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SECTION 2: SERVICES ═══════ */}
      <section className="relative bg-deep-navy border-t border-border-subtle">
        <ParticleCanvas />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <SectionReveal>
            <motion.div variants={fadeLeftVariants} className="mb-16">
              <div className="section-label mb-4">НАШИ УСЛУГИ</div>
              <h2 className="font-display text-[36px] font-semibold text-pure-white leading-[1.15] tracking-[-0.005em]">
                Комплексная защита любого объекта
              </h2>
              <p className="text-text-muted mt-2 text-base">
                От проектирования до пожизненного обслуживания
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <motion.div
                  key={service.title}
                  variants={fadeUpVariants}
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-6 rounded-2xl bg-charcoal border border-border-subtle hover:border-border-glow transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,208,132,0.08)]"
                  style={{
                    background: 'radial-gradient(ellipse at top, rgba(0, 229, 194, 0.05) 0%, transparent 60%), #1A1F35',
                  }}
                >
                  <service.icon size={48} className="text-guard-green mb-4 group-hover:scale-110 transition-transform duration-250" />
                  <h3 className="font-display text-[28px] font-semibold text-pure-white mb-2 leading-[1.2]">
                    {service.title}
                  </h3>
                  <p className="text-sm text-text-body leading-relaxed mb-4">
                    {service.body}
                  </p>
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-1 text-sm text-guard-green hover:underline"
                  >
                    Подробнее <ChevronRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 3: CATALOG PREVIEW ═══════ */}
      <section className="bg-off-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <SectionReveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="section-label mb-4">ОБОРУДОВАНИЕ</div>
                <h2 className="font-display text-[36px] font-semibold text-text-dark leading-[1.15]">
                  Проверенное оборудование ведущих брендов
                </h2>
              </div>
              <Link to="/catalog" className="text-base text-guard-green hover:underline whitespace-nowrap shrink-0">
                Весь каталог &rarr;
              </Link>
            </div>

            <motion.div variants={fadeUpVariants} className="flex flex-wrap items-center justify-center gap-8 mb-12">
              {brands.map((brand) => (
                <BrandLogo key={brand} name={brand} />
              ))}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {catalogCategories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  variants={scaleInVariants}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={cat.link} className="group block">
                    <div className="overflow-hidden rounded-xl mb-4">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-[0.05em] text-guard-green">
                      {cat.label}
                    </span>
                    <p className="font-mono text-base text-text-dark-secondary mt-1">
                      {cat.count}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 4: LIVE METRICS ═══════ */}
      <section
        className="relative bg-deep-navy"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0, 208, 132, 0.06) 0%, transparent 70%), #0A0E1A',
        }}
      >
        <ParticleCanvas />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <SectionReveal>
            <motion.div variants={fadeUpVariants} className="text-center mb-16">
              <div className="section-label justify-center mb-4">
                ДОКАЗАТЕЛЬСТВО НАДЁЖНОСТИ
              </div>
              <h2 className="font-display text-[36px] font-semibold text-pure-white leading-[1.15]">
                Цифры, которые говорят
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  variants={fadeUpVariants}
                  transition={{ delay: i * 0.12 }}
                  className="text-center"
                >
                  <div className="font-mono font-bold gradient-guard-text leading-none mb-2" style={{ fontSize: 'clamp(48px, 6vw, 96px)' }}>
                    {typeof metric.number === 'string'
                      ? metric.number
                      : <AnimatedCounter target={metric.number} suffix={metric.suffix} />}
                  </div>
                  <h4 className="font-display text-xl font-medium text-pure-white mb-2">
                    {metric.label}
                  </h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {metric.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 5: AI AGENT PREVIEW ═══════ */}
      <section
        className="bg-charcoal"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 229, 194, 0.05) 0%, transparent 60%), #1A1F35',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
            <SectionReveal>
              <motion.div variants={fadeLeftVariants}>
                <div className="section-label mb-4">ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ</div>
                <h2 className="font-display text-[36px] font-semibold text-pure-white leading-[1.15] mb-4">
                  Ваш личный эксперт по безопасности
                </h2>
                <p className="text-base text-text-body leading-relaxed mb-6">
                  ИИ-Агент VSB39 знает весь каталог, умеет считать сметы, подбирать оборудование под задачу и отвечать на технические вопросы в любое время суток.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Подбор оборудования по параметрам объекта',
                    'Автоматический расчёт сметы с учётом работ',
                    'Ответы на вопросы о монтаже и настройке',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-text-body">
                      <Check size={18} className="text-guard-green shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/ai"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-guard-green text-guard-green font-medium text-sm hover:bg-guard-green/10 transition-colors"
                >
                  Открыть ИИ-Агента <ChevronRight size={16} />
                </Link>
              </motion.div>
            </SectionReveal>

            <SectionReveal>
              <motion.div variants={scaleInVariants}>
                <AIPreviewOrb />
              </motion.div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 6: TESTIMONIALS ═══════ */}
      <section className="bg-off-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <SectionReveal>
            <motion.div variants={fadeUpVariants} className="text-center mb-16">
              <div className="section-label justify-center mb-4">ОТЗЫВЫ КЛИЕНТОВ</div>
              <h2 className="font-display text-[36px] font-semibold text-text-dark leading-[1.15]">
                Что говорят наши заказчики
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.author}
                  variants={fadeUpVariants}
                  transition={{ delay: i * 0.12 }}
                  className="bg-charcoal rounded-2xl p-8 relative"
                >
                  <div className="text-guard-green text-[48px] leading-none mb-4 font-serif">&ldquo;</div>
                  <p className="text-lg italic text-text-dark leading-relaxed mb-6">
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-display font-medium text-text-dark">{t.author}</h4>
                      <p className="text-xs font-medium uppercase tracking-[0.05em] text-text-dark-secondary">
                        {t.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="text-caution-amber fill-caution-amber" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 7: WORKFLOW ═══════ */}
      <section className="relative bg-deep-navy">
        <ParticleCanvas />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <SectionReveal>
            <motion.div variants={fadeLeftVariants} className="mb-12">
              <div className="section-label mb-4">КАК МЫ РАБОТАЕМ</div>
              <h2 className="font-display text-[36px] font-semibold text-pure-white leading-[1.15]">
                От заявки до готовой системы — 4 простых шага
              </h2>
            </motion.div>

            <div className="relative">
              {/* Connecting Line - Desktop */}
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px">
                <div
                  className="h-full w-full"
                  style={{
                    background: 'linear-gradient(90deg, #00A868 0%, #00D084 50%, #00E5C2 100%)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {workflowSteps.map((step, i) => (
                  <motion.div
                    key={step.number}
                    variants={fadeUpVariants}
                    transition={{ delay: i * 0.15 }}
                    className="relative text-center lg:text-left"
                  >
                    <div className="w-16 h-16 rounded-full border border-guard-green flex items-center justify-center bg-deep-navy mx-auto lg:mx-0 mb-4 relative z-10">
                      <step.icon size={28} className="text-guard-green" />
                    </div>
                    <div className="font-mono text-[32px] font-semibold text-guard-green leading-none mb-2">
                      {step.number}
                    </div>
                    <h3 className="font-display text-[28px] font-semibold text-pure-white leading-[1.2] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-body leading-relaxed">
                      {step.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 8: CLIENT LOGOS / INDUSTRIES ═══════ */}
      <section className="bg-midnight border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {industries.map((ind, i) => (
                <motion.div
                  key={ind.label}
                  variants={fadeUpVariants}
                  transition={{ delay: i * 0.06 }}
                  className="flex flex-col items-center gap-2 group cursor-default"
                >
                  <ind.icon size={40} className="text-text-muted group-hover:text-guard-green transition-colors duration-200" />
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-text-muted group-hover:text-guard-green transition-colors duration-200">
                    {ind.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════ SECTION 9: FINAL CTA ═══════ */}
      <section
        className="relative bg-deep-navy"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 208, 132, 0.1) 0%, transparent 70%), #0A0E1A',
        }}
      >
        <ParticleCanvas />
        <div className="relative z-10 max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <SectionReveal>
            <motion.h2
              variants={fadeUpVariants}
              className="font-display text-[48px] font-semibold text-pure-white leading-[1.1] mb-6"
            >
              Готовы защитить свой объект?
            </motion.h2>
            <motion.p
              variants={fadeUpVariants}
              className="text-lg text-text-body max-w-[560px] mx-auto mb-8 leading-relaxed"
            >
              Получите бесплатную консультацию и предварительный расчёт сметы за 1 час. Работаем по Калининграду и Калининградской области.
            </motion.p>
            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Link
                to="/estimate"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl gradient-guard text-white font-medium text-lg animate-cta-pulse hover:brightness-110 transition-all"
              >
                <Calculator size={18} />
                Предварительный расчет
              </Link>
              <a
                href="tel:+74012393939"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-guard-green text-guard-green font-medium text-base hover:bg-guard-green/10 transition-colors"
              >
                <Phone size={18} />
                +7 (4012) 39-39-39
              </a>
            </motion.div>
            <motion.p variants={fadeUpVariants} className="text-sm text-text-muted">
              Или напишите в Telegram / WhatsApp
            </motion.p>
          </SectionReveal>
        </div>
      </section>
    </div>
  )
}
