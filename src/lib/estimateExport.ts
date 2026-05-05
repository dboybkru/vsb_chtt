import * as XLSX from 'xlsx'
import type {
  EstimateItem,
  EstimateServices,
  LaborSettings,
  ObjectParams,
} from '@/components/estimate/EstimateContext'

interface EstimateExportPayload {
  items: EstimateItem[]
  labor: LaborSettings
  services: EstimateServices
  params: ObjectParams
  equipmentTotal: number
  laborTotal: number
  servicesTotal: number
  grandTotal: number
}

const serviceLabels: Record<keyof EstimateServices, string> = {
  design: 'Проектирование',
  training: 'Обучение персонала',
  commissioning: 'Пусконаладочные работы',
  warranty: 'Расширенная гарантия',
}

const servicePrices: Record<keyof EstimateServices, number> = {
  design: 5000,
  training: 3000,
  commissioning: 7000,
  warranty: 10000,
}

function formatDateSlug(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function money(value: number) {
  return Math.round(value)
}

function addTitleRows(payload: EstimateExportPayload) {
  return [
    ['VSB39 — Ваша система безопасности', '', '', '', '', '', ''],
    ['Коммерческое предложение / предварительная смета', '', '', '', '', '', ''],
    [`Дата: ${new Date().toLocaleDateString('ru-RU')}`, '', '', '', 'Итого', '', money(payload.grandTotal)],
    ['', '', '', '', '', '', ''],
    ['Объект', payload.params.name || 'Не указан', '', 'Адрес', payload.params.address || 'Не указан', '', ''],
    ['Телефон', payload.params.phone || 'Не указан', '', 'Тип объекта', payload.params.type || 'Не указан', '', ''],
    ['', '', '', '', '', '', ''],
  ]
}

function sectionRow(title: string, total: number) {
  return [title, '', '', '', '', '', money(total)]
}

function itemRow(index: number | string, name: string, sku: string, brand: string, qty: number, price: number) {
  return [index, name, sku, brand, qty, money(price), money(qty * price)]
}

function applySheetLayout(sheet: XLSX.WorkSheet, lastRow: number) {
  sheet['!cols'] = [
    { wch: 7 },
    { wch: 48 },
    { wch: 22 },
    { wch: 18 },
    { wch: 12 },
    { wch: 15 },
    { wch: 16 },
  ]
  sheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ]
  sheet['!freeze'] = { xSplit: 0, ySplit: 8 }
  sheet['!autofilter'] = { ref: `A8:G${Math.max(8, lastRow)}` }
}

function decorateCells(sheet: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:G1')
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = sheet[address]
      if (!cell) continue
      cell.s = {
        font: row <= 1 ? { bold: true, sz: row === 0 ? 18 : 13, color: { rgb: '173B57' } } : undefined,
        alignment: { vertical: 'top', wrapText: true },
      }
      if (col >= 5 || (row === 2 && col === 6)) cell.z = '#,##0 ₽'
    }
  }
}

export function exportEstimateToXlsx(payload: EstimateExportPayload) {
  const rows: Array<Array<string | number>> = [
    ...addTitleRows(payload),
    ['№', 'Наименование', 'Артикул', 'Бренд', 'Кол-во', 'Цена', 'Сумма'],
    sectionRow('Оборудование', payload.equipmentTotal),
    ...payload.items.map((item, index) => itemRow(index + 1, item.name, item.sku, item.brand, item.quantity, item.price)),
  ]

  if (payload.laborTotal > 0) {
    rows.push(
      sectionRow('Монтажные работы', payload.laborTotal),
      itemRow(
        '',
        payload.labor.auto ? `Монтаж, коэффициент сложности: ${payload.labor.complexity}` : 'Монтажные работы, ручной расчёт',
        '',
        'VSB39',
        1,
        payload.laborTotal,
      ),
    )
  }

  const enabledServices = Object.entries(payload.services).filter(([, enabled]) => enabled) as Array<[keyof EstimateServices, boolean]>
  if (enabledServices.length > 0) {
    rows.push(sectionRow('Дополнительные услуги', payload.servicesTotal))
    enabledServices.forEach(([key]) => {
      rows.push(itemRow('', serviceLabels[key], '', 'VSB39', 1, servicePrices[key]))
    })
  }

  rows.push(
    ['', '', '', '', '', '', ''],
    ['Итого оборудование', '', '', '', '', '', money(payload.equipmentTotal)],
    ['Итого работы', '', '', '', '', '', money(payload.laborTotal)],
    ['Итого услуги', '', '', '', '', '', money(payload.servicesTotal)],
    ['Полная сумма сметы', '', '', '', '', '', money(payload.grandTotal)],
  )

  const workbook = XLSX.utils.book_new()
  workbook.Props = {
    Title: 'Коммерческое предложение VSB39',
    Subject: 'Предварительная смета',
    Author: 'VSB39',
    CreatedDate: new Date(),
  }

  const estimateSheet = XLSX.utils.aoa_to_sheet(rows)
  applySheetLayout(estimateSheet, rows.length)
  decorateCells(estimateSheet)
  XLSX.utils.book_append_sheet(workbook, estimateSheet, 'Смета')

  const objectRows = [
    ['Параметр', 'Значение'],
    ['Клиент', payload.params.name || ''],
    ['Телефон', payload.params.phone || ''],
    ['Адрес', payload.params.address || ''],
    ['Тип объекта', payload.params.type || ''],
    ['Площадь, м2', payload.params.area || ''],
    ['Камер', payload.params.cameras || ''],
    ['Точек доступа', payload.params.accessPoints || ''],
    ['Пожарная сигнализация', payload.params.fireAlarm ? 'Да' : 'Нет'],
    ['Сеть/СКС', payload.params.network ? 'Да' : 'Нет'],
    ['Заметки', payload.params.notes || ''],
  ]
  const objectSheet = XLSX.utils.aoa_to_sheet(objectRows)
  objectSheet['!cols'] = [{ wch: 28 }, { wch: 72 }]
  XLSX.utils.book_append_sheet(workbook, objectSheet, 'Объект')

  XLSX.writeFile(workbook, `vsb39-kp-${formatDateSlug()}.xlsx`, { cellStyles: true })
}
