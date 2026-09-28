import type { TranslationKey } from '../i18n/translations'
import type { ClubState } from './club'

/** Logros (fase 5): se ven en Insignias; salen de los contadores de siempre y del club */
export interface Achievement {
  id: string
  key: TranslationKey
  goal: number
  value: (s: ClubState) => number
}

const c = (event: string) => (s: ClubState) => s.career[event] ?? 0

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'draft1', key: 'ach.draft', goal: 1, value: c('drafts') },
  { id: 'draft25', key: 'ach.draft', goal: 25, value: c('drafts') },
  { id: 'title1', key: 'ach.title', goal: 1, value: c('titles') },
  { id: 'title10', key: 'ach.title', goal: 10, value: c('titles') },
  { id: 'duel10', key: 'ach.duel', goal: 10, value: c('duelWins') },
  { id: 'duel100', key: 'ach.duel', goal: 100, value: c('duelWins') },
  { id: 'cup1', key: 'ach.cup', goal: 1, value: c('cupWins') },
  { id: 'cup10', key: 'ach.cup', goal: 10, value: c('cupWins') },
  { id: 'puzzle10', key: 'ach.puzzle', goal: 10, value: c('puzzles') },
  { id: 'hl10', key: 'ach.hl', goal: 10, value: s => s.hlBest },
  { id: 'sbc5', key: 'ach.sbc', goal: 5, value: c('sbcs') },
  { id: 'evo1', key: 'ach.evo', goal: 1, value: c('evos') },
  { id: 'evo5', key: 'ach.evo', goal: 5, value: c('evos') },
  { id: 'coll1', key: 'ach.collection', goal: 1, value: s => s.collections.length },
  { id: 'coll10', key: 'ach.collection', goal: 10, value: s => s.collections.length },
  { id: 'cards100', key: 'ach.cards', goal: 100, value: s => Object.keys(s.cards).length },
  { id: 'cards500', key: 'ach.cards', goal: 500, value: s => Object.keys(s.cards).length },
]
