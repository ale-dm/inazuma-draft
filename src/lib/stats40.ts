import type { Player, Position } from '../types'
import { getAllPlayers } from '../data/catalog'

/** 7 stats del juego (nivel 40), en el orden de Victory Road */
export const STAT40_KEYS = ['kick', 'control', 'technique', 'pressure', 'physical', 'intelligence', 'agility'] as const
export const STAT40_ICONS = [
  '/icons/icon_parameter01.png', '/icons/icon_parameter02.png', '/icons/icon_parameter03.png',
  '/icons/icon_parameter04.png', '/icons/icon_parameter05.png', '/icons/icon_parameter06.png',
  '/icons/icon_parameter07.png',
]

/** Roles del mod: principal (S+), secundaria (A+), resto (B+) */
const ROLES: Record<Position, { main: number[]; sec: number[] }> = {
  FW: { main: [0, 1], sec: [2, 4, 5] },
  MF: { main: [1, 2, 5], sec: [0, 6, 4] },
  DF: { main: [3, 4, 5], sec: [2, 6] },
  GK: { main: [6, 4, 3], sec: [5] },
}

const RANKS: [number, string][] = [[92, 'S+'], [88, 'S'], [84, 'A+'], [80, 'A'], [76, 'B+'], [72, 'B'], [68, 'C+'], [0, 'C']]
const RANK_CLASS: Record<string, string> = { 'S+': 'g-s', S: 'g-s', 'A+': 'g-a', A: 'g-a', 'B+': 'g-b', B: 'g-b', 'C+': 'g-c', C: 'g-c' }

export function rankOf(ovr: number): string {
  return RANKS.find(([min]) => ovr >= min)![1]
}

export function rankClass(rank: string): string {
  return RANK_CLASS[rank] ?? 'g-c'
}

interface Dist { vals: number[][]; medias: number[] }
const cache = new Map<Position, Dist>()

function dist(position: Position): Dist {
  const hit = cache.get(position)
  if (hit) return hit
  const pool = getAllPlayers().filter(p => p.position === position && p.stats40?.length === 7)
  const vals = STAT40_KEYS.map((_, i) => pool.map(p => p.stats40![i]).sort((a, b) => a - b))
  const medias = pool.map(p => p.ovr).sort((a, b) => a - b)
  const d = { vals, medias }
  cache.set(position, d)
  return d
}

function pct(sorted: number[], v: number): number {
  let lo = 0
  let hi = 0
  for (const x of sorted) {
    if (x < v) lo++
    else if (x === v) hi++
  }
  return (lo + 0.5 * hi) / Math.max(1, sorted.length)
}

/** Letra de una stat: se pasa a la escala de medias por cuantiles dentro del puesto y se limita por rol. */
export function statRank(player: Player, index: number): string | null {
  const s = player.stats40
  if (!s || s.length !== 7) return null
  const d = dist(player.position)
  if (!d.vals[index]?.length || !d.medias.length) return rankOf(player.ovr)
  const q = pct(d.vals[index], s[index])
  const eq = d.medias[Math.min(d.medias.length - 1, Math.max(0, Math.round(q * (d.medias.length - 1))))]
  const role = ROLES[player.position]
  const cap = role.main.includes(index) ? 'S+' : role.sec.includes(index) ? 'A+' : 'B+'
  const rank = rankOf(eq)
  const order = RANKS.map(r => r[1])
  return order.indexOf(rank) < order.indexOf(cap) ? rank : cap
}

export const DUEL40_KEYS = ['shot', 'dribbleAt', 'dribbleDf', 'scrambleAt', 'scrambleDf', 'wall', 'catch'] as const

/** Duelos del juego con las stats de nivel 40 */
export function duels40(s: number[]): Record<(typeof DUEL40_KEYS)[number], number> {
  const [k, c, t, p, ph, i, a] = s
  return {
    shot: k + c,
    dribbleAt: t + c + 0.5 * k,
    dribbleDf: t + i + 0.5 * a,
    scrambleAt: i + ph,
    scrambleDf: i + p,
    wall: p + ph,
    catch: 2 * p + 3 * ph + 4 * a,
  }
}
