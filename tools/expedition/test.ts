/* Pruebas de la expedición (docs/plan-modos.md §2). Se lanzan con `npm run test:expedition`. */
import assert from 'node:assert/strict'
import type { Player, Technique } from '../../src/types'
import {
  EXPEDITION_STEPS, START_LIVES, afterMatch, applyReward, makeOffer, rivalRating, stepCoins, expeditionSquad, type ExpeditionRun,
} from '../../src/lib/expedition'

let n = 0
const test = (name: string, fn: () => void) => { fn(); n++; console.log(`ok ${n} - ${name}`) }

/** Jugador de prueba con id, puesto y media */
const pl = (id: string, position: Player['position'], ovr: number): Player =>
  ({ id, name: id, nickname: null, position, ovr, techniques: [], category: 'Top Player', game: 'IE1', team: 'T', characterId: id } as unknown as Player)
const tech = (id: string, type: Technique['type']): Technique => ({ id, name: id, type, traits: [] } as unknown as Technique)

const FORMATION = 'basic' as const
const team = { GK: 'gk', LB: 'df1', CB1: 'df2', CB2: 'df3', RB: 'df4', CM1: 'mf1', CM2: 'mf2', CM3: 'mf3', CM4: 'mf4', LW: 'fw1', RW: 'fw2' } as const
const roster = new Map<string, Player>([
  ['gk', pl('gk', 'GK', 70)], ['df1', pl('df1', 'DF', 70)], ['df2', pl('df2', 'DF', 70)], ['df3', pl('df3', 'DF', 70)], ['df4', pl('df4', 'DF', 70)],
  ['mf1', pl('mf1', 'MF', 70)], ['mf2', pl('mf2', 'MF', 70)], ['mf3', pl('mf3', 'MF', 70)], ['mf4', pl('mf4', 'MF', 70)],
  ['fw1', pl('fw1', 'FW', 70)], ['fw2', pl('fw2', 'FW', 70)],
])
const lookup = (id: string) => roster.get(id)
const techs = [tech('t-shoot', 'Shoot'), tech('t-drib', 'Dribble'), tech('t-block', 'Block')]
const candidates = [pl('star-fw', 'FW', 88), pl('star-df', 'DF', 84)]

const base = (over: Partial<ExpeditionRun> = {}): ExpeditionRun => ({
  formation: FORMATION, captain: 'CM1', team: { ...team }, chem: 20, chemBonus: 0, step: 0, lives: START_LIVES, wins: 0, coins: 0,
  boosts: {}, techs: {}, offer: null, rivals: [], results: [], over: false, ...over,
})

test('ocho rivales de media creciente, de 70 a 88', () => {
  assert.equal(EXPEDITION_STEPS, 8)
  assert.equal(rivalRating(0), 70)
  assert.equal(rivalRating(7), 88)
  for (let i = 1; i < 8; i++) assert.ok(rivalRating(i) > rivalRating(i - 1))
})

test('monedas por paso: de 150 a 600', () => {
  assert.equal(stepCoins(0), 150)
  assert.equal(stepCoins(7), 600)
})

test('la victoria da tres recompensas de tipos distintos (con fichaje si mejora el puesto)', () => {
  const offer = makeOffer(base(), [pl('star-fw', 'FW', 88)], techs, lookup, () => 0.3)
  assert.equal(offer.length, 3)
  assert.deepEqual(offer.map(r => r.kind), ['player', 'boost', 'tech'])
  const p = offer[0]
  assert.ok(p.kind === 'player')
  assert.equal(p.playerId, 'star-fw')
  assert.ok(p.slot === 'LW' || p.slot === 'RW', 'entra en un puesto de delantero')
})

test('sin fichaje que mejore, la tercera es +1 de química', () => {
  const weak = [pl('weak', 'FW', 50)]
  const offer = makeOffer(base(), weak, techs, lookup, () => 0.3)
  assert.deepEqual(offer.map(r => r.kind), ['boost', 'tech', 'chem'])
})

test('aplicar cada recompensa cambia el equipo como debe', () => {
  const run = base()
  const withPlayer = applyReward(run, { kind: 'player', slot: 'LW', playerId: 'star-fw' })
  assert.equal(withPlayer.team.LW, 'star-fw')
  const withBoost = applyReward(run, { kind: 'boost', playerId: 'fw1', stat: 'att' })
  assert.equal(withBoost.boosts.fw1.att, 5)
  const twice = applyReward(withBoost, { kind: 'boost', playerId: 'fw1', stat: 'att' })
  assert.equal(twice.boosts.fw1.att, 10)
  assert.equal(applyReward(run, { kind: 'chem' }).chemBonus, 1)
  const withTech = applyReward(run, { kind: 'tech', playerId: 'mf1', techId: 't-shoot' })
  assert.deepEqual(withTech.techs.mf1, ['t-shoot'])
})

test('victoria: suma monedas, cuenta la victoria, ofrece recompensa y avanza', () => {
  const next = afterMatch(base(), 0, 'Rival A', candidates, techs, lookup, () => 0.3)
  assert.equal(next.step, 1)
  assert.equal(next.wins, 1)
  assert.equal(next.coins, stepCoins(0))
  assert.ok(next.offer && next.offer.length === 3)
  assert.equal(next.over, false)
  assert.deepEqual(next.rivals, ['Rival A'])
  assert.deepEqual(next.results, [0])
})

test('empate: media moneda, sin recompensa, y avanza', () => {
  const next = afterMatch(base(), -1, 'Rival B', candidates, techs, lookup)
  assert.equal(next.coins, Math.floor(stepCoins(0) / 2))
  assert.equal(next.offer, null)
  assert.equal(next.wins, 0)
  assert.equal(next.step, 1)
})

test('derrota: una vida menos y avanza al siguiente rival (cada rival se juega una vez)', () => {
  const next = afterMatch(base(), 1, 'Rival C', candidates, techs, lookup)
  assert.equal(next.lives, START_LIVES - 1)
  assert.equal(next.step, 1)
  assert.equal(next.offer, null)
  assert.equal(next.over, false)
})

test('tres derrotas acaban la expedición', () => {
  let run = base()
  for (let i = 0; i < 3; i++) run = afterMatch(run, 1, `R${i}`, candidates, techs, lookup)
  assert.equal(run.lives, 0)
  assert.equal(run.over, true)
})

test('vencer al octavo rival acaba la expedición sin recompensa de elección', () => {
  const last = base({ step: EXPEDITION_STEPS - 1, wins: 7 })
  const won = afterMatch(last, 0, 'Final', candidates, techs, lookup)
  assert.equal(won.over, true)
  assert.equal(won.offer, null)
  assert.equal(won.wins, EXPEDITION_STEPS)
})

test('el equipo de la expedición se monta con sus refuerzos y sus supertécnicas', () => {
  const run = applyReward(applyReward(base(), { kind: 'boost', playerId: 'fw1', stat: 'con' }), { kind: 'tech', playerId: 'fw1', techId: 't-drib' })
  const sq = expeditionSquad(run, lookup, id => techs.find(x => x.id === id))
  assert.ok(sq)
  assert.equal(sq!.xi.length, 11)
  assert.equal(sq!.lineup.LW?.techniques.length, 1)
  assert.equal(sq!.lineup.LW?.techniques[0].id, 't-drib')
})

console.log(`\n${n} pruebas de la expedición OK`)
