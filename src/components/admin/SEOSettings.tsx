import type { FC } from 'react'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

function CharCounter({ value, limit }: { value: string; limit: number }) {
  const count = value.length
  const over = count > limit
  return (
    <span className={`text-xs transition-colors duration-200 ${over ? 'text-red-400' : 'text-guard-green'}`}>
      {count} / {limit}
    </span>
  )
}

const SEOSettings: FC = () => {
  const [homeTitle, setHomeTitle] = useState('VSB39 — Системы безопасности в Калининграде')
  const [homeDesc, setHomeDesc] = useState(
    'Профессиональные системы видеонаблюдения, СКУД, ОПС и СКС в Калининграде. Проектирование, монтаж, обслуживание. Компания VSB39.'
  )
  const [catalogTemplate, setCatalogTemplate] = useState('{category} — купить в Калининграде | VSB39')
  const [productTemplate, setProductTemplate] = useState('{name} {brand} — купить в Калининграде | VSB39')
  const [orgName, setOrgName] = useState('ООО "ВСБ39"')
  const [orgAddress, setOrgAddress] = useState('г. Калининград')
  const [orgPhone, setOrgPhone] = useState('+7 (4012) 39-39-39')
  const [orgEmail, setOrgEmail] = useState('info@vsb39.ru')
  const [autoSitemap, setAutoSitemap] = useState(true)
  const [lastUpdate] = useState('2024-05-01 12:00:00')

  const jsonLd = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      address: { '@type': 'PostalAddress', streetAddress: orgAddress },
      telephone: orgPhone,
      email: orgEmail,
      url: 'https://vsb39.ru',
    },
    null,
    2
  )

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      {/* Meta Tags */}
      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">Meta Tags</h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-text-body">Home title</Label>
            <CharCounter value={homeTitle} limit={60} />
          </div>
          <Input
            value={homeTitle}
            onChange={(e) => setHomeTitle(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-text-body">Home description</Label>
            <CharCounter value={homeDesc} limit={160} />
          </div>
          <Textarea
            value={homeDesc}
            onChange={(e) => setHomeDesc(e.target.value)}
            rows={3}
            className="bg-midnight border-border-subtle text-pure-white resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-text-body">Catalog title template</Label>
            <CharCounter value={catalogTemplate} limit={60} />
          </div>
          <Input
            value={catalogTemplate}
            onChange={(e) => setCatalogTemplate(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-text-body">Product title template</Label>
            <CharCounter value={productTemplate} limit={60} />
          </div>
          <Input
            value={productTemplate}
            onChange={(e) => setProductTemplate(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>
      </div>

      {/* JSON-LD */}
      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">JSON-LD Settings</h2>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Organization name</Label>
          <Input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Address</Label>
          <Input
            value={orgAddress}
            onChange={(e) => setOrgAddress(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Phone</Label>
          <Input
            value={orgPhone}
            onChange={(e) => setOrgPhone(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Email</Label>
          <Input
            value={orgEmail}
            onChange={(e) => setOrgEmail(e.target.value)}
            className="bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        {/* JSON Preview */}
        <div className="space-y-2">
          <Label className="text-sm text-text-body">Generated JSON-LD</Label>
          <div className="bg-midnight rounded-lg p-4 border border-border-subtle overflow-x-auto">
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {jsonLd.split('\n').map((line, i) => (
                <div key={i}>
                  {line.split(/".*?":/).map((part, j) => {
                    if (j === 0) return <span key={j} className="text-aurora-teal">{part}</span>
                    return <span key={j} className="text-guard-green">{part}</span>
                  })}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      {/* Sitemap */}
      <div className="bg-charcoal rounded-xl border border-border-subtle p-6 space-y-5">
        <h2 className="font-display text-[20px] font-semibold text-pure-white">Sitemap</h2>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-body">Автогенерация sitemap</p>
            <p className="text-xs text-text-muted">Генерировать sitemap.xml автоматически</p>
          </div>
          <Switch checked={autoSitemap} onCheckedChange={setAutoSitemap} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-text-body">Последнее обновление</Label>
          <Input
            value={lastUpdate}
            readOnly
            className="bg-midnight border-border-subtle text-text-muted"
          />
        </div>

        <Button
          variant="outline"
          className="border-guard-green text-guard-green hover:bg-guard-green/10"
          onClick={() => alert('sitemap.xml')}
        >
          Просмотреть sitemap
        </Button>
      </div>
    </div>
  )
}

export default SEOSettings
