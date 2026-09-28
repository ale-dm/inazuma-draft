import type { Element, GameId, Player } from '../types'
import { FORMATIONS, autoAssign, getFormation, lineupToArray, type FormationId, type LineupMap, type SlotId } from './lineup'
import { chemistry, teamRating } from './chemistry'
import { duelStats, type DuelKey, type DuelStats } from './duel'
import { isoWeek } from './club'
import { GAMES, getAllPlayers, getDraftPools, getTeamRoster, teamLogo } from '../data/catalog'
import { pickBestXI } from '../data/ffi-rosters'

/**
 * Duelo = el "Fatal" de MADFUT (guía de r/MADFUT), con los números de duelo de las cartas (lib/duel.ts).
 *
 * Mi club y Draft (juegas tú): 10 rondas; en cada una "lleva" un equipo (se alterna; el primero, al azar) y elige
 * carta y número. El otro responde con una carta viendo solo la pista (afinidad, escudo y juego, como la nación y el
 * club en MADFUT): ataque contra defensa, defensa contra ataque, control contra control. Empate → suma de los 3
 * números; si sigue igual, nadie puntúa. Tras las 10 rondas, si hay empate o 1 punto de diferencia, desempate con la
 * carta que queda a cada uno (suma de los 3): gana si saca más de 5; si no, empate.
 * Simulación: 6 ocasiones; control (1 de 3 cartas de control al azar de cada equipo) → quien gana ataca (1 de 3 de
 * ataque) contra la defensa del otro (1 de 3); empate en control = fuera.
 * Química en el duelo: 3 rombos +2 a los 3 números, 2 → +1, 1 → 0, 0 → −3. Boost de la semana: +2 a un juego o
 * una afinidad.
 */
export const FATAL_ROUNDS = 10
export const SIM_CHANCES = 6
/** Diferencia mínima en el desempate para ganar (si no, empate) */
export const TIEBREAK_MARGIN = 5

export interface FatalCard {
  p: Player
  /** Puesto del campo (o el puesto de la carta si no hay formación) */
  slot: string
  /** Números con química y boost ya sumados */
  st: DuelStats
  /** Lo que se ha sumado por química + boost */
  mod: number
  /** Pista que ve el rival (como la bandera, la liga o el club en MADFUT): afinidad, juego o escudo */
  hint: HintKind
}

export type HintKind = 'element' | 'game' | 'crest'

export interface FatalTeam {
  name: string
  cards: FatalCard[]
  /** Formación para colocarlos en el campo (null: filas por puesto) */
  formation: FormationId | null
}

export interface WeeklyBoost {
  kind: 'game' | 'element'
  value: GameId | Element
  amount: number
}

const CHEM_MOD = [-3, 0, 1, 2]
const ELEMENTS: Element[] = ['fire', 'wood', 'air', 'earth']

/** Boost de la semana: cambia cada lunes, alterna entre un juego y una afinidad */
export function weeklyBoost(week = isoWeek()): WeeklyBoost {
  const n = Number(week.slice(0, 4)) * 53 + Number(week.slice(6))
  return n % 2
    ? { kind: 'element', value: ELEMENTS[Math.floor(n / 2) % ELEMENTS.length], amount: 2 }
    : { kind: 'game', value: GAMES[Math.floor(n / 2) % GAMES.length], amount: 2 }
}

const boosted = (p: Player, b: WeeklyBoost) => (b.kind === 'game' ? p.game === b.value : p.element === b.value)

/** Equipo del duelo a partir de un once colocado (química por jugador del once, con el capitán) */
/** Pista de cada carta: al azar entre afinidad, juego y escudo (si el equipo tiene escudo) */
function pickHint(p: Player, rnd: () => number): HintKind {
  const kinds: HintKind[] = teamLogo(p.team, p.game) ? ['element', 'game', 'crest'] : ['element', 'game']
  return kinds[Math.floor(rnd() * kinds.length)]
}

