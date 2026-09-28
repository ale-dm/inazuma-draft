import { useSyncExternalStore } from 'react'
import type { Category } from '../types'
import type { FormationId, SlotId } from './lineup'

/**
 * El club del jugador (fase 3, solo en este dispositivo): monedas, XP, cartas con duplicados, sobres guardados,
 * racha diaria y objetivos. Más adelante irá a Supabase (fase 6). Ver docs/app-log.md.
 */
/** Plantilla hecha con cartas del club (Mis plantillas) */
export interface Squad {
  id: string
  name: string
  formation: FormationId
  /** puesto → id de carta */
  cards: Partial<Record<SlotId, string>>
  captain: SlotId | null
}

export interface ClubState {
  coins: number
  xp: number
  /** id de carta → copias */
  cards: Record<string, number>
  /** Sobres comprados o ganados sin abrir */
  packs: string[]
  /** Racha de días seguidos entrando (premio diario) */
  streak: number
  lastDaily: string | null
  /** Progreso de los objetivos del día: fecha + contadores por evento */
  day: string | null
  counters: Record<string, number>
  claimed: string[]
  /** Colecciones con el premio ya cobrado */
  collections: string[]
  squads: Squad[]
}

const KEY = 'ffi-club-v1'
export const STARTER_COINS = 5000
export const STARTER_PACKS = ['starter']

const fresh = (): ClubState => ({
  coins: STARTER_COINS, xp: 0, cards: {}, packs: [...STARTER_PACKS], streak: 0, lastDaily: null,
  day: null, counters: {}, claimed: [], collections: [], squads: [],
})

function read(): ClubState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...fresh(), ...JSON.parse(raw) as Partial<ClubState> } : fresh()
  } catch {
    return fresh()
  }
}

let state: ClubState = read()
const listeners = new Set<() => void>()

function commit(next: ClubState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* almacenamiento lleno o bloqueado: la partida sigue en memoria */
  }
  listeners.forEach(l => l())
}

export function getClub(): ClubState {
  return state
}

/** Hook: el componente se vuelve a pintar cuando cambia el club */
export function useClub(): ClubState {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb) }, getClub)
}

export function updateClub(fn: (s: ClubState) => ClubState) {
  commit(fn(state))
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ---------------------------------------------------------------- operaciones

export function addCoins(n: number) {
  updateClub(s => ({ ...s, coins: Math.max(0, s.coins + n) }))
}

export function addXp(n: number) {
  updateClub(s => ({ ...s, xp: s.xp + n }))
}

export function addCards(ids: string[]) {
  updateClub(s => {
    const cards = { ...s.cards }
    for (const id of ids) cards[id] = (cards[id] ?? 0) + 1
    return { ...s, cards }
  })
}

export function addPack(packId: string) {
  updateClub(s => ({ ...s, packs: [...s.packs, packId] }))
}

/** Quita el sobre guardado (el primero con ese id) */
export function takePack(packId: string): boolean {
  const i = state.packs.indexOf(packId)
  if (i < 0) return false
  updateClub(s => ({ ...s, packs: s.packs.filter((_, j) => j !== i) }))
  return true
}

export function spend(n: number): boolean {
  if (state.coins < n) return false
  addCoins(-n)
  return true
}

/** Precio de venta rápida de una copia repetida, por rareza */
export const QUICK_SELL: Record<Category, number> = {
  'Legendary Player': 1000,
  'Top Player': 400,
  'Advanced Player': 150,
  'Growing Player': 60,
  'Common Player': 25,
}

/** Vende copias de una carta (nunca la última) */
export function quickSell(id: string, copies: number, price: number): number {
  const have = state.cards[id] ?? 0
  const n = Math.min(copies, have - 1)
  if (n <= 0) return 0
  updateClub(s => ({ ...s, coins: s.coins + n * price, cards: { ...s.cards, [id]: have - n } }))
  return n * price
}

/** Suma a un contador del día (objetivos diarios); cambia de día → contadores a cero */
export function track(event: string, n = 1) {
  updateClub(s => {
    const fresh_ = s.day !== today()
    const counters = fresh_ ? {} : { ...s.counters }
    counters[event] = (counters[event] ?? 0) + n
    return { ...s, day: today(), counters, claimed: fresh_ ? [] : s.claimed }
  })
}

/** Máximo del día para un contador (p. ej. mejor química) */
export function trackMax(event: string, value: number) {
  updateClub(s => {
    const fresh_ = s.day !== today()
    const counters = fresh_ ? {} : { ...s.counters }
    counters[event] = Math.max(counters[event] ?? 0, value)
    return { ...s, day: today(), counters, claimed: fresh_ ? [] : s.claimed }
  })
}

export function saveSquad(squad: Squad) {
  updateClub(s => ({ ...s, squads: s.squads.some(q => q.id === squad.id) ? s.squads.map(q => (q.id === squad.id ? squad : q)) : [...s.squads, squad] }))
}

export function deleteSquad(id: string) {
  updateClub(s => ({ ...s, squads: s.squads.filter(q => q.id !== id) }))
}

export function resetClub() {
  commit(fresh())
}
