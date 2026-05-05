import type { FC } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Image, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiRequest, type ApiMaterial, type MaterialsResponse } from '@/lib/api'

const ITEMS_PER_PAGE = 20

const CatalogManagement: FC = () => {
  const [products, setProducts] = useState<ApiMaterial[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Все')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const token = localStorage.getItem('vsb39_admin_token') || ''
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined

  const loadProducts = async () => {
    setLoading(true)
    setStatus('')
    try {
      const params = new URLSearchParams({
        item_type: 'equipment',
        limit: String(ITEMS_PER_PAGE),
        offset: String((page - 1) * ITEMS_PER_PAGE),
      })
      if (search.trim()) params.set('q', search.trim())
      const response = await apiRequest<MaterialsResponse>(`/materials?${params.toString()}`)
      setProducts(response.items)
      setTotal(response.total)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить каталог')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  const categories = useMemo(() => {
    const values = products.map((product) => product.category).filter(Boolean) as string[]
    return ['Все', ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ru'))]
  }, [products])

  const visibleProducts =
    categoryFilter === 'Все'
      ? products
      : products.filter((product) => (product.category || 'Без категории') === categoryFilter)
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  const deleteProduct = async (product: ApiMaterial) => {
    if (!token) {
      setStatus('Сначала войдите в AI-настройках, чтобы получить backend-доступ')
      return
    }
    if (!window.confirm(`Удалить товар «${product.name}» из базы?`)) return
    try {
      await apiRequest(`/materials/${product.id}`, { method: 'DELETE', headers: authHeaders })
      setStatus('Товар удалён из базы')
      await loadProducts()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось удалить товар')
    }
  }

  const clearCatalog = async () => {
    if (!token) {
      setStatus('Сначала войдите в AI-настройках, чтобы получить backend-доступ')
      return
    }
    const answer = window.prompt('Это удалит весь каталог оборудования из базы. Введите УДАЛИТЬ')
    if (answer !== 'УДАЛИТЬ') return
    try {
      const response = await apiRequest<{ deleted_count?: number; message?: string }>('/materials', {
        method: 'DELETE',
        headers: authHeaders,
      })
      setPage(1)
      setProducts([])
      setTotal(0)
      setStatus(response.message || `Удалено: ${response.deleted_count ?? 0}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось очистить каталог')
    }
  }

  const enrichPhotos = async () => {
    try {
      const response = await apiRequest<{ checked: number; updated: number }>('/materials/enrich-photos', {
        method: 'POST',
        body: JSON.stringify({ limit: 100, min_score: 0.7 }),
      })
      setStatus(`Фото: проверено ${response.checked}, обновлено ${response.updated}`)
      await loadProducts()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось подобрать фото')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Поиск в базе: модель, бренд, артикул..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="pl-9 bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[190px] bg-midnight border-border-subtle text-pure-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-charcoal border-border-subtle">
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={loadProducts} variant="outline" className="border-border-subtle text-text-body hover:text-pure-white">
          <RefreshCw size={16} className="mr-1" />
          Обновить
        </Button>
        <Button onClick={enrichPhotos} variant="outline" className="border-border-subtle text-text-body hover:text-pure-white">
          <Image size={16} className="mr-1" />
          Найти фото
        </Button>
        <Button onClick={clearCatalog} className="bg-red-500 hover:bg-red-600 text-white">
          <Trash2 size={16} className="mr-1" />
          Очистить каталог
        </Button>
      </div>

      {status && (
        <div className="text-sm text-text-body bg-charcoal rounded-lg border border-border-subtle px-4 py-3">
          {status}
        </div>
      )}

      <div className="bg-charcoal rounded-xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-text-muted text-xs">Фото</TableHead>
                <TableHead className="text-text-muted text-xs">Название</TableHead>
                <TableHead className="text-text-muted text-xs">Бренд</TableHead>
                <TableHead className="text-text-muted text-xs">Категория</TableHead>
                <TableHead className="text-text-muted text-xs">Цена</TableHead>
                <TableHead className="text-text-muted text-xs">Источник</TableHead>
                <TableHead className="text-text-muted text-xs">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <TableRow key={product.id} className="border-border-subtle hover:bg-midnight/50">
                  <TableCell>
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover bg-midnight" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-midnight flex items-center justify-center text-text-muted">
                        <Image size={16} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-pure-white">{product.name}</p>
                    <p className="text-xs text-text-muted font-mono">{product.sku || `#${product.id}`}</p>
                  </TableCell>
                  <TableCell className="text-sm text-text-body">{product.brand || '-'}</TableCell>
                  <TableCell className="text-sm text-text-body">{product.category || 'Без категории'}</TableCell>
                  <TableCell className="text-sm text-guard-green font-mono">
                    {Number(product.price || 0).toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className="text-xs text-text-muted">{product.source || '-'}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => void deleteProduct(product)}
                      className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-red-400"
                      title="Удалить из базы"
                    >
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && visibleProducts.length === 0 && (
                <TableRow className="border-border-subtle">
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-text-muted">
                    В базе ничего не найдено
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted">
            {loading ? 'Загрузка...' : `Страница ${page} из ${totalPages}, всего ${total}`}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="border-border-subtle text-text-body hover:text-pure-white disabled:opacity-40"
            >
              Назад
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="border-border-subtle text-text-body hover:text-pure-white disabled:opacity-40"
            >
              Вперёд
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CatalogManagement
