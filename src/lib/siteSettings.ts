import { useEffect, useState } from 'react'
import { apiRequest } from './api'

export interface SiteSettings {
  site_name: string
  phone: string
  email: string
  address: string
  working_hours: string
  telegram: string
  whatsapp: string
  vk: string
  footer_text: string
  maintenance_mode: boolean
  analytics_enabled: boolean
  cookie_consent: boolean
}

export const defaultSiteSettings: SiteSettings = {
  site_name: 'VSB39',
  phone: '+7 (4012) 39-39-39',
  email: 'info@vsb39.ru',
  address: 'г. Калининград, ул. Примерная, 123',
  working_hours: 'Пн-Пт 9:00-18:00',
  telegram: 'https://t.me/vsb39',
  whatsapp: 'https://wa.me/74012393939',
  vk: 'https://vk.com/vsb39',
  footer_text: '© 2025 VSB39. Все права защищены.',
  maintenance_mode: false,
  analytics_enabled: true,
  cookie_consent: true,
}

function normalizeSettings(data: Partial<SiteSettings> & Record<string, unknown>): SiteSettings {
  return {
    ...defaultSiteSettings,
    ...data,
    site_name: String(data.site_name || data.siteName || defaultSiteSettings.site_name),
    phone: String(data.phone || defaultSiteSettings.phone),
    email: String(data.email || defaultSiteSettings.email),
    address: String(data.address || defaultSiteSettings.address),
    working_hours: String(data.working_hours || data.workingHours || defaultSiteSettings.working_hours),
    footer_text: String(data.footer_text || data.footerText || defaultSiteSettings.footer_text),
    maintenance_mode: Boolean(data.maintenance_mode ?? data.maintenanceMode ?? defaultSiteSettings.maintenance_mode),
    analytics_enabled: Boolean(data.analytics_enabled ?? data.analyticsEnabled ?? defaultSiteSettings.analytics_enabled),
    cookie_consent: Boolean(data.cookie_consent ?? data.cookieConsent ?? defaultSiteSettings.cookie_consent),
  }
}

export function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits ? `tel:+${digits}` : '#'
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await apiRequest<Record<string, unknown>>('/settings')
        if (!cancelled) setSettings(normalizeSettings(data))
      } catch {
        if (!cancelled) setSettings(defaultSiteSettings)
      }
    }
    void load()
    const onUpdated = () => void load()
    window.addEventListener('vsb39:settings-updated', onUpdated)
    return () => {
      cancelled = true
      window.removeEventListener('vsb39:settings-updated', onUpdated)
    }
  }, [])

  return settings
}
