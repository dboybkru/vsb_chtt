import { categories, categoryIcons } from '@/data/constants'
import type { Product } from '@/types'

export function CategoryRail({
  active,
  setActive,
  products,
}: {
  active: string
  setActive: (category: string) => void
  products: Product[]
}) {
  const categoryCounts = products.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const visibleCategories = categories.slice(1).filter(c => categoryCounts[c] > 0)

  return (
    <section className="category-rail">
      {visibleCategories.map(category => {
        const Icon = categoryIcons[category]
        const count = categoryCounts[category] || 0
        return (
          <button
            key={category}
            className={active === category ? 'category-tile category-active' : 'category-tile'}
            onClick={() => setActive(active === category ? 'Все' : category)}
          >
            <Icon size={30} />
            <strong>{category}</strong>
            <span>{count} позиций</span>
          </button>
        )
      })}
    </section>
  )
}
