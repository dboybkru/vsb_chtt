import type { FC } from 'react'
import { useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Product {
  id: number
  name: string
  sku: string
  brand: string
  category: string
  priceRetail: number
  priceInstaller: number
  status: 'active' | 'hidden'
  description: string
}

const initialProducts: Product[] = [
  { id: 1, name: 'DS-2CD2143G2-I', sku: 'HIK-001', brand: 'Hikvision', category: 'Камеры', priceRetail: 12500, priceInstaller: 10800, status: 'active', description: '4 Мп купольная IP-камера с ИК-подсветкой' },
  { id: 2, name: 'DS-2CD2347G2-LU', sku: 'HIK-002', brand: 'Hikvision', category: 'Камеры', priceRetail: 18900, priceInstaller: 16500, status: 'active', description: '4 Мп цилиндрическая IP-камера ColorVu' },
  { id: 3, name: 'DS-7616NI-K2', sku: 'HIK-003', brand: 'Hikvision', category: 'Регистраторы', priceRetail: 45000, priceInstaller: 39000, status: 'active', description: '16-канальный NVR 4K' },
  { id: 4, name: 'DS-K1T671M', sku: 'HIK-004', brand: 'Hikvision', category: 'СКУД', priceRetail: 32500, priceInstaller: 28000, status: 'hidden', description: 'Терминал доступа с распознаванием лиц' },
  { id: 5, name: 'RVi-1NCT2023', sku: 'RVI-001', brand: 'RVi', category: 'Камеры', priceRetail: 8900, priceInstaller: 7700, status: 'active', description: '2 Мп цилиндрическая IP-камера' },
  { id: 6, name: 'Dahua IPC-HDW2431TP-AS-S2', sku: 'DAH-001', brand: 'Dahua', category: 'Камеры', priceRetail: 14200, priceInstaller: 12300, status: 'active', description: '4 Мп купольная IP-камера WizSense' },
  { id: 7, name: 'Bolid С2000-СП1', sku: 'BOL-001', brand: 'BOLID', category: 'ОПС', priceRetail: 18500, priceInstaller: 16000, status: 'active', description: 'Прибор приёмно-контрольный охранно-пожарный' },
  { id: 8, name: 'Cabeus UTP-4P-C6', sku: 'CAB-001', brand: 'Cabeus', category: 'Кабель', priceRetail: 28, priceInstaller: 24, status: 'active', description: 'Кабель UTP Cat.6 4 пары' },
]

const CATEGORIES = ['Все', 'Камеры', 'Регистраторы', 'СКУД', 'ОПС', 'Кабель', 'Сетевое оборудование']
const BRANDS = ['Hikvision', 'Dahua', 'RVi', 'BOLID', 'Cabeus']

const ITEMS_PER_PAGE = 5

const CatalogManagement: FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Все')
  const [page, setPage] = useState(1)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'Все' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleDelete = () => {
    if (deleteProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
      setDeleteProduct(null)
    }
  }

  const handleDuplicate = (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: `${product.name} (копия)`,
      sku: `${product.sku}-COPY`,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const handleSaveEdit = () => {
    if (editProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? editProduct : p)))
      setDrawerOpen(false)
      setEditProduct(null)
    }
  }

  const openEdit = (product: Product) => {
    setEditProduct({ ...product })
    setDrawerOpen(true)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Поиск по названию или артикулу..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-midnight border-border-subtle text-pure-white"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[180px] bg-midnight border-border-subtle text-pure-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-charcoal border-border-subtle">
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="gradient-guard text-white hover:brightness-110">
          <Plus size={16} className="mr-1" />
          Добавить товар
        </Button>

        <Button variant="outline" className="border-border-subtle text-text-body hover:text-pure-white">
          Импорт
        </Button>

        <Button variant="outline" className="border-border-subtle text-text-body hover:text-pure-white">
          Экспорт CSV
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-charcoal rounded-xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-text-muted text-xs">Фото</TableHead>
                <TableHead className="text-text-muted text-xs">Название</TableHead>
                <TableHead className="text-text-muted text-xs">Бренд</TableHead>
                <TableHead className="text-text-muted text-xs">Категория</TableHead>
                <TableHead className="text-text-muted text-xs">Цена розн.</TableHead>
                <TableHead className="text-text-muted text-xs">Цена инст.</TableHead>
                <TableHead className="text-text-muted text-xs">Статус</TableHead>
                <TableHead className="text-text-muted text-xs">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-border-subtle hover:bg-midnight/50 transition-colors duration-150"
                >
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-midnight flex items-center justify-center">
                      <PackageIcon />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-pure-white">{product.name}</p>
                    <p className="text-xs text-text-muted font-mono">{product.sku}</p>
                  </TableCell>
                  <TableCell className="text-sm text-text-body">{product.brand}</TableCell>
                  <TableCell className="text-sm text-text-body">{product.category}</TableCell>
                  <TableCell className="text-sm text-guard-green font-mono">
                    {product.priceRetail.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className="text-sm text-text-body font-mono">
                    {product.priceInstaller.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-guard-green' : 'bg-text-muted'}`} />
                      <span className="text-sm text-text-body">
                        {product.status === 'active' ? 'Активен' : 'Скрыт'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-guard-green transition-colors"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(product)}
                        className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-aurora-teal transition-colors"
                        title="Дублировать"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteProduct(product)}
                        className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-red-400 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
            <p className="text-xs text-text-muted">
              Показано {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} из {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-pure-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-guard-green text-white'
                      : 'text-text-muted hover:bg-midnight hover:text-pure-white'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-pure-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <DialogContent className="bg-charcoal border-border-subtle text-pure-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-[18px]">Удалить товар?</DialogTitle>
            <DialogDescription className="text-text-muted">
              Товар «{deleteProduct?.name}» будет безвозвратно удалён.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteProduct(null)}
              className="border-border-subtle text-text-body hover:text-pure-white"
            >
              Отмена
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 size={14} className="mr-1" />
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Drawer */}
      {drawerOpen && editProduct && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setDrawerOpen(false); setEditProduct(null) }}
          />
          <div className="relative w-full max-w-[500px] bg-charcoal border-l border-border-subtle h-full overflow-y-auto animate-slideInRight">
            <div className="sticky top-0 bg-charcoal border-b border-border-subtle px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-display text-[18px] font-semibold text-pure-white">
                Редактировать товар
              </h2>
              <button
                onClick={() => { setDrawerOpen(false); setEditProduct(null) }}
                className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-pure-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-text-body">Название</Label>
                <Input
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="bg-midnight border-border-subtle text-pure-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-text-body">Артикул (SKU)</Label>
                <Input
                  value={editProduct.sku}
                  onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                  className="bg-midnight border-border-subtle text-pure-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-text-body">Бренд</Label>
                <Select
                  value={editProduct.brand}
                  onValueChange={(v) => setEditProduct({ ...editProduct, brand: v })}
                >
                  <SelectTrigger className="bg-midnight border-border-subtle text-pure-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal border-border-subtle">
                    {BRANDS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-text-body">Категория</Label>
                <Select
                  value={editProduct.category}
                  onValueChange={(v) => setEditProduct({ ...editProduct, category: v })}
                >
                  <SelectTrigger className="bg-midnight border-border-subtle text-pure-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal border-border-subtle">
                    {CATEGORIES.filter((c) => c !== 'Все').map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-text-body">Описание</Label>
                <Textarea
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  rows={3}
                  className="bg-midnight border-border-subtle text-pure-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-text-body">Цена розница</Label>
                  <Input
                    type="number"
                    value={editProduct.priceRetail}
                    onChange={(e) => setEditProduct({ ...editProduct, priceRetail: Number(e.target.value) })}
                    className="bg-midnight border-border-subtle text-pure-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-text-body">Цена инсталлятор</Label>
                  <Input
                    type="number"
                    value={editProduct.priceInstaller}
                    onChange={(e) => setEditProduct({ ...editProduct, priceInstaller: Number(e.target.value) })}
                    className="bg-midnight border-border-subtle text-pure-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={editProduct.status === 'active'}
                  onCheckedChange={(v) =>
                    setEditProduct({ ...editProduct, status: v ? 'active' : 'hidden' })
                  }
                />
                <Label className="text-sm text-text-body">
                  {editProduct.status === 'active' ? 'Активен' : 'Скрыт'}
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 gradient-guard text-white hover:brightness-110"
                >
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setDrawerOpen(false); setEditProduct(null) }}
                  className="border-border-subtle text-text-body hover:text-pure-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}

function PackageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

export default CatalogManagement
