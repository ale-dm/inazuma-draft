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
  /** Objetivos semanales: semana ISO ("2026-W39") + contadores y cobrados de esa semana */
  week: string | null
  weekCounters: Record<string, number>
  weekClaimed: string[]
  /** Contadores de siempre (objetivos de carrera) y objetivos de carrera cobrados */
  career: Record<string, number>
  careerClaimed: string[]
  /** Copa diaria: último día jugada */
  dailyCup: string | null
  /** Puzzles de draft resueltos (id) */
  puzzles: string[]
  /** Mejor racha de Higher/Lower */
  hlBest: number
  /** Retos (SBC) hechos: id → veces */
  sbcDone: Record<string, number>
  /** Escudo del club (equipo de una colección completada) */
  crest: string | null
}

const KEY = 'ffi-club-v1'
export const STARTER_COINS = 5000
export const STARTER_PACKS = ['starter']

const fresh = (): ClubState => ({
  coins: STARTER_COINS, xp: 0, cards: {}, packs: [...STARTER_PACKS], streak: 0, lastDaily: null,
  day: null, counters: {}, claimed: [], collections: [], squads: [],
  week: null, weekCounters: {}, weekClaimed: [], career: {}, careerClaimed: [], dailyCup: null, puzzles: [], hlBest: 0, sbcDone: {}, crest: null,
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

/** Semana ISO del día: "2026-W39" (los objetivos semanales empiezan el lunes) */
export function isoWeek(d = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((t.getTime() - start.getTime()) / 86400000 + 1) / 7)
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
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

/** Suma a un contador del día, de la semana y de siempre (objetivos diarios, semanales y de carrera); al cambiar de
 *  día o de semana, esos contadores vuelven a cero */
export function track(event: string, n = 1) {
  updateClub(s => {
    const fresh_ = s.day !== today()
    const counters = fresh_ ? {} : { ...s.counters }
    counters[event] = (counters[event] ?? 0) + n
    const newWeek = s.week !== isoWeek()
    const weekCounters = newWeek ? {} : { ...s.weekCounters }
    weekCounters[event] = (weekCounters[event] ?? 0) + n
    const career = { ...s.career, [event]: (s.career[event] ?? 0) + n }
    return {
      ...s, day: today(), counters, claimed: fresh_ ? [] : s.claimed,
      week: isoWeek(), weekCounters, weekClaimed: newWeek ? [] : s.weekClaimed, career,
    }
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

/** Quita una copia de cada carta (retos) */
export function removeCopies(ids: string[]) {
  updateClub(s => {
    const cards = { ...s.cards }
    for (const id of ids) {
      const left = (cards[id] ?? 0) - 1
      if (left > 0) cards[id] = left
      else delete cards[id]
    }
    return { ...s, cards }
  })
}

export function resetClub() {
  commit(fresh())
}
