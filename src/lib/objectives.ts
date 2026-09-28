import { addCoins, addPack, getClub, today, updateClub } from './club'

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
  { id: 'chem', event: 'chem', goal: 60, reward: { coins: 500 } },
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

/** Objetivos del día cumplidos y sin cobrar + premio diario: el aviso rojo de la pantalla principal */
export function pendingRewards(): number {
  return Number(dailyAvailable()) + DAILY_OBJECTIVES.filter(o => !objectiveClaimed(o) && objectiveProgress(o) >= o.goal).length
}

/** Premio de una colección completa */
export const COLLECTION_REWARD: Reward = { coins: 2000, pack: 'gold' }
