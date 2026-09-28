import type { Player } from '../types'
import { getAllPlayers, getPlayer } from '../data/catalog'
import type { ClubState } from './club'
import { loadLocalStats } from './local-stats'

/** Progreso del jugador: nivel y colección del club (en este dispositivo) + títulos, finales y drafts de las estadísticas */
export interface Progress {
  level: number
  /** 0–100 hacia el siguiente nivel */
  levelPct: number
  titles: number
  finals: number
  drafts: number
  /** Cartas distintas del club */
  owned: number
  collectionPct: number
  /** Sus 3 mejores cartas (o, si aún no tiene, 3 leyendas para enseñar el estilo) */
  showcase: Player[]
}

export const XP_PER_LEVEL = 200

/** Una carta por personaje (la primera de la lista): que no salga tres veces el mismo */
export function uniqueCharacters(players: Player[]): Player[] {
  const seen = new Set<string>()
  return players.filter(p => !seen.has(p.characterId) && seen.add(p.characterId))
}

export function loadProgress(club: ClubState): Progress {
  const s = loadLocalStats()
  const total = getAllPlayers().length
  const owned = Object.keys(club.cards).filter(id => club.cards[id] > 0).map(getPlayer).filter((p): p is Player => !!p)
  const byOvr = (a: Player, b: Player) => b.ovr - a.ovr
  const showcase = uniqueCharacters((owned.length ? owned : getAllPlayers().filter(p => p.category === 'Legendary Player' && p.image))
    .sort(byOvr))
    .slice(0, 3)
  return {
    level: Math.floor(club.xp / XP_PER_LEVEL) + 1,
    levelPct: Math.floor(((club.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100),
    titles: s.championships,
    finals: s.finalsReached,
    drafts: s.draftsCompleted,
    owned: owned.length,
    collectionPct: total ? Math.floor((owned.length / total) * 100) : 0,
    showcase,
  }
}
