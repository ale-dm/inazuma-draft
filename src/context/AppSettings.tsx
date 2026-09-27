import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKey } from '../i18n/translations'
import { setSfxEnabled } from '../lib/sfx'

export type Theme = 'dark' | 'light'

type Vars = Record<string, string | number>

interface AppSettingsContextValue {
  theme: Theme
  locale: Locale
  sound: boolean
  setTheme: (t: Theme) => void
  setLocale: (l: Locale) => void
  toggleTheme: () => void
  toggleSound: () => void
  t: (key: TranslationKey, vars?: Vars) => string
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)

function interpolate(template: string, vars?: Vars) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))
}

function readStored<T extends string>(key: string, fallback: T, allowed: T[]): T {
  try {
    const v = localStorage.getItem(key) as T
    return allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

function browserLocale(): Locale {
  try {
    const lang = navigator.language.slice(0, 2).toLowerCase()
    return lang === 'es' || lang === 'en' ? lang : 'fr'
  } catch {
    return 'fr'
  }
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStored('iz-theme', 'light', ['dark', 'light']))
  const [locale, setLocaleState] = useState<Locale>(() => readStored('iz-locale', browserLocale(), ['fr', 'en', 'es']))
  const [sound, setSoundState] = useState(() => readStored('iz-sound', 'on', ['on', 'off']) === 'on')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('iz-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem('iz-locale', locale)
  }, [locale])

  useEffect(() => {
    setSfxEnabled(sound)
    localStorage.setItem('iz-sound', sound ? 'on' : 'off')
  }, [sound])

  const setTheme = (t: Theme) => setThemeState(t)
  const setLocale = (l: Locale) => setLocaleState(l)
  const toggleTheme = () => setThemeState(t => (t === 'dark' ? 'light' : 'dark'))
  const toggleSound = () => setSoundState(s => !s)

  const t = (key: TranslationKey, vars?: Vars) =>
    interpolate(translations[locale][key], vars)

  return (
    <AppSettingsContext.Provider value={{ theme, locale, sound, setTheme, setLocale, toggleTheme, toggleSound, t }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) throw new Error('useAppSettings outside provider')
  return ctx
}
