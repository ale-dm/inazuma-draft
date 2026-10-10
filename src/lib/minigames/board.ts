/**
 * Tablero de fusiones (ver docs/gameplay-variedad.md): una receta se cumple si tienes una carta de cada personaje que
 * pide, sin usar la misma carta dos veces. Pura; la pantalla viene después.
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

/** Asigna a cada personaje que pide la receta una carta distinta; null si no se puede */
export function matchRecipe(pieces: Piece[], recipe: Recipe): Piece[] | null {
  const used = new Set<string>()
  const picked: Piece[] = []
  for (const need of recipe.requires) {
    const p = pieces.find(x => x.character === need && !used.has(x.id))
    if (!p) return null
    used.add(p.id)
    picked.push(p)
  }
  return picked
}

/** Las recetas que se pueden fusionar ahora mismo */
export function readyRecipes(pieces: Piece[], recipes: Recipe[]): Recipe[] {
  return recipes.filter(r => matchRecipe(pieces, r) !== null)
}

/** Fusiona: quita las cartas usadas y añade el resultado. null si la receta no se cumple */
export function merge(pieces: Piece[], recipe: Recipe): Piece[] | null {
  const used = matchRecipe(pieces, recipe)
  if (!used) return null
  const ids = new Set(used.map(p => p.id))
  return [...pieces.filter(p => !ids.has(p.id)), { id: `${recipe.result}-${recipe.id}`, character: recipe.result }]
}
