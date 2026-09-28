import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LOCALES, translations, type Locale, type TranslationKey } from '../i18n/translations'
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

/** Idioma del dispositivo: el primero de sus idiomas preferidos que tengamos (es-MX → es, it-IT → it…); si no, inglés */
function browserLocale(): Locale {
  try {
    const prefs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const tag of prefs) {
      const lang = tag.slice(0, 2).toLowerCase() as Locale
      if (LOCALES.includes(lang)) return lang
    }
  } catch {
    /* sin navigator (prerender) */
  }
  return 'en'
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStored('iz-theme', 'light', ['dark', 'light']))
  const [locale, setLocaleState] = useState<Locale>(() => readStored('iz-lang', browserLocale(), [...LOCALES]))
  const [sound, setSoundState] = useState(() => readStored('iz-sound', 'on', ['on', 'off']) === 'on')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('iz-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    setSfxEnabled(sound)
    localStorage.setItem('iz-sound', sound ? 'on' : 'off')
  }, [sound])

  const setTheme = (t: Theme) => setThemeState(t)
  // solo se guarda la elección manual: sin ella, cada visita sigue el idioma del dispositivo
  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem('iz-lang', l)
    } catch {
      /* almacenamiento bloqueado */
    }
  }
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
