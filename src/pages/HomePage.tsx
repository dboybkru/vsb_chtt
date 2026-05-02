import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  ArrowRight,
  Bot,
  Calculator,
  Check,
  Search,
  Building2,
  Wrench,
  Clock3,
  Eye,
  ShieldCheck,
  HeartHandshake,
  Camera,
  KeyRound,
  Flame,
  Network,
  FileText,
} from 'lucide-react'
import { SITE_URL } from '@/config/env'
import { serviceCards, seoPages } from '@/data/constants'
import { navigateTo } from '@/utils/router'
import { gtagEvent } from '@/config/analytics'
import type { Product } from '@/types'

function Hero() {
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Опишите объект: тип, площадь, сколько входов и что важно видеть. Я подскажу стартовую конфигурацию и отправлю в смету.',
    },
  ])
  const prompts = [
    'Склад 1200 м², нужен общий обзор',
    'Офис, 8 рабочих мест под контролем',
    'Магазин, касса и вход',
    'Дом, камеры по периметру',
  ]

  function submitChat(text = chatInput) {
    const message = text.trim()
    if (!message) return
    try {
      localStorage.setItem('vsb39_hero_request', message)
    } catch {}
    setChatMessages(current => [
      ...current,
      { role: 'user', text: message },
      {
        role: 'assistant',
        text: 'Принял. Для точного расчёта откройте калькулятор: там можно выбрать тип объекта, сложность, точки внимания и сразу получить смету.',
      },
    ])
    setChatInput('')
    gtagEvent('hero_chat_submit')
  }

  return (
    <section className="hero" id="top">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-badge">Калининград и область · проектирование · монтаж · сервис</div>
          <h1>
            Системы безопасности <span>под ключ</span> в Калининграде
          </h1>
          <p>
            ВСБ39 проектирует и монтирует видеонаблюдение, СКУД, охранную сигнализацию и сети.
            Подбираем оборудование из прайсов, считаем смету и берём систему на обслуживание.
          </p>
          <div className="hero-actions">
            <button className="btn btn-blue" onClick={() => { navigateTo('estimate'); gtagEvent('click_cta', { label: 'hero_estimate' }) }}>
              <Calculator size={18} />Рассчитать смету
            </button>
            <button className="btn btn-outline" onClick={() => { navigateTo('catalog'); gtagEvent('click_cta', { label: 'hero_catalog' }) }}>
              <Search size={18} />Подобрать оборудование
            </button>
          </div>
          <div className="hero-chat" aria-label="AI-чат подбора системы безопасности">
            <div className="hero-chat-head">
              <span>
                <Bot size={17} />
                AI-подбор
              </span>
              <small>черновик диалога для будущего VseGPT</small>
            </div>
            <div className="hero-chat-body">
              {chatMessages.slice(-4).map((msg, idx) => (
                <div className={`chat-bubble ${msg.role}`} key={`${msg.role}-${idx}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="hero-chat-prompts">
              {prompts.map(prompt => (
                <button key={prompt} onClick={() => submitChat(prompt)}>{prompt}</button>
              ))}
            </div>
            <div className="hero-chat-input">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitChat() }}
                placeholder="Например: производство 2500 м², 12 рабочих мест, 3 ворот..."
              />
              <button onClick={() => submitChat()}>
                <ArrowRight size={18} />
              </button>
            </div>
            <button
              className="hero-chat-estimate"
              onClick={() => {
                const latestRequest = chatInput.trim() || [...chatMessages].reverse().find(m => m.role === 'user')?.text || ''
                if (latestRequest) {
                  try { localStorage.setItem('vsb39_hero_request', latestRequest) } catch {}
                }
                navigateTo('estimate')
              }}
            >
              Перейти к расчёту сметы
            </button>
          </div>
          <div className="hero-proof">
            {['39-й регион', 'гарантия и сервис', 'смета из прайсов', 'выезд и аудит'].map(label => (
              <span key={label}>
                <Check size={15} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-panel" aria-label="Превью проекта системы безопасности">
          <div className="security-plan">
            <div className="plan-head">
              <div>
                <strong>Проект объекта</strong>
                <small>склад · 1 240 м² · 3 рубежа</small>
              </div>
              <span>готово 78%</span>
            </div>
            <div className="plan-map">
              <span className="zone zone-a">склад</span>
              <span className="zone zone-b">офис</span>
              <span className="zone zone-c">въезд</span>
              <i className="cam cam-1" aria-hidden="true" />
              <i className="cam cam-2" aria-hidden="true" />
              <i className="cam cam-3" aria-hidden="true" />
              <i className="cam cam-4" aria-hidden="true" />
            </div>
          </div>
          <div className="scope-list">
            {[
              ['Камеры', '12 IP, PoE, WDR'],
              ['Доступ', '2 двери, журнал событий'],
              ['Охрана', 'датчики, тревожные зоны'],
              ['Сервис', 'регламент и гарантия'],
            ].map(([title, text]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="ai-strip">
            <Bot size={22} />
            <div>
              <strong>ИИ-сметчик</strong>
              <small>сравнил 3 прайса и нашёл 4 аналога</small>
            </div>
            <b>от 186 400 ₽</b>
          </div>
        </div>
      </div>
      <div className="stats-strip">
        {[
          ['3', 'направления защиты'],
          ['9', 'рубежей спокойствия'],
          ['39', 'региональная экспертиза'],
          ['SLA', 'сервис после монтажа'],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function BrandStory() {
  return (
    <section className="brand-story" id="about">
      <div className="story-head">
        <h2>ВСБ - Ваша Система Безопасности</h2>
        <p>
          Бренд строится на простой формуле: видеть, что происходит на объекте, стеречь входы и
          периметр, беречь клиента от проекта до поддержки.
        </p>
      </div>
      <div className="vsb-grid">
        {([
          [Eye, 'В', 'Видим', 'Камеры, аналитика, архивы, удалённый доступ и контроль событий.'] as const,
          [ShieldCheck, 'С', 'Стережём', 'СКУД, сигнализация, периметр, тревожные сценарии и журналирование.'] as const,
          [HeartHandshake, 'Б', 'Бережём', 'Сервис, гарантия, аккуратный монтаж, документация и поддержка.'] as const,
        ]).map(([Icon, letter, title, text]) => (
          <article key={letter}>
            <Icon size={32} />
            <strong>{letter}</strong>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="guarantees">
        {[
          'Гарантия на оборудование',
          'Фиксация сроков',
          'Скрытый монтаж',
          'Удалённый доступ',
          'Обучение персонала',
          'Сервисные регламенты',
          'Чистая документация',
          'Подбор аналогов',
          '39-й регион без сюрпризов',
        ].map(item => (
          <span key={item}>
            <Check size={16} />
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

const iconMap: Record<string, typeof Camera> = {
  Camera,
  KeyRound,
  Flame,
  Network,
}

export default function HomePage({ products }: { products: Product[] }) {
  return (
    <>
      <Helmet>
        <title>ВСБ39 - системы безопасности под ключ в Калининграде</title>
        <meta
          name="description"
          content="Проектирование, монтаж и обслуживание видеонаблюдения, СКУД, ОПС и сетей в Калининграде и области."
        />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: products.slice(0, 6).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}/catalog`,
              name: p.name,
            })),
          })}
        </script>
      </Helmet>
      <Hero />
      <main>
        <section className="services-section">
          <div className="section-head">
            <div>
              <h2>Закрываем объект как систему, а не набор отдельных камер</h2>
              <p>
                Для SEO и продаж каждая услуга может развиваться в отдельную посадочную страницу с
                кейсами, сметами, оборудованием и частыми вопросами.
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => navigateTo('catalog')}>
              Смотреть каталог
            </button>
          </div>
          <div className="service-grid">
            {serviceCards.map(({ icon, title, text }) => {
              const Icon = iconMap[icon] || Camera
              return (
                <article key={title} className="service-card">
                  <Icon size={26} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <button
                    onClick={() => {
                      navigateTo('catalog')
                      gtagEvent('click_service', { service: title })
                    }}
                  >
                    Перейти к подбору <ArrowRight size={16} />
                  </button>
                </article>
              )
            })}
          </div>
        </section>
        <section className="seo-hub">
          <div>
            <h2>Структура для роста в поиске</h2>
            <p>
              Сайт готов расширяться: услуги, районы, типы объектов, бренды оборудования и статьи
              базы знаний можно развивать как отдельные страницы.
            </p>
          </div>
          <div className="seo-links">
            {seoPages.map(page => (
              <button key={page} onClick={() => navigateTo('prices')}>
                <FileText size={16} />
                {page}
              </button>
            ))}
          </div>
        </section>
        <section className="workflow-section">
          {([
            [Building2, 'Аудит', 'Смотрим объект, риски, трассы, точки доступа и сценарии тревог.'] as const,
            [Calculator, 'Смета', 'Подбираем оборудование из прайсов и показываем аналоги по характеристикам.'] as const,
            [Wrench, 'Монтаж', 'Монтируем, маркируем, настраиваем удалённый доступ и документацию.'] as const,
            [Clock3, 'Сервис', 'Оставляем регламент, гарантию, обновления и поддержку после сдачи.'] as const,
          ]).map(([Icon, title, text]) => (
            <article key={title}>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>
        <BrandStory />
      </main>
    </>
  )
}
