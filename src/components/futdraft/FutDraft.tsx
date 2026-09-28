import { useMemo, useState } from 'react'
import type { Player, Position } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getFormation, nextEmptySlot, type FormationId, type LineupMap, type SlotId } from '../../lib/lineup'
import { MAX_TEAM_CHEM, chemistry, teamRating } from '../../lib/chemistry'
import { BENCH, benchOptions, captainOptions, formationOptions, slotOptions } from '../../lib/fut-draft'
import InaCard from '../InaCard'
import Sheet from '../hub/Sheet'
import { CircleHelp, X } from 'lucide-react'
import Pitch, { fieldY } from '../pitch/Pitch'
import ChemHelp from '../pitch/ChemHelp'

interface Props {
  onComplete: (lineup: LineupMap, formation: FormationId, captain: SlotId, chemistry: number, bench: Player[]) => void
  onExit: () => void
}

/** Un sitio del draft: un puesto del campo o un hueco del banquillo ("bench-0"…) */
type Spot = SlotId | `bench-${number}`
const benchSpot = (i: number): Spot => `bench-${i}`
const benchIndex = (s: Spot) => (s.startsWith('bench-') ? Number(s.slice(6)) : -1)

/** Draft al estilo MADFUT: formación 1 de 5 → capitán 1 de 5 → cada hueco 1 de 5 → banquillo, con química y media */
export default function FutDraft({ onComplete, onExit }: Props) {
  const { t } = useAppSettings()
  const [formations] = useState(formationOptions)
  const [captains] = useState(captainOptions)
  const [formation, setFormation] = useState<FormationId | null>(null)
  const [captain, setCaptain] = useState<SlotId | null>(null)
  const [lineup, setLineup] = useState<LineupMap>({})
  const [bench, setBench] = useState<(Player | null)[]>(() => Array(BENCH).fill(null))
  const [picking, setPicking] = useState<Spot | null>(null)
  /** Carta tocada: al tocar otra que pueda ir en su sitio se cambian (el banquillo entra en el campo si el puesto coincide) */
  const [selected, setSelected] = useState<Spot | null>(null)
  // las opciones de cada sitio se sortean una vez: cerrar y volver a abrir no cambia la tirada
  const [options, setOptions] = useState<Partial<Record<Spot, Player[]>>>({})

  const def = formation ? getFormation(formation) : null
  const chem = useMemo(() => chemistry(lineup, captain ?? undefined), [lineup, captain])
  const [help, setHelp] = useState(false)
  const placed = Object.values(lineup).filter((p): p is Player => !!p)
  const rating = teamRating(placed)
  const full = !!def && placed.length === def.slots.length
  const taken = () => new Set([...placed, ...bench].filter((p): p is Player => !!p).map(p => p.characterId))

  const playerAt = (s: Spot) => (benchIndex(s) >= 0 ? bench[benchIndex(s)] : lineup[s as SlotId]) ?? null
  /** Puesto que exige el sitio: el del campo, o ninguno en el banquillo */
  const roleAt = (s: Spot): Position | null => (benchIndex(s) >= 0 ? null : def!.slots.find(x => x.id === s)!.role)

  function put(changes: [Spot, Player | null][]) {
    setLineup(l => {
      const next = { ...l }
      for (const [s, p] of changes) if (benchIndex(s) < 0) { if (p) next[s as SlotId] = p; else delete next[s as SlotId] }
      return next
    })
    setBench(b => {
      const next = [...b]
      for (const [s, p] of changes) if (benchIndex(s) >= 0) next[benchIndex(s)] = p
      return next
    })
  }

  function chooseCaptain(p: Player) {
    const slot = nextEmptySlot({}, p, formation!)
    if (!slot) return
    setLineup({ [slot]: p })
    setCaptain(slot)
  }

  function openSpot(s: Spot) {
    if (!options[s]) {
      const role = roleAt(s)
      setOptions(o => ({ ...o, [s]: role ? slotOptions(role, taken()) : benchOptions(taken()) }))
    }
    setPicking(s)
  }

  function pick(p: Player) {
    put([[picking!, p]])
    setPicking(null)
  }

  function tap(s: Spot) {
    if (!selected || selected === s) return setSelected(selected === s ? null : s)
    const a = playerAt(selected)!, b = playerAt(s)!
    const fits = (p: Player, at: Spot) => { const r = roleAt(at); return !r || r === p.position }
    if (!fits(a, s) || !fits(b, selected)) return setSelected(s)
    put([[selected, b], [s, a]])
    // el capitán va con su carta; si baja al banquillo, el brazalete se queda en su puesto con quien entra
    if (benchIndex(selected) < 0 && benchIndex(s) < 0) setCaptain(c => (c === selected ? (s as SlotId) : c === s ? (selected as SlotId) : c))
    setSelected(null)
  }

  const card = (s: Spot, p: Player) => (
    <span className={selected === s ? 'fd-selected' : undefined}>
      <InaCard player={p} size="xs" onClick={() => tap(s)} />
    </span>
  )

  return (
    <div className="hub fd">
      <header className="hub-top safe-top">
        <div className="hub-top__row">
          <button type="button" className="hub-icon-btn" onClick={onExit} aria-label={t('fd.exit')}><X size={20} /></button>
          <span className="hub-logo">{t('hub.draft')}</span>
          <span className="w-10" />
        </div>
        {def && (
          <div className="hub-bar fd-bar">
            <span className="fd-stat"><small>{t('fd.rating')}</small>{rating || '—'}</span>
            <button type="button" className="fd-stat fd-stat--btn" onClick={() => setHelp(true)} aria-label={t('chem.title')}>
              <small>{t('fd.chemistry')} <CircleHelp size={11} /></small><span>{chem.team}<em>/{MAX_TEAM_CHEM}</em></span>
            </button>
            <span className="fd-chem-track"><span style={{ width: `${(chem.team / MAX_TEAM_CHEM) * 100}%` }} /></span>
            <span className="fd-stat"><small>{def.layout}</small>{placed.length}/{def.slots.length}</span>
          </div>
        )}
      </header>

      <main className="fd-main">
        {!formation && (
          <section className="fd-step">
            <h2 className="fd-title">{t('fd.formation')}</h2>
            <div className="fd-formations">
              {formations.map(id => {
                const f = getFormation(id)
                return (
                  <button key={id} type="button" className="tile fd-formation" onClick={() => setFormation(id)}>
                    <span className="fd-mini">
                      {f.slots.map(s => <i key={s.id} style={{ left: `${s.x}%`, top: `${fieldY(s.y)}%` }} />)}
                    </span>
                    <span className="tile__label">{t(f.nameKey)}</span>
                    <small>{f.layout}</small>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {formation && !captain && (
          <section className="fd-step">
            <h2 className="fd-title">{t('fd.captain')}</h2>
            <div className="fd-options">
              {captains.map(p => <InaCard key={p.id} player={p} onClick={() => chooseCaptain(p)} />)}
            </div>
          </section>
        )}

        {def && captain && (
          <section className="fd-step">
            <p className="fd-hint">{selected ? t('fd.swap') : full ? t('fd.benchHint') : t('fd.tapSlot')}</p>
            <Pitch
              slots={def.slots}
              lineup={lineup}
              chem={chem}
              captain={captain}
              selected={selected && benchIndex(selected) < 0 ? (selected as SlotId) : null}
              onTapPlaced={id => tap(id)}
              onTapEmpty={id => openSpot(id)}
            />

            {full && (
              <>
                <h3 className="sheet-label">{t('fd.bench')}</h3>
                <div className="fd-bench">
                  {bench.map((p, i) => (
                    <div key={i} className="fd-bench__spot">
                      {p ? card(benchSpot(i), p) : (
                        <button type="button" className="fd-empty" onClick={() => openSpot(benchSpot(i))}>+<small>{t('fd.sub')}</small></button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="sheet-cta fd-cta"
                  onClick={() => onComplete(lineup, formation!, captain, chem.team, bench.filter((p): p is Player => !!p))}
                >
                  {t('fd.play')}
                </button>
              </>
            )}
          </section>
        )}
      </main>

      <Sheet
        open={!!picking}
        title={picking ? t('fd.pick', { pos: roleAt(picking) ?? t('fd.sub') }) : ''}
        onClose={() => setPicking(null)}
      >
        <div className="fd-options">
          {(picking && options[picking] || []).map(p => <InaCard key={p.id} player={p} onClick={() => pick(p)} />)}
        </div>
      </Sheet>
      <ChemHelp open={help} onClose={() => setHelp(false)} />
    </div>
  )
}
