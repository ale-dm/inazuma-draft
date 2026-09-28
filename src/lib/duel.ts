import type { Player } from '../types'

/**
 * Estadísticas de duelo (estilo MADFUT/FC): 3 números de combate que salen de las 6 del jugador.
 * Se usan en el modo Duelo (fase 4: cada uno decide si su carta ataca, controla el balón o defiende) y se
 * muestran junto a la carta en las pantallas de ese modo. Ver docs/app-log.md.
 */
export interface DuelStats {
  /** Verde: capacidad de ataque/remate */
  att: number
  /** Azul: control de balón/regate */
  con: number
  /** Rojo: defensa (los porteros mezclan defensa y parada) */
  def: number
}

/**
 * Se reutilizan directamente las 3 estadísticas más afines de la carta (tiro, control, defensa), sin inventar
 * una fórmula nueva: es lo más fiel a "cómo de bueno es atacando/controlando/defendiendo" que ya tenemos.
 * Los porteros no tienen buena "defensa" de campo, así que su rojo mezcla defensa y parada.
 */
export function duelStats(p: Player): DuelStats {
  const { shooting, control, defense, goalkeeping } = p.stats
  return {
    att: shooting,
    con: control,
    def: p.position === 'GK' ? Math.round((defense + goalkeeping) / 2) : defense,
  }
}

/** Quién gana un duelo en una acción: compara esa estadística de las dos cartas (empate → gana la nota general) */
export function resolveDuel(a: Player, b: Player, action: keyof DuelStats): 0 | 1 | -1 {
  const sa = duelStats(a)[action]
  const sb = duelStats(b)[action]
  if (sa === sb) return a.ovr === b.ovr ? 0 : a.ovr > b.ovr ? 1 : -1
  return sa > sb ? 1 : -1
}
