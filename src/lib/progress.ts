import type { Player } from '../types'
import { getAllPlayers, getPlayer } from '../data/catalog'
import { loadLocalStats } from './local-stats'

/** Progreso del jugador (nivel, títulos, colección), calculado de las estadísticas locales: sin cuenta ni servidor */
export interface Progress {
  level: number
  /** 0–100 hacia el siguiente nivel */
  levelPct: number
  titles: number
  finals: number
  drafts: number
  /** Cartas distintas que ha tenido en algún draft */
  owned: number
  collectionPct: number
  /** Sus 3 mejores cartas (o, si aún no tiene, 3 leyendas para enseñar el estilo) */
  showcase: Player[]
}

const XP_PER_LEVEL = 100

/** Una carta por personaje (la primera de la lista): que no salga tres veces el mismo */
export function uniqueCharacters(players: Player[]): Player[] {
  const seen = new Set<string>()
  return players.filter(p => !seen.has(p.characterId) && seen.add(p.characterId))
}

export function loadProgress(): Progress {
  const s = loadLocalStats()
  const xp = s.runsStarted * 10 + s.draftsCompleted * 25 + s.finalsReached * 50 + s.championships * 100
  const total = getAllPlayers().length
  const owned = s.uniquePlayerIds.map(getPlayer).filter((p): p is Player => !!p)
  const byOvr = (a: Player, b: Player) => b.ovr - a.ovr
  const showcase = uniqueCharacters((owned.length ? owned : getAllPlayers().filter(p => p.category === 'Legendary Player' && p.image))
    .sort(byOvr))
    .slice(0, 3)
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    levelPct: xp % XP_PER_LEVEL,
    titles: s.championships,
    finals: s.finalsReached,
    drafts: s.draftsCompleted,
    owned: owned.length,
    collectionPct: total ? Math.floor((owned.length / total) * 100) : 0,
    showcase,
  }
}
