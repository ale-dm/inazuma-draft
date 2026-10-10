import { getClub, updateClub } from './club'

/**
 * Dificultad del Fatal (clásico y Sim). Cambia cuánto ve la IA de tus números (`noise`), cuánto cuida sus cartas buenas
 * (`cost`), cuánto se adapta su equipo al tuyo (`duelPull`, `simPull`; ver fatal.ts) y el premio (`reward`).
 * Lo medido con `npm run balance` es el nivel normal.
 */
export type Difficulty = 'easy' | 'normal' | 'hard'

export interface Level {
  noise: number
  cost: number
  duelPull: number
  simPull: number
  reward: number
}

export const LEVELS: Record<Difficulty, Level> = {
  // pull: cuánto del desequilibrio se cierra. Por encima de 1, el rival queda por debajo de ti; por debajo, sigue más fuerte
  easy: { noise: 3.5, cost: 0.6, duelPull: 1.05, simPull: 1, reward: 0.7 },
  normal: { noise: 2, cost: 0.45, duelPull: 0.9, simPull: 0.8, reward: 1 },
  hard: { noise: 0.8, cost: 0.3, duelPull: 0.6, simPull: 0.5, reward: 1.5 },
}

export const difficulty = (): Difficulty => getClub().difficulty ?? 'normal'
export const level = (): Level => LEVELS[difficulty()]

export function setDifficulty(d: Difficulty) {
  updateClub(s => ({ ...s, difficulty: d }))
}
