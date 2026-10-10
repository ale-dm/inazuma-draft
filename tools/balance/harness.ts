/* Mide el equilibrio del Fatal con el código real de la app (src/lib). Lo lanza tools/balance/run.mjs.
 * Aproximaciones frente a la pantalla (ver docs/balance-report.md): en el Sim no se simulan el cambio de carta pagado, el
 * grito del portero, la hiperenergía ni la táctica del descanso; sí las supertécnicas, la presión alta y el contraataque. */
import fs from 'node:fs'
import path from 'node:path'
import type { GameId, Player } from '../../src/types'

// ---- entorno: sin navegador, y con un azar con semilla para que dos ejecuciones den lo mismo
const g = globalThis as Record<string, unknown>
const store = new Map<string, string>()
g.localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) }
let seed = 20261004
Math.random = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

const A = g.__BALANCE_ARGS__ as { live: boolean; n: number; root: string }
if (!A.live) {
  const db = JSON.parse(fs.readFileSync(path.join(A.root, 'build/players.json'), 'utf8'))
  const cards = db.cards.map((c: { techniques: string[] }) => ({ ...c, card_techniques: [...new Set(c.techniques)].map((t, i) => ({ slot: i + 1, technique_id: t })) }))
  g.fetch = async (url: string) => {
    const u = new URL(url)
    const table = u.pathname.split('/').pop() as string
    const rows = ({ cards, techniques: db.techniques, teams: db.teams, staff: db.staff } as Record<string, unknown[]>)[table] ?? []
    const off = +(u.searchParams.get('offset') ?? 0), lim = +(u.searchParams.get('limit') ?? rows.length)
    const slice = rows.slice(off, off + lim)
    return new Response(JSON.stringify(slice), { status: 200, headers: { 'content-range': `${off}-${off + slice.length - 1}/${rows.length}` } })
  }
}

const { loadCatalog, getAllPlayers } = await import('../../src/data/catalog')
const { FORMATIONS, getFormation } = await import('../../src/lib/lineup')
const F = await import('../../src/lib/fatal')
const T = await import('../../src/lib/tension')
const { teamRating } = await import('../../src/lib/chemistry')
type FatalTeam = import('../../src/lib/fatal').FatalTeam
type FatalCard = import('../../src/lib/fatal').FatalCard
type DuelKey = 'att' | 'con' | 'def'
await loadCatalog()
const ALL: Player[] = getAllPlayers().filter(p => p.image)
const N = A.n
const NO_BOOST = { kind: 'game' as const, value: 'NONE' as unknown as GameId, amount: 0 }
const counter = F.counter

// ---- equipos de prueba: once de la media pedida (±4, ampliando si no hay), mezclado o de un solo juego
function buildTeam(target: number, game?: GameId): { team: FatalTeam; xi: Player[]; rating: number } {
  const pool = ALL.filter(p => !game || p.game === game)
  const f = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)]
  const used = new Set<string>()
  const lineup: Record<string, Player> = {}
  for (const s of getFormation(f.id).slots) {
    const free = pool.filter(p => p.position === s.role && !used.has(p.characterId))
    let list: Player[] = []
    for (const d of [3, 5, 8, 14, 99]) { list = free.filter(p => Math.abs(p.ovr - target) <= d); if (list.length >= 3) break }
    const p = list[Math.floor(Math.random() * list.length)]
    used.add(p.characterId)
    lineup[s.id] = p
  }
  const xi = Object.values(lineup)
  const captain = (Object.entries(lineup).sort((a, b) => b[1].ovr - a[1].ovr)[0][0]) as never
  return { team: F.fatalTeam('X', lineup as never, captain, f.id, NO_BOOST), xi, rating: teamRating(xi) }
}
const mk = (target: number, game?: GameId) => buildTeam(target, game).team

