import { useMemo, useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getFormation, nextEmptySlot, type LineupMap, type SlotId } from '../../lib/lineup'
import { MAX_TEAM_CHEM, chemistry } from '../../lib/chemistry'
import { PUZZLE_COUNT, PUZZLE_REWARD, dailyPuzzleId, makePuzzle, type Puzzle } from '../../lib/puzzles'
import { addCoins, today, track, updateClub, useClub } from '../../lib/club'
import { playSfx } from '../../lib/sfx'
import InaCard from '../InaCard'
import Pitch from '../pitch/Pitch'
import Coin from '../Coin'
import Screen from '../club/Screen'
import { Check } from 'lucide-react'

/** Puzzles de draft (fase 4): el del día y 30 numerados; ver lib/puzzles.ts */
export default function Puzzles() {
  const { t } = useAppSettings()
  const club = useClub()
  const [open, setOpen] = useState<string | null>(null)
  const daily = dailyPuzzleId(today())

  if (open) return <PuzzleView key={open} puzzle={makePuzzle(open)} onBack={() => setOpen(null)} />

  const ids = Array.from({ length: PUZZLE_COUNT }, (_, i) => String(i + 1))
  return (
    <Screen title={t('hub.puzzles')}>
      <p className="fd-hint">{t('pz.rules', { n: PUZZLE_REWARD })}</p>
      <button type="button" className="sheet-choice sheet-choice--mode" onClick={() => setOpen(daily)}>
        <b>{t('pz.daily')}</b>
        <small>{club.puzzles.includes(daily) ? <><Check size={12} className="inline" /> {t('pz.solved')}</> : today()}</small>
      </button>
      <div className="pz-grid">
        {ids.map(id => (
          <button key={id} type="button" className={`pz-tile ${club.puzzles.includes(id) ? 'is-done' : ''}`} onClick={() => setOpen(id)}>
            {club.puzzles.includes(id) ? <Check size={18} /> : id}
          </button>
        ))}
      </div>
    </Screen>
  )
}

function PuzzleView({ puzzle, onBack }: { puzzle: Puzzle; onBack: () => void }) {
  const { t } = useAppSettings()
  const club = useClub()
  const [lineup, setLineup] = useState<LineupMap>({})
  const def = getFormation(puzzle.formation)
  const chem = useMemo(() => chemistry(lineup), [lineup])
  const placed = Object.values(lineup).filter((p): p is Player => !!p)
  const solved = placed.length === def.slots.length && chem.team >= puzzle.target
  const already = club.puzzles.includes(puzzle.id)
  const [paid, setPaid] = useState(false)

  function place(p: Player) {
    const slot = nextEmptySlot(lineup, p, puzzle.formation)
    if (!slot) return
    const next = { ...lineup, [slot]: p }
    setLineup(next)
    playSfx('pick')
    const nPlaced = Object.values(next).filter(Boolean).length
    if (nPlaced === def.slots.length && chemistry(next).team >= puzzle.target && !already && !paid) {
      setPaid(true)
      addCoins(PUZZLE_REWARD)
      track('puzzles')
      updateClub(s => ({ ...s, puzzles: [...new Set([...s.puzzles, puzzle.id])] }))
      playSfx('qualify')
    }
  }

  function remove(slot: SlotId) {
    const next = { ...lineup }
    delete next[slot]
    setLineup(next)
  }

  const pool = puzzle.cards.filter(p => !placed.includes(p))
  const title = puzzle.id.startsWith('d-') ? t('pz.daily') : t('pz.n', { n: puzzle.id })
  return (
    <Screen title={title}>
      <button type="button" className="chip self-start" onClick={onBack}>← {t('hub.puzzles')}</button>
      <div className="fd-bar hub-bar">
        <span className="fd-stat"><small>{t('pz.target')}</small>{puzzle.target}</span>
        <span className="fd-stat"><small>{t('fd.chemistry')}</small><span>{chem.team}<em>/{MAX_TEAM_CHEM}</em></span></span>
        <span className="fd-chem-track"><span style={{ width: `${Math.min(100, (chem.team / Math.max(1, puzzle.target)) * 100)}%` }} /></span>
        <span className="fd-stat"><small>{def.layout}</small>{placed.length}/{def.slots.length}</span>
      </div>
      <p className="fd-hint">{solved ? t('pz.done') : t('pz.hint')}</p>
      {solved && paid && <p className="reward-line">+<Coin className="w-5 h-5" /> {PUZZLE_REWARD}</p>}
      <Pitch slots={def.slots} lineup={lineup} chem={chem} onTapPlaced={remove} />
      <div className="fd-options">
        {pool.map(p => <InaCard key={p.id} player={p} size="xs" onClick={() => place(p)} />)}
      </div>
    </Screen>
  )
}
