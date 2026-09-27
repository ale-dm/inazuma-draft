import type { Player, PlayerStats, Position } from '../types'
import { DEFAULT_FORMATION, lineupToArray, type FormationId, type LineupMap } from './lineup'

/** Stats mostradas en la carta según el puesto */
export const POSITION_STAT_KEYS: Record<Position, (keyof PlayerStats)[]> = {
  GK: ['goalkeeping', 'physical', 'defense'],
  DF: ['defense', 'physical', 'speed'],
  MF: ['control', 'speed', 'shooting'],
  FW: ['shooting', 'speed', 'control'],
}

export const ALL_STAT_KEYS: (keyof PlayerStats)[] = ['shooting', 'control', 'physical', 'speed', 'defense', 'goalkeeping']

export function displayStatValue(p: Player, key: keyof PlayerStats): number {
  return p.stats[key]
}

/** Nota global de la carta (OVR, escala FIFA; ver docs/plan-base-jugadores.md) */
export function playerRating(p: Player): number {
  return p.ovr
}

export function playerPower(p: Player): number {
  return p.ovr
}

export function teamPower(players: Player[]): number {
  return players.reduce((sum, p) => sum + p.ovr, 0)
}

export function lineupPower(lineup: LineupMap, formationId: FormationId = DEFAULT_FORMATION): number {
  return teamPower(lineupToArray(lineup, formationId))
}
