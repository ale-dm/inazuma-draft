import { useState, useMemo } from 'react'
import type { DraftPool, Player } from '../types'
import { displayPoolLabel, draftPoolKey, getDraftPools, getTeamRoster, isPlayerInPoolRoster } from '../data/catalog'
import {
  autoPlacePlayer,
  compatibleEmptySlots,
  DEFAULT_FORMATION,
  getFormation,
  missingPositions,
  sortPlayersByPosition,
  type FormationId,
  type LineupMap,
} from '../lib/lineup'
import { random } from '../lib/run-rng'
import { playSfx } from '../lib/sfx'
import { useAppSettings } from '../context/AppSettings'
import PlayerCard from './PlayerCard'
import PitchFormation from './PitchFormation'
import BoxScore from './BoxScore'
import FormationSelector from './FormationSelector'
import PlayerComparator from './PlayerComparator'
import { lineupPower } from '../lib/power'

const TOTAL_ROUNDS = 11
const TOTAL_REROLLS = 3
const POS_ORDER = ['GK', 'DF', 'MF', 'FW'] as const

interface Props {
  mode: 'classic' | 'memory'
  seed: string | null
  onCopySeed: () => void
  onComplete: (players: Player[], lineup: LineupMap, poolsRolled: string[], formationId: FormationId) => void
}

