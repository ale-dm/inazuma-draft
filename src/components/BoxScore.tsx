import { useMemo } from 'react'
import { DEFAULT_FORMATION, getFormationSlotsByLine, type FormationId, type LineupMap, isSlotValid } from '../lib/lineup'
import { lineupPower, playerRating } from '../lib/power'
import { useAppSettings } from '../context/AppSettings'
import PlayerAvatar from './PlayerAvatar'
import { Check, X } from 'lucide-react'

interface Props {
  lineup: LineupMap
  formationId?: FormationId
  onSlotClick?: (slotId: import('../lib/lineup').SlotId) => void
  selectedSlot?: import('../lib/lineup').SlotId | null
  strict?: boolean
  showPower?: boolean
}

export default function BoxScore({ lineup, formationId = DEFAULT_FORMATION, onSlotClick, selectedSlot, strict, showPower }: Props) {
  const { t } = useAppSettings()
  const slots = getFormationSlotsByLine(formationId)
  const filled = slots.filter(s => lineup[s.id]).length
  const totalPower = useMemo(() => lineupPower(lineup, formationId), [lineup, formationId])

  return (
    <div className="iz-panel">
      <div className="iz-panel-head flex justify-between items-center">
        <span>{t('box.title')}</span>
        <span className="text-[#ffe566] tabular-nums">{filled}/11</span>
      </div>
      {showPower && (
        <div className="px-3 py-2 text-xs text-iz-muted border-b divider-iz">
          {t('stats.teamPower')}{' '}
          <span className="text-iz-blue font-bold tabular-nums">{totalPower}</span>
        </div>
      )}
      <div>
        {slots.map(slot => {
          const player = lineup[slot.id]
          const isSelected = selectedSlot === slot.id
          const valid = !player || !strict || isSlotValid(lineup, slot.id, formationId)
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSlotClick?.(slot.id)}
              className={`box-row w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm min-h-[2.75rem]
                ${isSelected ? 'box-row--selected' : ''}
                ${!valid ? 'bg-red-50 dark:bg-red-950/40' : ''}
                ${onSlotClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="w-7 text-[0.65rem] font-bold text-iz-muted">{slot.role}</span>
              {player ? (
                <>
                  <PlayerAvatar player={player} size="sm" variant="zukan" />
                  <span className="truncate font-medium flex-1 text-iz-heading text-xs">{player.name}</span>
                  <span className={`text-[0.65rem] font-bold shrink-0 ${valid ? 'text-emerald-600' : 'text-red-500'}`}>
                    {showPower && (
                      <span className="text-iz-blue mr-1 tabular-nums">{playerRating(player)}</span>
                    )}
                    {valid ? <Check size={14} className="inline" /> : <X size={14} className="inline" />}
                  </span>
                </>
              ) : (
                <span className="text-iz-muted/50 text-xs italic">—</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
