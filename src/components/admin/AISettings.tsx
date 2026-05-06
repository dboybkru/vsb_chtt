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
  model_id?: string
  provider?: string
  provider_label?: string
  name?: string
  role?: string
  input_price?: number | null
  output_price?: number | null
  available?: boolean
  best_value?: boolean
}

interface AISettingsPayload {
  base_url: string
  model: string
  providers?: Record<string, { label?: string; base_url?: string; has_api_key?: boolean; masked_api_key?: string | boolean }>
  has_api_key?: boolean
  masked_api_key?: string | boolean
  assistant_prompt: string
  task_models?: Record<string, string>
  task_backup_models?: Record<string, string>
  task_prompts?: Record<string, string>
  recommended_models?: AIModelInfo[]
  model_tests?: Record<string, ModelTestResult>
  temperature?: number
  max_tokens?: number
}

interface ModelTestResult {
  ok: boolean
  provider?: string
  model?: string
  reply?: string
  error?: string
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
  { id: 'aitunnel:openai/gpt-5.4-mini', provider: 'aitunnel', provider_label: 'AITunnel', name: 'AITunnel · GPT-5.4 Mini', role: 'Лучшее цена/качество: сметы, подбор, техподдержка, агент', input_price: 0.144, output_price: 0.864, best_value: true },
  { id: 'aitunnel:openai/gpt-5.4-nano', provider: 'aitunnel', provider_label: 'AITunnel', name: 'AITunnel · GPT-5.4 Nano', role: 'Лучшее цена/качество: парсинг прайсов, фото-проверка', input_price: 0.0384, output_price: 0.24, best_value: true },
  { id: 'aitunnel:openai/gpt-5.4', provider: 'aitunnel', provider_label: 'AITunnel', name: 'AITunnel · GPT-5.4', role: 'Сложные инженерные вопросы', input_price: 0.48, output_price: 2.88, best_value: true },
  { id: 'aitunnel:openai/gpt-5.5', provider: 'aitunnel', provider_label: 'AITunnel', name: 'AITunnel · GPT-5.5', role: 'Самая умная модель для сложного выбора', input_price: 0.96, output_price: 5.76 },
  { id: 'vsegpt:openai/gpt-4o-mini', provider: 'vsegpt', provider_label: 'VseGPT', name: 'VseGPT · GPT-4o mini', role: 'Дешевый fallback для простых задач', input_price: 0.02, output_price: 0.08, best_value: true },
  { id: 'vsegpt:openai/gpt-4.1-nano', provider: 'vsegpt', provider_label: 'VseGPT', name: 'VseGPT · GPT-4.1 Nano', role: 'Очень дешевые короткие задачи', input_price: 0.015, output_price: 0.06, best_value: true },
  { id: 'vsegpt:openai/gpt-4.1-mini', provider: 'vsegpt', provider_label: 'VseGPT', name: 'VseGPT · GPT-4.1 Mini', role: 'Недорогой стабильный fallback', input_price: 0.06, output_price: 0.24 },
  { id: 'vsegpt:openai/gpt-5.4-mini', provider: 'vsegpt', provider_label: 'VseGPT', name: 'VseGPT · GPT-5.4 Mini', role: 'Альтернатива AITunnel для основного агента', input_price: 0.20, output_price: 1.20 },
  { id: 'vsegpt:openai/gpt-5.4-nano', provider: 'vsegpt', provider_label: 'VseGPT', name: 'VseGPT · GPT-5.4 Nano', role: 'Альтернатива AITunnel для дешевого парсинга', input_price: 0.06, output_price: 0.35 },
  { id: 'aitunnel:openai/gpt-5.5-pro', provider: 'aitunnel', provider_label: 'AITunnel', name: 'AITunnel · GPT-5.5 Pro', role: 'Дорогая экспертная модель для редких задач', input_price: 5.76, output_price: 34.56 },
]

