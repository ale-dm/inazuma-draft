import { useSyncExternalStore } from 'react'

/**
 * Cambios del CRUD oculto (#/admin): se guardan en este dispositivo y se aplican encima del catálogo de Supabase al
 * cargarlo (data/catalog.ts). Para que sean para todos: "Exportar" → data/card_edits.json en el repo → build.py los
 * aplica al generar la base (tools/db/edits.py) → workflow de carga en Supabase. Los nombres de campo son las
 * columnas de la base (snake_case), así el mismo JSON vale en los dos sitios.
 */
export interface CardEdit {
  character_id?: string
  name?: string
  game?: string
  version?: string
  team?: string | null
  position?: string
  element?: string | null
  ovr?: number
  category?: string
  tier?: string
  shooting?: number
  control?: number
  physical?: number
  speed?: number
  defense?: number
  goalkeeping?: number
  image_url?: string | null
  /** Estadísticas de duelo a mano (null/sin poner: se calculan de las normales, ver lib/duel.ts) */
  duel_att?: number | null
  duel_con?: number | null
  duel_def?: number | null
  /** Ids de las técnicas, en orden */
  techniques?: string[]
  is_version?: boolean
  no?: number | null
}

export interface TechniqueEdit {
  name?: string
  name_es?: string | null
  type?: string
  element?: string | null
  cost?: number | null
  traits?: string[]
}

export interface AdminEdits {
  version: 1
  /** Cambios sobre cartas que ya existen */
  cards: Record<string, CardEdit>
  /** Cartas nuevas (todos los campos) */
  created: Record<string, CardEdit>
  /** Cartas borradas (ocultas) */
  deleted: string[]
  techniques: Record<string, TechniqueEdit>
}

const KEY = 'ffi-admin-edits-v1'
const empty = (): AdminEdits => ({ version: 1, cards: {}, created: {}, deleted: [], techniques: {} })

function read(): AdminEdits {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) as Partial<AdminEdits> } : empty()
  } catch {
    return empty()
  }
}

let edits: AdminEdits = read()
const listeners = new Set<() => void>()

function commit(next: AdminEdits) {
  edits = next
  try {
    localStorage.setItem(KEY, JSON.stringify(edits))
  } catch {
    /* sin almacenamiento: los cambios duran hasta recargar */
  }
  listeners.forEach(l => l())
}

export function getEdits(): AdminEdits {
  return edits
}

export function useEdits(): AdminEdits {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb) }, getEdits)
}

export function editCount(e = edits): number {
  return Object.keys(e.cards).length + Object.keys(e.created).length + e.deleted.length + Object.keys(e.techniques).length
}

export function setCardEdit(id: string, patch: CardEdit | null) {
  const cards = { ...edits.cards }
  if (patch && Object.keys(patch).length) cards[id] = patch
  else delete cards[id]
  commit({ ...edits, cards })
}

export function setCreated(id: string, card: CardEdit | null) {
  const created = { ...edits.created }
  if (card) created[id] = card
  else delete created[id]
  commit({ ...edits, created })
}

export function setDeleted(id: string, deleted: boolean) {
  commit({ ...edits, deleted: deleted ? [...new Set([...edits.deleted, id])] : edits.deleted.filter(x => x !== id) })
}

export function setTechniqueEdit(id: string, patch: TechniqueEdit | null) {
  const techniques = { ...edits.techniques }
  if (patch && Object.keys(patch).length) techniques[id] = patch
  else delete techniques[id]
  commit({ ...edits, techniques })
}

export function replaceEdits(next: AdminEdits) {
  commit({ ...empty(), ...next, version: 1 })
}

export function clearEdits() {
  commit(empty())
}
