import type { Player } from '../types'
import { getPlayer } from '../data/catalog'
import { teamRating } from './chemistry'
import { getClub, updateClub } from './club'
import { toLineupMap } from './saved-draft'
import type { FormationId, LineupMap, SlotId } from './lineup'

/**
 * Último draft terminado (como en MADFUT): con él se juegan el Fatal Draft y las copas de draft hasta que se hace
 * otro. Se guarda en este dispositivo; los puntos y el récord salen del resumen del draft.
 */
export interface LastDraft {
  formation: FormationId
  captain: SlotId
  lineup: Partial<Record<SlotId, string>>
  subs: string[]
  reserves: string[]
  /** Química del equipo (0–33) */
  chem: number
  /** Media: titulares + suplentes */
  rating: number
  points: number
  at: number
}

const KEY = 'ffi-last-draft-v1'

export function loadLastDraft(): LastDraft | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as LastDraft : null
  } catch {
    return null
  }
}

/** Puntos de draft: lo que cada titular pasa de 50 + 5 por punto de química (cosa de ~250 a ~600) */
export const draftPoints = (xi: Player[], chem: number) => xi.reduce((s, p) => s + Math.max(0, p.ovr - 50), 0) + chem * 5

export type DraftTier = 'bronze' | 'silver' | 'gold' | 'elite'
export const TIERS: { tier: DraftTier; from: number }[] = [
  { tier: 'bronze', from: 0 }, { tier: 'silver', from: 300 }, { tier: 'gold', from: 400 }, { tier: 'elite', from: 480 },
]
export const draftTier = (points: number): DraftTier => [...TIERS].reverse().find(t => points >= t.from)!.tier

/** Estrellas de la media (1–5) */
export const ratingStars = (rating: number) => (rating >= 90 ? 5 : rating >= 82 ? 4 : rating >= 74 ? 3 : rating >= 66 ? 2 : 1)

export interface DraftInput {
  lineup: LineupMap
  formation: FormationId
  captain: SlotId
  chem: number
  subs: Player[]
  reserves: Player[]
}

/** Guarda el draft recién terminado como el último; dice si bate el récord de puntos */
export function saveLastDraft(d: DraftInput): { draft: LastDraft; record: boolean } {
  const xi = Object.values(d.lineup).filter((p): p is Player => !!p)
  const ids = Object.fromEntries(Object.entries(d.lineup).filter(([, p]) => p).map(([k, p]) => [k, p!.id]))
  const draft: LastDraft = {
    formation: d.formation, captain: d.captain, lineup: ids, subs: d.subs.map(p => p.id), reserves: d.reserves.map(p => p.id),
    chem: d.chem, rating: teamRating([...xi, ...d.subs]), points: draftPoints(xi, d.chem), at: Date.now(),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    /* sin almacenamiento: no se podrá seguir tras recargar */
  }
  const record = draft.points > getClub().draftBest
  if (record) updateClub(s => ({ ...s, draftBest: draft.points }))
  return { draft, record }
}

/** El once del último draft, ya como cartas */
export function lastDraftXI(d: LastDraft): { lineup: LineupMap; xi: Player[] } {
  const lineup = toLineupMap(d.lineup)
  return { lineup, xi: Object.values(lineup).filter((p): p is Player => !!p) }
}

export const draftPlayers = (ids: string[]) => ids.map(getPlayer).filter((p): p is Player => !!p)
