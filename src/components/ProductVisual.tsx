import { Camera } from 'lucide-react'
import { categoryIcons } from '@/data/constants'
import { isImageUrl } from '@/utils/formatters'

export function ProductVisual({ category, photo }: { category: string; photo?: string }) {
  const Icon = categoryIcons[category] || Camera
  if (isImageUrl(photo)) {
    return (
      <div className="product-visual product-photo">
        <img src={photo} alt="" loading="lazy" />
      </div>
    )
  }
  return (
    <div className="product-visual">
      <div className="device-shadow" />
      <div className="device-card">
        <Icon size={38} strokeWidth={1.7} />
      </div>
    </div>
  )
}
