import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Video, Calculator, Headset, MessageSquare } from 'lucide-react'
import AIOrb from '@/components/ai/AIOrb'
import ChatInterface from '@/components/ai/ChatInterface'
import CapabilitiesGrid from '@/components/ai/CapabilitiesGrid'
import AnalyticsDashboard from '@/components/ai/AnalyticsDashboard'
import CTASection from '@/components/ai/CTASection'

const fullIntroText = 'Я ваш эксперт по системам безопасности. Помогу подобрать оборудование, рассчитать смету, ответить на технические вопросы и найти лучшее решение для вашего объекта.'

export default function AiAgent() {
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  const scrollToChat = useCallback(() => {
    const el = document.getElementById('ai-chat-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Typing effect
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < fullIntroText.length) {
        setTypedText(fullIntroText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 30)
    return () => clearInterval(timer)
  }, [])

  // Blinking cursor
  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(timer)
  }, [])

  const quickChips = [
    { label: 'Подобрать камеры', icon: Video, primary: true },
    { label: 'Рассчитать смету', icon: Calculator, primary: false },
    { label: 'Техническая консультация', icon: Headset, primary: false },
    { label: 'Статус заказа', icon: MessageSquare, primary: false },
  ]

  return (
    <main className="bg-deep-navy">
      {/* Section 1: AI Hero */}
      <section
        className="relative min-h-[80vh] flex flex-col items-center justify-center pt-[120px] pb-16 overflow-hidden"
      >
        {/* Radial glow behind orb */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,229,194,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          {/* AI Orb */}
          <AIOrb size={320} className="mb-8" />

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-guard-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-guard-green" />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.05em] text-guard-green">
              Онлайн — GPT-4o
            </span>
          </motion.div>

          {/* Agent Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-display text-[clamp(40px,5vw,64px)] font-bold text-pure-white mb-6"
          >
            ИИ-Агент VSB39
          </motion.h1>

          {/* Typing Introduction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-lg text-text-body max-w-[640px] mb-8 min-h-[3.5em]"
          >
            {typedText}
            <span className={`inline-block w-[2px] h-[1.1em] bg-guard-green ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          </motion.p>

          {/* Quick Action Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: typedText.length === fullIntroText.length ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {quickChips.map((chip, i) => (
              <motion.button
                key={chip.label}
                initial={{ opacity: 0, y: 10 }}
                animate={typedText.length === fullIntroText.length ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                onClick={scrollToChat}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  chip.primary
                    ? 'bg-guard-green text-deep-navy hover:brightness-110'
                    : 'bg-charcoal text-guard-green border border-guard-green hover:bg-guard-green/10'
                }`}
              >
                <chip.icon size={16} />
                {chip.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2: Chat Interface */}
      <div id="ai-chat-section">
        <ChatInterface />
      </div>

      {/* Section 3: Capabilities Grid */}
      <CapabilitiesGrid />

      {/* Section 4: Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* Section 5: CTA */}
      <CTASection />
    </main>
  )
}
