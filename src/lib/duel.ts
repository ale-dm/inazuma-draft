import type { Player } from '../types'
import { getAllPlayers, getDraftPools, getTeamRoster } from '../data/catalog'
import { pickBestXI } from '../data/ffi-rosters'
import { teamRating } from './chemistry'

/**
 * Duelo (estilo MADFUT/FC, fase 4). Cada carta tiene 3 números de combate que salen de sus estadísticas:
 * verde ataque, azul control de balón y rojo defensa. De momento solo cuentan los números y el portero; las
 * supertécnicas y la afinidad están sin usar a propósito: ideas en docs/duelo.md.
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
 * Se reutilizan las 3 estadísticas más afines de la carta (tiro, control, defensa), sin inventar una fórmula nueva.
 * Los porteros no tienen buena "defensa" de campo, así que su rojo mezcla defensa y parada. Si la carta tiene
 * valores de duelo puestos a mano (CRUD oculto), mandan esos.
 */
export function duelStats(p: Player): DuelStats {
  const { shooting, control, defense, goalkeeping } = p.stats
  return {
    att: p.duel?.att ?? shooting,
    con: p.duel?.con ?? control,
    def: p.duel?.def ?? (p.position === 'GK' ? Math.round((defense + goalkeeping) / 2) : defense),
  }
}

/** Quién gana un duelo en una acción: compara esa estadística de las dos cartas (empate → gana la nota general) */
export function resolveDuel(a: Player, b: Player, action: DuelKey): 0 | 1 | -1 {
  const sa = duelStats(a)[action]
  const sb = duelStats(b)[action]
  if (sa === sb) return a.ovr === b.ovr ? 0 : a.ovr > b.ovr ? 1 : -1
  return sa > sb ? 1 : -1
}

// ---------------------------------------------------------------- partido de duelo

/** Jugadas por partido: cada una gasta una carta de campo de cada equipo (hay 10) */
export const DUEL_ROUNDS = 7

export interface DuelTeam {
  name: string
  /** Portero: no se juega como carta, para los tiros */
  gk: Player
  /** Cartas de campo que se pueden jugar */
  field: Player[]
}

export interface DuelRound {
  /** Carta jugada por cada equipo [tú, rival] */
  cards: [Player, Player]
  /** Control contra control: quién se lleva el balón (−1: nadie, empate total) */
  ball: 0 | 1 | -1
  /** Tiro de quien tiene el balón: su ataque contra la defensa de la carta rival y el portero */
  shot?: { by: 0 | 1; att: number; block: number; gk: number; goal: boolean }
}

/** Parada del portero para el duelo: su estadística de parada */
export const keeperSave = (gk: Player) => gk.stats.goalkeeping

/**
 * Una jugada: 1) medio campo, control contra control (empate: la nota general); 2) quien gana el balón tira: su
 * ataque contra la media de la defensa de la carta rival y la parada de su portero. Gol si el ataque es mayor.
 */
export function playRound(mine: Player, theirs: Player, myGk: Player, theirGk: Player): DuelRound {
  const r = resolveDuel(mine, theirs, 'con')
  if (r === 0) return { cards: [mine, theirs], ball: -1 }
  const by: 0 | 1 = r === 1 ? 0 : 1
  const [shooter, blocker, keeper] = by === 0 ? [mine, theirs, theirGk] : [theirs, mine, myGk]
  const att = duelStats(shooter).att
  const block = duelStats(blocker).def
  const gk = keeperSave(keeper)
  return { cards: [mine, theirs], ball: by, shot: { by, att, block, gk, goal: att > Math.round((block + gk) / 2) } }
}

/** Once → equipo de duelo: el portero aparte y las 10 cartas de campo */
export function toDuelTeam(name: string, xi: Player[]): DuelTeam {
  const gk = xi.find(p => p.position === 'GK') ?? [...xi].sort((a, b) => b.stats.goalkeeping - a.stats.goalkeeping)[0]
  return { name, gk, field: xi.filter(p => p !== gk) }
}

/**
 * La máquina elige carta: prefiere buen control (gana el balón) sin olvidar ataque y defensa, con algo de azar para
 * que no sea siempre la misma.
 */
export function aiPick(hand: Player[], rnd = Math.random): Player {
  const score = (p: Player) => {
    const d = duelStats(p)
    return d.con * 0.5 + d.att * 0.25 + d.def * 0.25 + (rnd() - 0.5) * 18
  }
  return hand.reduce((best, p) => (score(p) > score(best) ? p : best), hand[0])
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
