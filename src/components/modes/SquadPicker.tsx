import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getPlayer } from '../../data/catalog'
import { getFormation, lineupToArray, type LineupMap } from '../../lib/lineup'
import { MAX_TEAM_CHEM, chemistry, teamRating } from '../../lib/chemistry'
import { SQUADS_HASH } from '../../lib/route'
import { useClub, type Squad } from '../../lib/club'

export interface PickedSquad {
  name: string
  xi: Player[]
  /** Química del once (0–33) */
  chem: number
}

export function squadLineup(q: Squad): LineupMap {
  const l: LineupMap = {}
  for (const [slot, id] of Object.entries(q.cards)) {
    const p = id ? getPlayer(id) : undefined
    if (p) l[slot as keyof LineupMap] = p
  }
  return l
}

/** Elegir una de Mis plantillas completas (11 cartas) para jugar un modo con tus cartas */
export default function SquadPicker({ onPick }: { onPick: (s: PickedSquad) => void }) {
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
        {ready.map(({ q, xi, chem }) => (
          <li key={q.id} className="obj" role="button" onClick={() => onPick({ name: q.name, xi, chem })}>
            <span className="obj__text">
              <b>{q.name}</b>
              <small>{getFormation(q.formation).layout} · {t('fd.rating')} {teamRating(xi)} · {t('fd.chemistry')} {chem}/{MAX_TEAM_CHEM}</small>
            </span>
            <span className="chip on">{t('modes.play')}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
