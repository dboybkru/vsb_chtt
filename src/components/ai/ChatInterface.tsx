import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Paperclip, Trash2, Download, Plus, ChevronLeft,
  Sparkles, ArrowRight, Loader2, AlertCircle
} from 'lucide-react'
import { useEstimate } from '@/components/estimate/EstimateContext'

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

const suggestedCards = [
  { title: 'Какие камеры лучше для склада 500 м²?', icon: Sparkles },
  { title: 'Сколько стоит монтаж СКУД на 5 точек доступа?', icon: Sparkles },
  { title: 'Что нужно для пожарной сигнализации в офисе?', icon: Sparkles },
  { title: 'Подбери комплект видеонаблюдения на 8 камер', icon: Sparkles },
]

// Настройки ИИ
const AI_CONFIG = {
  baseUrl: 'https://api.vsegpt.ru/v1',
  model: 'openai/gpt-4o',
  temperature: 0.7,
  maxTokens: 2048,
}

// Системный промпт
const SYSTEM_PROMPT = `Вы — ИИ-ассистент компании VSB39 (Калининград), эксперт по системам безопасности.
Ваша задача — помогать клиентам с:
- Подбором оборудования для видеонаблюдения, СКУД, ОПС, СКС
- Расчётом предварительных смет
- Техническими консультациями
- Ответами на вопросы о монтаже и обслуживании

В каталоге компании более 600 позиций оборудования.
Отвечайте профессионально, кратко и по существу. Если нужно — уточняйте детали.`

function generateId() {
  return Math.random().toString(36).slice(2)
}

async function getCatalogItems(category?: string): Promise<string> {
  try {
    const url = category
      ? `/api/materials/?limit=20&search=${encodeURIComponent(category)}`
      : '/api/materials/?limit=10'
    const resp = await fetch(url)
    if (!resp.ok) return ''
    const data = await resp.json()
    const items = data.items || []
    if (!items.length) return ''
    return items.map((m: any) =>
      `- ${m.name}: ${m.price} ₽ (${m.source})`
    ).join('\n')
  } catch {
    return ''
  }
}

async function sendToAI(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const apiKey = localStorage.getItem('vsegpt-api-key') || ''
    if (!apiKey) {
      return 'API ключ не настроен. Пожалуйста, добавьте ключ в настройках админки (раздел «Настройки ИИ»).'
    }

    const model = localStorage.getItem('vsegpt-model') || AI_CONFIG.model
    const temperature = Number(localStorage.getItem('vsegpt-temperature') || String(AI_CONFIG.temperature))
    const maxTokens = Number(localStorage.getItem('vsegpt-max-tokens') || String(AI_CONFIG.maxTokens))

    const resp = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return `Ошибка API (${resp.status}): ${err.slice(0, 200)}`
    }

    const data = await resp.json()
    return data.choices?.[0]?.message?.content || 'Нет ответа от ИИ'
  } catch (e) {
    return `Ошибка сети: ${e instanceof Error ? e.message : 'Unknown error'}`
  }
}

