import type { Player } from '../types'
import { POSITION_STAT_KEYS, displayStatValue, playerRating } from '../lib/power'
import { useAppSettings } from '../context/AppSettings'
import { teamLogo, teamName, techniqueName } from '../data/catalog'
import PlayerAvatar from './PlayerAvatar'
import { ElementIcon, PositionIcon, TechniqueIcon } from './GameIcon'
import { ArrowLeftRight } from 'lucide-react'


interface Props {
  player: Player
  mode: 'classic' | 'memory'
  onClick?: () => void
  onCompare?: () => void
  inCompare?: boolean
  selected?: boolean
  compact?: boolean
  disabled?: boolean
  teamLabel?: string
}

export default function PlayerCard({ player, mode, onClick, onCompare, inCompare, selected, compact, disabled, teamLabel }: Props) {
  const { t, locale } = useAppSettings()

  if (compact) {
    return (
      <div
        className={`player-chip player-chip--${player.element} flex items-center gap-2 px-2 py-1.5 rounded text-sm
          ${selected ? 'player-chip--selected' : ''} ${disabled ? 'opacity-40' : ''}`}
      >
        <PlayerAvatar player={player} size="sm" variant="zukan" />
        <PositionIcon position={player.position} className="h-4 shrink-0" />
        <span className="font-medium truncate text-iz-heading">{player.name}</span>
        <ElementIcon element={player.element} className="w-5 h-5 ml-auto shrink-0" />
      </div>
    )
  }

  const rating = playerRating(player)
  const statKeys = POSITION_STAT_KEYS[player.position]
  const interactive = onClick && !disabled

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`zukan-player-card zukan-player-card--${player.element}
        ${selected ? 'zukan-player-card--selected' : ''}
        ${inCompare ? 'zukan-player-card--compare' : ''}
        ${disabled ? 'zukan-player-card--disabled' : ''}`}
    >
      {onCompare && (
        <span
          role="button"
          tabIndex={0}
          aria-label={t('compare.pin')}
          onClick={e => { e.stopPropagation(); onCompare() }}
          onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onCompare() } }}
          className={`compare-pin-btn ${inCompare ? 'compare-pin-btn--on' : ''}`}
        >
          <ArrowLeftRight size={14} />
        </span>
      )}
      <PlayerAvatar
        player={player}
        size="md"
        variant="zukan"
        showRating={mode === 'classic' ? rating : undefined}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <h4 className="font-heading font-bold text-sm text-iz-heading truncate leading-tight">{player.name}</h4>
          <PositionIcon position={player.position} className="h-4 shrink-0" />
        </div>
        <p className={`text-[0.65rem] element-${player.element} mb-1.5 truncate flex items-center gap-1`}>
          <ElementIcon element={player.element} className="w-4 h-4 align-text-bottom shrink-0" />
          {!teamLabel && teamLogo(player.team, player.game) && <img className="ic__badge" src={teamLogo(player.team, player.game)} alt="" />}
          <span className="truncate">{teamLabel ?? (teamLogo(player.team, player.game) ? player.game : teamName(player.team, locale))}</span>
        </p>
        {mode === 'classic' && (
          <div className="flex flex-wrap gap-1">
            {statKeys.map(key => (
              <span key={key} className="zukan-stat-pill">
                <span>{t(`stats.${key}`)}</span>
                <strong className="tabular-nums">{displayStatValue(player, key)}</strong>
              </span>
            ))}
          </div>
        )}
        {mode === 'classic' && player.techniques[0] && (
          <div className="text-[0.65rem] text-hissatsu truncate font-heading mt-1.5 flex items-center gap-1">
            <TechniqueIcon type={player.techniques[0].type} traits={player.techniques[0].traits} className="w-4 h-4 shrink-0" /> {techniqueName(player.techniques[0], locale)}
          </div>
        )}
      </div>
    </button>
  )
}
