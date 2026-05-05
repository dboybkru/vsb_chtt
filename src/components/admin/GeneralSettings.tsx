import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { apiRequest } from '@/lib/api'
import { defaultSiteSettings, type SiteSettings } from '@/lib/siteSettings'

const GeneralSettings: FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [statusText, setStatusText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiRequest<Partial<SiteSettings> & Record<string, unknown>>('/settings')
      .then((data) => setSettings({ ...defaultSiteSettings, ...data }))
      .catch(() => setStatusText('Не удалось загрузить настройки сайта'))
  }, [])

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setStatusText('')
    try {
      await apiRequest('/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      })
      window.dispatchEvent(new Event('vsb39:settings-updated'))
      setStatusText('Настройки сохранены и применены на сайте')
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : 'Не удалось сохранить настройки')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      {statusText && (
        <div className="bg-charcoal rounded-lg border border-border-subtle px-4 py-3 text-sm text-text-body">
          {statusText}
        </div>
      )}

      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">
          Информация о компании
        </h2>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Название сайта</Label>
          <Input
            value={settings.site_name}
            onChange={(e) => update('site_name', e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Телефон</Label>
          <Input
            value={settings.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Email</Label>
          <Input
            value={settings.email}
            onChange={(e) => update('email', e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Адрес</Label>
          <Input
            value={settings.address}
            onChange={(e) => update('address', e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Режим работы</Label>
          <Input
            value={settings.working_hours}
            onChange={(e) => update('working_hours', e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>
      </div>

      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">
          Соцсети и мессенджеры
        </h2>
        <div className="space-y-2">
          <Label className="text-sm text-text-body">Telegram</Label>
          <Input value={settings.telegram} onChange={(e) => update('telegram', e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-text-body">WhatsApp</Label>
          <Input value={settings.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-text-body">VK</Label>
          <Input value={settings.vk} onChange={(e) => update('vk', e.target.value)} className="bg-midnight border-border-subtle text-pure-white" />
        </div>
      </div>

      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">
          Настройки сайта
        </h2>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-body">Режим обслуживания</p>
            <p className="text-xs text-text-muted">Показать заглушку на всех страницах</p>
          </div>
          <Switch checked={settings.maintenance_mode} onCheckedChange={(value) => update('maintenance_mode', value)} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-body">Аналитика</p>
            <p className="text-xs text-text-muted">Сбор статистики посещений</p>
          </div>
          <Switch checked={settings.analytics_enabled} onCheckedChange={(value) => update('analytics_enabled', value)} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-body">Cookie-согласие</p>
            <p className="text-xs text-text-muted">Показывать баннер согласия на cookies</p>
          </div>
          <Switch checked={settings.cookie_consent} onCheckedChange={(value) => update('cookie_consent', value)} />
        </div>
      </div>

      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">Футер</h2>
        <div className="space-y-2">
          <Label className="text-sm text-text-body">Текст копирайта</Label>
          <Textarea
            value={settings.footer_text}
            onChange={(e) => update('footer_text', e.target.value)}
            rows={2}
            className="bg-midnight border-border-subtle text-pure-white resize-none"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="gradient-guard text-white hover:brightness-110">
        {saving ? 'Сохраняем...' : 'Сохранить настройки'}
      </Button>
    </div>
  )
}

export default GeneralSettings
