import { MapPin, Phone } from 'lucide-react'
import { Logo } from './Logo'
import { navigateTo } from '@/utils/router'

export function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div>
        <Logo />
        <p>Инженерные системы безопасности для домов, офисов, складов и бизнеса в Калининграде и области.</p>
      </div>
      <div className="footer-links">
        <button onClick={() => navigateTo('catalog')}>Каталог</button>
        <button onClick={() => navigateTo('prices')}>База знаний</button>
        <button onClick={() => navigateTo('estimate')}>Смета</button>
        <a href="mailto:info@vsb39.ru">info@vsb39.ru</a>
      </div>
      <div className="footer-contact">
        <span>
          <MapPin size={17} />
          Калининград и область
        </span>
        <a href="tel:+74012390000">
          <Phone size={17} />
          +7 (4012) 39-00-00
        </a>
      </div>
    </footer>
  )
}
