import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Calculator, LayoutGrid } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/services', label: 'Услуги' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/solutions', label: 'Решения' },
  { to: '/ai', label: 'ИИ-Агент' },
  { to: '/about', label: 'О нас' },
  { to: '/contact', label: 'Контакты' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? 'bg-midnight/80 backdrop-blur-[20px] border-b border-border-subtle'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] md:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-tight">
            <span className="font-display font-bold text-[20px] text-guard-green tracking-tight">
              VSB39
            </span>
            <span className="text-[10px] text-text-muted tracking-[0.05em] uppercase">
              Ваша Система Безопасности
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors duration-200 hover:text-guard-green ${
                  location.pathname === link.to ? 'text-guard-green' : 'text-text-body'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-guard-green rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/catalog"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-guard-green text-guard-green text-sm font-semibold hover:bg-guard-green/10 transition-colors"
            >
              <LayoutGrid size={16} />
              Каталог
            </Link>
            <Link
              to="/estimate"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-guard text-white text-sm font-semibold hover:brightness-110 transition-all"
            >
              <Calculator size={16} />
              Заказать смету
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-pure-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] bg-midnight/95 backdrop-blur-lg z-[99]">
          <nav className="flex flex-col items-center justify-center gap-8 h-full pb-20">
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-2xl font-display font-semibold text-pure-white hover:text-guard-green transition-colors"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-4 mt-4 w-full max-w-xs px-6">
              <Link
                to="/estimate"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg gradient-guard text-white font-semibold"
              >
                <Calculator size={18} />
                Заказать смету
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
