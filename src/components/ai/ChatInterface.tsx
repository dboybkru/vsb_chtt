import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Paperclip, Trash2, Download, Plus, ChevronLeft,
  Sparkles, ArrowRight
} from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  products?: { name: string; price: number; image: string }[]
  delay?: number
}

const quickPrompts = [
  'Какие камеры лучше для склада 500 м²?',
  'Сколько стоит монтаж СКУД на 5 точек доступа?',
  'Что нужно для пожарной сигнализации в офисе?',
  'Подбери комплект видеонаблюдения на 8 камер',
]

const mockResponses: Record<string, string> = {
  'Какие камеры лучше для склада 500 м²?':
    'Для склада 500 м² рекомендую комбинацию: 4 купольные камеры DS-2CD2143G2-I (внутри помещений) + 2 уличные DS-2CD2T43G2-4I (по периметру). Общая стоимость комплекта около 75 000 ₽ с учётом регистратора и кабеля.',
  'Сколько стоит монтаж СКУД на 5 точек доступа?':
    'Монтаж СКУД на 5 точек доступа — примерно 45 000–65 000 ₽ в зависимости от сложности: прокладка кабеля, установка считывателей, настройка ПО и тестирование. Рекомендую добавить проектирование (+5 000 ₽) для точного расчёта.',
  'Что нужно для пожарной сигнализации в офисе?':
    'Для типового офиса потребуется: прибор приёмно-контрольный (ППК), 4–6 дымовых извещателей, ручной извещатель, оповещатели, резервный источник питания и кабель КСПВ. Базовый комплект — от 35 000 ₽.',
  'Подбери комплект видеонаблюдения на 8 камер':
    'Комплект на 8 камер: 8 × DS-2CD2143G2-I (12 800 ₽), NVR DS-7608NI-K2 (24 500 ₽), PoE-коммутатор (8 900 ₽), HDD 4TB (18 000 ₽), кабель и разъёмы (15 000 ₽). Итого: ~169 000 ₽ оборудования + монтаж ~50 000 ₽.',
  'default':
    'Понял вас. Я могу помочь подобрать оборудование, рассчитать смету или ответить на технические вопросы. Уточните детали — тип объекта, площадь, количество точек контроля.',
}

const suggestedCards = [
  { title: 'Какие камеры лучше для склада 500 м²?', icon: Sparkles },
  { title: 'Сколько стоит монтаж СКУД на 5 точек доступа?', icon: Sparkles },
  { title: 'Что нужно для пожарной сигнализации в офисе?', icon: Sparkles },
  { title: 'Подбери комплект видеонаблюдения на 8 камер', icon: Sparkles },
]

function generateId() {
  return Math.random().toString(36).slice(2)
}

