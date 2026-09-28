import type { ReactNode } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'

/** Marco de las pantallas del club (tienda, mis cartas, colecciones, objetivos): cabecera con volver y monedas */
export default function Screen({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useAppSettings()
  const { coins } = useClub()
  return (
    <div className="hub">
      <header className="hub-top safe-top">
        <div className="hub-top__row">
          <a href="#/" className="hub-icon-btn" aria-label={t('players.back')}>←</a>
          <span className="hub-logo">{title}</span>
          <span className="coin-badge">🪙 {coins.toLocaleString()}</span>
        </div>
      </header>
      <main className="fd-main"><div className="fd-step">{children}</div></main>
    </div>
  )
}
