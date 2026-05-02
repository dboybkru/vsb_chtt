export function formatMoney(value: number, unit = 'шт'): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value))} ₽${unit && unit !== 'шт' ? `/${unit}` : ''}`
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function normalize(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(',', '.')
    .trim()
}

export function parseNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const cleaned = String(value || '')
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

export function cellText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function isImageUrl(value: unknown): boolean {
  const text = cellText(value)
  return /^data:image\//i.test(text) || /^https?:\/\/.+\.(?:png|jpe?g|webp|gif)(?:[?#].*)?$/i.test(text)
}
