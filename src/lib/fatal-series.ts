import { getClub, isoWeek, updateClub, type FatalProgress } from './club'
import { giveReward, type Reward } from './objectives'

/**
 * Series de Fatal (como en MADFUT): Mi club y Simulación tienen 7 series por media máxima del once (la última, "X",
 * sin límite); cada partido suma puntos (contra la máquina: victoria 3, empate 1, derrota 1) y al llegar a
 * SERIES_GOAL la serie se completa y da su premio. El Draft va por divisiones (3 → 2 → 1 → élite): victoria 3,
 * empate 1, derrota 0; con DIV_GOAL se sube. Todo vuelve a empezar cada temporada (cada semana, el lunes).
 */
export type SeriesMode = 'club' | 'sim'

export interface Series {
  id: string
  mode: SeriesMode
  /** Media máxima del once (null = X, sin límite) */
  cap: number | null
  reward: Reward
}

export const SERIES_GOAL = 9
export const DIV_GOAL = 9
export const MATCH_POINTS = { win: 3, draw: 1, loss: 1 }
export const DRAFT_POINTS = { win: 3, draw: 1, loss: 0 }

const series = (mode: SeriesMode, caps: (number | null)[], rewards: Reward[]): Series[] =>
  caps.map((cap, i) => ({ id: `${mode}-${cap ?? 'x'}`, mode, cap, reward: rewards[i] }))

export const CLUB_SERIES = series('club', [70, 75, 80, 84, 87, 90, null], [
  { token: 'one-silver' }, { pack: 'silver' }, { token: 'one-80' }, { pack: 'gold' }, { token: 'one-85' }, { pack: 'x2-random' }, { token: 'one-90' },
])
export const SIM_SERIES = series('sim', [68, 74, 80, 84, 88, 91, null], [
  { pack: 'silver' }, { token: 'one-80' }, { pack: 'gold' }, { token: 'one-85' }, { pack: 'x2-random' }, { token: 'one-88' }, { pack: 'legend' },
])

/** Premio por subir de división (3→2, 2→1, 1→élite) y por cada partido ganado en élite */
export const DIVISION_REWARD: Record<number, Reward> = { 3: { pack: 'gold' }, 2: { pack: 'x2-random' }, 1: { token: 'one-90' }, 0: { coins: 1500 } }

/** Temporada actual: número de semana del año */
export const seasonNumber = (week = isoWeek()) => Number(week.slice(6))

/** Progreso de Fatal de esta temporada (si ha cambiado la semana, todo a cero) */
export function fatalProgress(): FatalProgress {
  const f = getClub().fatal
  return f && f.season === isoWeek() ? f : { season: isoWeek(), points: {}, done: [], division: 3, divPoints: 0 }
}

export const seriesDone = (s: Series) => fatalProgress().done.includes(s.id)
export const seriesPoints = (s: Series) => Math.min(SERIES_GOAL, fatalProgress().points[s.id] ?? 0)
export const doneCount = (mode: SeriesMode) => (mode === 'club' ? CLUB_SERIES : SIM_SERIES).filter(seriesDone).length

export function findSeries(id: string): Series | undefined {
  return [...CLUB_SERIES, ...SIM_SERIES].find(s => s.id === id)
}

/** Suma el resultado de un partido a su serie; si se completa, da el premio */
export function addSeriesResult(s: Series, result: 0 | 1 | -1): { points: number; completed: boolean } {
  const pts = result === 0 ? MATCH_POINTS.win : result === -1 ? MATCH_POINTS.draw : MATCH_POINTS.loss
  const f = fatalProgress()
  if (f.done.includes(s.id)) return { points: 0, completed: false }
  const total = (f.points[s.id] ?? 0) + pts
  const completed = total >= SERIES_GOAL
  updateClub(c => ({ ...c, fatal: { ...f, points: { ...f.points, [s.id]: total }, done: completed ? [...f.done, s.id] : f.done } }))
  if (completed) giveReward(s.reward)
  return { points: pts, completed }
}

/** Suma el resultado de un draft de Fatal a la división; al llegar a DIV_GOAL se sube y se cobra */
export function addDraftResult(result: 0 | 1 | -1): { points: number; promoted: boolean; reward: Reward | null } {
  const pts = result === 0 ? DRAFT_POINTS.win : result === -1 ? DRAFT_POINTS.draw : DRAFT_POINTS.loss
  const f = fatalProgress()
  if (f.division === 0) {
    const reward = result === 0 ? DIVISION_REWARD[0] : null
    if (reward) giveReward(reward)
    updateClub(c => ({ ...c, fatal: f }))
    return { points: pts, promoted: false, reward }
  }
  const total = f.divPoints + pts
  const promoted = total >= DIV_GOAL
  const reward = promoted ? DIVISION_REWARD[f.division] : null
  updateClub(c => ({ ...c, fatal: { ...f, division: promoted ? f.division - 1 : f.division, divPoints: promoted ? 0 : total } }))
  if (reward) giveReward(reward)
  return { points: pts, promoted, reward }
}
