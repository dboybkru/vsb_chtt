import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

const serviceLinks = [
  { to: '/services', label: 'Видеонаблюдение' },
  { to: '/services', label: 'СКУД' },
  { to: '/services', label: 'ОПС' },
  { to: '/services', label: 'СКС и сети' },
  { to: '/services', label: 'Проектирование' },
  { to: '/services', label: 'Обслуживание' },
]

const catalogLinks = [
  { to: '/catalog', label: 'Камеры' },
  { to: '/catalog', label: 'Регистраторы' },
  { to: '/catalog', label: 'СКУД' },
  { to: '/catalog', label: 'ОПС' },
  { to: '/catalog', label: 'Сетевое оборудование' },
  { to: '/catalog', label: 'Кабель' },
]

export default function Footer() {
  return (
    <footer className="bg-midnight border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1 — About */}
          <div>
            <div className="flex flex-col leading-tight mb-4">
              <span className="font-display font-bold text-[20px] text-guard-green tracking-tight">
                VSB39
              </span>
              <span className="text-[10px] text-text-muted tracking-[0.05em] uppercase">
                Ваша Система Безопасности
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              Профессиональные системы безопасности в Калининграде и области. Проектирование, монтаж, обслуживание.
            </p>
            <div className="flex items-start gap-2 text-sm text-text-muted">
              <MapPin size={16} className="mt-0.5 shrink-0 text-guard-green" />
              <span>г. Калининград, ул. Примерная, 123</span>
            </div>
          </div>

          {/* Column 2 — Services */}
          <div>
            <h4 className="font-display font-medium text-pure-white mb-4">Услуги</h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-muted hover:text-guard-green transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Catalog */}
          <div>
            <h4 className="font-display font-medium text-pure-white mb-4">Каталог</h4>
            <ul className="space-y-2.5">
              {catalogLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-muted hover:text-guard-green transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contacts */}
          <div>
            <h4 className="font-display font-medium text-pure-white mb-4">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-guard-green" />
                <span className="text-guard-green font-medium">+7 (4012) 39-39-39</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-text-muted" />
                <span className="text-sm text-text-muted">info@vsb39.ru</span>
              </div>
              <p className="text-sm text-text-muted">Пн–Пт 9:00–18:00</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <a href="https://t.me/vsb39" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-guard-green transition-colors" aria-label="Telegram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.98-3.46 3.8-1.58 4.59-1.85 5.1-1.86.11 0 .37.03.54.18.14.12.18.28.2.45-.01.06-.01.24-.02.38z"/>
                </svg>
              </a>
              <a href="https://wa.me/74012393939" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-guard-green transition-colors" aria-label="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.71 14.29c-.23.66-1.33 1.25-1.86 1.33-.49.07-.98.23-3.28-.68-2.78-1.09-4.57-3.91-4.71-4.09-.14-.18-1.12-1.49-1.12-2.84s.71-2.02.96-2.3c.25-.28.55-.35.73-.35l.52.01c.18 0 .37-.07.58.44.21.51.75 1.78.81 1.91.07.12.12.26.02.42-.1.16-.15.26-.3.4-.15.14-.31.32-.44.43-.14.12-.29.25-.12.49.17.24.75 1.24 1.62 2.01 1.11 1 2.04 1.32 2.32 1.47.29.14.48.12.66-.07.18-.2.76-.88.96-1.18.21-.3.42-.25.7-.15.29.1 1.82.86 2.13 1.01.32.15.53.22.61.35.07.12.07.71-.16 1.36z"/>
                </svg>
              </a>
              <a href="https://vk.com/vsb39" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-guard-green transition-colors" aria-label="VK">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.714-1.033-1.033-1.49-1.171-1.744-1.171-.356 0-.458.102-.458.593v1.575c0 .424-.136.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.994 4 8.604c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.862c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.744-.576.744z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-subtle mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; 2025 VSB39. Все права защищены.
          </p>
          <Link to="/privacy" className="text-sm text-text-muted hover:text-guard-green transition-colors">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  )
}
