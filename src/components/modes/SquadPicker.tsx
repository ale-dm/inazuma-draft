import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getPlayer } from '../../data/catalog'
import { getFormation, lineupToArray, type FormationId, type LineupMap, type SlotId } from '../../lib/lineup'
import { MAX_TEAM_CHEM, chemistry, teamRating } from '../../lib/chemistry'
import { SQUADS_HASH } from '../../lib/route'
import { useClub, type Squad } from '../../lib/club'
import { lastDraftXI, loadLastDraft } from '../../lib/last-draft'

export interface PickedSquad {
  name: string
  xi: Player[]
  /** Química del once (0–33) */
  chem: number
  /** Once colocado y capitán (química por jugador en el Duelo) */
  lineup: LineupMap
  captain: SlotId | null
  formation: FormationId
}

export function squadLineup(q: Squad): LineupMap {
  const l: LineupMap = {}
  for (const [slot, id] of Object.entries(q.cards)) {
    const p = id ? getPlayer(id) : undefined
    if (p) l[slot as keyof LineupMap] = p
  }
  return l
}

/** El último draft como equipo para jugar (Fatal Draft y copas de draft); null si todavía no hay ninguno */
export function draftSquad(name: string): PickedSquad | null {
  const d = loadLastDraft()
  if (!d) return null
  const { lineup, xi } = lastDraftXI(d)
  return xi.length === 11 ? { name, xi, chem: d.chem, lineup, captain: d.captain, formation: d.formation } : null
}

/** Elegir una de Mis plantillas completas (11 cartas) para jugar un modo con tus cartas */
/** cap: media máxima del once (series de Fatal); las plantillas que la pasan salen desactivadas */
export default function SquadPicker({ onPick, cap = null }: { onPick: (s: PickedSquad) => void; cap?: number | null }) {
  const { t } = useAppSettings()
  const club = useClub()
  const squads = club.squads.map(q => {
    const l = squadLineup(q)
    const xi = lineupToArray(l, q.formation)
    return { q, l, xi, chem: chemistry(l, q.captain ?? undefined).team }
  })
  const ready = squads.filter(s => s.xi.length === 11)

  return (
    <>
      <h3 className="sheet-label">{t('modes.pickSquad')}</h3>
      {ready.length === 0 && (
        <p className="fd-hint">
          {t('modes.noSquad')} <a href={SQUADS_HASH} className="underline">{t('hub.squads')}</a>
        </p>
      )}
      <ul className="obj-list">
        {ready.map(({ q, l, xi, chem }) => (
          <li key={q.id} className={`obj ${cap != null && teamRating(xi) > cap ? 'obj--done' : ''}`} role="button"
            onClick={() => (cap == null || teamRating(xi) <= cap) && onPick({ name: q.name, xi, chem, lineup: l, captain: q.captain, formation: q.formation })}>
            <span className="obj__text">
              <b>{q.name}</b>
              <small>{getFormation(q.formation).layout} · {t('fd.rating')} {teamRating(xi)} · {t('fd.chemistry')} {chem}/{MAX_TEAM_CHEM}</small>
            </span>
            <span className="chip on">{cap != null && teamRating(xi) > cap ? `> ${cap}` : t('modes.play')}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
