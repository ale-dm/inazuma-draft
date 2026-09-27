import { useAppSettings } from '../context/AppSettings'

interface Props {
  mode: 'classic' | 'memory'
  seed: string | null
  onModeChange: (mode: 'classic' | 'memory') => void
  onStart: () => void
}

const FEATURES = ['landing.feat.players', 'landing.feat.games', 'landing.feat.ffi'] as const

export default function Landing({ mode, seed, onModeChange, onStart }: Props) {
  const { t } = useAppSettings()

  return (
    <section className="landing-hero w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-fade-in">
      <div className="landing-hero__grid grid lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,440px)] gap-5 sm:gap-6 lg:gap-7 items-center">
        <div className="landing-hero__brand text-center lg:text-left order-2 lg:order-1">
          <p className="landing-hero__eyebrow">{t('landing.subtitle')}</p>
          <h1 className="landing-hero__title">
            <span className="text-inazuma block">INAZUMA</span>
            <span className="landing-hero__draft block">DRAFT</span>
          </h1>
          <p className="landing-hero__tagline text-iz-text">{t('landing.tagline1')}</p>
          <p className="landing-hero__tagline text-iz-muted mb-5">{t('landing.tagline2')}</p>

          <ul className="landing-features flex flex-wrap justify-center lg:justify-start gap-2.5">
            {FEATURES.map(key => (
              <li key={key} className="landing-feature">
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-panel iz-panel order-1 lg:order-2 w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 shadow-xl">
          <div className="iz-panel-head text-center">{t('landing.subtitle')}</div>
          <div className="iz-panel-body text-center">
            <p className="text-sm font-heading font-bold uppercase tracking-widest text-iz-muted mb-5">
              {t('landing.mode.label')}
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4">
              {(['classic', 'memory'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModeChange(m)}
                  className={`landing-mode-btn ${mode === m ? 'landing-mode-btn--on' : 'landing-mode-btn--off'}`}
                >
                  <span className="landing-mode-btn__label">
                    {m === 'classic' ? t('landing.mode.classic') : t('landing.mode.memory')}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-sm text-iz-muted mb-4 min-h-[2.75rem] leading-relaxed px-1">
              {mode === 'classic' ? t('landing.mode.classicHint') : t('landing.mode.memoryHint')}
            </p>

            {seed && (
              <p className="text-xs text-iz-cyan mb-4 px-2 py-2 rounded border divider-iz bg-iz-deep/40">
                {t('seed.sharedRun', { seed })}
              </p>
            )}

            <button
              type="button"
              onClick={onStart}
              className="btn-primary w-full animate-pulse-gold text-lg sm:text-xl px-10 sm:px-14 min-h-[3.5rem]"
            >
              {t('landing.play')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