export function fatalTeam(
  name: string, lineup: LineupMap, captain: SlotId | null | undefined, formation: FormationId | null, boost = weeklyBoost(), rnd = Math.random,
): FatalTeam {
  const chem = chemistry(lineup, captain ?? undefined)
  const cards = (Object.entries(lineup) as [SlotId, Player | undefined][]).filter((e): e is [SlotId, Player] => !!e[1]).map(([slot, p]) => {
    const mod = CHEM_MOD[chem.players[slot] ?? 0] + (boosted(p, boost) ? boost.amount : 0)
    const d = duelStats(p)
    const c = (v: number) => Math.max(1, Math.min(99, v + mod))
    return { p, slot, st: { att: c(d.att), con: c(d.con), def: c(d.def) }, mod, hint: pickHint(p, rnd) }
  })
  return { name, cards, formation }
}

/** Once suelto (rival de la máquina) → colocado en la formación que le encaje */
export function lineupFor(xi: Player[]): { lineup: LineupMap; formation: FormationId | null } {
  for (const f of FORMATIONS) {
    const l = autoAssign(xi, f.id)
    if (lineupToArray(l, f.id).length === xi.length) return { lineup: l, formation: f.id }
  }
  // sin formación exacta: puestos sintéticos por posición (en el campo, por filas)
  const l: Record<string, Player> = {}
  xi.forEach((p, i) => { l[`${p.position}${i}`] = p })
  return { lineup: l as LineupMap, formation: null }
}

/** Nombre del rival generado */
export const GENERATED_RIVAL = 'Fatal IA'

/**
 * Rival de la máquina: la mitad de las veces un equipo real del catálogo (su mejor once, media parecida a la tuya) y
 * la otra mitad uno generado con química a tope: formación al azar y los 11 del mismo juego (así todos tienen 3
 * rombos), con media cerca de la tuya y, si puede, de la misma afinidad.
 */
export function rivalTeam(rating: number, rnd = Math.random): FatalTeam {
  if (rnd() < 0.5) {
    const real = getDraftPools()
      .map(pool => ({ name: pool.label, xi: pickBestXI(getTeamRoster(pool)) }))
      .filter(t => t.xi.length === 11 && t.xi.some(p => p.position === 'GK'))
      .map(t => ({ ...t, rating: teamRating(t.xi) }))
    const near = real.filter(t => Math.abs(t.rating - rating) <= 4)
    const list = near.length ? near : [...real].sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating)).slice(0, 5)
    if (list.length) {
      const t = list[Math.floor(rnd() * list.length)]
      const { lineup, formation } = lineupFor(t.xi)
      return fatalTeam(t.name, lineup, captainOf(lineup), formation, weeklyBoost(), rnd)
    }
  }
  return generatedRival(rating, rnd)
}

export function generatedRival(rating: number, rnd = Math.random): FatalTeam {
  const all = getAllPlayers().filter(p => p.image)
  const byGame = GAMES.map(g => all.filter(p => p.game === g)).filter(l => l.length >= 120)
  const pool = byGame[Math.floor(rnd() * byGame.length)] ?? all
  const count = new Map<string, number>()
  for (const p of pool) count.set(p.element, (count.get(p.element) ?? 0) + 1)
  const element = [...count].sort((a, b) => b[1] - a[1])[Math.floor(rnd() * 2)]?.[0]
  const f = FORMATIONS[Math.floor(rnd() * FORMATIONS.length)]
  const used = new Set<string>()
  const lineup: LineupMap = {}
  for (const s of getFormation(f.id).slots) {
    const free = pool.filter(p => p.position === s.role && !used.has(p.characterId))
    const near = (l: Player[], d: number) => l.filter(p => Math.abs(p.ovr - rating) <= d)
    const tiers = [near(free.filter(p => p.element === element), 3), near(free, 3), near(free, 7), free]
    const list = tiers.find(l => l.length) ?? []
    const p = list[Math.floor(rnd() * list.length)]
    if (!p) continue
    used.add(p.characterId)
    lineup[s.id] = p
  }
  return fatalTeam(GENERATED_RIVAL, lineup, captainOf(lineup), f.id, weeklyBoost(), rnd)
}

