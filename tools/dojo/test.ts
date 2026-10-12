/* Pruebas del Dojo (límite de rotura, docs/plan-modos.md §1). Se lanzan con `npm run test:dojo`. */
import assert from 'node:assert/strict'
import type { Player } from '../../src/types'
import { duelStats, limitBonus } from '../../src/lib/duel'
import { LIMIT_MAX, canRaise, limitCap, sellPrice } from '../../src/lib/dojo'
import { getClub, raiseLimit, updateClub } from '../../src/lib/club'

let n = 0
const test = (name: string, fn: () => void) => { fn(); n++; console.log(`ok ${n} - ${name}`) }

/** Carta de prueba: delantero de 80 con números de tiro y control medios */
const fw = (id: string, ovr = 80): Player => ({
  id, name: id, position: 'FW', ovr, category: 'Top Player', techniques: [], duel: undefined,
  stats: { shooting: 80, control: 70, defense: 40, speed: 70, goalkeeping: 10, pace: 70, passing: 70, dribbling: 70, physical: 70 },
} as unknown as Player)

test('el bonus del límite: 0, 1, 2, 4, 5, 6 (el tercer nivel suma 2)', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(limitBonus), [0, 1, 2, 4, 5, 6])
})

test('sin límite, los números no cambian', () => {
  const p = fw('a')
  assert.deepEqual(duelStats(p, 0), duelStats(p))
})

test('con límite, cada número sube y nunca pasa de OVR − 1', () => {
  const p = fw('b', 80)
  const base = duelStats(p)
  const up = duelStats(p, LIMIT_MAX)
  for (const k of ['att', 'con', 'def'] as const) {
    assert.ok(up[k] >= base[k], `${k} no baja`)
    assert.ok(up[k] - base[k] <= limitBonus(LIMIT_MAX), `${k} sube como mucho el bonus`)
    assert.ok(up[k] <= p.ovr - 1, `${k} no pasa del tope`)
  }
})

test('el tope de OVR − 1 se respeta aunque el bonus sea grande', () => {
  const p = fw('c', 60)
  const up = duelStats(p, LIMIT_MAX)
  assert.ok(Math.max(up.att, up.con, up.def) <= 59)
})

test('ascender: hace falta una copia de sobra y no pasa del tope de la rareza', () => {
  assert.equal(canRaise(1, 0, 'Common Player'), false)
  assert.equal(canRaise(2, 0, 'Common Player'), true)
  assert.equal(canRaise(2, LIMIT_MAX, 'Common Player'), false)
  assert.equal(LIMIT_MAX, 3)
  assert.equal(limitCap('Legendary Player'), 2)
  assert.equal(canRaise(3, 2, 'Legendary Player'), false)
  assert.equal(canRaise(3, 1, 'Legendary Player'), true)
})

test('venta rápida: a la mitad si el límite está al máximo', () => {
  assert.equal(sellPrice(400, 2, 'Top Player'), 400)
  assert.equal(sellPrice(400, LIMIT_MAX, 'Top Player'), 200)
  assert.equal(sellPrice(1000, 2, 'Legendary Player'), 500)
})

test('ascender en el club gasta una copia y sube el límite (no con la última copia)', () => {
  updateClub(s => ({ ...s, cards: { x: 2 }, limits: {} }))
  assert.equal(raiseLimit('x', 'Common Player'), true)
  assert.equal(getClub().cards.x, 1)
  assert.equal(getClub().limits.x, 1)
  assert.equal(raiseLimit('x', 'Common Player'), false)
  assert.equal(getClub().limits.x, 1)
})

console.log(`\n${n} pruebas del Dojo OK`)
