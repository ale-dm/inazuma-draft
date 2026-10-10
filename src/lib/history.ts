import { updateClub, type MatchRecord } from './club'

/** Partidos guardados en este dispositivo (los más recientes; lo viejo se va) */
export const HISTORY_MAX = 200

export function recordMatch(r: Omit<MatchRecord, 'at'>) {
  updateClub(s => ({ ...s, history: [{ ...r, at: Date.now() }, ...(s.history ?? [])].slice(0, HISTORY_MAX) }))
}

export interface HistoryStats {
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  /** Victorias seguidas hasta el último partido */
  streak: number
  /** La mejor racha de victorias */
  bestStreak: number
}

/** Números de una lista de partidos (el más reciente primero) */
export function historyStats(list: MatchRecord[]): HistoryStats {
  const st: HistoryStats = { played: list.length, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, streak: 0, bestStreak: 0 }
  for (const m of list) {
    if (m.res === 0) st.won++
    else if (m.res === 1) st.lost++
    else st.drawn++
    st.gf += m.gf
    st.ga += m.ga
  }
  for (const m of list) {
    if (m.res === 0) st.streak++
    else break
  }
  let run = 0
  for (const m of [...list].reverse()) {
    run = m.res === 0 ? run + 1 : 0
    st.bestStreak = Math.max(st.bestStreak, run)
  }
  return st
}
