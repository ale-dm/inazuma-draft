/**
 * Farol (ver docs/gameplay-variedad.md): la técnica se juega boca abajo. El rival solo adivina el tipo y, si lo
 * acierta, la bloquea. Pura.
 */
export type TechType = 'Shoot' | 'Dribble' | 'Block' | 'Catch'
export const BLUFF_TYPES: TechType[] = ['Shoot', 'Dribble', 'Block', 'Catch']

export interface BluffResult {
  outcome: 'blocked' | 'through'
  /** Quién gana la tensión por el choque: el que bloquea recupera; si pasa, la técnica cuenta */
  winner: 'attacker' | 'defender'
}

/** El rival adivina `guess`; si coincide con el tipo jugado, la técnica se bloquea */
export function bluffOutcome(played: TechType, guess: TechType): BluffResult {
  return played === guess
    ? { outcome: 'blocked', winner: 'defender' }
    : { outcome: 'through', winner: 'attacker' }
}

/**
 * Adivinanza de la máquina: la mitad de las veces, el tipo que más se ha visto en la ventana de historial (lee el
 * patrón); la otra mitad, al azar. Si varios tipos empatan en el conteo, el desempate es al azar: un desempate fijo
 * (por orden de aparición) deja adivinable la rotación, porque el tipo que más tiempo lleva sin salir es justo el que
 * toca a continuación (ver docs/depuracion-minijuegos.md, H1). `rnd` se pasa para que sea reproducible en pruebas.
 */
export function aiBluffGuess(history: TechType[], rnd = Math.random): TechType {
  if (history.length && rnd() < 0.5) {
    const count = new Map<TechType, number>()
    for (const t of history) count.set(t, (count.get(t) ?? 0) + 1)
    const max = Math.max(...count.values())
    const tops = [...count].filter(([, c]) => c === max).map(([k]) => k)
    return tops[Math.floor(rnd() * tops.length)]
  }
  return BLUFF_TYPES[Math.floor(rnd() * BLUFF_TYPES.length)]
}
