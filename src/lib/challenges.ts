import type { TranslationKey } from '../i18n/translations'
import { isoWeek } from './club'
import type { Objective } from './objectives'

/**
 * Retos de la semana de Fatal (como los objetivos semanales): cada semana salen 3 de esta lista, siempre los mismos
 * para todos. Se cuentan con track() al jugar (ver Duel.tsx y SimMatch.tsx) y se cobran igual que los objetivos.
 */
export interface Challenge extends Objective {
  text: TranslationKey
}

export const CHALLENGES: Challenge[] = [
  { id: 'ch-techs', event: 'fatalTechs', goal: 15, reward: { coins: 1000 }, text: 'ch.techs' },
  { id: 'ch-wins', event: 'fatalWins', goal: 3, reward: { pack: 'gold' }, text: 'ch.wins' },
  { id: 'ch-nospend', event: 'fatalNoSpend', goal: 1, reward: { coins: 1500 }, text: 'ch.noSpend' },
  { id: 'ch-pen', event: 'penGoals', goal: 2, reward: { pack: 'silver' }, text: 'ch.pen' },
  { id: 'ch-subs', event: 'subsMade', goal: 2, reward: { coins: 800 }, text: 'ch.subs' },
]

/** Los 3 retos de una semana ISO: de la lista, sin repetir */
export function weekChallenges(week = isoWeek()): Challenge[] {
  const k = Number(week.slice(0, 4)) * 53 + Number(week.slice(6))
  const n = CHALLENGES.length
  return [0, 2, 4].map(i => CHALLENGES[(k + i) % n])
}
