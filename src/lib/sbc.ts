import type { Category, GameId, Player } from '../types'
import type { TranslationKey } from '../i18n/translations'
import { RARITY_ORDER } from './packs'
import { getClub, removeCopies, track, updateClub } from './club'
import { giveReward, type Reward } from './objectives'

/**
 * Retos (SBC, fase 5): entregas cartas repetidas (se gasta una copia de cada una, nunca la última) que cumplan los
 * requisitos, a cambio de un premio. Algunos se pueden repetir.
 */
export type SbcReq =
  | { kind: 'rating'; n: number }
  | { kind: 'sameGame' | 'sameTeam' | 'sameElement'; n: number }
  | { kind: 'minCategory'; n: number; category: Category }
  | { kind: 'team'; n: number; team: string }
  | { kind: 'games'; games: GameId[] }

export interface Sbc {
  id: string
  nameKey: TranslationKey
  size: number
  reqs: SbcReq[]
  reward: Reward
  repeatable?: boolean
}

export const SBCS: Sbc[] = [
  { id: 'bronze-swap', nameKey: 'sbc.bronzeSwap', size: 5, reqs: [], reward: { pack: 'silver' }, repeatable: true },
  { id: 'silver-swap', nameKey: 'sbc.silverSwap', size: 5, reqs: [{ kind: 'rating', n: 72 }], reward: { pack: 'gold' }, repeatable: true },
  { id: 'same-game', nameKey: 'sbc.sameGame', size: 5, reqs: [{ kind: 'sameGame', n: 5 }], reward: { coins: 2000 }, repeatable: true },
  { id: 'same-element', nameKey: 'sbc.sameElement', size: 6, reqs: [{ kind: 'sameElement', n: 6 }, { kind: 'rating', n: 70 }], reward: { pack: 'gold' }, repeatable: true },
  { id: 'teammates', nameKey: 'sbc.teammates', size: 4, reqs: [{ kind: 'sameTeam', n: 4 }], reward: { coins: 3000, pack: 'team-week' } },
  { id: 'raimon', nameKey: 'sbc.raimon', size: 4, reqs: [{ kind: 'team', n: 4, team: 'Raimon' }], reward: { coins: 5000, pack: 'legend' } },
  { id: 'elite', nameKey: 'sbc.elite', size: 7, reqs: [{ kind: 'rating', n: 80 }, { kind: 'minCategory', n: 2, category: 'Top Player' }], reward: { pack: 'legend' }, repeatable: true },
  { id: 'go-saga', nameKey: 'sbc.goSaga', size: 6, reqs: [{ kind: 'games', games: ['GO1', 'GO2', 'GO3'] }, { kind: 'rating', n: 74 }], reward: { coins: 2500, pack: 'saga-go' } },
]

const NO_TEAM = new Set(['Unaffiliated', 'Sub Character'])

function maxSame(players: Player[], key: (p: Player) => string | null): number {
  const n = new Map<string, number>()
  for (const p of players) {
    const k = key(p)
    if (k) n.set(k, (n.get(k) ?? 0) + 1)
  }
  return Math.max(0, ...n.values())
}

/** Media de las cartas entregadas (redondeada) */
export const avgRating = (players: Player[]) => (players.length ? Math.round(players.reduce((s, p) => s + p.ovr, 0) / players.length) : 0)

export function reqValue(r: SbcReq, players: Player[]): number {
  switch (r.kind) {
    case 'rating': return avgRating(players)
    case 'sameGame': return maxSame(players, p => p.game)
    case 'sameTeam': return maxSame(players, p => (NO_TEAM.has(p.team) ? null : p.team))
    case 'sameElement': return maxSame(players, p => p.element)
    case 'minCategory': return players.filter(p => RARITY_ORDER.indexOf(p.category) >= RARITY_ORDER.indexOf(r.category)).length
    case 'team': return players.filter(p => p.team === r.team || p.extraTeams.includes(r.team)).length
    case 'games': return players.filter(p => r.games.includes(p.game)).length
  }
}

export function reqOk(r: SbcReq, players: Player[], size: number): boolean {
  return reqValue(r, players) >= (r.kind === 'games' ? size : r.n)
}

export const sbcAvailable = (c: Sbc) => c.repeatable || !getClub().sbcDone[c.id]

export function sbcReady(c: Sbc, players: Player[]): boolean {
  return sbcAvailable(c) && players.length === c.size && c.reqs.every(r => reqOk(r, players, c.size))
    && players.every(p => (getClub().cards[p.id] ?? 0) > 1)
}

export function submitSbc(c: Sbc, players: Player[]): boolean {
  if (!sbcReady(c, players)) return false
  removeCopies(players.map(p => p.id))
  updateClub(s => ({ ...s, sbcDone: { ...s.sbcDone, [c.id]: (s.sbcDone[c.id] ?? 0) + 1 } }))
  giveReward(c.reward)
  track('sbcs')
  return true
}
