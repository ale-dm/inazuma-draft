/**
 * Tablero de fusiones (ver docs/gameplay-variedad.md): una receta se cumple si tienes una carta de cada personaje que
 * pide, sin usar la misma carta dos veces. Pura; la pantalla viene después.
 *
 * La identidad de una carta es su **posición** en el tablero, no su `id`: dos fusiones de la misma receta producen
 * cartas con el mismo nombre, y un id compartido hacía que una fusión se llevara por delante a todas las copias
 * (docs/depuracion-minijuegos.md, H2).
 */
export interface Piece {
  id: string
  /** Personaje (el mismo personaje de dos juegos cuenta igual) */
  character: string
}

export interface Recipe {
  id: string
  /** Personajes que pide la receta (uno por carta; puede repetirse para pedir dos copias de un personaje) */
  requires: string[]
  /** Carta que sale al fusionar */
  result: string
}

/** Índices de las cartas que cumplen la receta (una distinta por petición), o null si no se puede */
function indicesFor(pieces: Piece[], recipe: Recipe): number[] | null {
  const used = new Set<number>()
  const picked: number[] = []
  for (const need of recipe.requires) {
    const i = pieces.findIndex((p, k) => p.character === need && !used.has(k))
    if (i < 0) return null
    used.add(i)
    picked.push(i)
  }
  return picked
}

/** Asigna a cada personaje que pide la receta una carta distinta; null si no se puede */
export function matchRecipe(pieces: Piece[], recipe: Recipe): Piece[] | null {
  const idx = indicesFor(pieces, recipe)
  return idx ? idx.map(i => pieces[i]) : null
}

/** Las recetas que se pueden fusionar ahora mismo */
export function readyRecipes(pieces: Piece[], recipes: Recipe[]): Recipe[] {
  return recipes.filter(r => indicesFor(pieces, r) !== null)
}

/** Un id que no existe ya en el tablero (aunque se recargue o se repita la receta) */
function freshId(pieces: Piece[], base: string): string {
  const taken = new Set(pieces.map(p => p.id))
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}~${n}`
  return id
}

/** Fusiona: quita las cartas usadas (por posición) y añade el resultado con un id nuevo. null si la receta no se cumple */
export function merge(pieces: Piece[], recipe: Recipe): Piece[] | null {
  const idx = indicesFor(pieces, recipe)
  if (!idx) return null
  const drop = new Set(idx)
  const kept = pieces.filter((_, k) => !drop.has(k))
  return [...kept, { id: freshId(pieces, `${recipe.result}-${recipe.id}`), character: recipe.result }]
}
