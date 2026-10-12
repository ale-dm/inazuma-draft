/**
 * Dojo (docs/plan-modos.md §1): subir el límite de rotura de una carta con sus copias de sobra. Pura.
 * Cada carta tiene un límite de 0 a 3; las Legendarias, hasta 2. Con 5 niveles la media de los números subía 3,9
 * puntos en el catálogo real; con 3, 2,7, dentro del objetivo del plan (2–3). Medido con el catálogo, ver docs/plan-modos.md.
 */
import type { Category } from '../types'

export const LIMIT_MAX = 3
export const LEGENDARY_LIMIT_MAX = 2

export const limitCap = (c: Category): number => (c === 'Legendary Player' ? LEGENDARY_LIMIT_MAX : LIMIT_MAX)

/** Puede ascender: tiene una copia de sobra (al menos dos) y el límite no está en el tope de su rareza */
export function canRaise(copies: number, level: number, c: Category): boolean {
  return copies >= 2 && level < limitCap(c)
}

/** Precio de venta rápida de una copia: a la mitad si la carta ya tiene el límite al máximo (plan §1) */
export function sellPrice(base: number, level: number, c: Category): number {
  return level >= limitCap(c) ? Math.floor(base / 2) : base
}