// ---- duelo clásico sin pantalla
type Brain = 'ai' | 'human' | 'random'
const total = F.total
const best = (c: FatalCard): DuelKey => (['att', 'con', 'def'] as const).reduce((a, k) => (c.st[k] > c.st[a] ? k : a), 'att' as DuelKey)
const lead = (b: Brain, h: FatalCard[], o: FatalCard[]) => {
  if (b === 'ai') return F.aiLead(h, o)
  if (b === 'random') return { card: h[Math.floor(Math.random() * h.length)], stat: (['att', 'con', 'def'] as const)[Math.floor(Math.random() * 3)] }
  const s = [...h].sort((x, y) => y.st[best(y)] - x.st[best(x)]); const c = s[Math.floor(s.length / 2)]
  return { card: c, stat: best(c) }
}
const respond = (b: Brain, h: FatalCard[], stat: DuelKey, l: FatalCard, o: FatalCard[]) => {
  if (b === 'ai') return F.aiRespond(h, stat, l, o)
  if (b === 'random') return h[Math.floor(Math.random() * h.length)]
  const k = counter(stat), v = l.st[stat]
  const w = h.filter(c => c.st[k] > v).sort((x, y) => x.st[k] - y.st[k])
  return w.length ? w[0] : [...h].sort((x, y) => total(x) - total(y))[0]
}
function techFor(card: FatalCard, key: DuelKey, oppNum: number, tension: number): { bonus: number; cost: number } {
  const ts = T.usableTechs(card, key)
  const pick = F.chooseBoosts(ts.map(x => ({ id: x.id, cost: T.techCost(x), bonus: T.techBonus(x, card) })), F.perceive(oppNum) - card.st[key] + 1, tension, 1)[0]
  return pick ? { bonus: pick.bonus, cost: pick.cost } : { bonus: 0, cost: 0 }
}
/** 0: gana A, 1: gana B, −1: empate. useTech: las dos partes usan supertécnicas con la tensión del duelo */
function duel(a: FatalTeam, b: FatalTeam, ba: Brain, bb: Brain, useTech: boolean): { res: 0 | 1 | -1; tb: boolean } {
  let ha = [...a.cards], hb = [...b.cards]
  const first = Math.random() < 0.5 ? 0 : 1
  const rounds: import('../../src/lib/fatal').Round[] = []
  const ten = [T.DUEL_TENSION.start, T.DUEL_TENSION.start]
  for (let r = 0; r < F.FATAL_ROUNDS; r++) {
    const l = (first + r) % 2 as 0 | 1
    const [lh, rh, lb, rb] = l === 0 ? [ha, hb, ba, bb] : [hb, ha, bb, ba]
    const { card: lc, stat } = lead(lb, lh, rh)
    const rc = respond(rb, rh, stat, lc, lh)
    let lcc = lc, rcc = rc
    const spent = [0, 0]
    if (useTech) {
      const tl = techFor(lc, stat, rc.st[counter(stat)], ten[l]), tr = techFor(rc, counter(stat), lc.st[stat], ten[1 - l])
      lcc = { ...lc, st: { ...lc.st, [stat]: lc.st[stat] + tl.bonus } }
      rcc = { ...rc, st: { ...rc.st, [counter(stat)]: rc.st[counter(stat)] + tr.bonus } }
      spent[l] = tl.cost; spent[1 - l] = tr.cost
    }
    const [ca, cb] = l === 0 ? [lcc, rcc] : [rcc, lcc]
    const round = F.playRound(l === 0 ? 0 : 1, stat, ca, cb)   // cartas [A, B]; lleva A si l === 0
    rounds.push(round)
    const w = round.winner
    ten[0] = T.gainTension(ten[0] - spent[0], w === 0 ? T.DUEL_TENSION.win : T.DUEL_TENSION.lose)
    ten[1] = T.gainTension(ten[1] - spent[1], w === 1 ? T.DUEL_TENSION.win : T.DUEL_TENSION.lose)
    const [oa, ob] = l === 0 ? [lc, rc] : [rc, lc]
    ha = ha.filter(c => c !== oa); hb = hb.filter(c => c !== ob)
  }
  const s = F.score(rounds)
  const tbNeeded = F.needsTiebreak(s)
  const tb = tbNeeded ? F.tiebreak(ha[0], hb[0]) : null
  return { res: F.finalResult(s, tb), tb: tbNeeded }
}
interface Tally { w: number; d: number; l: number; tbs: number; n: number }
const pct = (x: number, n: number) => Math.round((x / n) * 1000) / 10
function duelBatch(mkA: () => FatalTeam, mkB: () => FatalTeam, ba: Brain, bb: Brain, useTech: boolean): Tally {
  const t: Tally = { w: 0, d: 0, l: 0, tbs: 0, n: N }
  for (let i = 0; i < N; i++) { const r = duel(mkA(), mkB(), ba, bb, useTech); if (r.res === 0) t.w++; else if (r.res === 1) t.l++; else t.d++; if (r.tb) t.tbs++ }
  return t
}