// Простой markdown-to-HTML парсер (inline, без доп. библиотек)
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-pure-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/### (.+?)\n/g, '<h3 class="text-pure-white font-semibold text-base mt-3 mb-1">$1</h3>')
    .replace(/## (.+?)\n/g, '<h2 class="text-pure-white font-semibold text-lg mt-4 mb-2">$1</h2>')
    .replace(/# (.+?)\n/g, '<h1 class="text-pure-white font-semibold text-xl mt-4 mb-2">$1</h1>')
    .replace(/\n- (.+?)\n/g, '<li class="ml-4 text-text-body">$1</li>')
    .replace(/\n\d+\. (.+?)\n/g, '<li class="ml-4 text-text-body list-decimal">$1</li>')
    .replace(/\n/g, '<br/>')
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [projects] = useState(['Новый проект', 'Офис на Ленина', 'Склад №3'])
  const [activeProject, setActiveProject] = useState('Новый проект')
  const [error, setError] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMessagesLength = useRef(0)
  const userScrolledUp = useRef(false)
  const { addItem } = useEstimate()

  // Smart scroll
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !bottomRef.current) return

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    const messagesAdded = messages.length > prevMessagesLength.current
    prevMessagesLength.current = messages.length

    if (messagesAdded && (!userScrolledUp.current || isNearBottom)) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
      userScrolledUp.current = false
    }
  }, [messages])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    userScrolledUp.current = distanceFromBottom > 100
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    setError(null)
    const userMsg: Message = { id: generateId(), role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Собираем контекст для ИИ
    const history = messages.slice(-10).map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.text }))
    const aiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: text.trim() },
    ]

    // Если запрос про подбор оборудования — добавляем товары из каталога в контекст
    const lower = text.toLowerCase()
    if (lower.includes('камер') || lower.includes('видеонаблюдение') || lower.includes('скуд') || lower.includes('сигнализац') || lower.includes('комплект')) {
      const category = lower.includes('скуд') ? 'СКУД'
        : lower.includes('сигнализац') ? 'ОПС'
        : lower.includes('камер') || lower.includes('видеонаблюдение') ? 'видеонаблюдение'
        : ''
      if (category) {
        const catalog = await getCatalogItems(category)
        if (catalog) {
          aiMessages.push({
            role: 'system',
            content: `Доступные позиции из каталога по запросу «${category}»:\n${catalog}\n\nИспользуйте эти данные для подбора, если они релевантны.`,
          })
        }
      }
    }

    const responseText = await sendToAI(aiMessages)
    setTyping(false)

    if (responseText.startsWith('Ошибка')) {
      setError(responseText)
    }

    const aiMsg: Message = {
      id: generateId(),
      role: 'ai',
      text: responseText,
    }
    setMessages(prev => [...prev, aiMsg])
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setTyping(false)
    setError(null)
    prevMessagesLength.current = 0
    userScrolledUp.current = false
  }, [])

  function addToEstimate(text: string) {
    // Парсим позиции формата: "Название — 7 140 ₽" или "Название: 7 140 ₽"
    const lines = text.split('\n')
    const items: Array<{name: string, price: number}> = []
    
    for (const line of lines) {
      // Match: "Something — 7 140 ₽" or "Something: 7 140 ₽"
      const match = line.match(/(.+?)\s*[—:\-]\s*([\d\s]+)\s*₽/)
      if (match) {
        const name = match[1].replace(/^[-*•]\s*/, '').trim()
        const priceStr = match[2].replace(/\s/g, '')
        const price = parseInt(priceStr, 10)
        if (name && price > 0) {
          items.push({ name, price })
        }
      }
    }
    
    // Also try to find total sum
    const totalMatch = text.match(/[Ии]того[:~\s]*([\d\s]+)\s*₽/)
    
    if (items.length === 0 && totalMatch) {
      // Fallback: add single item with total
      items.push({ 
        name: 'Подбор оборудования (ИИ)', 
        price: parseInt(totalMatch[1].replace(/\s/g, ''), 10) 
      })
    }
    
    // Add each item to estimate
    for (const item of items) {
      addItem({
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: item.name,
        sku: 'AI-генерация',
        brand: 'VSB39',
        category: 'Подбор ИИ',
        image: '/catalog-camera-1.jpg',
        price: item.price,
        quantity: 1,
      })
    }
    
    // Show toast/notification
    setError(items.length > 0 ? `Добавлено ${items.length} позиций в смету` : 'Не найдено позиций для добавления')
    setTimeout(() => setError(null), 3000)
  }

  return (
    <section className="bg-midnight border-t border-border-subtle">
      <div className="flex h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)] max-h-[900px]">
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
                <button 
                  onClick={() => {
                    const lastAi = messages.filter(m => m.role === 'ai').pop()
                    if (lastAi) addToEstimate(lastAi.text)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-guard-green text-deep-navy text-sm font-medium hover:brightness-110 transition-all"
                >
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
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            style={{ overflowAnchor: 'none' }}
          >
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
                      <card.icon size={18} className="text-guard-green shrink-0 mt-0.5" />
                      <span className="text-sm text-pure-white leading-snug">{card.title}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-guard-green text-deep-navy rounded-br-none'
                        : msg.text.startsWith('Ошибка') || msg.text.startsWith('API ключ не настроен')
                          ? 'bg-red-900/30 text-red-200 rounded-bl-none border border-red-700/40'
                          : 'bg-charcoal text-pure-white rounded-bl-none border border-border-subtle'
                    }`}
                  >
                    {msg.role === 'ai' && !msg.text.startsWith('Ошибка') && !msg.text.startsWith('API ключ не настроен') ? (
                      <>
                        <div 
                          className="markdown-content"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
                        />
                        <div className="mt-3 pt-3 border-t border-border-subtle/50">
                          <button
                            onClick={() => addToEstimate(msg.text)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-guard-green/10 text-guard-green text-xs font-medium hover:bg-guard-green/20 transition-colors"
                          >
                            <Plus size={14} />
                            Добавить в смету
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                    {msg.products && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 bg-midnight rounded-lg p-2">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{p.name}</p>
                              <p className="text-xs text-text-muted">{p.price.toLocaleString('ru')} ₽</p>
                            </div>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-charcoal border border-border-subtle rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                  <Loader2 size={16} className="text-text-muted animate-spin" />
                  <span className="text-xs text-text-muted">ИИ думает...</span>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} className="h-px" />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border-subtle bg-midnight shrink-0">
            <div className="max-w-3xl mx-auto">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2 flex items-center gap-2 rounded-lg bg-red-900/30 border border-red-700/40 px-3 py-2 text-xs text-red-200"
                >
                  <AlertCircle size={14} />
                  <span>{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-300 hover:text-red-100"
                  >
                    Скрыть
                  </button>
                </motion.div>
              )}

              <div className="flex items-end gap-2 bg-charcoal rounded-2xl border border-border-subtle px-4 py-3 focus-within:border-guard-green transition-colors">
                <button className="text-text-muted hover:text-pure-white transition-colors shrink-0">
                  <Paperclip size={20} />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(input)
                    }
                  }}
                  placeholder="Опишите задачу..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-pure-white placeholder-text-muted resize-none outline-none min-h-[20px] max-h-[120px]"
                  style={{ fieldSizing: 'content' }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  className="shrink-0 w-9 h-9 rounded-full bg-guard-green text-deep-navy flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {typing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={typing}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-charcoal border border-border-subtle text-xs text-text-body hover:text-pure-white hover:border-guard-green transition-all disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
