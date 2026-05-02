export function routeFromLocation(): string {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const hash = window.location.hash.replace('#', '')
  if (path === '/admin') return 'admin'
  if (path === '/catalog' || hash === 'catalog') return 'catalog'
  if (path === '/prices') return 'prices'
  if (path === '/estimate' || hash === 'estimate') return 'estimate'
  if (path === '/about' || hash === 'about') return 'about'
  return 'home'
}

export function navigateTo(route: string): void {
  const path = route === 'home' ? '/' : `/${route}`
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