export function captainOf(l: LineupMap): SlotId | null {
  const best = (Object.entries(l) as [SlotId, Player][]).sort((a, b) => b[1].ovr - a[1].ovr)[0]
  return best ? best[0] : null
}

/** Número con el que responde el otro: ataque ↔ defensa, control ↔ control */
export const counter = (k: DuelKey): DuelKey => (k === 'att' ? 'def' : k === 'def' ? 'att' : 'con')

export const total = (c: FatalCard) => c.st.att + c.st.con + c.st.def

/** Ronda: quien lleva (lead) con su número contra el número contrario de quien responde. 0 = lead, 1 = responde, −1 = nadie */
export function resolveRound(lead: FatalCard, stat: DuelKey, resp: FatalCard): 0 | 1 | -1 {
  const a = lead.st[stat]
  const b = resp.st[counter(stat)]
  if (a !== b) return a > b ? 0 : 1
  const ta = total(lead)
  const tb = total(resp)
  return ta === tb ? -1 : ta > tb ? 0 : 1
}

export interface Round {
  /** Equipo que lleva la ronda: 0 tú, 1 rival */
  lead: 0 | 1
  stat: DuelKey
  /** Cartas [tuya, rival] */
  cards: [FatalCard, FatalCard]
  /** Ganador: 0 tú, 1 rival, −1 nadie */
  winner: 0 | 1 | -1
  /** Se decidió por la suma de los 3 números */
  byTotal: boolean
}

export function playRound(lead: 0 | 1, stat: DuelKey, mine: FatalCard, theirs: FatalCard): Round {
  const [l, r] = lead === 0 ? [mine, theirs] : [theirs, mine]
  const w = resolveRound(l, stat, r)
  const winner = w === -1 ? -1 : ((w === 0 ? lead : 1 - lead) as 0 | 1)
  return { lead, stat, cards: [mine, theirs], winner, byTotal: l.st[stat] === r.st[counter(stat)] }
}

export const score = (rounds: Round[]): [number, number] => [
  rounds.filter(r => r.winner === 0).length,
  rounds.filter(r => r.winner === 1).length,
]

/** ¿Hace falta desempate? Empate o 1 punto de diferencia tras las 10 rondas */
export const needsTiebreak = (s: [number, number]) => Math.abs(s[0] - s[1]) <= 1

/** Desempate con la última carta de cada uno: 0 tú, 1 rival, −1 empate (diferencia de 5 o menos) */
export function tiebreak(mine: FatalCard, theirs: FatalCard): 0 | 1 | -1 {
  const d = total(mine) - total(theirs)
  return Math.abs(d) <= TIEBREAK_MARGIN ? -1 : d > 0 ? 0 : 1
}

/** Resultado final: 0 ganas, 1 gana el rival, −1 empate */
export function finalResult(s: [number, number], tb: 0 | 1 | -1 | null): 0 | 1 | -1 {
  if (tb !== null) return tb
  return s[0] === s[1] ? -1 : s[0] > s[1] ? 0 : 1
}

// ---------------------------------------------------------------- la máquina

const best = (c: FatalCard): DuelKey => (['att', 'con', 'def'] as const).reduce((a, k) => (c.st[k] > c.st[a] ? k : a), 'att' as DuelKey)

/** La máquina lleva: una carta de "clase media" (ni la mejor ni la peor, como aconseja la guía) con su mejor número */
export function aiLead(hand: FatalCard[], rnd = Math.random): { card: FatalCard; stat: DuelKey } {
  const sorted = [...hand].sort((a, b) => b.st[best(b)] - a.st[best(a)])
  const mid = Math.floor(sorted.length / 2)
  const span = Math.max(1, Math.floor(sorted.length / 3))
  const i = Math.min(sorted.length - 1, Math.max(0, mid + Math.floor((rnd() - 0.5) * 2 * span)))
  const card = sorted[i]
  return { card, stat: best(card) }
}

