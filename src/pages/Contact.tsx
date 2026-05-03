import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Headset,
  Truck,
  ShieldAlert,
  Check,
  ChevronDown,
  Send,
  MessageCircle,
} from 'lucide-react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

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
const objectTypes = [
  'Офис',
  'Магазин',
  'Склад',
  'Производство',
  'Жилой комплекс',
  'Частный дом',
  'Другое',
]

const serviceOptions = [
  'Видеонаблюдение',
  'СКУД',
  'ОПС',
  'СКС',
  'Проектирование',
  'Обслуживание',
]

const emergencyContacts = [
  {
    icon: Headset,
    heading: 'Техподдержка 24/7',
    phone: '+7 (4012) 39-39-39',
    desc: 'Сбои системы, ошибки камер, проблемы с доступом — звоните круглосуточно.',
    color: 'guard-green',
  },
  {
    icon: Truck,
    heading: 'Выездная бригада',
    phone: '',
    desc: 'Оперативный выезд по Калининграду в течение 2 часов.',
    color: 'guard-green',
  },
  {
    icon: ShieldAlert,
    heading: 'Пульт охраны',
    phone: '',
    desc: 'Для клиентов с подключённой охранной сигнализацией.',
    color: 'caution-amber',
  },
]

const faqItems = [
  {
    question: 'Как быстро вы можете приступить к монтажу?',
    answer: 'После утверждения проекта и сметы — в течение 3–5 рабочих дней. Для срочных проектов возможен старт на следующий день.',
  },
  {
    question: 'Даёте ли вы гарантию на работы?',
    answer: 'Да, гарантия на монтаж — 1 год. На оборудование — в соответствии с гарантией производителя (обычно 2–3 года).',
  },
  {
    question: 'Работаете ли вы за пределами Калининграда?',
    answer: 'Основная география — Калининград и Калининградская область. Крупные проекты в других регионах — по договорённости.',
  },
  {
    question: 'Можно ли посмотреть ваши объекты?',
    answer: 'По запросу организуем показ реализованных проектов, близких по масштабу и типу к вашему.',
  },
  {
    question: 'Как происходит оплата?',
    answer: '50% предоплата перед началом работ, 50% по завершении. Для постоянных клиентов — отсрочка платежа.',
  },
  {
    question: 'Есть ли у вас ИИ-консультант?',
    answer: 'Да! Наш ИИ-Агент доступен круглосуточно. Он поможет подобрать оборудование, рассчитать смету и ответить на технические вопросы.',
  },
]

