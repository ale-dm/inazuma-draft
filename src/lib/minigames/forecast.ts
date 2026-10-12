/**
 * Pronóstico de jornada (ver docs/gameplay-variedad.md y docs/gameplay-analisis.md §3): antes de jugar, dices si ganas,
 * empatas o pierdes. Acertar da puntos fijos (el empate, más, porque sale poco); tres aciertos seguidos dan un extra y
 * cinco, otro mayor. Fallar no quita nada. Pura.
 */
export type Pick = 'win' | 'draw' | 'loss'
export type Favorite = 'me' | 'rival' | 'even'

export const FORECAST_POINTS = 2
export const FORECAST_DRAW_POINTS = 3

/** Resultado del partido (0 gana, 1 pierde, −1 empate) a la forma del pronóstico */
export const pickOf = (res: 0 | 1 | -1): Pick => (res === 0 ? 'win' : res === 1 ? 'loss' : 'draw')

/** Favorito según la diferencia de media (tú − rival): se lee de la plantilla, no es un volado */
export function favoriteOf(diff: number): Favorite {
  if (Math.abs(diff) < 1.5) return 'even'
  return diff > 0 ? 'me' : 'rival'
}

/**
 * Probabilidades de cada resultado según la diferencia de media. Son las medidas en el balance (gameplay-analisis §3.2):
 * igualados gana 44 %, empata 12 % y pierde 44 %; con +3 de media, gana 82 %, empata 3 % y pierde 16 % (y al revés).
 * Las cifras con +3 suman 101 % por redondeo, así que se normalizan.
 */
export function outcomeOdds(diff: number): { win: number; draw: number; loss: number } {
  const raw = diff >= 3 ? { win: 0.82, draw: 0.03, loss: 0.16 }
    : diff <= -3 ? { win: 0.16, draw: 0.03, loss: 0.82 }
    : { win: 0.44, draw: 0.12, loss: 0.44 }
  const sum = raw.win + raw.draw + raw.loss
  return { win: raw.win / sum, draw: raw.draw / sum, loss: raw.loss / sum }
}

/** Resultado al azar con esas probabilidades (`rnd` en 0–1 para poder probarlo) */
export function drawOutcome(diff: number, rnd: () => number = Math.random): 0 | 1 | -1 {
  const o = outcomeOdds(diff)
  const x = rnd()
  return x < o.win ? 0 : x < o.win + o.draw ? -1 : 1
}

export function forecastScore(pick: Pick, res: 0 | 1 | -1): { hit: boolean; points: number } {
  const hit = pick === pickOf(res)
  return { hit, points: hit ? (pick === 'draw' ? FORECAST_DRAW_POINTS : FORECAST_POINTS) : 0 }
}

/** Racha tras el pronóstico: un acierto suma uno; un fallo la corta */
export const nextStreak = (streak: number, hit: boolean): number => (hit ? streak + 1 : 0)

/** Extra por la racha al llegar a 3 o 5 aciertos seguidos (se da una vez, al llegar) */
export function streakBonus(streakAfterHit: number): number {
  if (streakAfterHit === 5) return 5
  if (streakAfterHit === 3) return 2
  return 0
}
