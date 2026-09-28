import type { Player } from '../types'
import { getPlayer } from '../data/catalog'
import type { FormationId, LineupMap, SlotId } from './lineup'

/** Draft MADFUT a medias, guardado en este dispositivo para seguirlo más tarde (se guarda solo a cada paso) */
export interface SavedDraft {
  formations: FormationId[]
  captains: string[]
  formation: FormationId | null
  captain: SlotId | null
  lineup: Partial<Record<SlotId, string>>
  bench: (string | null)[]
  /** Opciones ya sorteadas de cada sitio (puesto o "bench-N") */
  options: Record<string, string[]>
  savedAt: number
}

const KEY = 'ffi-saved-draft-v1'

export function loadDraft(): SavedDraft | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as SavedDraft : null
  } catch {
    return null
  }
}

export function saveDraft(d: SavedDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d))
  } catch {
    /* sin almacenamiento: el draft sigue en memoria */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nada que borrar */
  }
}

export const toPlayers = (ids: string[]): Player[] => ids.map(getPlayer).filter((p): p is Player => !!p)

export function toLineupMap(ids: Partial<Record<SlotId, string>>): LineupMap {
  const out: LineupMap = {}
  for (const [slot, id] of Object.entries(ids) as [SlotId, string][]) {
    const p = getPlayer(id)
    if (p) out[slot] = p
  }
  return out
}
