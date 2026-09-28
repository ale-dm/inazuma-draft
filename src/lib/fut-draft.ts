import type { Category, Player, Position } from '../types'
import { getAllPlayers } from '../data/catalog'
import { FORMATIONS, type FormationId } from './lineup'
import { random } from './run-rng'

/** Opciones del draft MADFUT: formación, capitán y cada puesto, 1 de 6 (azar de la partida: se repite con la misma semilla) */
export const OPTIONS = 6
/** Suplentes del banquillo (cuentan para la media) */
export const BENCH = 7
/** Reservas (no cuentan para la media) */
export const RESERVES = 5

/** Probabilidad de cada rareza en las opciones de un puesto */
const RARITY_WEIGHT: Record<Category, number> = {
  'Legendary Player': 8,
  'Top Player': 22,
  'Advanced Player': 35,
  'Growing Player': 25,
  'Common Player': 10,
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function formationOptions(): FormationId[] {
  return shuffle(FORMATIONS.map(f => f.id)).slice(0, OPTIONS)
}

/** Cartas que se pueden ofrecer: con foto y sin repetir personaje ya elegido */
function pool(taken: Set<string>, filter: (p: Player) => boolean): Player[] {
  return getAllPlayers().filter(p => p.image && !taken.has(p.characterId) && filter(p))
}

/** OPTIONS cartas distintas (también de personaje) de la lista, cada una con la rareza sorteada por peso */
function draw(candidates: Player[], weights: Partial<Record<Category, number>>): Player[] {
  const byCat = new Map<Category, Player[]>()
  for (const p of candidates) {
    if (!weights[p.category]) continue
    const list = byCat.get(p.category)
    if (list) list.push(p)
    else byCat.set(p.category, [p])
  }
  const out: Player[] = []
  const chars = new Set<string>()
  for (let tries = 0; out.length < OPTIONS && tries < 200; tries++) {
    const cats = [...byCat.keys()].filter(c => byCat.get(c)!.length)
    if (!cats.length) break
    const total = cats.reduce((s, c) => s + weights[c]!, 0)
    let r = random() * total
    const cat = cats.find(c => (r -= weights[c]!) < 0) ?? cats[cats.length - 1]
    const list = byCat.get(cat)!
    const p = list.splice(Math.floor(random() * list.length), 1)[0]
    if (!chars.has(p.characterId)) {
      chars.add(p.characterId)
      out.push(p)
    }
  }
  return out.sort((a, b) => b.ovr - a.ovr)
}

/** Capitán: OPTIONS cartas Leyenda o Élite de cualquier puesto */
export function captainOptions(): Player[] {
  return draw(pool(new Set(), () => true), { 'Legendary Player': 1, 'Top Player': 2 })
}

/** Suplente o reserva: OPTIONS cartas de cualquier puesto, sin personajes ya elegidos */
export function benchOptions(takenCharacters: Set<string>): Player[] {
  return draw(pool(takenCharacters, () => true), RARITY_WEIGHT)
}

/** Jugadores para un puesto: OPTIONS cartas de esa posición, sin personajes ya elegidos */
export function slotOptions(position: Position, takenCharacters: Set<string>): Player[] {
  return draw(pool(takenCharacters, p => p.position === position), RARITY_WEIGHT)
}
