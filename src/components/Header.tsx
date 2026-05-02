import { useState } from 'react'
import { Calculator, Phone, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { navigateTo } from '@/utils/router'

const navItems = [
  ['home', 'Услуги'],
  ['catalog', 'Каталог'],
  ['prices', 'Прайсы'],
  ['estimate', 'Смета'],
  ['about', 'Компания'],
] as const

export function Header({ route, estimateCount }: { route: string; estimateCount: number }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <button className="logo-button" onClick={() => navigateTo('home')}>
        <Logo />
      </button>
      <nav className={open ? 'nav nav-open' : 'nav'}>
        {navItems.map(([target, label]) => (
          <button
            key={target}
            className={route === target ? 'nav-active' : ''}
            onClick={() => {
              navigateTo(target)
              setOpen(false)
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="estimate-link" onClick={() => navigateTo('estimate')}>
          <Calculator size={17} />
          Смета {estimateCount > 0 && <span>{estimateCount}</span>}
        </button>
        <a className="call-link" href="tel:+74012390000">
          <Phone size={17} />
          Звонок
        </a>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Меню">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
