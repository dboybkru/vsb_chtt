import type { FC } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const GeneralSettings: FC = () => {
  const [siteName, setSiteName] = useState('VSB39')
  const [sitePhone, setSitePhone] = useState('+7 (4012) 39-39-39')
  const [siteEmail, setSiteEmail] = useState('info@vsb39.ru')
  const [siteAddress, setSiteAddress] = useState('г. Калининград')
  const [workingHours, setWorkingHours] = useState('Пн–Пт 9:00–18:00')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [cookieConsent, setCookieConsent] = useState(true)
  const [footerText, setFooterText] = useState(
    '© 2024 VSB39 — Ваша Система Безопасности. Все права защищены.'
  )

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      {/* Company Info */}
      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">
          Информация о компании
        </h2>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Название сайта</Label>
          <Input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Телефон</Label>
          <Input
            value={sitePhone}
            onChange={(e) => setSitePhone(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Email</Label>
          <Input
            value={siteEmail}
            onChange={(e) => setSiteEmail(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Адрес</Label>
          <Input
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Режим работы</Label>
          <Input
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>
      </div>

      {/* Site Settings */}
      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">
          Настройки сайта
        </h2>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-body">Режим обслуживания</p>
            <p className="text-xs text-text-muted">Показать заглушку на всех страницах</p>
          </div>
          <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-body">Аналитика</p>
            <p className="text-xs text-text-muted">Сбор статистики посещений</p>
          </div>
          <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-body">Cookie-согласие</p>
            <p className="text-xs text-text-muted">Показывать баннер согласия на cookies</p>
          </div>
          <Switch checked={cookieConsent} onCheckedChange={setCookieConsent} />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">Футер</h2>
        <div className="space-y-2">
          <Label className="text-sm text-text-body">Текст копирайта</Label>
          <Textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={2}
            className="bg-midnight border-border-subtle text-pure-white resize-none"
          />
        </div>
      </div>

      <Button className="gradient-guard text-white hover:brightness-110">
        Сохранить настройки
      </Button>
    </div>
  )
}

export default GeneralSettings