/** ¿Encaja la carta con la pista de otra? (misma afinidad / juego / equipo, según su pista) */
export function matchesHint(c: FatalCard, lead: FatalCard): boolean {
  if (lead.hint === 'element') return c.p.element === lead.p.element
  if (lead.hint === 'game') return c.p.game === lead.p.game
  return c.p.team === lead.p.team
}

/**
 * La máquina responde viendo la pista de tu carta: estima su número (media de tus cartas que encajan con la pista) y
 * juega la carta más floja que lo supera; si ninguna lo supera, "tira" su peor carta para ese número.
 */
export function aiRespond(hand: FatalCard[], stat: DuelKey, lead: FatalCard, rivalLeft: FatalCard[], rnd = Math.random): FatalCard {
  const likely = rivalLeft.filter(c => matchesHint(c, lead))
  const pool = likely.length ? likely : rivalLeft
  const est = pool.reduce((s, c) => s + c.st[stat], 0) / Math.max(1, pool.length)
  const k = counter(stat)
  const beats = hand.filter(c => c.st[k] > est + (rnd() - 0.5) * 6).sort((a, b) => a.st[k] - b.st[k])
  if (beats.length) return beats[0]
  return [...hand].sort((a, b) => a.st[k] - b.st[k] || total(a) - total(b))[0]
}

// ---------------------------------------------------------------- simulación

const ATTACK = new Set(['LW', 'ST', 'RW'])
const WIDE = new Set(['LB', 'RB', 'LW', 'RW'])
const role = (slot: string) => slot.replace(/\d+$/, '')

export function attackers(t: FatalTeam): FatalCard[] {
  const a = t.cards.filter(c => ATTACK.has(c.slot) || role(c.slot) === 'FW')
  if (a.length >= 3) return a
  // como en MADFUT: si hay menos de 3 atacantes, se completa con medios
  return [...a, ...t.cards.filter(c => role(c.slot) === 'CM' || role(c.slot) === 'MF')].slice(0, 3)
}
export const controllers = (t: FatalTeam) => t.cards.filter(c => role(c.slot) === 'CM' || role(c.slot) === 'MF' || WIDE.has(c.slot))
export const defenders = (t: FatalTeam) => t.cards.filter(c => ['CB', 'GK', 'DF'].includes(role(c.slot)) || c.slot === 'LB' || c.slot === 'RB')

function pick3(list: FatalCard[], rnd: () => number): FatalCard {
  const three = [...list].sort(() => rnd() - 0.5).slice(0, 3)
  return three[Math.floor(rnd() * three.length)]
}

export interface SimChance {
  /** Batalla de control: [tuya, rival] */
  control: [FatalCard, FatalCard]
  /** Quién se lleva el balón (−1: fuera) */
  ball: 0 | 1 | -1
  /** Ataque de quien tiene el balón contra la defensa del otro: [atacante, defensor] */
  shot?: [FatalCard, FatalCard]
  goal?: boolean
}

export function simulate(me: FatalTeam, opp: FatalTeam, rnd = Math.random): SimChance[] {
  const out: SimChance[] = []
  for (let i = 0; i < SIM_CHANCES; i++) {
    const a = pick3(controllers(me).length ? controllers(me) : me.cards, rnd)
    const b = pick3(controllers(opp).length ? controllers(opp) : opp.cards, rnd)
    const ball = a.st.con === b.st.con ? -1 : a.st.con > b.st.con ? 0 : 1
    if (ball === -1) { out.push({ control: [a, b], ball }); continue }
    const [att, def] = ball === 0 ? [attackers(me), defenders(opp)] : [attackers(opp), defenders(me)]
    const x = pick3(att.length ? att : (ball === 0 ? me : opp).cards, rnd)
    const y = pick3(def.length ? def : (ball === 0 ? opp : me).cards, rnd)
    out.push({ control: [a, b], ball, shot: [x, y], goal: x.st.att > y.st.def })
  }
  return out
}

export const simScore = (ch: SimChance[]): [number, number] => [
  ch.filter(c => c.goal && c.ball === 0).length,
  ch.filter(c => c.goal && c.ball === 1).length,
]
