import type { TranslationKey } from '../i18n/translations'
import { addCards, addPack, getClub, spend, today, updateClub } from './club'
import { createRngFromSeed } from './rng'
import { getPack, openPack } from './packs'
import { giveReward, type Reward } from './objectives'
import type { Player } from '../types'

/**
 * Lo que hay en la tienda además de los sobres de siempre (como en MADFUT):
 * - Sobres de hoy: 4 ofertas que cambian cada día (a medianoche UTC), con unidades limitadas; unas gratis y otras
 *   con monedas.
 * - Fichas (tokens): premios de Fatal y objetivos que se canjean por su sobre; una ficha gratis al día.
 * - Sobre gratis: 9 cartas flojas cada FREE_EVERY minutos; sus puntos llenan la barra de bonus (a BONUS_GOAL, un sobre
 *   de oro) y se guarda la mejor puntuación.
 */
export interface DailyOffer {
  id: string
  pack: string
  nameKey: TranslationKey
  descKey: TranslationKey
  price: number
  stock: number
}

const OFFERS: DailyOffer[] = [
  { id: 'd88', pack: 'one-88', nameKey: 'today.88', descKey: 'today.88Desc', price: 0, stock: 1 },
  { id: 'dtop', pack: 'one-top', nameKey: 'today.top', descKey: 'today.topDesc', price: 0, stock: 1 },
  { id: 'd85', pack: 'one-85', nameKey: 'today.85', descKey: 'today.85Desc', price: 0, stock: 1 },
  { id: 'dx2', pack: 'x2-random', nameKey: 'today.x2', descKey: 'today.x2Desc', price: 4000, stock: 1 },
  { id: 'dsilver', pack: 'silver', nameKey: 'today.silver', descKey: 'today.silverDesc', price: 900, stock: 2 },
  { id: 'dgold', pack: 'gold', nameKey: 'today.gold', descKey: 'today.goldDesc', price: 2500, stock: 2 },
  { id: 'd80', pack: 'one-80', nameKey: 'today.80', descKey: 'today.80Desc', price: 0, stock: 2 },
]

/** Las 4 ofertas de hoy (las mismas para todos ese día) */
export function todayOffers(day = today()): DailyOffer[] {
  const rnd = createRngFromSeed(`store-${day}`)
  return [...OFFERS].sort(() => rnd() - 0.5).slice(0, 4).sort((a, b) => a.price - b.price)
}

export function offerLeft(o: DailyOffer): number {
  const t = getClub().today
  return o.stock - (t.day === today() ? t.taken[o.id] ?? 0 : 0)
}

/** Coge una oferta: paga (si cuesta) y guarda el sobre en Mis sobres */
export function takeOffer(o: DailyOffer): boolean {
  if (offerLeft(o) <= 0 || (o.price > 0 && !spend(o.price))) return false
  updateClub(s => {
    const taken = s.today.day === today() ? { ...s.today.taken } : {}
    taken[o.id] = (taken[o.id] ?? 0) + 1
    return { ...s, today: { day: today(), taken } }
  })
  addPack(o.pack)
  return true
}

/** Milisegundos hasta que cambian las ofertas (medianoche UTC) */
export function msToReset(now = Date.now()): number {
  const d = new Date(now)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - now
}

export function formatLeft(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000))
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`
}

// ---------------------------------------------------------------- fichas

/** Fichas que existen (orden de la pantalla) */
export const TOKENS = ['one-90', 'one-88', 'one-85', 'one-80', 'one-silver', 'one-bronze']
/** Ficha gratis del día */
export const FREE_TOKEN = 'one-80'

export function redeemToken(id: string): boolean {
  if (!(getClub().tokens[id] > 0)) return false
  updateClub(s => ({ ...s, tokens: { ...s.tokens, [id]: s.tokens[id] - 1 } }))
  addPack(id)
  return true
}

export const freeTokenAvailable = () => !getClub().codes.includes(`token-${today()}`)

export function claimFreeToken(): boolean {
  if (!freeTokenAvailable()) return false
  updateClub(s => ({ ...s, codes: [...s.codes.filter(c => !c.startsWith('token-')), `token-${today()}`] }))
  giveReward({ token: FREE_TOKEN })
  return true
}

// ---------------------------------------------------------------- sobre gratis

export const FREE_EVERY = 10
export const BONUS_GOAL = 500
export const BONUS_REWARD: Reward = { pack: 'gold' }

/** Puntos de un sobre gratis: lo que cada carta pasa de 50 de media */
export const packPoints = (cards: Player[]) => cards.reduce((s, p) => s + Math.max(0, p.ovr - 50), 0)

export function freePackReadyIn(now = Date.now()): number {
  return Math.max(0, getClub().freePack.last + FREE_EVERY * 60000 - now)
}

/** Abre el sobre gratis: cartas al club, puntos a la barra (a BONUS_GOAL, sobre de oro) y récord */
export function openFreePack(): { cards: Player[]; points: number; bonus: boolean } | null {
  if (freePackReadyIn() > 0) return null
  const cards = openPack(getPack('free'))
  const points = packPoints(cards)
  addCards(cards.map(p => p.id))
  const fp = getClub().freePack
  const sum = fp.bonus + points
  const bonus = sum >= BONUS_GOAL
  updateClub(s => ({ ...s, freePack: { last: Date.now(), bonus: bonus ? sum - BONUS_GOAL : sum, best: Math.max(fp.best, points) } }))
  if (bonus) giveReward(BONUS_REWARD)
  return { cards, points, bonus }
}

// ---------------------------------------------------------------- códigos

/** Códigos canjeables (una vez cada uno) */
export const CODES: Record<string, Reward> = {
  INAZUMA: { coins: 5000 },
  RAIMON: { pack: 'gold' },
  FFI: { pack: 'x2-random' },
  CHRONOSTORM: { token: 'one-88' },
  FUEGO: { pack: 'el-fire' },
  VICTORYROAD: { pack: 'saga-vr' },
}

export function redeemCode(raw: string): Reward | 'used' | 'invalid' {
  const code = raw.trim().toUpperCase().replace(/\s+/g, '')
  const r = CODES[code]
  if (!r) return 'invalid'
  if (getClub().codes.includes(code)) return 'used'
  updateClub(s => ({ ...s, codes: [...s.codes, code] }))
  giveReward(r)
  return r
}
