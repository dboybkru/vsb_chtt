import type { FC } from 'react'
import { useState } from 'react'
import { Eye, EyeOff, Check, Copy, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AITab = 'general' | 'api' | 'prompts' | 'integrations' | 'logs'

const tabs: { id: AITab; label: string }[] = [
  { id: 'general', label: 'Общие' },
  { id: 'api', label: 'API-ключи' },
  { id: 'prompts', label: 'Промпты' },
  { id: 'integrations', label: 'Интеграции' },
  { id: 'logs', label: 'Логи' },
]

const models = [
  { id: 'openai/gpt-4o', name: 'GPT-4o (рекомендуется)', desc: 'Хорошее качество, function calling' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Быстрая, дешевая' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', desc: 'Высокое качество' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', desc: 'Бюджетная' },
]

const promptTemplates = [
  {
    id: 'equipment',
    title: 'Подбор оборудования',
    content:
      'Вы эксперт по системам безопасности компании VSB39. Помогите подобрать оборудование для объекта клиента. Учитывайте бюджет, площадь, количество точек и требования к качеству.',
  },
  {
    id: 'estimate',
    title: 'Расчёт сметы',
    content:
      'Рассчитайте предварительную смету на установку системы безопасности. Включите оборудование, монтаж, настройку и обслуживание. Укажите сроки реализации.',
  },
  {
    id: 'tech',
    title: 'Техническая консультация',
    content:
      'Ответьте на технический вопрос клиента по системам видеонаблюдения, СКУД, ОПС или СКС. Используйте профессиональную терминологию, но объясняйте простым языком.',
  },
  {
    id: 'parsing',
    title: 'Парсинг прайсов',
    content:
      'Проанализируйте загруженный прайс-лист. Извлеките названия товаров, артикулы, цены по уровням и категории. Сформируйте структурированный JSON для импорта в каталог.',
  },
  {
    id: 'seo',
    title: 'SEO-оптимизация',
    content:
      'Сгенерируйте SEO-оптимизированные мета-теги для страниц каталога. Используйте ключевые слова: системы безопасности Калининград, видеонаблюдение, СКУД, ОПС.',
  },
]

const AISettings: FC = () => {
  const [activeTab, setActiveTab] = useState<AITab>('general')
  const [model, setModel] = useState(() => localStorage.getItem('vsegpt-model') || 'openai/gpt-4o')
  const [temperature, setTemperature] = useState(() => [
    Number(localStorage.getItem('vsegpt-temperature') || '0.7')
  ])
  const [maxTokens, setMaxTokens] = useState(() => localStorage.getItem('vsegpt-max-tokens') || '2048')
  const [systemPersonality, setSystemPersonality] = useState(
    'Вы эксперт по системам безопасности компании VSB39. Ваши знания охватывают видеонаблюдение, СКУД, охранно-пожарную сигнализацию и структурированные кабельные системы. Вы отвечаете профессионально, точно и по существу.'
  )
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Здравствуйте! Я ИИ-агент VSB39. Задайте вопрос о системах безопасности — я помогу с подбором оборудования, расчётом сметы или технической консультацией.'
  )
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vsegpt-api-key') || '')
  const [showKey, setShowKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState<'ok' | 'error' | 'idle'>('idle')
  const [testing, setTesting] = useState(false)
  const [prompts, setPrompts] = useState(promptTemplates)
  const [saveToast, setSaveToast] = useState(false)

  const updatePrompt = (id: string, content: string) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, content } : p)))
  }

  const handleSave = () => {
    localStorage.setItem('vsegpt-model', model)
    localStorage.setItem('vsegpt-temperature', String(temperature[0]))
    localStorage.setItem('vsegpt-max-tokens', maxTokens)
    localStorage.setItem('vsegpt-api-key', apiKey)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setKeyStatus('error')
      return
    }
    setTesting(true)
    setKeyStatus('idle')
    try {
      const resp = await fetch('https://api.vsegpt.ru/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'openai/gpt-4o',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      })
      if (resp.ok) {
        setKeyStatus('ok')
      } else {
        setKeyStatus('error')
      }
    } catch {
      setKeyStatus('error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-8">
      {/* Save Toast */}
      {saveToast && (
        <div className="fixed top-4 right-4 z-[1000] bg-guard-green text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideInToast">
          <Check size={16} />
          <span className="text-sm font-medium">Сохранено</span>
        </div>
      )}

      <div className="flex gap-6">
        {/* Vertical Tabs */}
        <div className="w-[200px] shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-charcoal text-pure-white border-l-[3px] border-guard-green'
                  : 'text-text-muted hover:bg-charcoal hover:text-pure-white border-l-[3px] border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm text-text-body">Модель ИИ (VseGPT)</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="bg-midnight border-border-subtle text-pure-white w-full max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal border-border-subtle">
                      {models.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex flex-col">
                            <span className="text-sm">{m.name}</span>
                            <span className="text-xs text-text-muted">{m.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-text-muted mt-1">
                    API: https://api.vsegpt.ru/v1
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-text-body">Temperature</Label>
                    <span className="text-sm text-guard-green font-mono">{temperature[0]}</span>
                  </div>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={1}
                    step={0.1}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-text-body">Max tokens</Label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    className="bg-midnight border-border-subtle text-pure-white max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-text-body">System personality</Label>
                  <Textarea
                    value={systemPersonality}
                    onChange={(e) => setSystemPersonality(e.target.value)}
                    rows={4}
                    className="bg-midnight border-border-subtle text-pure-white resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-text-body">Welcome message</Label>
                  <Textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={3}
                    className="bg-midnight border-border-subtle text-pure-white resize-none"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  className="gradient-guard text-white hover:brightness-110"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm text-text-body">VseGPT API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Bearer токен из личного кабинета vsegpt.ru"
                        className="bg-midnight border-border-subtle text-pure-white pr-10"
                      />
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-pure-white"
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      className="border-border-subtle text-text-body hover:text-pure-white"
                      onClick={() => navigator.clipboard?.writeText(apiKey)}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      onClick={testApiKey}
                      disabled={testing || !apiKey.trim()}
                      className="gradient-guard text-white hover:brightness-110 disabled:opacity-50"
                    >
                      {testing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      <span className="ml-1">Проверить</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        keyStatus === 'ok'
                          ? 'bg-guard-green'
                          : keyStatus === 'error'
                            ? 'bg-red-500'
                            : 'bg-text-muted'
                      }`}
                    />
                    <span className="text-sm text-text-body">
                      {keyStatus === 'ok'
                        ? 'Работает'
                        : keyStatus === 'error'
                          ? 'Ошибка соединения или неверный ключ'
                          : 'Не проверено'}
                    </span>
                  </div>
                  {keyStatus === 'error' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                      <AlertCircle size={14} />
                      <span>Проверьте ключ в личном кабинете vsegpt.ru → API-ключи</span>
                    </div>
                  )}
                  <p className="text-xs text-text-muted">
                    Ключ хранится локально в браузере (localStorage). Для продакшена рекомендуется перенести на бэкенд.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="space-y-4 animate-fadeIn">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="bg-charcoal rounded-xl border border-border-subtle p-5 space-y-3"
                >
                  <h3 className="font-display text-[16px] font-medium text-pure-white">
                    {prompt.title}
                  </h3>
                  <Textarea
                    value={prompt.content}
                    onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                    rows={4}
                    className="bg-midnight border-border-subtle text-pure-white resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="gradient-guard text-white hover:brightness-110"
                  >
                    Сохранить
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="animate-fadeIn">
              <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                  <div>
                    <p className="text-sm text-pure-white">Contentful CMS</p>
                    <p className="text-xs text-text-muted">Синхронизация контента</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                  <div>
                    <p className="text-sm text-pure-white">Telegram Bot</p>
                    <p className="text-xs text-text-muted">Уведомления в Telegram</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                  <div>
                    <p className="text-sm text-pure-white">Email уведомления</p>
                    <p className="text-xs text-text-muted">SMTP-рассылка</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-pure-white">Google Analytics</p>
                    <p className="text-xs text-text-muted">Отслеживание трафика</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="animate-fadeIn">
              <div className="bg-charcoal rounded-xl border border-border-subtle p-6">
                <div className="font-mono text-sm space-y-2">
                  <p className="text-text-muted">[2024-05-01 14:23:01] Запрос: подбор камер</p>
                  <p className="text-text-muted">[2024-05-01 14:23:02] Ответ: 2 048 токенов</p>
                  <p className="text-text-muted">[2024-05-01 14:45:12] Запрос: расчёт сметы</p>
                  <p className="text-text-muted">[2024-05-01 14:45:15] Ответ: 3 102 токенов</p>
                  <p className="text-text-muted">[2024-05-01 15:01:00] Запрос: техническая консультация</p>
                  <p className="text-text-muted">[2024-05-01 15:01:03] Ответ: 1 567 токенов</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInToast {
          animation: slideInToast 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AISettings
