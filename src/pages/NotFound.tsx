import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-midnight pt-24 pb-16">
      <div className="container mx-auto px-4 min-h-[520px] flex flex-col items-center justify-center text-center">
        <p className="font-mono text-guard-green text-sm mb-3">404</p>
        <h1 className="font-display text-4xl md:text-5xl text-pure-white mb-4">Страница не найдена</h1>
        <p className="text-text-body max-w-xl mb-8">
          Возможно, ссылка устарела или адрес набран с ошибкой. Можно вернуться в каталог, услуги или связаться с нами.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/catalog" className="px-5 py-3 rounded-lg bg-guard-green text-deep-navy font-medium hover:brightness-110 transition-all">
            В каталог
          </Link>
          <Link to="/contact" className="px-5 py-3 rounded-lg border border-border-subtle text-pure-white hover:border-guard-green transition-colors">
            Контакты
          </Link>
        </div>
      </div>
    </main>
  )
}