function getFallbackResponse(text: string): string {
  const normalized = text.toLowerCase()
  if (
    (normalized.includes('камера') || normalized.includes('оптимус') || normalized.includes('optimus')) &&
    (normalized.includes('пропал') || normalized.includes('пропала') || normalized.includes('не вид') || normalized.includes('вайфай') || normalized.includes('wi-fi') || normalized.includes('wifi'))
  ) {
    return 'Похоже, камера уже установлена и потеряла связь с приложением. Начните с простого: перезагрузите камеру и роутер, проверьте питание и индикаторы, затем убедитесь, что телефон подключен к той же Wi-Fi сети 2.4 ГГц. Если камера Optimus, откройте приложение/утилиту производителя и попробуйте локальный поиск устройства в сети. Если камера не находится, посмотрите в роутере список клиентов: появился ли новый IP-адрес камеры. Сброс к заводским лучше оставить последним шагом, когда питание и сеть точно проверены.'
  }
  for (const [key, value] of Object.entries(mockResponses)) {
    if (text.toLowerCase().includes(key.toLowerCase().slice(0, 20))) return value
  }
  return mockResponses.default
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [projects] = useState(['Новый проект', 'Офис на Ленина', 'Склад №3'])
  const [activeProject, setActiveProject] = useState('Новый проект')
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    const container = messagesRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typing, scrollToBottom])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: generateId(), role: 'user', text: text.trim() }
    const history = messages.slice(-10).map((message) => ({
      role: message.role === 'ai' ? 'assistant' : 'user',
      content: message.text,
    }))
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const response = await apiRequest<{ text?: string; error?: string }>('/ai-chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: text.trim() }],
        }),
      })
      const responseText = response.error ? getFallbackResponse(text.trim()) : response.text || getFallbackResponse(text.trim())
      setTyping(false)
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'ai',
        text: responseText,
      }])
    } catch {
      const responseText = getFallbackResponse(text.trim())
      setTimeout(() => {
        setTyping(false)
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'ai',
          text: responseText,
        }])
      }, Math.max(800, responseText.length * 10))
    }
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setTyping(false)
  }, [])

  return (
    <section className="bg-midnight">
      <div className="flex h-[calc(100vh-220px)] min-h-[560px] max-h-[820px]">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="hidden md:flex flex-col border-r border-border-subtle bg-deep-navy overflow-hidden"
            >
              <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                <h4 className="font-display text-lg font-medium text-pure-white">Контекст</h4>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-text-muted hover:text-pure-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
              <div className="p-4 border-b border-border-subtle">
                <label className="block text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-2">
                  Проект
                </label>
                <select
                  value={activeProject}
                  onChange={(e) => setActiveProject(e.target.value)}
                  className="w-full bg-charcoal border border-border-subtle rounded-lg px-3 py-2 text-sm text-pure-white focus:border-guard-green outline-none"
                >
                  {projects.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 border-b border-border-subtle">
                <p className="text-xs text-text-muted mb-1">Тип объекта:</p>
                <p className="text-sm text-pure-white mb-2">Офис</p>
                <p className="text-xs text-text-muted mb-1">Площадь:</p>
                <p className="text-sm text-pure-white mb-2">250 м²</p>
                <p className="text-xs text-text-muted mb-1">Камеры:</p>
                <p className="text-sm text-pure-white">6 шт</p>
              </div>
              <div className="p-4 space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-guard-green text-deep-navy text-sm font-medium hover:brightness-110 transition-all">
                  <Plus size={16} /> Добавить в смету
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-charcoal text-text-body text-sm hover:text-pure-white transition-colors">
                  <Download size={16} /> Скачать диалог
                </button>
                <button
                  onClick={clearChat}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-charcoal text-text-body text-sm hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} /> Очистить чат
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden md:flex items-center justify-center w-10 border-r border-border-subtle bg-deep-navy text-text-muted hover:text-pure-white transition-colors"
          >
            <ArrowRight size={18} />
          </button>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
            {messages.length === 0 && !typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
                  {suggestedCards.map((card, i) => (
                    <motion.button
                      key={card.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      onClick={() => sendMessage(card.title)}
                      className="flex items-start gap-3 bg-charcoal rounded-xl p-4 border border-border-subtle text-left hover:border-guard-green transition-colors"
                    >
                      <card.icon size={18} className="text-guard-green mt-0.5 shrink-0" />
                      <span className="text-sm text-text-body">{card.title}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-charcoal rounded-2xl rounded-br-md text-pure-white'
                        : 'bg-deep-navy border border-border-subtle rounded-2xl rounded-bl-md text-text-body'
                    }`}
                  >
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-guard-green/20 flex items-center justify-center">
                          <Sparkles size={12} className="text-guard-green" />
                        </div>
                        <span className="text-xs text-guard-green font-medium">ИИ-Агент</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.products && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p) => (
                          <div
                            key={p.name}
                            className="flex items-center gap-3 bg-charcoal/50 rounded-lg p-2"
                          >
                            <div className="w-10 h-10 rounded bg-midnight overflow-hidden shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-pure-white truncate">{p.name}</p>
                              <p className="text-xs text-guard-green">{p.price.toLocaleString('ru-RU')} ₽</p>
                            </div>
                            <button className="text-xs text-guard-green hover:underline shrink-0">
                              В смету
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="bg-deep-navy border border-border-subtle rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-guard-green/20 flex items-center justify-center">
                      <Sparkles size={12} className="text-guard-green" />
                    </div>
                    <span className="text-xs text-guard-green font-medium">ИИ-Агент</span>
                  </div>
                  <div className="flex items-center gap-1.5 h-5">
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-guard-green"
                    />
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-guard-green"
                    />
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-guard-green"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border-subtle">
            <div className="relative flex items-center gap-2">
              <button className="text-text-muted hover:text-pure-white transition-colors p-2 shrink-0">
                <Paperclip size={20} />
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(input)
                    }
                  }}
                  placeholder="Задайте вопрос о системах безопасности..."
                  className="w-full bg-charcoal border border-border-subtle rounded-full px-5 py-3 pr-12 text-sm text-pure-white placeholder:text-text-muted focus:border-guard-green focus:ring-4 focus:ring-guard-green/10 outline-none transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-guard-green flex items-center justify-center text-deep-navy hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-charcoal border border-border-subtle text-xs text-text-body hover:border-guard-green transition-colors"
                >
                  {prompt.length > 35 ? prompt.slice(0, 35) + '...' : prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
