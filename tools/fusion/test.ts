/* Pruebas de las fusiones Mixi Max (docs/plan-modos.md §4). Se lanzan con `npm run test:fusion`. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { FUSIONS, ingredientsFor, type Owned } from '../../src/lib/fusion'
import { fuseCards, getClub, updateClub } from '../../src/lib/club'

let n = 0
const test = (name: string, fn: () => void) => { fn(); n++; console.log(`ok ${n} - ${name}`) }

const base = JSON.parse(fs.readFileSync('build/players.json', 'utf8'))
const cards: any[] = base.cards

test('las 19 recetas tienen id único y su carta es una Mixi Max de la base con su personaje', () => {
  assert.equal(FUSIONS.length, 19)
  assert.equal(new Set(FUSIONS.map(f => f.id)).size, FUSIONS.length)
  for (const f of FUSIONS) {
    const c = cards.find(x => x.id === f.result)
    assert.ok(c, `existe ${f.result}`)
    assert.equal(c.team, 'Mixi Max', f.result)
    assert.equal(c.character_id, f.a, f.result)
  }
})

const own = (id: string, characterId: string, game: string, copies: number, ovr = 70): Owned => ({ id, characterId, game, copies, ovr })
const shaxel = FUSIONS.find(f => f.id === 'shaxel')!

test('la fusión necesita dos copias de sobra del mismo juego', () => {
  const owned = [own('a1', 'gouenji-shuuya', 'GO1', 2), own('b1', 'fubuki-shirou', 'GO1', 2)]
  assert.deepEqual(ingredientsFor(shaxel, owned, []), ['a1', 'b1'])
  assert.equal(ingredientsFor(shaxel, [own('a1', 'gouenji-shuuya', 'GO1', 2), own('b1', 'fubuki-shirou', 'GO2', 2)], []), null)
  assert.equal(ingredientsFor(shaxel, [own('a1', 'gouenji-shuuya', 'GO1', 1), own('b1', 'fubuki-shirou', 'GO1', 2)], []), null)
})

test('la fusión ya hecha no se ofrece otra vez', () => {
  const owned = [own('a1', 'gouenji-shuuya', 'GO1', 2), own('b1', 'fubuki-shirou', 'GO1', 2)]
  assert.equal(ingredientsFor(shaxel, owned, ['shaxel']), null)
})

test('se gasta la copia más floja de cada personaje', () => {
  const owned = [own('fuerte', 'gouenji-shuuya', 'GO1', 2, 85), own('floja', 'gouenji-shuuya', 'GO1', 2, 60), own('b1', 'fubuki-shirou', 'GO1', 2)]
  assert.deepEqual(ingredientsFor(shaxel, owned, []), ['floja', 'b1'])
})

test('fusionar gasta una copia de cada ingrediente, da la Mixi Max y no se repite', () => {
  updateClub(s => ({ ...s, cards: { 'ing-a': 2, 'ing-b': 3 }, fusions: [] }))
  assert.equal(fuseCards(shaxel, ['ing-a', 'ing-b']), true)
  assert.equal(getClub().cards['ing-a'], 1)
  assert.equal(getClub().cards['ing-b'], 2)
  assert.equal(getClub().cards[shaxel.result], 1)
  assert.deepEqual(getClub().fusions, ['shaxel'])
  assert.equal(fuseCards(shaxel, ['ing-a', 'ing-b']), false)
})

test('no se puede fusionar con la última copia', () => {
  updateClub(s => ({ ...s, cards: { 'ing-a': 1, 'ing-b': 3 }, fusions: [] }))
  assert.equal(fuseCards(shaxel, ['ing-a', 'ing-b']), false)
  assert.equal(getClub().cards['ing-b'], 3)
})

console.log(`\n${n} pruebas de fusiones OK`)