/* ── page ── */
export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="bg-deep-navy">
      {/* ========== HERO ========== */}
      <section
        className="relative pt-[72px] pb-8 px-4 sm:px-6 lg:px-8"
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
            Главная / Контакты
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeSnap }}
            className="font-display text-[48px] font-semibold text-pure-white leading-[1.1] tracking-[-0.01em] mb-4"
          >
            Свяжитесь с нами
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeSnap }}
            className="text-lg text-text-body leading-relaxed max-w-[600px] mb-8"
          >
            Опишите вашу задачу — мы ответим в течение часа в рабочее время. Для срочных вопросов звоните напрямую.
          </motion.p>

          {/* Emergency banner */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: easeSnap }}
            className="bg-charcoal rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-[3px] border-guard-green"
          >
            <div className="flex items-center gap-3">
              <Phone size={24} className="text-guard-green shrink-0" />
              <span className="font-display text-[20px] font-medium text-pure-white">
                Горячая линия 24/7
              </span>
            </div>
            <a
              href="tel:+74012393939"
              className="font-mono text-[32px] font-semibold text-guard-green leading-[1.1] tracking-[-0.02em] hover:brightness-110 transition-all animate-pulse-glow"
            >
              +7 (4012) 39-39-39
            </a>
          </motion.div>
        </div>
      </section>

      {/* ========== FORM + INFO ========== */}
      <section className="bg-off-white py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_0.6fr] gap-12">
          {/* Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-display text-[36px] font-semibold text-text-dark leading-[1.15] tracking-[-0.005em] mb-2"
            >
              Отправить заявку
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-base text-text-dark-secondary leading-relaxed mb-8"
            >
              Заполните форму — мы перезвоним для уточнения деталей.
            </motion.p>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  exit={{ opacity: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1.5">
                        Имя <span className="text-guard-green">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full bg-pure-white border border-border-light rounded-lg px-4 py-3 text-text-dark placeholder:text-text-muted focus:outline-none focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 transition-all"
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1.5">
                        Телефон <span className="text-guard-green">*</span>
                      </label>
                      <input
                        required
                        type="tel"
                        className="w-full bg-pure-white border border-border-light rounded-lg px-4 py-3 text-text-dark placeholder:text-text-muted focus:outline-none focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 transition-all"
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full bg-pure-white border border-border-light rounded-lg px-4 py-3 text-text-dark placeholder:text-text-muted focus:outline-none focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 transition-all"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1.5">
                      Тип объекта
                    </label>
                    <select className="w-full bg-pure-white border border-border-light rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 transition-all appearance-none cursor-pointer">
                      <option value="">Выберите тип объекта</option>
                      {objectTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Интересующие услуги
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map((svc) => (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => toggleService(svc)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                            selectedServices.includes(svc)
                              ? 'bg-guard-green text-white border-guard-green'
                              : 'bg-pure-white text-text-dark-secondary border-border-light hover:border-guard-green'
                          }`}
                        >
                          {svc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1.5">
                      Сообщение
                    </label>
                    <textarea
                      rows={4}
                      className="w-full bg-pure-white border border-border-light rounded-lg px-4 py-3 text-text-dark placeholder:text-text-muted focus:outline-none focus:border-guard-green focus:ring-2 focus:ring-guard-green/20 transition-all resize-none"
                      placeholder="Опишите вашу задачу..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[10px] gradient-guard text-white font-semibold text-base hover:scale-[1.02] hover:shadow-lg transition-all duration-150"
                  >
                    <Send size={18} />
                    Отправить заявку
                  </button>

                  <p className="text-sm text-text-dark-secondary text-center">
                    Отправляя форму, вы соглашаетесь с политикой конфиденциальности.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: easeSnap }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-guard-green/10 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check size={32} className="text-guard-green" />
                  </motion.div>
                  <h3 className="font-display text-[28px] font-semibold text-guard-green mb-3">
                    Спасибо! Мы перезвоним вам в течение часа.
                  </h3>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-text-dark-secondary hover:text-guard-green transition-colors text-sm underline"
                  >
                    Отправить ещё одну заявку
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="space-y-8"
          >
            <motion.h3
              variants={{
                hidden: { opacity: 0, x: 15 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.3, ease: easeSnap },
                },
              }}
              className="font-display text-[28px] font-semibold text-text-dark leading-[1.2]"
            >
              Контактная информация
            </motion.h3>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: 15 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.3, ease: easeSnap },
                },
              }}
              className="space-y-6"
            >
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-guard-green mt-0.5 shrink-0" />
                <p className="text-base text-text-dark">
                  г. Калининград
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-guard-green mt-0.5 shrink-0" />
                <div>
                  <a
                    href="tel:+74012393939"
                    className="block text-base text-guard-green font-medium"
                  >
                    +7 (4012) 39-39-39
                  </a>

                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={20} className="text-guard-green mt-0.5 shrink-0" />
                <div>
                  <a
                    href="mailto:info@vsb39.ru"
                    className="block text-base text-guard-green font-medium"
                  >
                    info@vsb39.ru
                  </a>
                  <span className="text-sm text-text-dark-secondary">
                    sales@vsb39.ru
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-guard-green mt-0.5 shrink-0" />
                <div>
                  <p className="text-base text-text-dark">
                    Пн–Пт: 9:00–18:00
                  </p>
                  <p className="text-sm text-text-dark-secondary">
                    Сб: 10:00–14:00
                  </p>
                  <p className="text-sm text-text-dark-secondary">
                    Вс: выходной
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 15 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.3, ease: easeSnap },
                },
              }}
              className="flex items-center gap-4 pt-4"
            >
              <a
                href="https://t.me/vsb39"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-guard-green flex items-center justify-center text-white hover:scale-110 transition-transform"
                aria-label="Telegram"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://wa.me/74012393939"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-guard-green flex items-center justify-center text-white hover:scale-110 transition-transform"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://vk.com/vsb39"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-guard-green flex items-center justify-center text-white hover:scale-110 transition-transform"
                aria-label="VK"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.365 1.26 2.18 1.817.616.423 1.084.33 1.084.33l2.177-.03s1.14-.071.599-.968c-.044-.073-.314-.66-1.617-1.865-1.364-1.26-1.182-1.055.462-3.23.998-1.332 1.398-2.146 1.272-2.494-.12-.33-.86-.243-.86-.243l-2.45.015s-.182-.025-.316.056c-.132.08-.217.265-.217.265s-.39 1.037-.91 1.92c-1.096 1.86-1.534 1.96-1.714 1.842-.42-.272-.315-1.085-.315-1.663 0-1.806.274-2.56-.534-2.756-.268-.065-.464-.108-1.146-.115-.876-.01-1.617.003-2.038.208-.28.14-.494.45-.363.468.162.022.53.1.725.363.252.34.243 1.103.243 1.103s.145 2.13-.34 2.396c-.332.183-.79-.19-1.77-1.894-.502-.868-.88-1.83-.88-1.83s-.073-.178-.204-.274c-.158-.117-.38-.154-.38-.154l-2.333.016s-.35.01-.478.162c-.115.136-.01.417-.01.417s1.833 4.292 3.91 6.455c1.903 1.983 4.064 1.85 4.064 1.85h.978z" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== MAP ========== */}
      <section className="border-t border-border-subtle">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="w-full h-[400px] bg-midnight relative overflow-hidden"
        >
          <iframe
            title="VSB39 Office Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=20.4%2C54.68%2C20.55%2C54.74&layer=mapnik"
            className="w-full h-full border-0 grayscale-[50%]"
            loading="lazy"
          />
          <div className="absolute bottom-4 left-4 bg-charcoal/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-border-subtle">
            <p className="text-sm text-pure-white font-medium">
              VSB39 — Ваша Система Безопасности
            </p>
            <p className="text-xs text-text-muted">
              г. Калининград
            </p>
          </div>
        </motion.div>
      </section>

      {/* ========== EMERGENCY CONTACTS ========== */}
      <section className="bg-charcoal border-t-2 border-caution-amber py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="text-center mb-10"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="section-label justify-center text-caution-amber mb-3"
            >
              СРОЧНАЯ ПОМОЩЬ
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[28px] font-semibold text-pure-white leading-[1.2]"
            >
              Экстренные контакты
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {emergencyContacts.map((ec) => (
              <motion.div
                key={ec.heading}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: easeSnap },
                  },
                }}
                className="glass-card rounded-2xl p-6 hover:border-[rgba(0,208,132,0.3)] transition-colors duration-200"
              >
                <ec.icon
                  size={40}
                  className={`mb-4 ${ec.color === 'caution-amber' ? 'text-caution-amber' : 'text-guard-green'}`}
                  strokeWidth={1.5}
                />
                <h3 className="font-display text-[20px] font-medium text-pure-white mb-2">
                  {ec.heading}
                </h3>
                {ec.phone && (
                  <a
                    href={`tel:${ec.phone.replace(/\D/g, '')}`}
                    className={`font-mono text-base font-medium block mb-2 ${ec.color === 'caution-amber' ? 'text-caution-amber' : 'text-guard-green'}`}
                  >
                    {ec.phone}
                  </a>
                )}
                <p className="text-sm text-text-muted">{ec.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="bg-off-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto">
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
              ВОПРОСЫ И ОТВЕТЫ
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-[36px] font-semibold text-text-dark leading-[1.15] tracking-[-0.005em]"
            >
              Часто задаваемые вопросы
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            <AccordionPrimitive.Root type="single" collapsible className="space-y-3">
              {faqItems.map((item) => (
                <motion.div
                  key={item.question}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.3, ease: easeSnap },
                    },
                  }}
                >
                  <AccordionPrimitive.Item
                    value={item.question}
                    className="bg-pure-white border border-border-light rounded-lg overflow-hidden"
                  >
                    <AccordionPrimitive.Trigger className="w-full flex items-center justify-between p-4 text-left group cursor-pointer">
                      <span className="font-display text-[20px] font-medium text-text-dark leading-[1.3] pr-4">
                        {item.question}
                      </span>
                      <ChevronDown
                        size={20}
                        className="text-text-muted shrink-0 group-data-[state=open]:rotate-45 transition-transform duration-200"
                      />
                    </AccordionPrimitive.Trigger>
                    <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="px-4 pb-4 text-base text-text-dark-secondary leading-relaxed bg-[rgba(0,0,0,0.02)]">
                        {item.answer}
                      </div>
                    </AccordionPrimitive.Content>
                  </AccordionPrimitive.Item>
                </motion.div>
              ))}
            </AccordionPrimitive.Root>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