// ---- Sim sin pantalla
type Pol = 'passive' | 'ai'
function simBoost(card: FatalCard, key: DuelKey, ctx: 'control' | 'attack' | 'defend', oppNum: number, tension: number, press: boolean, counterBonus = 0): { bonus: number; cost: number } {
  const ts = T.usableTechs(card, key)
  const opts = ts.map(x => ({ id: x.id, cost: T.techCost(x), bonus: T.techBonus(x, card) }))
  if (press && ctx === 'control') opts.push({ id: 'press', cost: T.PRESS.cost, bonus: T.PRESS.bonus })
  const own = card.st[key] + counterBonus
  const need = ctx === 'control' ? oppNum - own + 1 : ctx === 'attack' ? oppNum - own + 6 : oppNum - own - 1
  const p = F.chooseBoosts(opts, need, tension, 2)
  return { bonus: p.reduce((n, o) => n + o.bonus, 0), cost: p.reduce((n, o) => n + o.cost, 0) }
}
interface SimOut { ga: number; gb: number; ballA: number; balls: number }
function sim(a: FatalTeam, b0: FatalTeam, pa: Pol, pull: number): SimOut {
  const b = F.adaptRival(a, b0, pull)
  const chs = F.simulate(a, b)
  const ten: [number, number] = [T.TENSION_START, T.TENSION_START]
  const out: SimOut = { ga: 0, gb: 0, ballA: 0, balls: 0 }
  let cA = false, cB = false
  for (const c of chs) {
    const ca = F.cardOf(c.control, 0), cb = F.cardOf(c.control, 1)
    const ba = pa === 'ai' ? simBoost(ca, 'con', 'control', F.perceive(cb.st.con), ten[0], true, cA ? T.COUNTER_BONUS : 0) : { bonus: cA ? T.COUNTER_BONUS : 0, cost: 0 }
    const bb = simBoost(cb, 'con', 'control', F.perceive(ca.st.con), ten[1], true, cB ? T.COUNTER_BONUS : 0)
    bb.bonus += cB ? T.COUNTER_BONUS : 0
    if (pa === 'ai') ba.bonus += cA ? T.COUNTER_BONUS : 0
    cA = cB = false
    const ball = F.controlWinner(c, [ba.bonus, bb.bonus])
    ten[0] = T.gainTension(ten[0] - ba.cost, ball === 0 ? T.TENSION_GAIN.ballWon : T.TENSION_GAIN.ballLost)
    ten[1] = T.gainTension(ten[1] - bb.cost, ball === 1 ? T.TENSION_GAIN.ballWon : T.TENSION_GAIN.ballLost)
    if (ball === -1) continue
    out.balls++; if (ball === 0) out.ballA++
    if (c.penalty) {
      // penalti: direcciones al azar (el jugador elige algo mejor que el azar; la medida es conservadora)
      const kick = Math.floor(Math.random() * 3) as F.PenDir, keep = Math.floor(Math.random() * 3) as F.PenDir
      if (F.penaltyGoal(kick, keep, c.penRoll)) { if (ball === 0) out.ga++; else out.gb++ }
      continue
    }
    const d = c.atk[ball]
    const atkSide = ball, defSide = 1 - ball
    const sc = F.cardOf(d, 0), df = F.cardOf(d, 1)
    const pol = (s: number) => (s === 0 ? pa : 'ai')
    const bat = pol(atkSide) === 'ai' ? simBoost(sc, 'att', 'attack', F.perceive(df.st.def), ten[atkSide], false) : { bonus: 0, cost: 0 }
    const bde = pol(defSide) === 'ai' ? simBoost(df, 'def', 'defend', F.perceive(sc.st.att), ten[defSide], false) : { bonus: 0, cost: 0 }
    const r = F.shotResult(c, ball, [bat.bonus, bde.bonus])
    ten[atkSide] = T.gainTension(ten[atkSide] - bat.cost, r.goal ? T.TENSION_GAIN.goal : 0)
    ten[defSide] = T.gainTension(ten[defSide] - bde.cost, r.goal ? 0 : T.TENSION_GAIN.saved)
    if (r.goal) { if (ball === 0) out.ga++; else out.gb++ }
    else if (ball === 1) cA = true   // paré yo: contraataque
    else cB = true
  }
  return out
}
interface SimTally { w: number; d: number; l: number; goals: number; ga: number; gb: number; poss: number; n: number }
function simBatch(mkA: () => FatalTeam, mkB: () => FatalTeam, pa: Pol, pull: number): SimTally {
  const t: SimTally = { w: 0, d: 0, l: 0, goals: 0, ga: 0, gb: 0, poss: 0, n: N }
  for (let i = 0; i < N; i++) { const r = sim(mkA(), mkB(), pa, pull); t.ga += r.ga; t.gb += r.gb; t.goals += r.ga + r.gb; t.poss += r.balls ? r.ballA / r.balls : 0.5; if (r.ga > r.gb) t.w++; else if (r.ga < r.gb) t.l++; else t.d++ }
  return t
}

