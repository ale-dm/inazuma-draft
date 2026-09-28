import { useState } from 'react'
import type { Player } from '../types'
import { useAppSettings } from '../context/AppSettings'
import { teamLogo, teamName } from '../data/catalog'
import { RARITY_CLASS } from '../lib/packs'
import { ElementIcon, PositionIcon } from './GameIcon'

/** Cartas sin equipo propio: solo se enseña el juego */
const NO_TEAM = new Set(['Unaffiliated', 'Sub Character'])

interface Props {
  player: Player
  /** false en el modo Memoria: sin la media */
  showRating?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

/**
 * Carta de Inazuma (estilo propio): esquinas cortadas en diagonal y líneas de velocidad sobre el color de la rareza
 * (colores de Victory Road, según la media). Media, icono de puesto y de afinidad, foto grande, nombre y equipo.
 */
export default function InaCard({ player, showRating = true, size = 'md', onClick }: Props) {
  const { locale } = useAppSettings()
  const [failed, setFailed] = useState(false)
  const [badgeFailed, setBadgeFailed] = useState(false)
  const Tag = onClick ? 'button' : 'div'
  const surname = player.name.split(' ').slice(-1)[0]
  const logo = !NO_TEAM.has(player.team) && !badgeFailed ? teamLogo(player.team) : undefined

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`ic ic--${RARITY_CLASS[player.category]} ic--${size}`}
      aria-label={`${player.name} · ${player.position}${showRating ? ` · ${player.ovr}` : ''}`}
    >
      <span className="ic__glow" aria-hidden />
      {player.image && !failed
        ? <img className="ic__photo" src={player.image} alt="" loading={size === 'xs' || size === 'sm' ? 'lazy' : 'eager'} onError={() => setFailed(true)} />
        : <span className="ic__initials" aria-hidden>{player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>}
      <span className="ic__head">
        {showRating && <span className="ic__ovr">{player.ovr}</span>}
        <PositionIcon position={player.position} className="ic__pos" />
      </span>
      <ElementIcon element={player.element} className="ic__el" />
      <span className="ic__foot">
        <span className="ic__name">{size === 'xs' ? surname : player.name}</span>
        {size !== 'xs' && (
          <span className="ic__team">
            {!NO_TEAM.has(player.team) && (
              logo
                ? <img className="ic__badge" src={logo} alt="" onError={() => setBadgeFailed(true)} />
                : <>{teamName(player.team, locale)}{' · '}</>
            )}
            {logo ? ' · ' : ''}{player.game}
          </span>
        )}
      </span>
    </Tag>
  )
}
