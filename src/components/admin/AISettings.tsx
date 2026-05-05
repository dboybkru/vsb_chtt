import type { FC } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Bot, Check, Copy, Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiRequest } from '@/lib/api'

type AITab = 'models' | 'api' | 'prompts' | 'logs'
type TaskId = 'assistant' | 'equipment' | 'estimate' | 'support' | 'parsing' | 'photo_search'

interface AIModelInfo {
  id: string
  name?: string
  role?: string
  input_price?: number | null
  output_price?: number | null
  available?: boolean
}

interface AISettingsPayload {
  base_url: string
  model: string
  has_api_key?: boolean
  masked_api_key?: string | boolean
  assistant_prompt: string
  task_models?: Record<string, string>
  task_prompts?: Record<string, string>
  recommended_models?: AIModelInfo[]
  temperature?: number
  max_tokens?: number
}

const tabs: { id: AITab; label: string }[] = [
  { id: 'models', label: 'Модели' },
  { id: 'api', label: 'API-ключи' },
  { id: 'prompts', label: 'Промпты' },
  { id: 'logs', label: 'Логи' },
]

const tasks: { id: TaskId; title: string; note: string }[] = [
  { id: 'assistant', title: 'Общий ИИ-агент', note: 'диалог с клиентом и админом' },
  { id: 'equipment', title: 'Подбор оборудования', note: 'камера, регистратор, СКУД, ОПС, совместимость' },
  { id: 'estimate', title: 'Сметы и действия', note: 'создание, проверка и правка смет' },
  { id: 'support', title: 'Техподдержка', note: 'монтаж, эксплуатация, диагностика' },
  { id: 'parsing', title: 'Парсинг прайсов', note: 'дешево, строго, JSON без фантазий' },
  { id: 'photo_search', title: 'Поиск фото', note: 'проверка совпадения товара и картинки' },
]

