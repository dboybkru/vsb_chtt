import { Link } from 'react-router-dom'

export default function Solutions() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center pt-[72px]">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-pure-white mb-4">Решения</h1>
        <p className="text-text-body mb-6">Раздел в разработке</p>
        <Link to="/" className="text-guard-green hover:underline">
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
