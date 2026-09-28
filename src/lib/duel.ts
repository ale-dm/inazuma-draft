import type { Player } from '../types'
import { getAllPlayers, getDraftPools, getTeamRoster } from '../data/catalog'
import { pickBestXI } from '../data/ffi-rosters'
import { teamRating } from './chemistry'

/**
 * Números de duelo de cada carta (verde ataque, azul control, rojo defensa) y rival de la máquina. Las reglas del
 * Duelo (Fatal de MADFUT) están en lib/fatal.ts; ver docs/duelo.md.
 */
export interface DuelStats {
  /** Verde: capacidad de ataque/remate */
  att: number
  /** Azul: control de balón/regate */
  con: number
  /** Rojo: defensa (los porteros mezclan defensa y parada) */
  def: number
}

export type DuelKey = keyof DuelStats

/** Cuánto aprovecha cada puesto cada número [ataque, control, defensa] */
const POS_FACTOR: Record<Player['position'], [number, number, number]> = {
  FW: [1, 0.92, 0.68],
  MF: [0.92, 1, 0.86],
  DF: [0.8, 0.9, 1],
  GK: [0.5, 0.72, 1],
}
/** Tipo de supertécnica → número al que suma (0 ataque, 1 control, 2 defensa) */
const TECH_SLOT: Record<string, 0 | 1 | 2> = { Shoot: 0, Dribble: 1, Block: 2, Catch: 2 }
/** Tope del bonus de técnicas por número */
const TECH_CAP = 6

/**
 * Números de duelo de la carta (ver docs/duelo.md):
 * 1. mezcla de sus stats afines: ataque = tiro 70 % + velocidad y control; control = control 60 % + velocidad y
 *    físico; defensa = defensa 60 % + físico y velocidad (porteros: parada 70 % + defensa y físico)
 * 2. × lo que aprovecha su puesto (un defensa con mucho tiro no ataca como un delantero; un portero, aún menos)
 * 3. + sus supertécnicas: cada una suma a su número (tiro → ataque, regate → control, bloqueo y parada → defensa;
 *    parada solo en porteros) 1 + TP/40, +1 si es tiro largo o bloqueo de tiros; como mucho +6 por número
 * 4. tope: media + 8 (y 25–99)
 * Si la carta tiene valores puestos a mano (CRUD oculto), mandan esos.
 */
export function duelStats(p: Player): DuelStats {
  const s = p.stats
  const raw = [
    s.shooting * 0.7 + s.speed * 0.15 + s.control * 0.15,
    s.control * 0.6 + s.speed * 0.25 + s.physical * 0.15,
    p.position === 'GK'
      ? s.goalkeeping * 0.7 + s.defense * 0.15 + s.physical * 0.15
      : s.defense * 0.6 + s.physical * 0.3 + s.speed * 0.1,
  ]
  const bonus = [0, 0, 0]
  for (const t of new Set(p.techniques)) {
    if (t.type === 'Catch' && p.position !== 'GK') continue
    bonus[TECH_SLOT[t.type]] += 1 + (t.cost ?? 30) / 40
    if (t.traits?.includes('long')) bonus[0] += 1
    if (t.traits?.includes('block')) bonus[2] += 1
  }
  const f = POS_FACTOR[p.position]
  const [att, con, def] = raw.map((r, i) => Math.max(25, Math.min(99, p.ovr + 8, Math.round(r * f[i] + Math.min(TECH_CAP, bonus[i])))))
  return { att: p.duel?.att ?? att, con: p.duel?.con ?? con, def: p.duel?.def ?? def }
}

/** Quién gana un duelo en una acción: compara esa estadística de las dos cartas (empate → gana la nota general) */
export function resolveDuel(a: Player, b: Player, action: DuelKey): 0 | 1 | -1 {
  const sa = duelStats(a)[action]
  const sb = duelStats(b)[action]
  if (sa === sb) return a.ovr === b.ovr ? 0 : a.ovr > b.ovr ? 1 : -1
  return sa > sb ? 1 : -1
}

/** Rival de la máquina con una media parecida a la tuya (±4; si no hay, el más cercano) */
export function duelOpponent(rating: number, rnd = Math.random): { name: string; xi: Player[] } {
  const teams = getDraftPools()
    .map(pool => ({ name: pool.label, xi: pickBestXI(getTeamRoster(pool)) }))
    .filter(t => t.xi.length === 11 && t.xi.some(p => p.position === 'GK'))
    .map(t => ({ ...t, rating: teamRating(t.xi) }))
  const near = teams.filter(t => Math.abs(t.rating - rating) <= 4)
  const list = near.length ? near : [...teams].sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating)).slice(0, 5)
  if (list.length) return list[Math.floor(rnd() * list.length)]
  // sin pools (no debería pasar): 11 cartas al azar
  const all = getAllPlayers()
  return { name: '???', xi: Array.from({ length: 11 }, () => all[Math.floor(rnd() * all.length)]) }
}

/** Premio del duelo: monedas y XP según el resultado */
export function duelReward(goals: [number, number]): { coins: number; xp: number } {
  if (goals[0] > goals[1]) return { coins: 400, xp: 60 }
  if (goals[0] === goals[1]) return { coins: 150, xp: 30 }
  return { coins: 50, xp: 15 }
}
