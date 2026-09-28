import { useMemo, useState } from 'react'
import { ArrowLeft, CircleHelp, Plus, Trash2 } from 'lucide-react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getPlayer } from '../../data/catalog'
import { FORMATIONS, getFormation, remapLineupToFormation, type FormationId, type LineupMap, type SlotId } from '../../lib/lineup'
import { MAX_TEAM_CHEM, chemistry, teamRating } from '../../lib/chemistry'
import { deleteSquad, saveSquad, useClub, type Squad } from '../../lib/club'
import InaCard from '../InaCard'
import Sheet from '../hub/Sheet'
import Pitch from '../pitch/Pitch'
import ChemHelp from '../pitch/ChemHelp'
import Screen from './Screen'

const toLineup = (q: Squad): LineupMap =>
  Object.fromEntries(Object.entries(q.cards).map(([slot, id]) => [slot, getPlayer(id!)]).filter(([, p]) => p))

const fromLineup = (l: LineupMap): Squad['cards'] =>
  Object.fromEntries(Object.entries(l).filter(([, p]) => p).map(([slot, p]) => [slot, p!.id]))

/** Mis plantillas: onces hechos con las cartas del club, con la química y la media (como las plantillas de MADFUT) */
export default function Squads() {
  const { t } = useAppSettings()
  const club = useClub()
  const [editing, setEditing] = useState<string | null>(null)
  const squad = club.squads.find(q => q.id === editing)

  function create() {
    const q: Squad = { id: `sq-${Date.now()}`, name: t('sq.name', { n: club.squads.length + 1 }), formation: 'basic', cards: {}, captain: null }
    saveSquad(q)
    setEditing(q.id)
  }

  if (squad) return <SquadEditor squad={squad} onBack={() => setEditing(null)} />

  return (
    <Screen title={t('hub.squads')} statsToggle>
      <button type="button" className="sheet-cta" onClick={create}><Plus size={22} className="inline -mt-1" /> {t('sq.new')}</button>
      {club.squads.length === 0 && <p className="fd-hint">{t('sq.empty')}</p>}
      <ul className="obj-list">
        {club.squads.map(q => {
          const l = toLineup(q)
          const players = Object.values(l).filter((p): p is Player => !!p)
          return (
            <li key={q.id} className="obj" onClick={() => setEditing(q.id)} role="button">
              <span className="obj__text">
                <b>{q.name}</b>
                <small>{getFormation(q.formation).layout} · {players.length}/11 · {t('fd.rating')} {teamRating(players) || '—'} · {t('fd.chemistry')} {chemistry(l, q.captain ?? undefined).team}/{MAX_TEAM_CHEM}</small>
              </span>
              <button type="button" className="hub-icon-btn" aria-label={t('sq.delete')} onClick={e => { e.stopPropagation(); deleteSquad(q.id) }}>
                <Trash2 size={18} />
              </button>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}

function SquadEditor({ squad, onBack }: { squad: Squad; onBack: () => void }) {
  const { t } = useAppSettings()
  const club = useClub()
  const [picking, setPicking] = useState<SlotId | null>(null)
  const [focus, setFocus] = useState<SlotId | null>(null)
  const [help, setHelp] = useState(false)
  const def = getFormation(squad.formation)
  const lineup = useMemo(() => toLineup(squad), [squad])
  const placed = Object.values(lineup).filter((p): p is Player => !!p)
  const chem = chemistry(lineup, squad.captain ?? undefined)
  const used = new Set(placed.map(p => p.characterId))
  const owned = useMemo(() => Object.keys(club.cards).filter(id => club.cards[id] > 0).map(getPlayer)
    .filter((p): p is Player => !!p).sort((a, b) => b.ovr - a.ovr), [club.cards])

  const update = (patch: Partial<Squad>) => saveSquad({ ...squad, ...patch })
  const setLineup = (l: LineupMap, captain = squad.captain) => update({ cards: fromLineup(l), captain: captain && l[captain] ? captain : null })

  function changeFormation(f: FormationId) {
    const l = remapLineupToFormation(lineup, f)
    const capCard = squad.captain ? lineup[squad.captain]?.id : null
    const cap = (Object.entries(l).find(([, p]) => p?.id === capCard)?.[0] ?? null) as SlotId | null
    update({ formation: f, cards: fromLineup(l), captain: cap })
  }

  const role = picking ? def.slots.find(s => s.id === picking)!.role : null
  const options = role ? owned.filter(p => p.position === role && !used.has(p.characterId)) : []
  const focused = focus ? lineup[focus] : undefined

  return (
    <Screen title={squad.name} statsToggle>
      <button type="button" className="chip self-start" onClick={onBack}><ArrowLeft size={14} /> {t('hub.squads')}</button>
      <div className="fd-bar hub-bar">
        <span className="fd-stat"><small>{t('fd.rating')}</small>{teamRating(placed) || '—'}</span>
        <button type="button" className="fd-stat fd-stat--btn" onClick={() => setHelp(true)} aria-label={t('chem.title')}>
          <small>{t('fd.chemistry')} <CircleHelp size={11} /></small><span>{chem.team}<em>/{MAX_TEAM_CHEM}</em></span>
        </button>
        <span className="fd-chem-track"><span style={{ width: `${(chem.team / MAX_TEAM_CHEM) * 100}%` }} /></span>
        <span className="fd-stat"><small>{def.layout}</small>{placed.length}/11</span>
      </div>
      <div className="chip-row">
        {FORMATIONS.map(f => (
          <button key={f.id} type="button" className={`chip ${squad.formation === f.id ? 'on' : ''}`} onClick={() => changeFormation(f.id)} title={f.layout}>{t(f.nameKey)}</button>
        ))}
      </div>
      <Pitch slots={def.slots} lineup={lineup} chem={chem} captain={squad.captain} onTapEmpty={setPicking} onTapPlaced={setFocus} />

      <Sheet open={!!picking} title={t('sq.pick', { pos: role ?? '' })} onClose={() => setPicking(null)}>
        {options.length === 0 && <p className="fd-hint">{t('sq.noCards')}</p>}
        <div className="fd-options">
          {options.slice(0, 60).map(p => (
            <InaCard key={p.id} player={p} size="sm" onClick={() => { setLineup({ ...lineup, [picking!]: p }); setPicking(null) }} />
          ))}
        </div>
      </Sheet>

      <Sheet open={!!focused} title={focused?.name ?? ''} onClose={() => setFocus(null)}>
        {focused && (
          <div className="flex flex-col items-center gap-3">
            <InaCard player={focused} size="md" />
            <button type="button" className="sheet-choice sheet-choice--row w-full" onClick={() => { update({ captain: focus }); setFocus(null) }}>
              <b>{t('sq.captain')}</b>{squad.captain === focus && <small>C</small>}
            </button>
            <button type="button" className="sheet-choice sheet-choice--row w-full" onClick={() => { setPicking(focus); setFocus(null) }}>
              <b>{t('sq.change')}</b>
            </button>
            <button type="button" className="sheet-choice sheet-choice--row w-full" onClick={() => {
              const l = { ...lineup }
              delete l[focus!]
              setLineup(l)
              setFocus(null)
            }}>
              <b>{t('sq.remove')}</b>
            </button>
          </div>
        )}
      </Sheet>
      <ChemHelp open={help} onClose={() => setHelp(false)} />
    </Screen>
  )
}
