import type { FC } from 'react'
import { useState } from 'react'
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Estimate {
  id: number
  title: string
  client: string
  amount: number
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  date: string
}

const initialEstimates: Estimate[] = [
  { id: 124, title: 'Офис на Ленина', client: 'ООО "Пример"', amount: 285000, status: 'sent', date: '2024-05-01' },
  { id: 123, title: 'Склад на Московском', client: 'ИП Иванов', amount: 142000, status: 'approved', date: '2024-04-28' },
  { id: 122, title: 'Магазин "Продукты"', client: 'ООО "Торг"', amount: 67000, status: 'draft', date: '2024-04-25' },
  { id: 121, title: 'Школа №15', client: 'МБОУ СШ №15', amount: 520000, status: 'sent', date: '2024-04-20' },
  { id: 120, title: 'ЖК "Солнечный"', client: 'УК "Дом"', amount: 890000, status: 'approved', date: '2024-04-15' },
  { id: 119, title: 'Ресторан "Вкус"', client: 'ООО "Вкус"', amount: 195000, status: 'rejected', date: '2024-04-10' },
]

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-text-muted' },
  sent: { label: 'Отправлена', color: 'bg-caution-amber' },
  approved: { label: 'Одобрена', color: 'bg-guard-green' },
  rejected: { label: 'Отклонена', color: 'bg-red-500' },
}

const ITEMS_PER_PAGE = 5

const EstimatesHistory: FC = () => {
  const [estimates] = useState<Estimate[]>(initialEstimates)
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(estimates.length / ITEMS_PER_PAGE)
  const paginated = estimates.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="p-8 space-y-6">
      <div className="bg-charcoal rounded-xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-text-muted text-xs">№</TableHead>
                <TableHead className="text-text-muted text-xs">Название</TableHead>
                <TableHead className="text-text-muted text-xs">Клиент</TableHead>
                <TableHead className="text-text-muted text-xs">Сумма</TableHead>
                <TableHead className="text-text-muted text-xs">Статус</TableHead>
                <TableHead className="text-text-muted text-xs">Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((est) => (
                <TableRow
                  key={est.id}
                  className="border-border-subtle hover:bg-midnight/50 transition-colors duration-150"
                >
                  <TableCell className="text-sm text-text-body font-mono">#{est.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calculator size={14} className="text-guard-green" />
                      <span className="text-sm text-pure-white">{est.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-body">{est.client}</TableCell>
                  <TableCell className="text-sm text-guard-green font-mono">
                    {est.amount.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusMap[est.status].color}`} />
                      <span className="text-sm text-text-body">{statusMap[est.status].label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-muted">{est.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
            <p className="text-xs text-text-muted">
              Показано {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, estimates.length)} из {estimates.length}
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
    </div>
  )
}

export default EstimatesHistory
