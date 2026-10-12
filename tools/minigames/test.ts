/* Pruebas de la lógica de los minijuegos (ver src/lib/minigames). Se lanzan con `npm run test:minigames`. */
import assert from 'node:assert/strict'
import { barPos, calibrate } from '../../src/lib/minigames/calibrate'
import { aiBluffGuess, bluffOutcome, BLUFF_TYPES, type TechType } from '../../src/lib/minigames/bluff'
import { drawOutcome, favoriteOf, forecastScore, nextStreak, outcomeOdds, pickOf, streakBonus } from '../../src/lib/minigames/forecast'
import { aiLead, aiRespond } from '../../src/lib/ai'
import { matchRecipe, merge, readyRecipes, type Piece, type Recipe } from '../../src/lib/minigames/board'

let n = 0
const test = (name: string, fn: () => void) => { fn(); n++; console.log(`ok ${n} - ${name}`) }

test('la barra sube y baja entre 0 y 1 (vuelta de 1800 ms)', () => {
  assert.equal(barPos(0), 0)
  assert.equal(barPos(900), 1)
  assert.equal(barPos(1800), 0)
  assert.ok(Math.abs(barPos(450) - 0.5) < 1e-9)
  assert.ok(Math.abs(barPos(1350) - 0.5) < 1e-9)
})

test('calibrar: el centro es perfecto, el borde falla', () => {
  assert.deepEqual(calibrate(0.5), { tier: 'perfect', power: 1 })
  assert.equal(calibrate(0.0).tier, 'miss')
  assert.equal(calibrate(1.0).tier, 'miss')
})

test('calibrar: la potencia baja al alejarse del centro', () => {
  const powers = [0.5, 0.56, 0.62, 0.7, 0.8].map(p => calibrate(p).power)
  for (let i = 1; i < powers.length; i++) assert.ok(powers[i] <= powers[i - 1])
})

test('farol: si adivinas el tipo, se bloquea; si no, pasa', () => {
  assert.equal(bluffOutcome('Shoot', 'Shoot').outcome, 'blocked')
  assert.equal(bluffOutcome('Shoot', 'Block').outcome, 'through')
  assert.equal(bluffOutcome('Shoot', 'Shoot').winner, 'defender')
  assert.equal(bluffOutcome('Shoot', 'Block').winner, 'attacker')
})

test('farol: la máquina lee el tipo más usado (más de la mitad de las veces)', () => {
  let rnd = 1
  const seeded = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647 }
  const history: TechType[] = ['Shoot', 'Shoot', 'Shoot', 'Dribble']
  let hits = 0
  for (let i = 0; i < 2000; i++) if (aiBluffGuess(history, seeded) === 'Shoot') hits++
  assert.ok(hits / 2000 > 0.5, `acierta ${hits / 2000}`)
})

/** Simulación reproducible del farol: el jugador sigue una estrategia y la máquina ve las últimas 12 técnicas */
function bluffRate(play: (i: number) => TechType, rounds = 20000): number {
  let seed = 4242
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  let blocked = 0
  const hist: TechType[] = []
  for (let i = 0; i < rounds; i++) {
    const played = play(i)
    if (bluffOutcome(played, aiBluffGuess(hist.slice(-12), rnd)).outcome === 'blocked') blocked++
    hist.push(played)
  }
  return blocked / rounds
}

test('farol: rotar los tipos no se bloquea más que al azar (H1)', () => {
  const rotate = bluffRate(i => BLUFF_TYPES[i % 4])
  assert.ok(rotate >= 0.2 && rotate <= 0.35, `rotar se bloquea ${rotate}`)
})

test('farol: repetir el mismo tipo sí se bloquea a menudo (H1)', () => {
  const repeat = bluffRate(() => 'Shoot')
  assert.ok(repeat > 0.55, `repetir se bloquea ${repeat}`)
})

test('pronóstico: acertar da puntos, fallar no quita nada', () => {
  assert.deepEqual(forecastScore('win', 0), { hit: true, points: 2 })
  assert.deepEqual(forecastScore('draw', 0), { hit: false, points: 0 })
  assert.equal(pickOf(-1), 'draw')
  assert.equal(pickOf(1), 'loss')
})

test('pronóstico: el empate da 3 puntos (sale poco)', () => {
  assert.deepEqual(forecastScore('draw', -1), { hit: true, points: 3 })
})

test('pronóstico: el favorito sale de la diferencia de media', () => {
  assert.equal(favoriteOf(3), 'me')
  assert.equal(favoriteOf(-3), 'rival')
  assert.equal(favoriteOf(0), 'even')
  assert.equal(favoriteOf(1), 'even')
})