// ---- escenarios, indicadores y informe
const flags: string[] = []
const flag = (ok: boolean, msg: string) => { if (!ok) flags.push(msg) }
const L: string[] = []
const row = (cells: (string | number)[]) => L.push(`| ${cells.join(' | ')} |`)
const TIERS = [60, 68, 75, 82, 88]
const t0 = Date.now()
const range = (v: number, lo: number, hi: number) => v >= lo && v <= hi

L.push('# Informe de equilibrio (generado)', '',
  `Generado por \`npm run balance\` (\`tools/balance\`) con ${N} partidos por escenario, catálogo ${A.live ? 'de Supabase' : 'de build/players.json'} y azar con semilla. ` +
  'Gana A = la parte que aparece primero. Rango de cada indicador entre paréntesis; fuera de rango se marca ⚠.', '')

// 1) duelo clásico, espejo (IA contra IA) por nivel
L.push('## 1. Duelo clásico: IA contra IA al mismo nivel', '', '| Media | Gana A % | Empate % | Gana B % | Desempate % | con supertécnicas: A / E / B % |', '|---|---|---|---|---|---|')
for (const tier of TIERS) {
  const m = duelBatch(() => mk(tier), () => mk(tier), 'ai', 'ai', false)
  const mt = duelBatch(() => mk(tier), () => mk(tier), 'ai', 'ai', true)
  row([tier, pct(m.w, N), pct(m.d, N), pct(m.l, N), pct(m.tbs, N), `${pct(mt.w, N)} / ${pct(mt.d, N)} / ${pct(mt.l, N)}`])
  flag(range(pct(m.w, N), 42, 58), `Duelo espejo (media ${tier}): gana A ${pct(m.w, N)} % (42–58)`)
  flag(pct(m.d, N) <= 22, `Duelo espejo (media ${tier}): empates ${pct(m.d, N)} % (≤ 22)`)
  flag(range(pct(mt.w, N), 42, 58), `Duelo espejo con supertécnicas (media ${tier}): gana A ${pct(mt.w, N)} % (42–58)`)
}
L.push('')

