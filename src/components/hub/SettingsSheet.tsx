import { useAppSettings } from '../../context/AppSettings'
import { LOCALES, type Locale } from '../../i18n/translations'
import Sheet from './Sheet'
import { SITE } from '../../config/site'
import { Coffee, ExternalLink, Moon, Sun, Volume2, VolumeX } from 'lucide-react'

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
          <b>{sound ? <Volume2 size={20} /> : <VolumeX size={20} />}</b>
        </button>
        <button type="button" onClick={toggleTheme} className="sheet-choice sheet-choice--row">
          <small>{t('settings.theme')}</small>
          <b>{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}</b>
        </button>
      </div>
      {/* créditos del proyecto original (antes en el pie de la web) */}
      <footer className="settings-credits">
        <p>{t('footer.tagline')}</p>
        <p>{t('footer.byBefore')}<a href={SITE.github} target="_blank" rel="noopener noreferrer">{SITE.author}</a></p>
        <a href={SITE.paypal} target="_blank" rel="noopener noreferrer"><Coffee size={14} /> {t('footer.support')} <ExternalLink size={12} /></a>
      </footer>
    </Sheet>
  )
}
