import type { Player } from '../types'
import type { DuelKey } from '../lib/duel'
import InaCard from './InaCard'

interface Props {
  player: Player
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  /** Resalta una de las 3 estadísticas (la acción elegida en el Duelo) */
  highlight?: DuelKey
}

/** Carta del Duelo: la carta normal con los 3 números de combate siempre a la vista (ver src/lib/duel.ts) */
export default function DuelCard({ player, size = 'md', onClick, highlight }: Props) {
  return <InaCard player={player} size={size} onClick={onClick} stats highlight={highlight} />
}
