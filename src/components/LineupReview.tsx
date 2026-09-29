import { useState } from 'react'
import type { Player } from '../types'
import {
  canPlace,
  getFormation,
  getFormationSlots,
  getSlot,
  isSlotValid,
  lineupToArray,
  placePlayer,
  type FormationId,
  type LineupMap,
  type SlotId,
} from '../lib/lineup'
import { useAppSettings } from '../context/AppSettings'
import PitchFormation from './PitchFormation'
import BoxScore from './BoxScore'
import InaCard from './InaCard'
import ExportTeamButton from './ExportTeamButton'
import { lineupPower } from '../lib/power'

interface Props {
  players: Player[]
  lineup: LineupMap
  formationId: FormationId
  mode: 'classic' | 'memory'
  onLineupChange: (lineup: LineupMap) => void
  onConfirm: () => void
}

export default function LineupReview({ players, lineup: initialLineup, formationId, mode, onLineupChange, onConfirm }: Props) {
  const { t } = useAppSettings()
  const [lineup, setLineup] = useState<LineupMap>(initialLineup)
  const [selectedSlot, setSelectedSlot] = useState<SlotId | null>(null)
  const [movingPlayer, setMovingPlayer] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formation = getFormation(formationId)
  const slots = getFormationSlots(formationId)
  const all = lineupToArray(lineup, formationId)
  const totalPower = lineupPower(lineup, formationId)
  const isValid = slots.every(s => lineup[s.id] && isSlotValid(lineup, s.id, formationId)) && all.length === players.length

  function handleSlotClick(slotId: SlotId) {
    setError(null)
    const slot = getSlot(slotId, formationId)
    if (!slot) return
    const occupant = lineup[slotId]

    if (movingPlayer) {
      if (!canPlace(movingPlayer, slot)) {
        setError(t('lineup.err.cantPlace', { name: movingPlayer.name, pos: movingPlayer.position, role: slot.role }))
        return
      }
      const next = placePlayer(lineup, movingPlayer, slotId, formationId)
      if (!next) {
        setError(t('lineup.err.swap'))
        return
      }
      setLineup(next)
      onLineupChange(next)
      setMovingPlayer(null)
      setSelectedSlot(null)
      return
    }

    if (occupant) {
      setMovingPlayer(occupant)
      setSelectedSlot(slotId)
    } else {
      setSelectedSlot(prev => prev === slotId ? null : slotId)
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-xl sm:text-2xl font-bold mb-1 text-iz-heading">
          {t('lineup.title')} <span className="text-accent">{t('lineup.team')}</span>
        </h2>
        <p className="text-iz-muted text-sm mb-4">
          {t(formation.nameKey)} ({formation.layout}) · {t('stats.teamPower')}{' '}
          <span className="text-iz-cyan font-bold">{totalPower}</span>
          {movingPlayer && (
            <span className="text-accent ml-2">
              — {t('lineup.place', { name: movingPlayer.name, pos: movingPlayer.position })}
            </span>
          )}
        </p>

        {error && (
          <div className="mb-4 alert-error">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,480px)_minmax(220px,280px)] gap-4 sm:gap-6 mb-6 sm:mb-8 justify-center">
          <div className="flex flex-col items-center gap-3">
            <PitchFormation
              lineup={lineup}
              formationId={formationId}
              selectedSlot={selectedSlot}
              selectedPlayer={movingPlayer}
              onSlotClick={handleSlotClick}
              interactive
              strict
              size="md"
            />
          </div>
          <BoxScore
            lineup={lineup}
            formationId={formationId}
            selectedSlot={selectedSlot}
            onSlotClick={handleSlotClick}
            strict
          />
        </div>

        <div className="card-grid mb-8">
          {all.map(p => (
            <span key={p.id} className="card-grid__item"><InaCard player={p} size="sm" showRating={mode !== 'memory'} /></span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <ExportTeamButton
            lineup={lineup}
            formationId={formationId}
            mode={mode}
            className="sm:flex-1"
          />
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isValid}
            className={`btn-primary flex-1 text-xl py-4 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isValid ? t('lineup.launch') : t('lineup.incomplete')}
          </button>
        </div>
      </div>
    </div>
  )
}
