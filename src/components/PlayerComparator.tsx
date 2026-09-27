import type { Player } from '../types'
import { POSITION_STAT_KEYS, displayStatValue, playerRating } from '../lib/power'
import { useAppSettings } from '../context/AppSettings'
import { teamName } from '../data/catalog'
import PlayerAvatar from './PlayerAvatar'

interface Props {
  a: Player
  b: Player
  mode: 'classic' | 'memory'
  onClear: () => void
}

export default function PlayerComparator({ a, b, mode, onClear }: Props) {
  const { t, locale } = useAppSettings()
  const statKeys = POSITION_STAT_KEYS[a.position]

  return (
    <div className="compare-panel iz-panel animate-slide-up">
      <div className="iz-panel-head flex items-center justify-between gap-2 !text-sm">
        <span>{t('compare.title')}</span>
        <button type="button" onClick={onClear} className="btn-secondary text-[0.65rem] py-1 px-2">
          {t('compare.clear')}
        </button>
      </div>
      <div className="iz-panel-body grid grid-cols-2 gap-3 sm:gap-4">
        {[a, b].map(player => (
          <div key={player.id} className="flex flex-col items-center gap-2 min-w-0">
            <PlayerAvatar player={player} size="md" variant="zukan" showRating={mode === 'classic' ? playerRating(player) : undefined} />
            <div className="text-center w-full min-w-0">
              <p className="font-heading font-bold text-sm text-iz-heading truncate">{player.name}</p>
              <p className="text-[0.65rem] text-iz-muted truncate">{player.position} · {teamName(player.team, locale)}</p>
            </div>
          </div>
        ))}
        {mode === 'classic' && (
          <div className="col-span-2 border-t divider-iz pt-3 space-y-1.5">
            <div className="flex justify-between text-xs font-heading font-bold text-iz-muted px-1">
              <span className="truncate max-w-[40%]">{a.name}</span>
              <span>{t('stats.rating')}</span>
              <span className="truncate max-w-[40%] text-right">{b.name}</span>
            </div>
            {statKeys.map(key => {
              const va = displayStatValue(a, key)
              const vb = displayStatValue(b, key)
              const na = Number(va)
              const nb = Number(vb)
              const aWins = na > nb
              const bWins = nb > na
              return (
                <div key={key} className="compare-stat-row">
                  <span className={`tabular-nums font-bold ${aWins ? 'text-emerald-600' : ''}`}>{va}</span>
                  <span className="text-[0.65rem] text-iz-muted uppercase tracking-wide">{t(`stats.${key}`)}</span>
                  <span className={`tabular-nums font-bold text-right ${bWins ? 'text-emerald-600' : ''}`}>{vb}</span>
                </div>
              )
            })}
            <div className="compare-stat-row font-heading">
              <span className={`tabular-nums font-black ${playerRating(a) > playerRating(b) ? 'text-inazuma' : ''}`}>
                {playerRating(a)}
              </span>
              <span className="text-[0.65rem] text-iz-muted uppercase">{t('stats.rating')}</span>
              <span className={`tabular-nums font-black text-right ${playerRating(b) > playerRating(a) ? 'text-inazuma' : ''}`}>
                {playerRating(b)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
