import type { Player } from '../types'
import type { DuelKey, DuelStats } from '../lib/duel'
import InaCard from './InaCard'

interface Props {
  player: Player
  size?: 'xs' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  /** Resalta una de las 3 estadísticas (la acción elegida en el Duelo) */
  highlight?: DuelKey
  /** Números ya con química y boost */
  values?: DuelStats
  /** Diferencia por química + boost (+2, −3…) */
  mod?: number
}

/** Carta del Duelo: la carta normal con los 3 números de combate siempre a la vista (ver src/lib/duel.ts) */
export default function DuelCard({ player, size = 'md', onClick, highlight, values, mod }: Props) {
  return (
    <span className="duel-slot">
      <InaCard player={player} size={size} onClick={onClick} stats highlight={highlight} values={values} />
      {!!mod && <span className={`duel-mod ${mod > 0 ? 'is-up' : 'is-down'}`}>{mod > 0 ? `+${mod}` : mod}</span>}
    </span>
  )
}
