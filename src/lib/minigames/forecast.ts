/**
 * Pronóstico de jornada (ver docs/gameplay-variedad.md): antes de jugar, dices si ganas, empatas o pierdes. Acertar da
 * puntos extra; no toca el resultado ni se pierde nada si fallas. Pura.
 */
export type Pick = 'win' | 'draw' | 'loss'
export const FORECAST_POINTS = 2

/** Resultado del partido (0 gana, 1 pierde, −1 empate) a la forma del pronóstico */
export const pickOf = (res: 0 | 1 | -1): Pick => (res === 0 ? 'win' : res === 1 ? 'loss' : 'draw')

export function forecastScore(pick: Pick, res: 0 | 1 | -1): { hit: boolean; points: number } {
  const hit = pick === pickOf(res)
  return { hit, points: hit ? FORECAST_POINTS : 0 }
}
