import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

const badges = [
  'OpenAI GPT-4o',
  'RAG',
  'Vector Search',
  'Real-time',
  'Secure',
]

export default function CTASection() {
  const scrollToChat = () => {
    const el = document.getElementById('ai-chat-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="bg-deep-navy relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,208,132,0.06) 0%, transparent 70%)',
      }}
    >
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-[48px] font-semibold text-pure-white leading-tight mb-6"
        >
          Попробуйте прямо сейчас
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base text-text-body mb-8"
        >
          ИИ-Агент работает на базе GPT-4o с дополнительным обучением на каталоге оборудования, прайс-листах и технической документации VSB39.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={scrollToChat}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl gradient-guard text-white font-semibold hover:brightness-110 transition-all mb-8"
        >
          Начать диалог
          <ArrowDown size={18} />
        </motion.button>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge, i) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
              className="text-xs font-medium uppercase tracking-[0.05em] text-text-muted bg-charcoal px-3 py-1 rounded-full"
            >
              {badge}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
