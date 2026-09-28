import type { GameId, Player } from '../types'
import { GAMES, getAllPlayers } from '../data/catalog'
import { FORMATIONS, getFormation, type FormationId, type LineupMap } from './lineup'
import { chemistry } from './chemistry'
import { createRngFromSeed } from './rng'

/**
 * Puzzles de draft (fase 4): una formación y ~17 cartas fijas; hay que colocar 11 y llegar a la química objetivo.
 * El puzzle sale de una semilla: se monta primero una solución (casi todos del mismo juego, muchos de la misma
 * afinidad y unos cuantos del mismo equipo), su química es el objetivo (así siempre tiene solución) y se añaden
 * cartas trampa de los mismos puestos pero de otro juego y otra afinidad.
 */
export interface Puzzle {
  id: string
  formation: FormationId
  cards: Player[]
  target: number
}

export const PUZZLE_COUNT = 30
export const PUZZLE_REWARD = 500
export const DECOYS = 6

export const dailyPuzzleId = (day: string) => `d-${day}`

export function makePuzzle(id: string): Puzzle {
  const rnd = createRngFromSeed(`puzzle-${id}`)
  const pick = <T,>(l: T[]): T => l[Math.floor(rnd() * l.length)]
  const all = getAllPlayers().filter(p => p.image)
  const formation = pick(FORMATIONS).id
  const slots = getFormation(formation).slots

  const byGame = new Map<GameId, Player[]>()
  for (const p of all) byGame.set(p.game, [...(byGame.get(p.game) ?? []), p])
  const game = pick(GAMES.filter(g => (byGame.get(g)?.length ?? 0) >= 60))
  const inGame = byGame.get(game) ?? all
  const element = pick(['fire', 'wood', 'air', 'earth'] as const)
  const teamCount = new Map<string, number>()
  for (const p of inGame) teamCount.set(p.team, (teamCount.get(p.team) ?? 0) + 1)
  const teams = [...teamCount].filter(([t, n]) => n >= 8 && t !== 'Unaffiliated' && t !== 'Sub Character').map(([t]) => t).sort()
  const team = teams.length ? pick(teams) : null

  const used = new Set<string>()
  const lineup: LineupMap = {}
  const solution: Player[] = []
  for (const s of slots) {
    const free = (l: Player[]) => l.filter(p => p.position === s.role && !used.has(p.characterId))
    const base = free(inGame)
    const tiers = [
      team && rnd() < 0.55 ? base.filter(p => p.team === team) : [],
      rnd() < 0.8 ? base.filter(p => p.element === element) : [],
      base,
      free(all),
    ]
    const list = tiers.find(l => l.length) ?? []
    const p = pick(list)
    if (!p) continue
    used.add(p.characterId)
    lineup[s.id] = p
    solution.push(p)
  }
  const target = chemistry(lineup).team

  const decoys: Player[] = []
  for (let i = 0; i < DECOYS; i++) {
    const role = pick(slots).role
    const list = all.filter(p => p.position === role && p.game !== game && p.element !== element && !used.has(p.characterId))
    const p = pick(list)
    if (!p) continue
    used.add(p.characterId)
    decoys.push(p)
  }
  const cards = [...solution, ...decoys]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return { id, formation, cards, target }
}
