import type { Player } from '../types'
import type { LineupMap, SlotId } from './lineup'

/**
 * Química al estilo MADFUT/FC actual, adaptada a Inazuma (ver docs/app-log.md):
 *   liga → mismo juego (IE1, GO2, VR…) · nación → misma afinidad (fuego, aire, bosque, montaña) · club → mismo equipo.
 * Cada jugador del once suma puntos por cuántos del once comparten su juego, su afinidad y su equipo (máximo 3 por
 * jugador, 33 el equipo). El capitán cuenta doble para los umbrales (como los Iconos/Héroes).
 */
export type ChemGroup = 'game' | 'element' | 'team'

export const CHEM_GROUPS: ChemGroup[] = ['game', 'element', 'team']

/** Nº de jugadores que hacen falta para +1, +2 y +3 */
export const THRESHOLDS: Record<ChemGroup, [number, number, number]> = {
  // ajustado con 400 onces al azar del catálogo: media ≈ 10/33 (con 3/5/8 y 2/5/8 salía 23, demasiado fácil:
  // solo hay 4 afinidades y 9 juegos, uno de ellos con 943 cartas)
  game: [4, 6, 8],
  element: [4, 7, 10],
  team: [2, 4, 7],
}

export const MAX_PLAYER_CHEM = 3
export const MAX_TEAM_CHEM = 33

/** Cartas sin equipo propio: no suman química de equipo */
const NO_TEAM = new Set(['Unaffiliated', 'Sub Character'])

function groupKey(p: Player, g: ChemGroup): string | null {
  if (g === 'game') return p.game
  if (g === 'element') return p.element
  return NO_TEAM.has(p.team) ? null : p.team
}

export function pointsFor(count: number, g: ChemGroup): number {
  return THRESHOLDS[g].filter(n => count >= n).length
}

export interface Chemistry {
  /** Química de cada jugador del once, 0–3 */
  players: Partial<Record<SlotId, number>>
  /** Puntos de cada jugador por grupo (para explicar de dónde salen) */
  detail: Partial<Record<SlotId, Record<ChemGroup, number>>>
  /** Cuántos hay de cada juego, afinidad y equipo en el once (el capitán cuenta 2) */
  counts: Record<ChemGroup, Record<string, number>>
  /** Química del equipo, 0–33 */
  team: number
}

export function chemistry(lineup: LineupMap, captain?: SlotId): Chemistry {
  const entries = (Object.entries(lineup) as [SlotId, Player | undefined][]).filter((e): e is [SlotId, Player] => !!e[1])
  const counts: Record<ChemGroup, Record<string, number>> = { game: {}, element: {}, team: {} }
  for (const [slot, p] of entries) {
    const weight = slot === captain ? 2 : 1
    for (const g of CHEM_GROUPS) {
      const k = groupKey(p, g)
      if (k) counts[g][k] = (counts[g][k] ?? 0) + weight
    }
  }
  const players: Partial<Record<SlotId, number>> = {}
  const detail: Partial<Record<SlotId, Record<ChemGroup, number>>> = {}
  for (const [slot, p] of entries) {
    const d = {} as Record<ChemGroup, number>
    for (const g of CHEM_GROUPS) {
      const k = groupKey(p, g)
      d[g] = k ? pointsFor(counts[g][k], g) : 0
    }
    detail[slot] = d
    players[slot] = Math.min(MAX_PLAYER_CHEM, d.game + d.element + d.team)
  }
  const team = Object.values(players).reduce((s, c) => s + (c ?? 0), 0)
  return { players, detail, counts, team }
}

/** Media del equipo con la fórmula de FUT: media de los 11 + lo que los mejores superan esa media, repartido */
export function teamRating(players: Player[]): number {
  if (!players.length) return 0
  const sum = players.reduce((s, p) => s + p.ovr, 0)
  const avg = sum / players.length
  const extra = players.reduce((s, p) => s + Math.max(0, p.ovr - avg), 0)
  return Math.floor((sum + extra) / 11)
}
