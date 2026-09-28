import type { ReactNode } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { ArrowLeft, X } from 'lucide-react'

interface Props {
  title: string
  children: ReactNode
  /** ✕ que cierra la partida y vuelve al inicio */
  onExit?: () => void
  /** ← a otra pantalla (p. ej. el explorador de jugadores vuelve al inicio) */
  backHref?: string
}

/** Marco de las pantallas de juego (draft FFI, alineación, torneo, resultado, jugadores) con el estilo de la app */
export default function GameShell({ title, children, onExit, backHref }: Props) {
  const { t } = useAppSettings()
  return (
    <div className="hub">
      <header className="hub-top safe-top">
        <div className="hub-top__row">
          {backHref
            ? <a href={backHref} className="hub-icon-btn" aria-label={t('players.back')}><ArrowLeft size={20} /></a>
            : <button type="button" className="hub-icon-btn" onClick={onExit} aria-label={t('fd.exit')}><X size={20} /></button>}
          <span className="hub-logo">{title}</span>
          <span className="w-10" />
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  )
}
