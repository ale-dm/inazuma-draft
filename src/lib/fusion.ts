/**
 * Fusión Mixi Max (docs/plan-modos.md §4). Dos personajes del mismo juego, cada uno con una copia de sobra, se
 * fusionan en la Mixi Max de su receta; una vez por cuenta. La carta resultado es la Mixi Max de la base, con su media
 * y sus técnicas (no se recalcula: esas cartas ya existen con su número). Pura.
 */
import fusionData from '../data/fusions.json'

export interface Fusion {
  id: string
  /** Personajes (characterId) que se fusionan */
  a: string
  b: string
  /** Carta Mixi Max que sale */
  result: string
}

export const FUSIONS = fusionData as Fusion[]

/** Lo que hace falta de cada carta del club: personaje, juego, copias y media (se gasta primero la más floja) */
export interface Owned {
  id: string
  characterId: string
  game: string
  copies: number
  ovr: number
}

/** Par de cartas con el que se hace la fusión, o null si no hay (sin copias de sobra, o ya hecha) */
export function ingredientsFor(f: Fusion, owned: Owned[], done: string[]): [string, string] | null {
  if (done.includes(f.id)) return null
  const games = [...new Set(owned.map(o => o.game))]
  for (const g of games) {
    const pick = (ch: string) => owned
      .filter(o => o.characterId === ch && o.game === g && o.copies >= 2)
      .sort((x, y) => x.ovr - y.ovr)[0]
    const x = pick(f.a)
    const y = pick(f.b)
    if (x && y) return [x.id, y.id]
  }
  return null
}