export default function Draft({ mode, seed, onCopySeed, onComplete }: Props) {
  const { t } = useAppSettings()
  const [round, setRound] = useState(1)
  const [drafted, setDrafted] = useState<Player[]>([])
  const [lineup, setLineup] = useState<LineupMap>({})
  const [formationId, setFormationId] = useState<FormationId>(DEFAULT_FORMATION)
  const [rolledPool, setRolledPool] = useState<DraftPool | null>(null)
  const [rolledRoster, setRolledRoster] = useState<Player[]>([])
  const [rolling, setRolling] = useState(false)
  const [rerollsLeft, setRerollsLeft] = useState(TOTAL_REROLLS)
  const [lastPoolKey, setLastPoolKey] = useState<string | null>(null)
  const [poolsRolled, setPoolsRolled] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [compare, setCompare] = useState<Player[]>([])

  const pools = getDraftPools()
  const missing = useMemo(() => missingPositions(lineup, formationId), [lineup, formationId])
  const formation = getFormation(formationId)
  const totalPower = useMemo(() => lineupPower(lineup, formationId), [lineup, formationId])

  const formationLocked = drafted.length > 0

  function changeFormation(id: FormationId) {
    if (formationLocked) return
    setFormationId(id)
    setError(null)
  }

  function toggleCompare(player: Player) {
    setCompare(prev => {
      if (prev.some(p => p.id === player.id)) return prev.filter(p => p.id !== player.id)
      if (prev.length >= 2) return [prev[1], player]
      return [...prev, player]
    })
  }

  function drawPool(isReroll: boolean) {
    if (isReroll && rerollsLeft <= 0) return
    setError(null)
    setRolling(true)
    setRolledPool(null)
    setRolledRoster([])
    if (isReroll) setRerollsLeft(r => r - 1)

    setTimeout(() => {
      // Seuls les pools avec au moins un joueur plaçable (sinon soft-lock sans relance)
      const draftedIds = new Set(drafted.map(d => d.id))
      const pickable = pools.filter(pool =>
        getTeamRoster(pool).some(p =>
          !draftedIds.has(p.id) && compatibleEmptySlots(lineup, p, formationId).length > 0,
        ),
      )
      const candidates = pickable.length > 0 ? pickable : pools
      let pool: DraftPool
      do {
        pool = candidates[Math.floor(random() * candidates.length)]
      } while (draftPoolKey(pool) === lastPoolKey && candidates.length > 1)

      setRolledPool(pool)
      setRolledRoster(getTeamRoster(pool))
      setPoolsRolled(prev => [...prev, draftPoolKey(pool)])
      setRolling(false)
      playSfx('roll')
    }, 800)
  }

  function roll() {
    drawPool(false)
  }

  function reroll() {
    drawPool(true)
  }

  function assertInRoster(player: Player): boolean {
    if (!rolledPool) {
      setError(t('draft.err.rollFirst'))
      return false
    }
    if (!isPlayerInPoolRoster(player, rolledPool) || !rolledRoster.some(p => p.id === player.id)) {
      setError(t('draft.err.notInRoster', { name: player.name, team: displayPoolLabel(rolledPool) }))
      return false
    }
    return true
  }

  function pick(player: Player) {
    setError(null)
    if (!assertInRoster(player)) return

    if (compatibleEmptySlots(lineup, player, formationId).length === 0) {
      setError(t('draft.err.noSlot', {
        pos: player.position,
        missing: missing.map(m => `${m.count}× ${m.role}`).join(', '),
      }))
      return
    }

    const nextLineup = autoPlacePlayer(lineup, player, formationId)
    if (!nextLineup) {
      setError(t('draft.err.cantPlace', { name: player.name, pos: player.position }))
      return
    }

    const nextDrafted = [...drafted, player]
    setLineup(nextLineup)
    setDrafted(nextDrafted)
    setLastPoolKey(rolledPool ? draftPoolKey(rolledPool) : null)
    setRolledPool(null)
    setRolledRoster([])
    setCompare(prev => prev.filter(p => p.id !== player.id))
    playSfx('pick')

    if (nextDrafted.length >= TOTAL_ROUNDS) {
      onComplete(nextDrafted, nextLineup, poolsRolled, formationId)
    } else {
      setRound(r => r + 1)
    }
  }

  const pool = useMemo(() => {
    if (!rolledPool || rolledRoster.length === 0) return []
    const draftedIds = new Set(drafted.map(d => d.id))
    return sortPlayersByPosition(
      rolledRoster.filter(p => !draftedIds.has(p.id)),
    )
  }, [rolledPool, rolledRoster, drafted])

  const poolByPos = useMemo(() => {
    const groups: Record<string, Player[]> = { GK: [], DF: [], MF: [], FW: [] }
    for (const p of pool) groups[p.position].push(p)
    return groups
  }, [pool])

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="iz-panel mb-3 sm:mb-4">
          <div className="iz-panel-head flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
            <span className="truncate">
              {t('draft.title')} — {t('draft.team')}
            </span>
            <span className="text-[0.65rem] opacity-90 normal-case tracking-normal font-semibold shrink-0 flex flex-wrap items-center gap-x-2 gap-y-1 justify-end">
              {seed && (
                <button type="button" onClick={onCopySeed} className="seed-pill" title={t('seed.copyHint')}>
                  {t('seed.label')}: <strong className="tabular-nums">{seed}</strong>
                </button>
              )}
              <span>
                {t('draft.round', { current: round, total: TOTAL_ROUNDS })}
                {' · '}
                {t('draft.rerollsGlobal', { left: rerollsLeft, total: TOTAL_REROLLS })}
                {mode === 'classic' && (
                  <>
                    {' · '}
                    {t('stats.teamPower')}{' '}
                    <strong className="tabular-nums">{totalPower}</strong>
                  </>
                )}
              </span>
            </span>
          </div>
          {missing.length > 0 && (
            <div className="px-4 py-2 text-xs text-iz-muted border-b divider-iz bg-iz-deep/50">
              {t('draft.missing')}{' '}
              {missing.map(m => (
                <span key={m.role} className="text-iz-blue font-bold mr-2">{m.count}× {m.role}</span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 alert-error animate-fade-in">
            {error}
          </div>
        )}

        {compare.length === 2 && (
          <div className="mb-4">
            <PlayerComparator a={compare[0]} b={compare[1]} mode={mode} onClear={() => setCompare([])} />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,480px)_minmax(220px,260px)] gap-3 sm:gap-4">
          <div className="iz-panel min-h-[min(50vh,480px)] sm:min-h-[480px] flex flex-col order-1">
            {!rolledPool && !rolling && (
              <div className="iz-panel-body flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-iz-muted text-sm text-center max-w-xs">
                  {t('draft.rollHint', { rerolls: TOTAL_REROLLS })}
                </p>
                <button type="button" onClick={roll} className="btn-primary text-xl px-14 py-5 animate-pulse-gold">
                  {t('draft.roll')}
                </button>
              </div>
            )}
            {rolling && (
              <div className="iz-panel-body flex-1 flex items-center justify-center text-xl font-heading text-accent animate-pulse">
                {t('draft.rolling')}
              </div>
            )}
            {rolledPool && !rolling && (
              <div className="animate-slide-up flex flex-col flex-1">
                <div className="iz-panel-head text-center !text-base !tracking-wide">
                  {displayPoolLabel(rolledPool)}
                </div>
                <div className="px-4 py-2 text-center text-xs text-iz-muted border-b divider-iz">
                  {t('draft.pool', { left: pool.length, total: rolledRoster.length })}
                  {compare.length > 0 && compare.length < 2 && (
                    <span className="block mt-1 text-iz-cyan">{t('compare.pickSecond')}</span>
                  )}
                  {rerollsLeft > 0 && (
                    <button
                      type="button"
                      onClick={reroll}
                      disabled={rolling}
                      className="btn-secondary ml-3 text-[0.65rem] py-1 px-2"
                    >
                      {t('draft.reroll', { left: rerollsLeft, total: TOTAL_REROLLS })}
                    </button>
                  )}
                </div>
                <div className="iz-panel-body flex-1 overflow-y-auto max-h-[min(65dvh,560px)] sm:max-h-[70vh]">
                  {POS_ORDER.map(pos => {
                    const players = poolByPos[pos]
                    if (players.length === 0) return null
                    const slotsLeft = compatibleEmptySlots(lineup, players[0], formationId).length
                    return (
                      <div key={pos} className="iz-pos-section">
                        <div className="iz-pos-section__label">
                          <span>{pos}</span>
                          <span className="text-iz-muted font-normal">({players.length})</span>
                          {slotsLeft === 0 && <span className="text-red-500 ml-auto">— {t('draft.full')}</span>}
                        </div>
                        <div className="flex flex-col gap-2 stagger">
                          {players.map(p => {
                            const canPick = compatibleEmptySlots(lineup, p, formationId).length > 0
                            return (
                              <PlayerCard
                                key={p.id}
                                player={p}
                                mode={mode}
                                teamLabel={displayPoolLabel(rolledPool)}
                                onClick={canPick ? () => pick(p) : undefined}
                                onCompare={() => toggleCompare(p)}
                                inCompare={compare.some(c => c.id === p.id)}
                                disabled={!canPick}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="iz-panel order-2 xl:order-none">
            <div className="iz-panel-head text-center sm:text-left">
              {t(formation.nameKey)} <span className="opacity-60 font-normal">({formation.layout})</span>
            </div>
            <div className="iz-panel-body flex flex-col items-center gap-2 sm:gap-3 py-3 sm:py-4 w-full">
              {!formationLocked && (
                <FormationSelector value={formationId} onChange={changeFormation} />
              )}
              <PitchFormation lineup={lineup} formationId={formationId} strict size="lg" />
            </div>
          </div>

          <div className="order-3 xl:order-none">
            <BoxScore lineup={lineup} formationId={formationId} strict showPower={mode === 'classic'} />
          </div>
        </div>
      </div>
    </div>
  )
}
