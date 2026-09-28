import type { Category, Player } from '../types'

/**
 * Mejoras de las evoluciones que suben números (sin carta real a la que cambiar). Aquí, sin dependencias, para que el
 * catálogo pueda montar las cartas evolucionadas ("evo~keshin~<id>") sin importar lib/evolutions.ts.
 */
export const EVO_BOOST: Record<string, { ovr: number; stats: number }> = {
  training: { ovr: 5, stats: 5 },
  keshin: { ovr: 4, stats: 5 },
  armed: { ovr: 3, stats: 4 },
  soul: { ovr: 4, stats: 5 },
}

export const EVO_PREFIX = 'evo~'

/** Rareza por media (los mismos cortes que tools/db/common.py) */
export function categoryFor(ovr: number): Category {
  return ovr >= 89 ? 'Legendary Player' : ovr >= 83 ? 'Top Player' : ovr >= 75 ? 'Advanced Player' : ovr >= 65 ? 'Growing Player' : 'Common Player'
}

/** "evo~keshin~<id de la carta base>" → [evolución, id base] */
export function parseEvoId(id: string): [string, string] | null {
  if (!id.startsWith(EVO_PREFIX)) return null
  const rest = id.slice(EVO_PREFIX.length)
  const i = rest.indexOf('~')
  return i > 0 ? [rest.slice(0, i), rest.slice(i + 1)] : null
}

export const evoId = (evo: string, baseId: string) => `${EVO_PREFIX}${evo}~${baseId}`

/** Carta evolucionada: la base con la mejora (tope 99) */
export function applyBoost(base: Player, evo: string, id: string): Player {
  const b = EVO_BOOST[evo]
  const cap = (n: number) => Math.min(99, n + b.stats)
  const ovr = Math.min(99, base.ovr + b.ovr)
  const s = base.stats
  return {
    ...base,
    id,
    ovr,
    category: categoryFor(ovr),
    stats: { shooting: cap(s.shooting), control: cap(s.control), physical: cap(s.physical), speed: cap(s.speed), defense: cap(s.defense), goalkeeping: cap(s.goalkeeping) },
    duel: base.duel ? {
      att: base.duel.att == null ? null : Math.min(99, base.duel.att + b.stats),
      con: base.duel.con == null ? null : Math.min(99, base.duel.con + b.stats),
      def: base.duel.def == null ? null : Math.min(99, base.duel.def + b.stats),
    } : undefined,
    evo: [...(base.evo ?? []), evo],
  }
}
