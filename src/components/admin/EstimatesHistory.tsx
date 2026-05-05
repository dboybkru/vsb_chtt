import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Calculator, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiRequest } from '@/lib/api'

interface Estimate {
  id: number
  name: string
  customer_name?: string
  items?: unknown[]
  total?: number
  created_at?: string
}

const EstimatesHistory: FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const token = localStorage.getItem('vsb39_admin_token') || ''
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined

  const loadEstimates = async () => {
    if (!token) {
      setStatus('Сначала войдите в AI-настройках, чтобы получить backend-доступ')
      return
    }
    setLoading(true)
    setStatus('')
    try {
      const response = await apiRequest<Estimate[]>('/smetas', { headers: authHeaders })
      setEstimates(response)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить сметы')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEstimates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteEstimate = async (estimate: Estimate) => {
    if (!token) {
      setStatus('Сначала войдите в AI-настройках, чтобы получить backend-доступ')
      return
    }
    if (!window.confirm(`Удалить смету «${estimate.name}»?`)) return
    try {
      await apiRequest(`/smetas/${estimate.id}`, { method: 'DELETE', headers: authHeaders })
      setStatus('Смета удалена')
      await loadEstimates()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось удалить смету')
    }
  }

  const clearEstimates = async () => {
    if (!token) {
      setStatus('Сначала войдите в AI-настройках, чтобы получить backend-доступ')
      return
    }
    const answer = window.prompt('Это удалит все сметы из базы. Введите УДАЛИТЬ')
    if (answer !== 'УДАЛИТЬ') return
    try {
      const response = await apiRequest<{ deleted_count?: number; message?: string }>('/admin/smetas', {
        method: 'DELETE',
        headers: authHeaders,
      })
      setEstimates([])
      setStatus(response.message || `Удалено: ${response.deleted_count ?? 0}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось очистить сметы')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={loadEstimates} variant="outline" className="border-border-subtle text-text-body hover:text-pure-white">
          <RefreshCw size={16} className="mr-1" />
          Обновить
        </Button>
        <Button onClick={clearEstimates} className="bg-red-500 hover:bg-red-600 text-white">
          <Trash2 size={16} className="mr-1" />
          Очистить сметы
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
                <TableHead className="text-text-muted text-xs">№</TableHead>
                <TableHead className="text-text-muted text-xs">Название</TableHead>
                <TableHead className="text-text-muted text-xs">Клиент</TableHead>
                <TableHead className="text-text-muted text-xs">Позиций</TableHead>
                <TableHead className="text-text-muted text-xs">Сумма</TableHead>
                <TableHead className="text-text-muted text-xs">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id} className="border-border-subtle hover:bg-midnight/50">
                  <TableCell className="text-sm text-text-body font-mono">#{estimate.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calculator size={14} className="text-guard-green" />
                      <span className="text-sm text-pure-white">{estimate.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-body">{estimate.customer_name || '-'}</TableCell>
                  <TableCell className="text-sm text-text-body">{estimate.items?.length ?? 0}</TableCell>
                  <TableCell className="text-sm text-guard-green font-mono">
                    {Number(estimate.total || 0).toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => void deleteEstimate(estimate)}
                      className="p-1.5 rounded hover:bg-midnight text-text-muted hover:text-red-400"
                      title="Удалить смету"
                    >
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && estimates.length === 0 && (
                <TableRow className="border-border-subtle">
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-text-muted">
                    В базе нет смет
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {loading && <div className="px-4 py-3 border-t border-border-subtle text-xs text-text-muted">Загрузка...</div>}
      </div>
    </div>
  )
}

export default EstimatesHistory
