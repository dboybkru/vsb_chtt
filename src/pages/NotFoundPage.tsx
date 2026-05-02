import { Helmet } from 'react-helmet-async'
import { navigateTo } from '@/utils/router'

export default function NotFoundPage() {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '40px' }}>
      <Helmet>
        <title>Страница не найдена — ВСБ39</title>
        <meta name="description" content="Запрашиваемая страница не существует. Вернитесь на главную или в каталог." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(48px, 8vw, 120px)', margin: 0, color: 'var(--blue)' }}>404</h1>
        <p style={{ color: 'var(--sub)', fontSize: '18px', marginBottom: '24px' }}>
          Страница не найдена или перемещена
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-blue" onClick={() => navigateTo('home')}>На главную</button>
          <button className="btn btn-outline" onClick={() => navigateTo('catalog')}>В каталог</button>
        </div>
      </div>
    </main>
  )
}
