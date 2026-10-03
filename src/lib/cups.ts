import type { GameId, Player } from '../types'
import type { TranslationKey } from '../i18n/translations'
import { getDraftPools, getTeamRoster } from '../data/catalog'
import { pickBestXI } from '../data/ffi-rosters'
import { teamRating } from './chemistry'
import { createRngFromSeed } from './rng'
import { today } from './club'
import type { Reward } from './objectives'

/**
 * Copas de draft (como en MADFUT): eliminatorias con tu último draft. Por saga: 8 equipos (cuartos, semis y final) de
 * los juegos de esa saga, cada ronda más difícil. Diaria: 4 equipos (semis y final), los mismos rivales para todos
 * ese día y una sola vez al día. Cada copa tiene un boost (en MADFUT, "Ligas: mín. 6"): si tu once cumple lo que pide,
 * sube su química durante la copa.
 */
export interface CupBoost {
  /** Cartas de estos juegos (null: juegos distintos en el once) */
  games: GameId[] | null
  /** Cuántas hacen falta */
  min: number
  /** Química que suma (el equipo no pasa de 33) */
  chem: number
}

/** Cuántas cartas del once cuentan para el boost de la copa */
export function boostCount(b: CupBoost, xi: Player[]): number {
  return b.games ? xi.filter(p => b.games!.includes(p.game)).length : new Set(xi.map(p => p.game)).size
}

export interface CupDef {
  id: string
  nameKey: TranslationKey
  /** Juegos de los que salen los rivales (null: todos) */
  games: GameId[] | null
  rounds: 2 | 3
  daily?: boolean
  /** Monedas por ronda ganada */
  perRound: number
  /** Premio al campeón */
  prize: Reward
  boost: CupBoost
}

export const CUPS: CupDef[] = [
  { id: 'daily', nameKey: 'cup.daily', games: null, rounds: 2, daily: true, perRound: 300, prize: { coins: 1000, pack: 'gold' }, boost: { games: null, min: 4, chem: 4 } },
  { id: 'ie', nameKey: 'cup.ie', games: ['IE1', 'IE2', 'IE3'], rounds: 3, perRound: 250, prize: { coins: 1000, pack: 'saga-ie' }, boost: { games: ['IE1', 'IE2', 'IE3'], min: 4, chem: 4 } },
  { id: 'go', nameKey: 'cup.go', games: ['GO1', 'GO2', 'GO3'], rounds: 3, perRound: 250, prize: { coins: 1000, pack: 'saga-go' }, boost: { games: ['GO1', 'GO2', 'GO3'], min: 4, chem: 4 } },
  { id: 'ares', nameKey: 'cup.ares', games: ['ARES', 'ORION'], rounds: 3, perRound: 250, prize: { coins: 1000, pack: 'saga-ares' }, boost: { games: ['ARES', 'ORION'], min: 4, chem: 4 } },
  { id: 'vr', nameKey: 'cup.vr', games: ['VR'], rounds: 3, perRound: 250, prize: { coins: 1000, pack: 'saga-vr' }, boost: { games: ['VR'], min: 4, chem: 4 } },
]

export interface CupOpponent {
  name: string
  xi: Player[]
  rating: number
}

/** Nombre de cada ronda, de la primera a la final */
export const ROUND_KEYS: Record<2 | 3, TranslationKey[]> = {
  2: ['cup.semi', 'cup.final'],
  3: ['cup.quarter', 'cup.semi', 'cup.final'],
}

/**
 * Rivales de la copa, de menos a más media. Se eligen entre los equipos jugables de sus juegos cerca de tu media (la
 * final, un poco por encima). En la diaria, la semilla es la fecha: todos juegan contra los mismos.
 */
export function cupOpponents(cup: CupDef, myRating: number): CupOpponent[] {
  const rnd = cup.daily ? createRngFromSeed(`cup-${today()}`) : Math.random
  const teams = getDraftPools()
    .filter(p => !cup.games || cup.games.includes(p.game))
    .map(pool => ({ name: pool.label, xi: pickBestXI(getTeamRoster(pool)) }))
    .filter(t => t.xi.length === 11 && t.xi.some(p => p.position === 'GK'))
    .map(t => ({ ...t, rating: teamRating(t.xi) }))
  // la diaria no depende de tu media: rivales fijos de nivel medio-alto
  const target = cup.daily ? 80 : myRating
  const out: CupOpponent[] = []
  for (let r = 0; r < cup.rounds; r++) {
    const want = target - 3 + r * 3
    const left = teams.filter(t => !out.includes(t))
    const near = left.filter(t => Math.abs(t.rating - want) <= 3)
    const pool = near.length ? near : [...left].sort((a, b) => Math.abs(a.rating - want) - Math.abs(b.rating - want)).slice(0, 4)
    if (!pool.length) break
    out.push(pool[Math.floor(rnd() * pool.length)])
  }
  return out.sort((a, b) => a.rating - b.rating)
}
