import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calculator, MessageSquare, Sparkles } from 'lucide-react'
import ChatInterface from '@/components/ai/ChatInterface'

export default function AiAgent() {
  const scrollToChat = useCallback(() => {
    const el = document.getElementById('ai-chat-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const quickChips = [
    { label: 'Подобрать комплект', icon: Sparkles, primary: true },
    { label: 'Рассчитать смету', icon: Calculator, primary: false },
    { label: 'Задать вопрос', icon: MessageSquare, primary: false },
  ]

  return (
    <main className="bg-deep-navy">
      <section
        className="relative pt-[104px] pb-8 overflow-hidden border-b border-border-subtle"
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-[clamp(34px,4vw,56px)] font-bold text-pure-white"
          >
            ИИ-Агент VSB39
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <p className="max-w-[700px] text-base sm:text-lg leading-7 text-text-body">
              Помогает подобрать оборудование, собрать смету и ответить на технические вопросы по видеонаблюдению, СКУД, ОПС и сетям.
            </p>
            <div className="flex flex-wrap gap-3">
              {quickChips.map((chip) => (
              <button
                key={chip.label}
                onClick={scrollToChat}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  chip.primary
                    ? 'bg-guard-green text-deep-navy hover:brightness-110'
                    : 'bg-charcoal text-guard-green border border-guard-green hover:bg-guard-green/10'
                }`}
              >
                <chip.icon size={16} />
                {chip.label}
              </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div id="ai-chat-section">
        <ChatInterface />
      </div>
    </main>
  )
}