// 2) fuerza de la IA: contra un humano fuerte (ve el número exacto) y contra el azar
L.push('## 2. Duelo clásico: tú contra la IA (media 75)', '', '| Tú juegas… | Ganas % | Empate % | Pierdes % |', '|---|---|---|---|')
for (const [name, b] of [['como un humano fuerte (ve el número exacto de la IA)', 'human'], ['sin criterio (al azar)', 'random']] as const) {
  const m = duelBatch(() => mk(75), () => mk(75), b, 'ai', false)
  row([name, pct(m.w, N), pct(m.d, N), pct(m.l, N)])
  if (b === 'human') flag(range(pct(m.w, N), 30, 62), `Humano fuerte contra la IA: gana ${pct(m.w, N)} % (30–62: la IA debe competir, sin ser imbatible)`)
  else flag(pct(m.w, N) <= 12, `Humano al azar contra la IA: gana ${pct(m.w, N)} % (≤ 12: la IA no debe regalar partidos)`)
}
L.push('')

// 3) diferencia de media
L.push('## 3. Duelo clásico: sensibilidad a la media (IA contra IA, sin adaptar al rival; solo informativo)', '', '| Media A / B | Gana A % | Empate % | Gana B % |', '|---|---|---|---|')
for (const [ta, tb, lo, hi] of [[75, 75, 42, 58], [78, 75, 52, 70], [81, 75, 60, 82], [87, 75, 72, 96]] as const) {
  const m = duelBatch(() => mk(ta), () => mk(tb), 'ai', 'ai', false)
  row([`${ta} / ${tb}`, pct(m.w, N), pct(m.d, N), pct(m.l, N)])
  if (ta === tb) flag(range(pct(m.w, N), lo, hi), `Ventaja de media ${ta} contra ${tb}: gana A ${pct(m.w, N)} % (${lo}–${hi})`)
}
L.push('')

// 4) química / un solo juego
L.push('## 4. Duelo clásico: sensibilidad a la química (un solo juego contra mezclado, misma media 75, sin adaptar; solo informativo)', '', '| A | Gana A % | Empate % | Gana B % |', '|---|---|---|---|')
for (const game of ['IE1', 'GO1', 'VR'] as GameId[]) {
  const m = duelBatch(() => mk(75, game), () => mk(75), 'ai', 'ai', false)
  row([`solo ${game}`, pct(m.w, N), pct(m.d, N), pct(m.l, N)])
}
L.push('')

// 5) Sim: espejo y jugador pasivo, con distintos «pull» de la IA
L.push('## 5. Fatal Sim (12 ocasiones, 90 min)', '', '| Escenario | Gana A % | Empate % | Gana B % | Goles/partido | Posesión A % |', '|---|---|---|---|---|---|')
for (const tier of [68, 82]) {
  const m = simBatch(() => mk(tier), () => mk(tier), 'ai', F.SIM_PULL)
  row([`media ${tier}, los dos usan tensión`, pct(m.w, N), pct(m.d, N), pct(m.l, N), (m.goals / N).toFixed(2), pct(m.poss, N)])
  flag(range(pct(m.w, N), 36, 58), `Sim espejo (media ${tier}): gana A ${pct(m.w, N)} % (36–58)`)
  flag(range(m.goals / N, 2.5, 4.6), `Sim (media ${tier}): ${(m.goals / N).toFixed(2)} goles por partido (2,5–4,6)`)
  flag(pct(m.d, N) <= 32, `Sim espejo (media ${tier}): empates ${pct(m.d, N)} % (≤ 32)`)
  flag(range(pct(m.poss, N), 46, 54), `Sim espejo (media ${tier}): posesión de A ${pct(m.poss, N)} % (46–54)`)
}
const pas = simBatch(() => mk(75), () => mk(75), 'passive', F.SIM_PULL)
row(['media 75, A no usa tensión (como «Saltar»)', pct(pas.w, N), pct(pas.d, N), pct(pas.l, N), (pas.goals / N).toFixed(2), pct(pas.poss, N)])
flag(range(pct(pas.w, N), 22, 45), `Sim sin usar tensión contra la IA: gana ${pct(pas.w, N)} % (22–45: usar la tensión debe compensar, sin ser obligatorio)`)
L.push('')

