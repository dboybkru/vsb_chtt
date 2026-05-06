import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://www.vsb39.ru'

const metaByPath: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Системы безопасности Калининград — VSB39',
    description: 'Профессиональные системы безопасности в Калининграде и области: видеонаблюдение, СКУД, ОПС, сети, проектирование, монтаж и обслуживание.',
  },
  '/services': {
    title: 'Услуги безопасности — видеонаблюдение, СКУД, ОПС',
    description: 'Проектирование, монтаж и обслуживание систем видеонаблюдения, СКУД, пожарной сигнализации и сетей в Калининграде.',
  },
  '/catalog': {
    title: 'Каталог оборудования для систем безопасности',
    description: 'Оборудование для систем безопасности в Калининграде: камеры, регистраторы, СКУД, сетевое оборудование, питание и кабель.',
  },
  '/estimate': {
    title: 'Калькулятор сметы онлайн — VSB39',
    description: 'Рассчитайте стоимость системы безопасности онлайн: оборудование, монтажные работы, пусконаладка и выгрузка сметы.',
  },
  '/ai': {
    title: 'ИИ-агент подбора оборудования — VSB39',
    description: 'ИИ-консультант VSB39 помогает подобрать систему безопасности, рассчитать смету и разобраться с техническими вопросами.',
  },
  '/about': {
    title: 'О компании VSB39',
    description: 'VSB39 проектирует, монтирует и обслуживает системы безопасности в Калининграде и области.',
  },
  '/contact': {
    title: 'Контакты VSB39 Калининград',
    description: 'Телефон, адрес, режим работы и способы связи с VSB39. Консультация и выезд на объект в Калининграде и области.',
  },
  '/prices': {
    title: 'Цены на системы безопасности — VSB39',
    description: 'Ориентировочные цены на оборудование, монтаж и обслуживание систем безопасности в Калининграде.',
  },
  '/privacy': {
    title: 'Политика конфиденциальности — VSB39',
    description: 'Политика обработки персональных данных посетителей сайта VSB39.',
  },
  '/admin': {
    title: 'Админ-панель — VSB39',
    description: 'Административная панель VSB39 для управления каталогом, сметами и настройками сайта.',
  },
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, name)
    document.head.appendChild(element)
  }
  element.content = content
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  element.href = url
}

export default function SEO() {
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname
    const normalizedPathname = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname
    const basePath = normalizedPathname.startsWith('/catalog/') ? '/catalog' : normalizedPathname
    const meta = metaByPath[basePath] || {
      title: 'Страница не найдена — VSB39',
      description: 'Запрошенная страница не найдена. Перейдите в каталог, услуги или свяжитесь с VSB39.',
    }
    const url = `${SITE_URL}${pathname}`
    document.title = meta.title
    setMeta('description', meta.description)
    setCanonical(url)
    setMeta('og:title', meta.title, true)
    setMeta('og:description', meta.description, true)
    setMeta('og:url', url, true)
    setMeta('og:type', 'website', true)
    setMeta('og:locale', 'ru_RU', true)
    setMeta('og:image', `${SITE_URL}/catalog-camera-1.jpg`, true)
  }, [location.pathname])

  return null
}
