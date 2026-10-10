/* Pruebas de la lógica de los minijuegos (ver src/lib/minigames). Se lanzan con `npm run test:minigames`. */
import assert from 'node:assert/strict'
import { barPos, calibrate } from '../../src/lib/minigames/calibrate'
import { aiBluffGuess, bluffOutcome, type TechType } from '../../src/lib/minigames/bluff'
import { forecastScore, pickOf } from '../../src/lib/minigames/forecast'
import { matchRecipe, merge, readyRecipes, type Piece, type Recipe } from '../../src/lib/minigames/board'

let n = 0
const test = (name: string, fn: () => void) => { fn(); n++; console.log(`ok ${n} - ${name}`) }

test('la barra sube y baja entre 0 y 1', () => {
  assert.equal(barPos(0), 0)
  assert.equal(barPos(700), 1)
  assert.equal(barPos(1400), 0)
  assert.ok(Math.abs(barPos(350) - 0.5) < 1e-9)
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

test('pronóstico: acertar da puntos, fallar no quita nada', () => {
  assert.deepEqual(forecastScore('win', 0), { hit: true, points: 2 })
  assert.deepEqual(forecastScore('draw', 0), { hit: false, points: 0 })
  assert.equal(pickOf(-1), 'draw')
  assert.equal(pickOf(1), 'loss')
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

console.log(`\n${n} pruebas OK`)
