import { addCoins, addPack, getClub, isoWeek, today, updateClub } from './club'

/** Premio: monedas y/o un sobre */
export interface Reward {
  coins?: number
  pack?: string
}

export function giveReward(r: Reward) {
  if (r.coins) addCoins(r.coins)
  if (r.pack) addPack(r.pack)
}

/** Premio diario por entrar, según los días seguidos (vuelve a empezar tras el 7.º) */
export const DAILY: Reward[] = [
  { coins: 300 }, { coins: 400 }, { coins: 500 }, { coins: 700 }, { coins: 900 }, { coins: 1200 }, { pack: 'gold' },
]

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function dailyAvailable(): boolean {
  return getClub().lastDaily !== today()
}

/** Día de la racha que toca cobrar hoy (1–7) */
export function dailyDay(): number {
  const s = getClub()
  const streak = s.lastDaily === yesterday() ? s.streak : 0
  return (streak % DAILY.length) + 1
}

export function claimDaily(): Reward | null {
  if (!dailyAvailable()) return null
  const day = dailyDay()
  const reward = DAILY[day - 1]
  updateClub(s => ({ ...s, lastDaily: today(), streak: s.lastDaily === yesterday() ? s.streak + 1 : 1 }))
  giveReward(reward)
  return reward
}

/** Objetivos del día: contador (ver track / trackMax en club.ts), meta y premio */
export interface Objective {
  id: string
  event: string
  goal: number
  reward: Reward
}

export const DAILY_OBJECTIVES: Objective[] = [
  { id: 'draft', event: 'drafts', goal: 1, reward: { coins: 300 } },
  { id: 'packs', event: 'packs', goal: 2, reward: { coins: 300 } },
  { id: 'chem', event: 'chem', goal: 24, reward: { coins: 500 } },   // química de 0–33
  { id: 'semis', event: 'semis', goal: 1, reward: { coins: 400 } },
  { id: 'title', event: 'titles', goal: 1, reward: { pack: 'gold' } },
]

export function objectiveProgress(o: Objective): number {
  const s = getClub()
  return s.day === today() ? s.counters[o.event] ?? 0 : 0
}

export function objectiveClaimed(o: Objective): boolean {
  const s = getClub()
  return s.day === today() && s.claimed.includes(o.id)
}

export function claimObjective(o: Objective): boolean {
  if (objectiveClaimed(o) || objectiveProgress(o) < o.goal) return false
  updateClub(s => ({ ...s, claimed: [...s.claimed, o.id] }))
  giveReward(o.reward)
  return true
}

// ---------------------------------------------------------------- semanales y de carrera

/** Objetivos de la semana (se reinician el lunes): contadores de track() en club.ts */
export const WEEKLY_OBJECTIVES: Objective[] = [
  { id: 'w-drafts', event: 'drafts', goal: 5, reward: { coins: 1000 } },
  { id: 'w-packs', event: 'packs', goal: 10, reward: { coins: 1000 } },
  { id: 'w-duels', event: 'duelWins', goal: 3, reward: { pack: 'gold' } },
  { id: 'w-cups', event: 'cups', goal: 3, reward: { coins: 1500 } },
  { id: 'w-hl', event: 'hl', goal: 5, reward: { coins: 800 } },
  { id: 'w-titles', event: 'titles', goal: 2, reward: { coins: 2000, pack: 'gold' } },
]

/** Objetivos de carrera (para siempre, por escalones) */
export const CAREER_OBJECTIVES: Objective[] = [
  { id: 'c-drafts-10', event: 'drafts', goal: 10, reward: { coins: 2000 } },
  { id: 'c-drafts-50', event: 'drafts', goal: 50, reward: { pack: 'legend' } },
  { id: 'c-titles-1', event: 'titles', goal: 1, reward: { pack: 'gold' } },
  { id: 'c-titles-10', event: 'titles', goal: 10, reward: { pack: 'legend' } },
  { id: 'c-packs-25', event: 'packs', goal: 25, reward: { coins: 2000 } },
  { id: 'c-packs-100', event: 'packs', goal: 100, reward: { pack: 'legend' } },
  { id: 'c-duels-10', event: 'duelWins', goal: 10, reward: { pack: 'gold' } },
  { id: 'c-duels-50', event: 'duelWins', goal: 50, reward: { pack: 'legend' } },
  { id: 'c-cups-5', event: 'cupWins', goal: 5, reward: { pack: 'gold' } },
  { id: 'c-puzzles-5', event: 'puzzles', goal: 5, reward: { pack: 'gold' } },
]

export function weeklyProgress(o: Objective): number {
  const s = getClub()
  return s.week === isoWeek() ? s.weekCounters[o.event] ?? 0 : 0
}

export function weeklyClaimed(o: Objective): boolean {
  const s = getClub()
  return s.week === isoWeek() && s.weekClaimed.includes(o.id)
}

export function claimWeekly(o: Objective): boolean {
  if (weeklyClaimed(o) || weeklyProgress(o) < o.goal) return false
  updateClub(s => ({ ...s, weekClaimed: [...s.weekClaimed, o.id] }))
  giveReward(o.reward)
  return true
}

export function careerProgress(o: Objective): number {
  return getClub().career[o.event] ?? 0
}

export function careerClaimed(o: Objective): boolean {
  return getClub().careerClaimed.includes(o.id)
}

export function claimCareer(o: Objective): boolean {
  if (careerClaimed(o) || careerProgress(o) < o.goal) return false
  updateClub(s => ({ ...s, careerClaimed: [...s.careerClaimed, o.id] }))
  giveReward(o.reward)
  return true
}

/** Objetivos cumplidos y sin cobrar (día, semana, carrera) + premio diario: el aviso rojo de la pantalla principal */
export function pendingRewards(): number {
  return Number(dailyAvailable())
    + DAILY_OBJECTIVES.filter(o => !objectiveClaimed(o) && objectiveProgress(o) >= o.goal).length
    + WEEKLY_OBJECTIVES.filter(o => !weeklyClaimed(o) && weeklyProgress(o) >= o.goal).length
    + CAREER_OBJECTIVES.filter(o => !careerClaimed(o) && careerProgress(o) >= o.goal).length
}

/** Premio de una colección completa */
export const COLLECTION_REWARD: Reward = { coins: 2000, pack: 'gold' }
