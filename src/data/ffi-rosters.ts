import type { Player, Position } from '../types'

const rating = (p: Player) => p.ovr

type Shape = Record<Position, number>

/** Formations candidates (DF 2–5, MF 2–5, FW 1–4) — ex. Dark Emperors = 2-5-3 */
const SHAPES: Shape[] = []
for (let df = 2; df <= 5; df++) {
  for (let fw = 1; fw <= 4; fw++) {
    const mf = 10 - df - fw
    if (mf >= 2 && mf <= 5) SHAPES.push({ GK: 1, DF: df, MF: mf, FW: fw })
  }
}

/** Distance aux formations standard (4-4-2 / 4-3-3), pour départager */
function shapeDistance(s: Shape): number {
  const d442 = Math.abs(s.DF - 4) + Math.abs(s.MF - 4) + Math.abs(s.FW - 2)
  const d433 = Math.abs(s.DF - 4) + Math.abs(s.MF - 3) + Math.abs(s.FW - 3)
  return Math.min(d442, d433)
}

function fillShape(byPos: Record<Position, Player[]>, shape: Shape): Player[] {
  const picked: Player[] = []
  for (const pos of ['GK', 'DF', 'MF', 'FW'] as const) {
    picked.push(...byPos[pos].slice(0, shape[pos]))
  }
  return picked
}

/**
 * Meilleur XI : choisit la formation qui colle le mieux au roster
 * (le plus de joueurs à leur poste), puis complète les trous éventuels
 * avec les meilleurs remplaçants restants, quel que soit leur poste.
 */
export function pickBestXI(roster: Player[]): Player[] {
  const unique = new Map<string, Player>()
  for (const p of roster) {
    const k = p.characterId
    const cur = unique.get(k)
    if (!cur || rating(p) > rating(cur)) unique.set(k, p)
  }
  const players = [...unique.values()].sort((a, b) => rating(b) - rating(a))

  const byPos: Record<Position, Player[]> = { GK: [], DF: [], MF: [], FW: [] }
  for (const p of players) byPos[p.position].push(p)

  let best: Player[] = []
  let bestKey: [number, number, number] = [-1, -Infinity, -Infinity]
  for (const shape of SHAPES) {
    const xi = fillShape(byPos, shape)
    const key: [number, number, number] = [
      xi.length,
      -shapeDistance(shape),
      xi.reduce((sum, p) => sum + rating(p), 0),
    ]
    if (
      key[0] > bestKey[0] ||
      (key[0] === bestKey[0] && (key[1] > bestKey[1] || (key[1] === bestKey[1] && key[2] > bestKey[2])))
    ) {
      best = xi
      bestKey = key
    }
  }

  // Trous (poste absent du roster) → meilleurs joueurs restants, gardiens en dernier
  const used = new Set(best.map(p => p.id))
  const bench = players
    .filter(p => !used.has(p.id))
    .sort((a, b) => Number(a.position === 'GK') - Number(b.position === 'GK') || rating(b) - rating(a))
  return [...best, ...bench].slice(0, 11)
}
