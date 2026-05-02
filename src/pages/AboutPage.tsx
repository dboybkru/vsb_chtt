import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '@/config/env'
import { Eye, ShieldCheck, HeartHandshake, Check } from 'lucide-react'

export default function AboutPage() {
  return (
    <main>
      <Helmet>
        <title>О компании ВСБ39</title>
        <meta name="description" content="ВСБ39 - Ваша Система Безопасности: видим, стережём, бережём." />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <meta property="og:url" content={`${SITE_URL}/about`} />
      </Helmet>
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
    </main>
  )
}
