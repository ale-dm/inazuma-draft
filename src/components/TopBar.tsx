import { useState } from 'react'
import { useAppSettings } from '../context/AppSettings'
import RulesModal from './RulesModal'

export default function TopBar() {
  const { theme, locale, sound, setLocale, toggleTheme, toggleSound, t } = useAppSettings()
  const [rulesOpen, setRulesOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 iz-nav safe-top">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 min-h-[3rem]">
          <div className="flex items-center gap-2 shrink-0 z-10 min-w-[4.5rem]">
            <button type="button" onClick={() => setRulesOpen(true)} className="iz-nav-btn min-h-[2.25rem]">
              <span aria-hidden>📖</span>
              <span className="hidden sm:inline ml-1">{t('nav.rules')}</span>
            </button>
          </div>

          <a
            href={import.meta.env.BASE_URL}
            className="min-w-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity iz-nav-title max-w-[50%]"
          >
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded shadow-md shrink-0" width={32} height={32} />
            <span className="font-heading font-black text-xs sm:text-sm tracking-tight truncate">
              <span className="text-[#ffe566]">FFI</span>
              <span> 6-0</span>
            </span>
          </a>

          <div className="flex items-center gap-1 shrink-0 z-10 min-w-[4.5rem] justify-end">
            <div className="seg-group">
              {(['es', 'fr', 'en'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`seg-btn seg-btn--sm min-h-[2rem] min-w-[2rem] ${locale === l ? 'seg-btn--on' : 'seg-btn--off'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className="iz-nav-btn min-h-[2.25rem] min-w-[2.25rem] flex items-center justify-center"
              title={sound ? t('nav.sound.off') : t('nav.sound.on')}
            >
              {sound ? '🔊' : '🔇'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="iz-nav-btn ml-0.5 min-h-[2.25rem] min-w-[2.25rem] flex items-center justify-center"
              title={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  )
}
