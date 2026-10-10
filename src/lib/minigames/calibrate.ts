/**
 * Calibrar (ver docs/gameplay-variedad.md): una barra sube y baja; al parar, la posición decide la potencia. En el
 * centro de la zona verde, máximo; en el borde, nada. Pura: el tiempo se pasa desde fuera (testable).
 */
export const CAL_PERIOD_MS = 1400

/** Posición de la barra (0 a 1) en un instante: sube de 0 a 1 y vuelve, cada `periodMs` */
export function barPos(elapsedMs: number, periodMs = CAL_PERIOD_MS): number {
  const p = ((elapsedMs % periodMs) + periodMs) % periodMs / periodMs
  return p < 0.5 ? p * 2 : (1 - p) * 2
}

export type CalTier = 'perfect' | 'good' | 'weak' | 'miss'
export interface CalResult {
  tier: CalTier
  /** Potencia de 0 a 1 que se aplica al tiro o a la jugada */
  power: number
}

/**
 * Dónde cae la parada. `zone` es el ancho de la zona verde (0 a 1, centrada). Dentro del cuarto central, perfecto;
 * dentro de la zona, bueno; un poco fuera, flojo; fuera, fallo.
 */
export function calibrate(pos: number, zone = 0.2): CalResult {
  const d = Math.abs(pos - 0.5)
  const half = zone / 2
  if (d <= half / 2) return { tier: 'perfect', power: 1 }
  if (d <= half) return { tier: 'good', power: 0.75 }
  if (d <= half + 0.1) return { tier: 'weak', power: 0.4 }
  return { tier: 'miss', power: 0 }
}
