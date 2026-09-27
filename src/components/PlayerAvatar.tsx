import { useState } from 'react'
import type { Player } from '../types'
import { getPlayerImage } from '../data/player-images'

const ELEMENT_BG: Record<string, string> = {
  fire: 'from-orange-500 to-red-700',
  wood: 'from-emerald-500 to-emerald-800',
  air: 'from-sky-400 to-blue-600',
  earth: 'from-amber-500 to-amber-800',
}

interface Props {
  player: Player
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'round' | 'zukan'
  className?: string
  showRating?: number
}

const SIZES = {
  round: { xs: 'w-7 h-7', sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' },
  zukan: { xs: 'w-8 h-8', sm: 'w-11 h-11', md: 'w-[4.5rem] h-[4.5rem]', lg: 'w-24 h-24' },
}

export default function PlayerAvatar({ player, size = 'md', variant = 'round', className = '', showRating }: Props) {
  const [failed, setFailed] = useState(false)
  const src = getPlayerImage(player)
  const dim = SIZES[variant][size]
  const isZukan = variant === 'zukan'

  if (isZukan) {
    const inner = src && !failed ? (
      <img
        src={src}
        alt={player.name}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover object-top"
      />
    ) : (
      <div className={`zukan-portrait__fallback bg-gradient-to-b ${ELEMENT_BG[player.element]}`}>
        {player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
    )
    return (
      <div className={`zukan-portrait ${dim} ${className}`}>
        {inner}
        {showRating != null && (
          <span className="zukan-rating-badge tabular-nums">{showRating}</span>
        )}
      </div>
    )
  }

  const roundClass = `shrink-0 rounded-full object-cover object-top border border-iz-blue/40 bg-iz-card ${dim} ${className}`

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={player.name}
        onError={() => setFailed(true)}
        className={roundClass}
      />
    )
  }

  return (
    <div className={`${roundClass} bg-gradient-to-b ${ELEMENT_BG[player.element]} flex items-center justify-center font-heading font-bold text-white text-[0.55rem] sm:text-xs`}>
      {player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
    </div>
  )
}
