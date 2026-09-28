import type { Player } from '../types'
import { duelStats } from '../lib/duel'
import InaCard from './InaCard'

interface Props {
  player: Player
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  /** Resalta una de las 3 estadísticas (la acción elegida en el Duelo) */
  highlight?: 'att' | 'con' | 'def'
}

/**
 * Carta con la columna de combate del Duelo (estilo MADFUT/FC): 3 números en flechas de color a la derecha de la
 * carta — verde ataque, azul control de balón, rojo defensa (ver src/lib/duel.ts). Se calculan a partir de las
 * estadísticas propias del jugador, no son una estadística nueva. Se usa en el modo Duelo (fase 4).
 */
export default function DuelCard({ player, size = 'md', onClick, highlight }: Props) {
  const d = duelStats(player)
  return (
    <span className={`duel-card duel-card--${size}`}>
      <InaCard player={player} size={size} onClick={onClick} />
      <span className="duel-card__stats" aria-hidden>
        <b className={`duel-card__n duel-card__n--att ${highlight === 'att' ? 'is-on' : ''}`}>{d.att}</b>
        <b className={`duel-card__n duel-card__n--con ${highlight === 'con' ? 'is-on' : ''}`}>{d.con}</b>
        <b className={`duel-card__n duel-card__n--def ${highlight === 'def' ? 'is-on' : ''}`}>{d.def}</b>
      </span>
    </span>
  )
}