const defaultTaskModels: Record<TaskId, string> = {
  assistant: 'aitunnel:openai/gpt-5.4-mini',
  equipment: 'aitunnel:openai/gpt-5.4-mini',
  estimate: 'aitunnel:openai/gpt-5.4-mini',
  support: 'aitunnel:openai/gpt-5.4-mini',
  parsing: 'aitunnel:openai/gpt-5.4-nano',
  photo_search: 'aitunnel:openai/gpt-5.4-nano',
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

const defaultTaskBackupModels: Record<TaskId, string> = {
  assistant: 'vsegpt:openai/gpt-4.1-mini',
  equipment: 'vsegpt:openai/gpt-4.1-mini',
  estimate: 'vsegpt:openai/gpt-4.1-mini',
  support: 'vsegpt:openai/gpt-4.1-mini',
  parsing: 'vsegpt:openai/gpt-4.1-nano',
  photo_search: 'vsegpt:openai/gpt-4.1-nano',
}

function providerLabel(model?: AIModelInfo) {
  return model?.provider_label || (model?.provider === 'aitunnel' ? 'AITunnel' : model?.provider === 'vsegpt' ? 'VseGPT' : 'Провайдер')
}

const AISettings: FC = () => {
  const [activeTab, setActiveTab] = useState<AITab>('models')
  const [models, setModels] = useState<AIModelInfo[]>(defaultModels)
  const [taskModels, setTaskModels] = useState<Record<TaskId, string>>(defaultTaskModels)
  const [taskBackupModels, setTaskBackupModels] = useState<Record<TaskId, string>>(defaultTaskBackupModels)
  const [taskPrompts, setTaskPrompts] = useState<Record<TaskId, string>>(defaultTaskPrompts)
  const [baseUrl, setBaseUrl] = useState('https://api.vsegpt.ru/v1')
  const [providerBaseUrls, setProviderBaseUrls] = useState<Record<string, string>>({
    vsegpt: 'https://api.vsegpt.ru/v1',
    aitunnel: 'https://api.aitunnel.ru/v1',
  })
  const [temperature, setTemperature] = useState([0.4])
  const [maxTokens, setMaxTokens] = useState('4096')
  const [apiKey, setApiKey] = useState('')
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({ vsegpt: '', aitunnel: '' })
  const [providers, setProviders] = useState<AISettingsPayload['providers']>({})
  const [showKey, setShowKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState<'ok' | 'error' | 'unknown'>('unknown')
  const [saveToast, setSaveToast] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [authEmail, setAuthEmail] = useState('dboy@bk.ru')
  const [authPassword, setAuthPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('vsb39_admin_token') || '')
  const [loadingModels, setLoadingModels] = useState(false)
  const [testingModels, setTestingModels] = useState(false)
  const [modelTests, setModelTests] = useState<Record<string, ModelTestResult>>({})

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
    setProviderBaseUrls({
      vsegpt: settings.providers?.vsegpt?.base_url || settings.base_url || 'https://api.vsegpt.ru/v1',
      aitunnel: settings.providers?.aitunnel?.base_url || 'https://api.aitunnel.ru/v1',
    })
    setTaskModels({ ...defaultTaskModels, ...(settings.task_models || {}), assistant: settings.model || settings.task_models?.assistant || defaultTaskModels.assistant })
    setTaskBackupModels({ ...defaultTaskBackupModels, ...(settings.task_backup_models || {}) })
    setTaskPrompts({ ...defaultTaskPrompts, ...(settings.task_prompts || {}), assistant: settings.assistant_prompt || settings.task_prompts?.assistant || defaultTaskPrompts.assistant })
    setTemperature([settings.temperature ?? 0.4])
    setMaxTokens(String(settings.max_tokens ?? 4096))
    setProviders(settings.providers || {})
    setKeyStatus(settings.has_api_key ? 'ok' : 'unknown')
    if (settings.recommended_models?.length) setModels(settings.recommended_models)
    if (settings.model_tests) setModelTests(settings.model_tests)
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
      setModels(preferred.length >= 6 ? preferred.slice(0, 14) : [...preferred, ...fallback].slice(0, 14))
      setStatusText(`VseGPT и AITunnel обработаны. Загружено от API: ${response.models.length}. Показаны лучшие варианты по задачам и цене/качеству.`)
      await handleTestModels()
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
          provider_keys: providerKeys,
          provider_base_urls: providerBaseUrls,
          model: taskModels.assistant,
          assistant_prompt: taskPrompts.assistant,
          task_models: taskModels,
          task_backup_models: taskBackupModels,
          task_prompts: taskPrompts,
          temperature: temperature[0],
          max_tokens: Number(maxTokens) || 4096,
        }),
      })
      setApiKey('')
      setProviderKeys({ vsegpt: '', aitunnel: '' })
      applySettings(settings)
      const failed = Object.values(settings.model_tests || {}).filter((item) => !item.ok).length
      setStatusText(failed ? `AI-настройки сохранены. Проверка моделей: есть ошибки (${failed}).` : 'AI-настройки сохранены. Все выбранные модели ответили.')
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

  const selectedModelsForTest = () => {
    const modelsToTest: Record<string, string> = {}
    tasks.forEach((task) => {
      modelsToTest[`${task.title} · основная`] = taskModels[task.id]
      modelsToTest[`${task.title} · резервная`] = taskBackupModels[task.id]
    })
    return modelsToTest
  }

  const handleTestModels = async () => {
    if (!token) {
      setStatusText('Сначала войдите в backend сметы')
      return
    }
    setTestingModels(true)
    try {
      const response = await apiRequest<{ results: Record<string, ModelTestResult> }>('/settings/ai/test-models', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ models: selectedModelsForTest() }),
      })
      setModelTests(response.results || {})
      const failed = Object.values(response.results || {}).filter((item) => !item.ok).length
      setStatusText(failed ? `Проверка моделей завершена: ошибок ${failed}` : 'Проверка моделей завершена: все выбранные модели отвечают')
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : 'Не удалось проверить модели')
    } finally {
      setTestingModels(false)
    }
  }

  const setTaskModel = (id: TaskId, value: string) => setTaskModels((prev) => ({ ...prev, [id]: value }))
  const setTaskBackupModel = (id: TaskId, value: string) => setTaskBackupModels((prev) => ({ ...prev, [id]: value }))
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl flex-1">
                    {(['aitunnel', 'vsegpt'] as const).map((provider) => (
                      <div key={`${provider}-base-url`} className="space-y-2">
                        <Label className="text-sm text-text-body">{provider === 'aitunnel' ? 'AITunnel' : 'VseGPT'} Base URL</Label>
                        <Input
                          value={providerBaseUrls[provider] || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            setProviderBaseUrls((prev) => ({ ...prev, [provider]: value }))
                            if (provider === 'vsegpt') setBaseUrl(value)
                          }}
                          className="bg-midnight border-border-subtle text-pure-white"
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleLoadModels} disabled={loadingModels || testingModels} className="gradient-guard text-white hover:brightness-110">
                    <RefreshCw size={16} className={loadingModels ? 'animate-spin' : ''} />
                    Подобрать из VseGPT + AITunnel
                  </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {models.slice(0, 14).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTaskModels((prev) => ({ ...prev, assistant: item.id }))}
                      className="text-left rounded-xl border border-border-subtle bg-midnight p-4 hover:border-guard-green transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-guard-green mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-pure-white">{item.name || item.id}</p>
                            <span className="rounded-full bg-pure-white/10 px-2 py-0.5 text-[10px] text-text-body">{providerLabel(item)}</span>
                            {item.best_value && <span className="rounded-full bg-guard-green/15 px-2 py-0.5 text-[10px] text-guard-green">лучше цена/качество</span>}
                          </div>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {['aitunnel', 'vsegpt'].map((provider) => {
                          const option = modelOptions.find((model) => model.provider === provider && (
                            task.id === 'parsing' || task.id === 'photo_search'
                              ? /nano|4\.1-nano|4o-mini/i.test(model.id)
                              : /5\.4-mini|4\.1-mini|4o-mini/i.test(model.id)
                          ))
                          return (
                            <button
                              key={`${task.id}-${provider}-suggest`}
                              type="button"
                              onClick={() => option && setTaskModel(task.id, option.id)}
                              disabled={!option}
                              className="rounded-lg border border-border-subtle bg-charcoal px-3 py-2 text-left text-text-body hover:border-guard-green disabled:opacity-50"
                            >
                              <span className="block text-pure-white">{provider === 'aitunnel' ? 'AITunnel' : 'VseGPT'}</span>
                              <span className="block truncate">{option?.name || 'нет варианта'}</span>
                              {option?.best_value && <span className="mt-1 block text-guard-green">лучше цена/качество</span>}
                            </button>
                          )
                        })}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-text-muted">Основная модель</Label>
                          <Select value={taskModels[task.id]} onValueChange={(value) => setTaskModel(task.id, value)}>
                            <SelectTrigger className="bg-charcoal border-border-subtle text-pure-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-charcoal border-border-subtle max-h-[360px]">
                              {modelOptions.map((option) => (
                                <SelectItem key={`${task.id}-primary-${option.id}`} value={option.id}>{option.name || option.id}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-text-muted">Резервная модель</Label>
                          <Select value={taskBackupModels[task.id]} onValueChange={(value) => setTaskBackupModel(task.id, value)}>
                            <SelectTrigger className="bg-charcoal border-border-subtle text-pure-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-charcoal border-border-subtle max-h-[360px]">
                              {modelOptions.map((option) => (
                                <SelectItem key={`${task.id}-backup-${option.id}`} value={option.id}>{option.name || option.id}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <Button onClick={handleTestModels} disabled={testingModels} variant="outline" className="border-border-subtle text-text-body hover:text-pure-white">
                    <RefreshCw size={16} className={testingModels ? 'animate-spin' : ''} />
                    Проверить выбранные модели
                  </Button>
                  {Object.keys(modelTests).length > 0 && (
                    <div className="text-xs text-text-muted">
                      Проверено: {Object.values(modelTests).filter((item) => item.ok).length} ок / {Object.values(modelTests).filter((item) => !item.ok).length} ошибок
                    </div>
                  )}
                </div>
                {Object.keys(modelTests).length > 0 && (
                  <div className="rounded-xl border border-border-subtle bg-midnight p-4 space-y-2">
                    {Object.entries(modelTests).slice(0, 12).map(([name, result]) => (
                      <div key={name} className="flex items-start justify-between gap-3 text-xs border-b border-border-subtle/60 last:border-b-0 pb-2 last:pb-0">
                        <div className="min-w-0">
                          <p className="text-pure-white truncate">{name}</p>
                          <p className="text-text-muted truncate">{result.provider}:{result.model}</p>
                        </div>
                        <span className={result.ok ? 'text-guard-green' : 'text-red-400'}>
                          {result.ok ? 'работает' : result.error || 'ошибка'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5 animate-fadeIn">
              {(['aitunnel', 'vsegpt'] as const).map((provider) => (
                <div key={provider} className="space-y-2 rounded-xl border border-border-subtle bg-midnight p-4">
                  <Label className="text-sm text-text-body">{provider === 'aitunnel' ? 'AITunnel' : 'VseGPT'} API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        value={providerKeys[provider] || ''}
                        onChange={(e) => setProviderKeys((prev) => ({ ...prev, [provider]: e.target.value }))}
                        placeholder={providers?.[provider]?.masked_api_key ? String(providers[provider]?.masked_api_key) : 'Вставьте новый ключ'}
                        className="bg-charcoal border-border-subtle text-pure-white pr-10"
                      />
                      <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-pure-white">
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button variant="outline" className="border-border-subtle text-text-body hover:text-pure-white" onClick={() => navigator.clipboard?.writeText(providerKeys[provider] || '')} disabled={!providerKeys[provider]}><Copy size={14} /></Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${providers?.[provider]?.has_api_key ? 'bg-guard-green' : 'bg-text-muted'}`} />
                    <span className="text-sm text-text-body">{providers?.[provider]?.has_api_key ? 'Ключ сохранён' : 'Ключ не сохранён'}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Button onClick={handleCheck} className="gradient-guard text-white hover:brightness-110">Проверить выбранную модель</Button>
                <div className="flex items-center gap-2">
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
