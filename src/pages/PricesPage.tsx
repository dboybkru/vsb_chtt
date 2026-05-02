import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '@/config/env'
import { BookOpen } from 'lucide-react'
import { seoPages } from '@/data/constants'

export default function PricesPage() {
  return (
    <main>
      <Helmet>
        <title>Прайсы и база знаний ВСБ39</title>
        <meta
          name="description"
          content="Поставщики, условия подбора оборудования и база знаний по системам безопасности."
        />
        <link rel="canonical" href={`${SITE_URL}/prices`} />
        <meta property="og:url" content={`${SITE_URL}/prices`} />
      </Helmet>
      <section className="knowledge-page">
        <div>
          <h1>База знаний и прайсы поставщиков</h1>
          <p>
            Публичный раздел для будущих SEO-страниц: сравнения брендов, подбор оборудования,
            объяснение смет и рекомендации по объектам.
          </p>
        </div>
        <div className="knowledge-grid">
          {seoPages.map(page => (
            <article key={page}>
              <BookOpen size={22} />
              <h3>{page}</h3>
              <p>Материал можно связать с каталогом, сметами и типовыми решениями для Калининграда.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
