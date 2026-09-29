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

/**
 * Plantillas por perfil, sacadas de las cartas de MADFUT (diferencia con la media) [ataque, control, defensa]:
 * delantero (Mbappé 91: 89/83/42), delantero de toque, medio de ataque (De Bruyne 90: 86/89/64), medio defensivo
 * (Guijarro 88: 84/83/86), central (van Dijk 89: 67/70/87), carrilero y portero (Donnarumma 89: 39/34/88).
 */
const TEMPLATE = {
  'FW-st': [-2, -8, -44],
  'FW-cr': [-4, -3, -40],
  'MF-at': [-5, -3, -30],
  'MF-df': [-8, -6, -3],
  'DF-cb': [-23, -20, -2],
  'DF-wb': [-15, -9, -4],
  GK: [-50, -54, -1],
} as const
type Profile = keyof typeof TEMPLATE

/** Perfil de la carta según su puesto y sus stats */
export function duelProfile(p: Player): Profile {
  const s = p.stats
  if (p.position === 'FW') return s.control > s.shooting ? 'FW-cr' : 'FW-st'
  if (p.position === 'MF') return s.defense > Math.max(s.shooting, s.control) ? 'MF-df' : 'MF-at'
  if (p.position === 'DF') return s.control + s.speed > 2 * s.defense + 6 ? 'DF-wb' : 'DF-cb'
  return 'GK'
}

/** Tipo de supertécnica → número al que suma (0 ataque, 1 control, 2 defensa) */
const TECH_SLOT: Record<string, 0 | 1 | 2> = { Shoot: 0, Dribble: 1, Block: 2, Catch: 2 }

/**
 * Números de duelo de la carta, con la escala de MADFUT (ver docs/duelo.md):
 * 1. la plantilla de su perfil sobre la media (el número fuerte queda 1–3 por debajo; el flojo, muy por debajo)
 * 2. ajuste propio: (su stat afín − media) × 0,3, entre −6 y +2 (tiro → ataque, control → control, defensa → defensa;
 *    porteros: parada)
 * 3. supertécnicas: +1 por cada 2 del tipo del número (tiro, regate, bloqueo; parada solo en porteros), +2 como mucho
 * 4. nunca por encima de la media − 1 (como en MADFUT), mínimo 20
 * Si la carta tiene valores puestos a mano (CRUD oculto), mandan esos.
 */
export function duelStats(p: Player): DuelStats {
  const s = p.stats
  const raw = [s.shooting, s.control, p.position === 'GK' ? s.goalkeeping : s.defense]
  const techs = [0, 0, 0]
  for (const t of new Set(p.techniques)) {
    if (t.type === 'Catch' && p.position !== 'GK') continue
    techs[TECH_SLOT[t.type]]++
  }
  const tpl = TEMPLATE[duelProfile(p)]
  const [att, con, def] = tpl.map((off, i) => {
    const adj = Math.max(-6, Math.min(2, Math.round((raw[i] - p.ovr) * 0.3))) + Math.min(2, Math.floor(techs[i] / 2))
    return Math.max(20, Math.min(p.ovr - 1, p.ovr + off + adj))
  })
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
