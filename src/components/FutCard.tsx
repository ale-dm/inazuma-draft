import { useState } from 'react'
import type { Player } from '../types'
import { ALL_STAT_KEYS } from '../lib/power'
import { useAppSettings } from '../context/AppSettings'
import { RARITY_CLASS } from '../lib/packs'

const ELEMENT_ICON: Record<string, string> = { fire: '🔥', wood: '🌿', air: '💨', earth: '⛰️' }

interface Props {
  player: Player
  /** false en el modo Memoria: sin nota ni estadísticas */
  showStats?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

/** Carta estilo FUT: escudo con la nota, el puesto, el retrato y las 6 estadísticas */
export default function FutCard({ player, showStats = true, size = 'md', onClick }: Props) {
  const { t } = useAppSettings()
  const [failed, setFailed] = useState(false)
  const lastName = player.name.split(' ').slice(-1)[0]
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`fut-card fut-card--${RARITY_CLASS[player.category]} fut-card--${size}`}
      aria-label={`${player.name} ${player.ovr}`}
    >
      <div className="fut-card__head">
        {showStats && <span className="fut-card__ovr">{player.ovr}</span>}
        <span className="fut-card__pos">{player.position}</span>
        <span className="fut-card__el" aria-hidden>{ELEMENT_ICON[player.element]}</span>
      </div>
      <div className="fut-card__art">
        {player.image && !failed
          ? <img src={player.image} alt="" loading={size === 'lg' || size === 'md' ? 'eager' : 'lazy'} onError={() => setFailed(true)} />
          : <span className="fut-card__initials">{player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>}
      </div>
      <div className="fut-card__name">{lastName}</div>
      {showStats && (size === 'md' || size === 'lg') && (
        <div className="fut-card__stats">
          {ALL_STAT_KEYS.map(k => (
            <span key={k}>
              <small>{t(`stats.short.${k}`)}</small>
              <b>{player.stats[k]}</b>
            </span>
          ))}
        </div>
      )}
      <div className="fut-card__game">{player.game}</div>
    </Tag>
  )
}
