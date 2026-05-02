import { useEffect } from 'react'
import { routeMeta } from '@/config/seo'
import { SITE_URL } from '@/config/env'
import type { RouteKey } from '@/types'

export function useSeo(route: RouteKey) {
  const meta = routeMeta[route] || routeMeta.home
  const path = route === 'home' ? '/' : `/${route}`
  const canonical = `${SITE_URL}${path}`

  useEffect(() => {
    document.title = meta.title
  }, [meta.title])

  return { meta, canonical, path }
}
