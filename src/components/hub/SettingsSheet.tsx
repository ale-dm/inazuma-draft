import { useAppSettings } from '../../context/AppSettings'
import { LOCALES, type Locale } from '../../i18n/translations'
import Sheet from './Sheet'

const LANGUAGE_NAME: Record<Locale, string> = { en: 'English', es: 'Español', fr: 'Français', it: 'Italiano' }

/** Ajustes: idioma, sonido y tema */
export default function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale, setLocale, sound, toggleSound, theme, toggleTheme } = useAppSettings()

  return (
    <Sheet open={open} title={t('hub.settings')} onClose={onClose}>
      <h3 className="sheet-label">{t('settings.language')}</h3>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {LOCALES.map(l => (
          <button key={l} type="button" onClick={() => setLocale(l)} className={`sheet-choice sheet-choice--row ${locale === l ? 'on' : ''}`}>
            <b>{LANGUAGE_NAME[l]}</b>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={toggleSound} className="sheet-choice sheet-choice--row">
          <small>{t('settings.sound')}</small>
          <b>{sound ? '🔊' : '🔇'}</b>
        </button>
        <button type="button" onClick={toggleTheme} className="sheet-choice sheet-choice--row">
          <small>{t('settings.theme')}</small>
          <b>{theme === 'dark' ? '🌙' : '☀️'}</b>
        </button>
      </div>
    </Sheet>
  )
}
