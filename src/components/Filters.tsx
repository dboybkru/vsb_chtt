import { useMemo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import {
  selectFilterKeys,
  buildFilterOptions,
  availableBooleanFilters,
  defaultFilters,
} from '@/utils/filters'
import { categories } from '@/data/constants'
import type { Product, FilterState } from '@/types'

export function Filters({
  products,
  filters,
  setFilters,
}: {
  products: Product[]
  filters: FilterState
  setFilters: (updater: FilterState | ((prev: FilterState) => FilterState)) => void
}) {
  const optionMap = useMemo(() => {
    return selectFilterKeys.reduce((acc, key) => {
      acc[key] = buildFilterOptions(products, filters, key)
      return acc
    }, {} as Record<string, { value: string; count: number }[]>)
  }, [products, filters])

  const booleanCounts = useMemo(() => availableBooleanFilters(products, filters), [products, filters])
  const update = (patch: Partial<FilterState>) => setFilters(current => ({ ...current, ...patch }))

  const renderOptions = (key: string) => {
    const options = optionMap[key] || []
    const value = filters[key as keyof FilterState] as string
    const withCurrent =
      value && value !== 'Все' && !options.some(item => item.value === value)
        ? [...options, { value, count: 0 }]
        : options
    return [
      <option key="Все" value="Все">Все</option>,
      ...withCurrent.map(item => (
        <option key={item.value} value={item.value}>
          {item.value} ({item.count})
        </option>
      )),
    ]
  }

  const shouldShowSelect = (key: string) =>
    (optionMap[key]?.length || 0) > 0 || (filters[key as keyof FilterState] as string) !== 'Все'
  const shouldShowCheck = (key: string) => Boolean(booleanCounts[key]) || (filters[key as keyof FilterState] as boolean)
  const categoryOptions = optionMap.category?.length
    ? optionMap.category
    : categories.slice(1).map(c => ({ value: c, count: 0 }))

  return (
    <aside className="filters">
      <div className="filters-title">
        <SlidersHorizontal size={19} />
        <strong>Фильтры</strong>
      </div>
      <label>
        Категория
        <select value={filters.category} onChange={e => update({ category: e.target.value })}>
          <option value="Все">Все</option>
          {categoryOptions.map(item => (
            <option key={item.value} value={item.value}>
              {item.value} ({item.count})
            </option>
          ))}
        </select>
      </label>
      {shouldShowSelect('brand') && (
        <label>
          Бренд
          <select value={filters.brand} onChange={e => update({ brand: e.target.value })}>
            {renderOptions('brand')}
          </select>
        </label>
      )}
      {shouldShowSelect('resolution') && (
        <label>
          Разрешение
          <select value={filters.resolution} onChange={e => update({ resolution: e.target.value })}>
            {renderOptions('resolution')}
          </select>
        </label>
      )}
      {shouldShowSelect('formFactor') && (
        <label>
          Корпус
          <select value={filters.formFactor} onChange={e => update({ formFactor: e.target.value })}>
            {renderOptions('formFactor')}
          </select>
        </label>
      )}
      {shouldShowSelect('lens') && (
        <label>
          Объектив
          <select value={filters.lens} onChange={e => update({ lens: e.target.value })}>
            {renderOptions('lens')}
          </select>
        </label>
      )}
      {shouldShowSelect('ipRating') && (
        <label>
          IP-защита
          <select value={filters.ipRating} onChange={e => update({ ipRating: e.target.value })}>
            {renderOptions('ipRating')}
          </select>
        </label>
      )}
      {shouldShowSelect('channels') && (
        <label>
          Каналы
          <select value={filters.channels} onChange={e => update({ channels: e.target.value })}>
            {renderOptions('channels')}
          </select>
        </label>
      )}
      {shouldShowSelect('codec') && (
        <label>
          Кодек
          <select value={filters.codec} onChange={e => update({ codec: e.target.value })}>
            {renderOptions('codec')}
          </select>
        </label>
      )}
      {shouldShowSelect('spec') && (
        <label>
          Характеристика
          <select value={filters.spec} onChange={e => update({ spec: e.target.value })}>
            {renderOptions('spec')}
          </select>
        </label>
      )}
      <div className="price-inputs">
        <label>
          Цена от
          <input value={filters.minPrice} onChange={e => update({ minPrice: e.target.value })} inputMode="numeric" />
        </label>
        <label>
          до
          <input value={filters.maxPrice} onChange={e => update({ maxPrice: e.target.value })} inputMode="numeric" />
        </label>
      </div>
      {shouldShowCheck('poe') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.poe} onChange={e => update({ poe: e.target.checked })} />
          PoE питание <span>{booleanCounts.poe || 0}</span>
        </label>
      )}
      {shouldShowCheck('outdoor') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.outdoor} onChange={e => update({ outdoor: e.target.checked })} />
          Уличное исполнение <span>{booleanCounts.outdoor || 0}</span>
        </label>
      )}
      {shouldShowCheck('wdr') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.wdr} onChange={e => update({ wdr: e.target.checked })} />
          WDR <span>{booleanCounts.wdr || 0}</span>
        </label>
      )}
      {shouldShowCheck('mic') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.mic} onChange={e => update({ mic: e.target.checked })} />
          Микрофон <span>{booleanCounts.mic || 0}</span>
        </label>
      )}
      {shouldShowCheck('audio') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.audio} onChange={e => update({ audio: e.target.checked })} />
          Аудио <span>{booleanCounts.audio || 0}</span>
        </label>
      )}
      {shouldShowCheck('ik') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.ik} onChange={e => update({ ik: e.target.checked })} />
          ИК-подсветка <span>{booleanCounts.ik || 0}</span>
        </label>
      )}
      {shouldShowCheck('colorNight') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.colorNight} onChange={e => update({ colorNight: e.target.checked })} />
          Цветная ночь <span>{booleanCounts.colorNight || 0}</span>
        </label>
      )}
      {shouldShowCheck('hasPhoto') && (
        <label className="check-label">
          <input type="checkbox" checked={filters.hasPhoto} onChange={e => update({ hasPhoto: e.target.checked })} />
          Есть фото <span>{booleanCounts.hasPhoto || 0}</span>
        </label>
      )}
      <button className="btn btn-outline" onClick={() => setFilters(defaultFilters)}>
        Сбросить
      </button>
    </aside>
  )
}