// 6b) condiciones reales del duelo: tu once (mezclado, como un draft normal) contra el rival que genera el juego para tu media
L.push('## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego', '', '| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |', '|---|---|---|---|---|---|---|')
for (const tier of [68, 75, 82]) {
  for (const b of ['ai', 'human'] as const) {
    const mineChem: number[] = [], oppChem: number[] = []
    const t: Tally = { w: 0, d: 0, l: 0, tbs: 0, n: N }
    for (let i = 0; i < N; i++) {
      const me = buildTeam(tier)
      const rival = F.adaptRivalDuel(me.team, F.rivalTeam(me.rating))
      mineChem.push(me.team.cards.reduce((n, c) => n + c.mod, 0) / me.team.cards.length)
      oppChem.push(rival.cards.reduce((n, c) => n + c.mod, 0) / rival.cards.length)
      const r = duel(me.team, rival, b, 'ai', false)
      if (r.res === 0) t.w++; else if (r.res === 1) t.l++; else t.d++
    }
    const avg = (x: number[]) => (x.reduce((a, c) => a + c, 0) / x.length).toFixed(1)
    row([tier, 'IA (equipo real o generado)', b === 'ai' ? 'IA' : 'humano fuerte', pct(t.w, N), pct(t.d, N), pct(t.l, N), `${avg(mineChem)} / ${avg(oppChem)}`])
    if (b === 'human') flag(range(pct(t.w, N), 28, 65), `Condiciones reales (media ${tier}, humano fuerte): gana ${pct(t.w, N)} % (28–65; química media ${avg(mineChem)} contra ${avg(oppChem)})`)
  }
}
L.push('')

L.push('### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75', '', '| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |', '|---|---|---|---|')
for (const pull of [1, F.DUEL_PULL, 0.75]) {
  const res: number[] = []
  for (const b of ['human', 'ai'] as const) {
    let w = 0
    for (let i = 0; i < N; i++) { const me = buildTeam(75); const rival = F.adaptRivalDuel(me.team, F.rivalTeam(me.rating), pull); if (duel(me.team, rival, b, 'ai', false).res === 0) w++ }
    res.push(pct(w, N))
  }
  // equipo mejor: se le suman 1–2 puntos a todo (química) antes de adaptar
  let wb = 0
  for (let i = 0; i < N; i++) { const me = buildTeam(75); const boosted = { ...me.team, cards: me.team.cards.map(c => ({ ...c, st: { att: c.st.att + 2, con: c.st.con + 2, def: c.st.def + 2 } })) }; const rival = F.adaptRivalDuel(me.team, F.rivalTeam(me.rating), pull); if (duel(boosted, rival, 'ai', 'ai', false).res === 0) wb++ }
  row([pull, res[0], res[1], pct(wb, N)])
}
L.push('')

// 6) Sim: cuánto ayuda ir mejor (con la IA adaptada), según el «pull»
L.push('## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)', '', '| Media A / B | pull | Gana A % | Empate % | Gana B % |', '|---|---|---|---|---|')
for (const pull of [1, F.SIM_PULL, 0.7]) {
  const m = simBatch(() => mk(80), () => mk(72), 'ai', pull)
  row(['80 / 72', pull, pct(m.w, N), pct(m.d, N), pct(m.l, N)])
  if (pull === F.SIM_PULL) flag(range(pct(m.w, N), 52, 75), `Sim con pull ${pull}: ir 8 puntos mejor da ${pct(m.w, N)} % (52–75: ir mejor debe notarse sin decidir)`)
}
L.push('')

L.push('## Indicadores fuera de rango', '', ...(flags.length ? flags.map(f => `- ⚠ ${f}`) : ['Ninguno.']), '', `Tiempo: ${((Date.now() - t0) / 1000).toFixed(0)} s.`)
fs.writeFileSync(path.join(A.root, 'docs/balance-report.md'), L.join('\n') + '\n')
console.log(L.join('\n'))
process.exit(flags.length ? 1 : 0)
