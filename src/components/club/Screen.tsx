import type { ReactNode } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import Coin from '../Coin'
import { ArrowLeft, ChartNoAxesColumn } from 'lucide-react'
import { toggleCardStats, useCardStats } from '../../lib/card-prefs'

/** Botón de las pantallas con cartas: enseñar u ocultar los 3 números de duelo dentro de las cartas (como MADFUT) */
export function StatsToggle() {
  const { t } = useAppSettings()
  const on = useCardStats()
  return (
    <button type="button" className={`hub-icon-btn stats-toggle ${on ? 'on' : ''}`} onClick={toggleCardStats}
      aria-pressed={on} aria-label={t('cards.statsToggle')} title={t('cards.statsToggle')}>
      <ChartNoAxesColumn size={20} />
    </button>
  )
}

/** Marco de las pantallas del club (tienda, mis cartas, colecciones, objetivos): cabecera con volver y monedas;
 *  con statsToggle, el botón de los números de duelo junto a las monedas */
export default function Screen({ title, children, statsToggle }: { title: string; children: ReactNode; statsToggle?: boolean }) {
  const { t } = useAppSettings()
  const { coins } = useClub()
  return (
    <div className="hub">
      <header className="hub-top safe-top">
        <div className="hub-top__row">
          <a href="#/" className="hub-icon-btn" aria-label={t('players.back')}><ArrowLeft size={20} /></a>
          <span className="hub-logo">{title}</span>
          <span className="flex items-center gap-2">
            {statsToggle && <StatsToggle />}
            <span className="coin-badge"><Coin /> {coins.toLocaleString()}</span>
          </span>
        </div>
      </header>
      <main className="fd-main"><div className="fd-step">{children}</div></main>
    </div>
  )
}
