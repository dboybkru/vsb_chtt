import { GA_ID, YM_ID } from '@/config/env'

export function gtagEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.gtag && GA_ID) {
    window.gtag('event', eventName, params)
  }
}

export function ymGoal(goalId: string) {
  if (typeof window !== 'undefined' && window.ym && YM_ID) {
    window.ym(Number(YM_ID), 'reachGoal', goalId)
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    ym?: (id: number, method: string, goal: string) => void
    dataLayer?: unknown[]
  }
}
