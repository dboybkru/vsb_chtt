import { escapeHtml, formatMoney } from './formatters'
import type { EstimateLine } from '@/types'

export function printEstimateDocument({
  objectType,
  area,
  complexity,
  autoLines,
  manualLines,
  totals,
  metrics,
}: {
  objectType: string
  area: number | string
  complexity: string
  autoLines: EstimateLine[]
  manualLines: EstimateLine[]
  totals: { equipment: number; work: number; manual: number; total: number }
  metrics: { buildingLength: string; cameraQty: number; cableQty: number; switchQty: number }
}): boolean {
  const oldFrame = document.getElementById('estimate-print-frame')
  oldFrame?.remove()
  const frame = document.createElement('iframe')
  frame.id = 'estimate-print-frame'
  frame.title = 'Печатная смета ВСБ39'
  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '1px'
  frame.style.height = '1px'
  frame.style.border = '0'
  frame.style.opacity = '0'
  document.body.appendChild(frame)
  const printWindow = frame.contentWindow
  if (!printWindow) return false
  const complexityLabel = complexity === 'simple' ? 'простая' : complexity === 'hard' ? 'сложная' : 'стандартная'
  const row = (line: EstimateLine) => `
    <tr>
      <td><strong>${escapeHtml(line.name)}</strong><small>${escapeHtml(line.note || '')}</small></td>
      <td>${escapeHtml(String(line.qty))} ${escapeHtml(line.unit || 'шт')}</td>
      <td>${escapeHtml(formatMoney(line.price, line.unit))}</td>
      <td>${escapeHtml(formatMoney(line.price * line.qty))}</td>
    </tr>
  `
  const html = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8" /><title>Смета ВСБ39</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:28px;color:#07101e;font-family:Arial,sans-serif;background:#fff}
header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #07101e;padding-bottom:18px;margin-bottom:22px}
h1{margin:0;font-size:28px}h2{margin:24px 0 10px;font-size:17px}p{margin:6px 0;color:#4b5563}
.brand{font-weight:800;color:#ff6b2c}
.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}
.meta div{border:1px solid #dbe3ef;border-radius:8px;padding:10px}
.meta span{display:block;color:#64748b;font-size:12px}
.meta b{display:block;margin-top:4px;font-size:14px}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{border-bottom:1px solid #dbe3ef;padding:10px 8px;text-align:left;vertical-align:top}
th{color:#64748b;font-size:12px;text-transform:uppercase}
td:nth-child(2),td:nth-child(3),td:nth-child(4),th:nth-child(2),th:nth-child(3),th:nth-child(4){text-align:right;white-space:nowrap}
small{display:block;margin-top:4px;color:#64748b;line-height:1.35}
.summary{margin-left:auto;margin-top:18px;width:360px;border:1px solid #dbe3ef;border-radius:10px;padding:14px}
.summary div{display:flex;justify-content:space-between;gap:18px;padding:7px 0}
.summary .total{border-top:1px solid #dbe3ef;margin-top:8px;padding-top:12px;font-size:18px;font-weight:800}
footer{margin-top:28px;color:#64748b;font-size:12px}
@media print{body{padding:16mm}.summary{break-inside:avoid}}
</style>
</head>
<body>
<header><div><h1>Смета <span class="brand">ВСБ39</span></h1><p>Ваша Система Безопасности. Видим. Стережём. Бережём.</p></div>
<div><p><strong>Дата:</strong> ${escapeHtml(new Date().toLocaleDateString('ru-RU'))}</p><p><strong>Объект:</strong> ${escapeHtml(objectType)}, ${escapeHtml(String(area))} м²</p><p><strong>Сложность:</strong> ${escapeHtml(complexityLabel)}</p></div></header>
<section class="meta">
<div><span>Длина здания</span><b>${escapeHtml(metrics.buildingLength)} м</b></div>
<div><span>Камер</span><b>${escapeHtml(String(metrics.cameraQty))} шт</b></div>
<div><span>Кабель</span><b>${escapeHtml(String(metrics.cableQty))} м</b></div>
<div><span>PoE</span><b>${escapeHtml(String(metrics.switchQty))} шт</b></div>
</section>
<h2>Автоматический расчёт</h2>
<table><thead><tr><th>Позиция</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>${autoLines.map(row).join('')}</tbody></table>
${manualLines.length ? `<h2>Дополнительно из каталога</h2><table><thead><tr><th>Позиция</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>${manualLines.map(row).join('')}</tbody></table>` : ''}
<section class="summary">
<div><span>Оборудование</span><b>${escapeHtml(formatMoney(totals.equipment))}</b></div>
<div><span>Монтаж и настройка</span><b>${escapeHtml(formatMoney(totals.work))}</b></div>
<div><span>Дополнительно</span><b>${escapeHtml(formatMoney(totals.manual))}</b></div>
<div class="total"><span>Итого</span><b>${escapeHtml(formatMoney(totals.total))}</b></div>
</section>
<footer>Жёсткий диск для архива указывается в описании NVR и не включён в стоимость сметы.</footer>
</body></html>`
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  window.setTimeout(() => {
    printWindow.focus()
    printWindow.print()
  }, 250)
  return true
}