const defaultModels: AIModelInfo[] = [
  { id: 'openai/gpt-5.4-mini', name: 'GPT-5.4 Mini', role: 'Основная модель: сметы, подбор, техподдержка, агент', input_price: 0.20, output_price: 1.20 },
  { id: 'openai/gpt-5.4-nano', name: 'GPT-5.4 Nano', role: 'Дешевая модель: парсинг прайсов, фото-проверка', input_price: 0.06, output_price: 0.35 },
  { id: 'openai/gpt-5.4-mini-thinking', name: 'GPT-5.4 Mini Thinking', role: 'Сложные сметы и рассуждения', input_price: 0.20, output_price: 1.20 },
  { id: 'openai/gpt-5.4', name: 'GPT-5.4', role: 'Сложные инженерные вопросы', input_price: 0.70, output_price: 4.20 },
  { id: 'openai/gpt-5.4-1m', name: 'GPT-5.4 1M', role: 'Очень длинные прайсы и документы', input_price: 1.40, output_price: 6.30 },
  { id: 'openai/gpt-5.3-chat', name: 'GPT-5.3 Chat', role: 'Fallback для чата и консультаций', input_price: 0.48, output_price: 3.80 },
  { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', role: 'Недорогой стабильный fallback', input_price: 0.06, output_price: 0.24 },
  { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano', role: 'Очень дешевые короткие задачи', input_price: 0.015, output_price: 0.06 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o mini', role: 'Дешевый совместимый fallback', input_price: 0.02, output_price: 0.08 },
  { id: 'openai/gpt-oss-120b-fast', name: 'GPT-OSS 120B fast', role: 'Очень дешевый open-weight fallback', input_price: 0.021, output_price: 0.085 },
]

const defaultTaskModels: Record<TaskId, string> = {
  assistant: 'openai/gpt-5.4-mini',
  equipment: 'openai/gpt-5.4-mini',
  estimate: 'openai/gpt-5.4-mini',
  support: 'openai/gpt-5.4-mini',
  parsing: 'openai/gpt-5.4-nano',
  photo_search: 'openai/gpt-5.4-nano',
}

const defaultTaskPrompts: Record<TaskId, string> = {
  assistant:
    'Ты ИИ-агент VSB39 для клиентов и администратора. Отвечай по-русски, спокойно и практично. Сначала уточняй цель объекта, затем связывай оборудование, монтаж, пусконаладку и обслуживание. Не придумывай цены и наличие; если есть база/смета, опирайся на нее.',
  equipment:
    'Ты инженер по подбору оборудования систем безопасности VSB39. Отличай IP/AHD камеры, NVR/DVR, PoE-коммутаторы, СКУД, ОПС, питание, кабель и расходники. Подбирай совместимые позиции из базы: учитывай разрешение, объектив, ИК-подсветку, улица/помещение, PoE, канальность регистратора, запас портов и питание. Если данных мало, задай один точный вопрос.',
  estimate:
    'Ты сметчик VSB39. Делай сметы структурно: оборудование, монтажные работы, пусконаладка, кабельные линии, материалы, доставка, проектирование и прочее. Количества сохраняй точно, цены бери только из базы или запроса пользователя, не дублируй позиции, проверяй связку оборудование-работы.',
  support:
    'Ты техническая поддержка VSB39 по монтажу и эксплуатации систем безопасности. Разбираешься в видеонаблюдении, СКУД, ОПС, СКС, питании, PoE, настройке регистраторов, удаленном доступе, адресации, кабельных трассах и типовых ошибках монтажа. Давай безопасные пошаговые рекомендации.',
  parsing:
    'Ты парсер прайсов поставщиков систем безопасности. Извлекай только реальные товарные строки. Возвращай JSON-массив с полями name, characteristics, unit, price, source, sku, brand, category, image_url. price всегда число. Не выдумывай позиции, пропускай строки без цены, не путай заголовки разделов с товарами.',
  photo_search:
    'Ты проверяешь результаты поиска фото товара. Выбирай изображение только при явном совпадении бренда, артикула или уникального названия. Верни JSON image_url и confidence 0..1. Если совпадение слабое, confidence ниже 0.8.',
}

function priceLabel(model: AIModelInfo) {
  if (model.input_price == null && model.output_price == null) return 'цены от провайдера'
  return `${model.input_price ?? '?'} / ${model.output_price ?? '?'} ₽ за 1000 токенов`
}

const AISettings: FC = () => {
  const [activeTab, setActiveTab] = useState<AITab>('models')
  const [models, setModels] = useState<AIModelInfo[]>(defaultModels)
  const [taskModels, setTaskModels] = useState<Record<TaskId, string>>(defaultTaskModels)
  const [taskPrompts, setTaskPrompts] = useState<Record<TaskId, string>>(defaultTaskPrompts)
  const [baseUrl, setBaseUrl] = useState('https://api.vsegpt.ru/v1')
  const [temperature, setTemperature] = useState([0.4])
  const [maxTokens, setMaxTokens] = useState('4096')
  const [apiKey, setApiKey] = useState('')
  const [maskedKey, setMaskedKey] = useState<string | boolean>('')
  const [showKey, setShowKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState<'ok' | 'error' | 'unknown'>('unknown')
  const [saveToast, setSaveToast] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [authEmail, setAuthEmail] = useState('dboy@bk.ru')
  const [authPassword, setAuthPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('vsb39_admin_token') || '')
  const [loadingModels, setLoadingModels] = useState(false)

  const modelOptions = useMemo(() => {
    const byId = new Map<string, AIModelInfo>()
    ;[...models, ...defaultModels].forEach((item) => {
      if (item.id) byId.set(item.id, { ...byId.get(item.id), ...item })
    })
    return Array.from(byId.values()).slice(0, 80)
  }, [models])

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined

  const applySettings = (settings: AISettingsPayload) => {
    setBaseUrl(settings.base_url || 'https://api.vsegpt.ru/v1')
    setTaskModels({ ...defaultTaskModels, ...(settings.task_models || {}), assistant: settings.model || settings.task_models?.assistant || defaultTaskModels.assistant })
    setTaskPrompts({ ...defaultTaskPrompts, ...(settings.task_prompts || {}), assistant: settings.assistant_prompt || settings.task_prompts?.assistant || defaultTaskPrompts.assistant })
    setTemperature([settings.temperature ?? 0.4])
    setMaxTokens(String(settings.max_tokens ?? 4096))
    setMaskedKey(settings.masked_api_key || '')
    setKeyStatus(settings.has_api_key ? 'ok' : 'unknown')
    if (settings.recommended_models?.length) setModels(settings.recommended_models)
  }

  const loadSettings = async (activeToken = token) => {
    if (!activeToken) return
    try {
      const settings = await apiRequest<AISettingsPayload>('/settings/ai', {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      applySettings(settings)
      setStatusText(settings.has_api_key ? 'Настройки загружены' : 'Настройки загружены, API-ключ не сохранён')
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : 'Не удалось загрузить настройки')
      setKeyStatus('error')
    }
  }

  useEffect(() => {
    void loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async () => {
    try {
      const response = await apiRequest<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      })
      localStorage.setItem('vsb39_admin_token', response.access_token)
      setToken(response.access_token)
      setAuthPassword('')
      setStatusText('Админ-доступ получен')
      await loadSettings(response.access_token)
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : 'Не удалось войти')
    }
  }

  const handleLoadModels = async () => {
    if (!token) {
      setStatusText('Сначала войдите в backend сметы')
      return
    }
    setLoadingModels(true)
    try {
      const response = await apiRequest<{ models: AIModelInfo[]; recommended_models?: AIModelInfo[] }>('/settings/ai/models', {
        headers: authHeaders,
      })
      const preferred = response.recommended_models?.filter((item) => item.available) || []
      const fallback = response.recommended_models || []
      setModels(preferred.length >= 6 ? preferred.slice(0, 10) : [...preferred, ...fallback].slice(0, 10))
      setStatusText(`VseGPT Models обработан. Загружено от API: ${response.models.length}. Показаны 10 лучших по цене/качеству.`)
    } catch (error) {
      setModels(defaultModels)
      setStatusText(error instanceof Error ? `${error.message}. Показал рекомендуемый список.` : 'Показал рекомендуемый список.')
    } finally {
      setLoadingModels(false)
    }
  }

  const handleSave = async () => {
    if (!token) {
      setStatusText('Сначала войдите в backend сметы')
      return
    }
    try {
      const settings = await apiRequest<AISettingsPayload>('/settings/ai', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          base_url: baseUrl,
          api_key: apiKey,
          model: taskModels.assistant,
          assistant_prompt: taskPrompts.assistant,
          task_models: taskModels,
          task_prompts: taskPrompts,
          temperature: temperature[0],
          max_tokens: Number(maxTokens) || 4096,
        }),
      })
      setApiKey('')
      applySettings(settings)
      setStatusText('AI-настройки сохранены')
      setSaveToast(true)
      setTimeout(() => setSaveToast(false), 2000)
    } catch (error) {
      setKeyStatus('error')
      setStatusText(error instanceof Error ? error.message : 'Не удалось сохранить')
    }
  }

  const handleCheck = async () => {
    try {
      const response = await apiRequest<{ text?: string; error?: string }>('/ai-chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Ответь одним словом: работает?' }],
          model: taskModels.assistant,
          max_tokens: 32,
        }),
      })
      const ok = Boolean(response.text && !response.error)
      setKeyStatus(ok ? 'ok' : 'error')
      setStatusText(ok ? 'AI отвечает' : response.error || 'AI не ответил')
    } catch (error) {
      setKeyStatus('error')
      setStatusText(error instanceof Error ? error.message : 'Проверка не прошла')
    }
  }

  const setTaskModel = (id: TaskId, value: string) => setTaskModels((prev) => ({ ...prev, [id]: value }))
  const setTaskPrompt = (id: TaskId, value: string) => setTaskPrompts((prev) => ({ ...prev, [id]: value }))

  return (
    <div className="p-8">
      {saveToast && (
        <div className="fixed top-4 right-4 z-[1000] bg-guard-green text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideInToast">
          <Check size={16} />
          <span className="text-sm font-medium">Сохранено</span>
        </div>
      )}

      <div className="flex gap-6">
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

        <div className="flex-1 min-w-0">
          {!token && (
            <div className="mb-6 bg-charcoal rounded-xl border border-border-subtle p-5">
              <h3 className="font-display text-[16px] font-medium text-pure-white mb-3">Вход в backend сметы</h3>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                <Input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="bg-midnight border-border-subtle text-pure-white" placeholder="Email" />
                <Input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="bg-midnight border-border-subtle text-pure-white" placeholder="Пароль" />
                <Button onClick={handleLogin} className="gradient-guard text-white hover:brightness-110">Войти</Button>
              </div>
            </div>
          )}

          {statusText && <div className="mb-6 text-sm text-text-body bg-charcoal rounded-lg border border-border-subtle px-4 py-3">{statusText}</div>}

          {activeTab === 'models' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
                  <div className="space-y-2 max-w-xl">
                    <Label className="text-sm text-text-body">Base URL</Label>
                    <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
                  </div>
                  <Button onClick={handleLoadModels} disabled={loadingModels} className="gradient-guard text-white hover:brightness-110">
                    <RefreshCw size={16} className={loadingModels ? 'animate-spin' : ''} />
                    Подобрать лучшие из VseGPT
                  </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {models.slice(0, 10).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTaskModels((prev) => ({ ...prev, assistant: item.id }))}
                      className="text-left rounded-xl border border-border-subtle bg-midnight p-4 hover:border-guard-green transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-guard-green mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-pure-white">{item.name || item.id}</p>
                          <p className="text-xs text-text-muted mt-1">{item.role || item.id}</p>
                          <p className="text-xs text-guard-green mt-2">{priceLabel(item)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-border-subtle bg-midnight p-4 space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-pure-white">{task.title}</p>
                        <p className="text-xs text-text-muted">{task.note}</p>
                      </div>
                      <Select value={taskModels[task.id]} onValueChange={(value) => setTaskModel(task.id, value)}>
                        <SelectTrigger className="bg-charcoal border-border-subtle text-pure-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-charcoal border-border-subtle max-h-[360px]">
                          {modelOptions.map((option) => (
                            <SelectItem key={`${task.id}-${option.id}`} value={option.id}>{option.name || option.id}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-text-body">Temperature</Label>
                      <span className="text-sm text-guard-green font-mono">{temperature[0]}</span>
                    </div>
                    <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-text-body">Max tokens</Label>
                    <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
                  </div>
                </div>

                <Button onClick={handleSave} className="gradient-guard text-white hover:brightness-110">Сохранить модели</Button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <Label className="text-sm text-text-body">VseGPT / OpenAI-compatible API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1 max-w-md">
                    <Input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={maskedKey ? String(maskedKey) : 'Вставьте новый ключ'} className="bg-midnight border-border-subtle text-pure-white pr-10" />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-pure-white">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Button variant="outline" className="border-border-subtle text-text-body hover:text-pure-white" onClick={() => navigator.clipboard?.writeText(apiKey)} disabled={!apiKey}><Copy size={14} /></Button>
                  <Button onClick={handleCheck} className="gradient-guard text-white hover:brightness-110">Проверить</Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${keyStatus === 'ok' ? 'bg-guard-green' : keyStatus === 'error' ? 'bg-red-500' : 'bg-text-muted'}`} />
                  <span className="text-sm text-text-body">{keyStatus === 'ok' ? 'Работает' : keyStatus === 'error' ? 'Ошибка' : 'Не проверено'}</span>
                </div>
              </div>
              <Button onClick={handleSave} className="gradient-guard text-white hover:brightness-110">Сохранить ключ</Button>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="space-y-4 animate-fadeIn">
              {tasks.map((task) => (
                <div key={task.id} className="bg-charcoal rounded-xl border border-border-subtle p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-guard-green" />
                    <h3 className="font-display text-[16px] font-medium text-pure-white">{task.title}</h3>
                  </div>
                  <Textarea value={taskPrompts[task.id]} onChange={(e) => setTaskPrompt(task.id, e.target.value)} rows={6} className="bg-midnight border-border-subtle text-pure-white resize-y" />
                  <Button size="sm" onClick={handleSave} className="gradient-guard text-white hover:brightness-110">Сохранить</Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-charcoal rounded-xl border border-border-subtle p-6 animate-fadeIn">
              <div className="font-mono text-sm space-y-2">
                <p className="text-text-muted">Логи AI-команд пишутся backend в server_backend/logs/assistant_audit.jsonl</p>
                <p className="text-text-muted">Используемые модели теперь сохраняются отдельно по задачам: parsing, estimate, equipment, support, photo_search.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes slideInToast { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideInToast { animation: slideInToast 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default AISettings
