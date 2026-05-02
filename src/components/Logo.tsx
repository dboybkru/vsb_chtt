import { SITE_NAME } from '@/config/env'

export function Logo() {
  return (
    <a href="#top" className="logo" aria-label={SITE_NAME}>
      <span className="logo-mark">
        ВС<span>Б</span>
      </span>
      <span className="logo-copy">
        <strong>
          ВСБ<span>39</span>
        </strong>
        <small>Видим. Стережём. Бережём.</small>
      </span>
    </a>
  )
}
