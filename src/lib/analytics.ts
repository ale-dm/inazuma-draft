import type { PostHog } from 'posthog-js'

// PostHog solo se descarga si hay clave (VITE_PUBLIC_POSTHOG_KEY); los eventos de antes de que cargue se encolan
const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
let client: Promise<PostHog> | null = null

export function initAnalytics() {
  if (!key || client) return
  client = import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    })
    return posthog
  })
}

export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  client?.then(p => p.capture(name, props)).catch(() => {})
}

export function isAnalyticsEnabled() {
  return client !== null
}