test('pronóstico: las probabilidades suman 1 y el favorito gana más', () => {
  for (const d of [-3, 0, 3]) {
    const o = outcomeOdds(d)
    assert.ok(Math.abs(o.win + o.draw + o.loss - 1) < 1e-9, `suma ${d}`)
  }
  assert.ok(outcomeOdds(3).win > outcomeOdds(3).loss)
  assert.ok(outcomeOdds(-3).loss > outcomeOdds(-3).win)
})

test('pronóstico: el reparto al azar respeta las probabilidades (+3 gana ~82 %)', () => {
  let seed = 777
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  let wins = 0
  const N = 20000
  for (let i = 0; i < N; i++) if (drawOutcome(3, rnd) === 0) wins++
  assert.ok(Math.abs(wins / N - outcomeOdds(3).win) < 0.015, `gana ${wins / N}`)
  assert.equal(drawOutcome(0, () => 0.1), 0)
  assert.equal(drawOutcome(0, () => 0.5), -1)
  assert.equal(drawOutcome(0, () => 0.9), 1)
})

test('pronóstico: racha de 3 da +2, de 5 da +5, y un fallo la corta', () => {
  assert.equal(nextStreak(2, true), 3)
  assert.equal(nextStreak(3, false), 0)
  assert.equal(streakBonus(3), 2)
  assert.equal(streakBonus(4), 0)
  assert.equal(streakBonus(5), 5)
})

const pieces: Piece[] = [
  { id: 'a', character: 'Axel' }, { id: 'b', character: 'Shawn' }, { id: 'c', character: 'Axel' }, { id: 'd', character: 'Mark' },
]
const recipes: Recipe[] = [
  { id: 'r1', requires: ['Axel', 'Shawn'], result: 'Shaxel' },
  { id: 'r2', requires: ['Axel', 'Axel'], result: 'Double' },
  { id: 'r3', requires: ['Mark', 'Mark'], result: 'Nope' },
]

test('tablero: una carta no sirve para dos peticiones', () => {
  assert.equal(matchRecipe([{ id: 'x', character: 'Axel' }], { id: 'q', requires: ['Axel', 'Axel'], result: 'Y' }), null)
})

test('tablero: las recetas listas son las que se pueden cumplir', () => {
  assert.deepEqual(readyRecipes(pieces, recipes).map(r => r.id), ['r1', 'r2'])
})

test('tablero: fusionar quita las cartas usadas y añade el resultado', () => {
  const next = merge(pieces, recipes[0])!
  assert.equal(next.length, 3)
  assert.ok(next.some(p => p.character === 'Shaxel'))
  assert.ok(!next.some(p => p.id === 'a' || p.id === 'b'))
  assert.equal(merge(pieces, recipes[2]), null)
})

test('tablero: receta con dos copias del mismo resultado se cumple (H2)', () => {
  const twins: Piece[] = [{ id: 'Shaxel-r1', character: 'Shaxel' }, { id: 'Shaxel-r1', character: 'Shaxel' }]
  assert.ok(matchRecipe(twins, { id: 'q', requires: ['Shaxel', 'Shaxel'], result: 'Z' }) !== null)
})

test('tablero: fusionar uno no se lleva las copias con el mismo id (H2)', () => {
  const twins: Piece[] = [{ id: 'Shaxel-r1', character: 'Shaxel' }, { id: 'Shaxel-r1', character: 'Shaxel' }, { id: 'c', character: 'Axel' }]
  const after = merge(twins, { id: 'r2', requires: ['Shaxel', 'Axel'], result: 'Y' })!
  assert.equal(after.filter(p => p.character === 'Shaxel').length, 1)
  assert.equal(after.length, 2)
})

test('tablero: dos fusiones de la misma receta dan dos piezas con id distinto (H2)', () => {
  const r: Recipe = { id: 'r1', requires: ['Axel', 'Shawn'], result: 'Shaxel' }
  let b: Piece[] = [{ id: 'a', character: 'Axel' }, { id: 'b', character: 'Shawn' }, { id: 'c', character: 'Axel' }, { id: 'd', character: 'Shawn' }]
  b = merge(b, r)!
  b = merge(b, r)!
  const ids = b.map(p => p.id)
  assert.equal(new Set(ids).size, ids.length)
})

const fakeCard = (id: string, att: number) => ({ p: { id, element: 'fire', game: 'IE1', team: 'T' }, slot: 'CM1', st: { att, con: att, def: att }, mod: 0, hint: 'element' as const })

test('IA: con mano vacía no lanza ni devuelve undefined (H3)', () => {
  assert.equal(aiLead([], [fakeCard('r', 50)]), null)
  assert.equal(aiRespond([], 'att', fakeCard('l', 50), [fakeCard('r', 50)]), null)
})

test('IA: sin cartas del rival, responde con la más floja de la mano (H3)', () => {
  const hand = [fakeCard('a', 70), fakeCard('b', 40)]
  assert.equal(aiRespond(hand, 'att', fakeCard('l', 50), [])?.p.id, 'b')
})

console.log(`\n${n} pruebas OK`)
