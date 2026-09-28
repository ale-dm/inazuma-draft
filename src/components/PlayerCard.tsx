import type { Player } from '../types'
import { POSITION_STAT_KEYS, displayStatValue, playerRating } from '../lib/power'
import { useAppSettings } from '../context/AppSettings'
import { teamName, techniqueName } from '../data/catalog'
import PlayerAvatar from './PlayerAvatar'

const POS_CLASS: Record<string, string> = {
  GK: 'pos-gk',
  DF: 'pos-df',
  MF: 'pos-mf',
  FW: 'pos-fw',
}

const ELEMENT_LABELS: Record<string, string> = {
  fire: '🔥', wood: '🌿', air: '💨', earth: '🪨',
}

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
        <span className={`px-1.5 py-0.5 rounded text-xs font-bold shrink-0 ${POS_CLASS[player.position]}`}>
          {player.position}
        </span>
        <span className="font-medium truncate text-iz-heading">{player.name}</span>
        <span className={`element-${player.element} text-xs ml-auto shrink-0`}>{ELEMENT_LABELS[player.element]}</span>
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
          ⇄
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
          <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold shrink-0 ${POS_CLASS[player.position]}`}>
            {player.position}
          </span>
        </div>
        <p className={`text-[0.65rem] element-${player.element} mb-1.5 truncate`}>
          {ELEMENT_LABELS[player.element]} {teamLabel ?? teamName(player.team, locale)}
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
          <div className="text-[0.65rem] text-hissatsu truncate font-heading mt-1.5">⚡ {techniqueName(player.techniques[0], locale)}</div>
        )}
      </div>
    </button>
  )
}
