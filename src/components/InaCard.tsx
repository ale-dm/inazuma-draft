import { useRef, useState } from 'react'
import type { Player } from '../types'
import { useAppSettings } from '../context/AppSettings'
import { teamLogo, teamName } from '../data/catalog'
import { RARITY_CLASS } from '../lib/packs'
import { duelStats, type DuelKey, type DuelStats } from '../lib/duel'
import { useCardStats } from '../lib/card-prefs'
import { ElementIcon, PositionIcon } from './GameIcon'

/** Cartas sin equipo propio: sin escudo */
const NO_TEAM = new Set(['Unaffiliated', 'Sub Character'])
const LONG_PRESS_MS = 420

interface Props {
  player: Player
  /** false en el modo Memoria: sin la media ni los números */
  showRating?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  /** Mantener pulsada: abre la ficha (stats y técnicas) sin ejecutar onClick */
  onLongPress?: () => void
  /** Números de duelo dentro de la carta: true/false fuerza; sin poner, la preferencia (botón de las pantallas) */
  stats?: boolean
  /** Resalta uno de los 3 números (la acción del Duelo) */
  highlight?: DuelKey
  /** Números a enseñar (en el Duelo, ya con química y boost) */
  values?: DuelStats
}

/**
 * Carta de Inazuma, con la distribución de las cartas de MADFUT/FC: a la izquierda media, puesto, afinidad y escudo
 * del equipo; la foto grande; el nombre abajo; a la derecha, los 3 números de duelo (verde ataque, azul control, rojo
 * defensa) o, si están ocultos, el juego de la carta. Color por rareza (Victory Road) y esquinas cortadas. Mantener
 * pulsada abre la ficha (onLongPress) en vez de la acción normal de onClick.
 */
export default function InaCard({ player, showRating = true, size = 'md', onClick, onLongPress, stats, highlight, values }: Props) {
  const { locale } = useAppSettings()
  const pref = useCardStats()
  const [failed, setFailed] = useState(false)
  const [badgeFailed, setBadgeFailed] = useState(false)
  const Tag = onClick ? 'button' : 'div'
  const surname = player.name.split(' ').slice(-1)[0]
  const logo = !NO_TEAM.has(player.team) && !badgeFailed ? teamLogo(player.team, player.game) : undefined
  const withStats = (stats ?? pref) && showRating
  const d = withStats ? values ?? duelStats(player) : null
  const small = size === 'xs'

  const pressTimer = useRef<number | undefined>(undefined)
  const longPressed = useRef(false)
  const startPress = () => {
    if (!onLongPress) return
    longPressed.current = false
    pressTimer.current = window.setTimeout(() => { longPressed.current = true; onLongPress() }, LONG_PRESS_MS)
  }
  const clearPress = () => window.clearTimeout(pressTimer.current)
  const handleClick = () => {
    if (longPressed.current) { longPressed.current = false; return }
    onClick?.()
  }

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick ? handleClick : undefined}
      onPointerDown={onLongPress ? startPress : undefined}
      onPointerUp={onLongPress ? clearPress : undefined}
      onPointerLeave={onLongPress ? clearPress : undefined}
      onContextMenu={onLongPress ? (e) => e.preventDefault() : undefined}
      className={`ic ic--${RARITY_CLASS[player.category]} ic--${size} ${withStats ? 'ic--stats' : ''}`}
      aria-label={`${player.name} · ${player.position}${showRating ? ` · ${player.ovr}` : ''}`}
    >
      <span className="ic__glow" aria-hidden />
      {player.image && !failed
        ? <img className="ic__photo" src={player.image} alt="" loading={size === 'xs' || size === 'sm' ? 'lazy' : 'eager'} onError={() => setFailed(true)} />
        : <span className="ic__initials" aria-hidden>{player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>}
      <span className="ic__side">
        {showRating && <span className="ic__ovr">{player.ovr}</span>}
        <PositionIcon position={player.position} className="ic__pos" />
        <ElementIcon element={player.element} className="ic__el" />
        {logo && <img className="ic__crest" src={logo} alt="" title={teamName(player.team, locale)} onError={() => setBadgeFailed(true)} />}
      </span>
      {d ? (
        <span className="ic__stats" aria-hidden>
          {(['att', 'con', 'def'] as const).map(k => (
            <b key={k} className={`ic__stat ic__stat--${k} ${highlight === k ? 'is-on' : ''}`}>{d[k]}</b>
          ))}
        </span>
      ) : (
        !small && <span className="ic__chip">{player.game}</span>
      )}
      <span className="ic__foot">
        <span className="ic__name">{small ? surname : player.name}</span>
        {!small && (withStats || !logo) && (
          <span className="ic__team">{!logo && !NO_TEAM.has(player.team) ? `${teamName(player.team, locale)} · ` : ''}{player.game}</span>
        )}
      </span>
    </Tag>
  )
}
