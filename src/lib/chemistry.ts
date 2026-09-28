import type { Player } from '../types'
import type { FormationSlot, LineupMap, SlotId } from './lineup'

/**
 * Química al estilo MADFUT, con los datos de Inazuma: entre dos puestos vecinos se comparan equipo, juego y elemento.
 * 2 o más coincidencias → verde · 1 → amarillo · 0 → rojo. Ver docs/app-log.md.
 */
export type LinkColor = 'green' | 'yellow' | 'red'
export type Link = [SlotId, SlotId]

const LINK_VALUE: Record<LinkColor, number> = { green: 2, yellow: 1, red: 0 }
/** Distancia (en % del campo) por debajo de la cual dos puestos están enlazados */
const NEAR = 34

/** Enlaces entre puestos vecinos: los cercanos, y al menos los 2 más próximos de cada uno */
export function formationLinks(slots: FormationSlot[]): Link[] {
  const dist = (a: FormationSlot, b: FormationSlot) => Math.hypot(a.x - b.x, a.y - b.y)
  const key = (a: SlotId, b: SlotId) => [a, b].sort().join('|')
  const links = new Map<string, Link>()
  for (const a of slots) {
    const others = slots.filter(b => b !== a).sort((b, c) => dist(a, b) - dist(a, c))
    others.forEach((b, i) => {
      if (i < 2 || dist(a, b) < NEAR) links.set(key(a.id, b.id), [a.id, b.id])
    })
  }
  return [...links.values()]
}

export function linkColor(a: Player, b: Player): LinkColor {
  const matches = Number(a.team === b.team) + Number(a.game === b.game) + Number(a.element === b.element)
  return matches >= 2 ? 'green' : matches === 1 ? 'yellow' : 'red'
}

export interface Chemistry {
  /** Color de cada enlace con los dos puestos ocupados */
  links: { link: Link; color: LinkColor }[]
  /** Química de cada jugador, 0–3 */
  players: Partial<Record<SlotId, number>>
  /** Química del equipo, 0–100 */
  team: number
}

export function chemistry(lineup: LineupMap, links: Link[], captain?: SlotId): Chemistry {
  const colored = links.flatMap(link => {
    const [a, b] = link.map(id => lineup[id])
    return a && b ? [{ link, color: linkColor(a, b) }] : []
  })
  const players: Partial<Record<SlotId, number>> = {}
  for (const id of Object.keys(lineup) as SlotId[]) {
    const mine = colored.filter(l => l.link.includes(id))
    const avg = mine.length ? mine.reduce((s, l) => s + LINK_VALUE[l.color], 0) / mine.length : 0
    const base = avg >= 1.5 ? 3 : avg >= 1 ? 2 : avg >= 0.5 ? 1 : 0
    players[id] = Math.min(3, base + (id === captain ? 1 : 0))
  }
  const team = Math.round((Object.values(players).reduce((s, c) => s + (c ?? 0), 0) / 33) * 100)
  return { links: colored, players, team: Math.min(100, team) }
}

/** Media del equipo con la fórmula de FUT: media de los 11 + lo que los mejores superan esa media, repartido */
export function teamRating(players: Player[]): number {
  if (!players.length) return 0
  const sum = players.reduce((s, p) => s + p.ovr, 0)
  const avg = sum / players.length
  const extra = players.reduce((s, p) => s + Math.max(0, p.ovr - avg), 0)
  return Math.floor((sum + extra) / 11)
}
