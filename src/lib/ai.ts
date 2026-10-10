import type { DuelKey, DuelStats } from './duel'
import { level } from './difficulty'

/**
 * La máquina del Fatal (clásico y Sim). Compite de verdad: calcula con las cartas que os quedan en lugar de jugar al
 * azar. Para que sea justa, ve tus números con un error de ±2 (no los exactos) y no ve tus supertécnicas. Ver
 * docs/balance-guide.md §2.1.
 */
export interface AiCard {
  st: DuelStats
  hint: 'element' | 'game' | 'crest'
  p: { element: string; game: string; team: string }
}


const counter = (k: DuelKey): DuelKey => (k === 'att' ? 'def' : k === 'def' ? 'att' : 'con')
const total = (c: AiCard) => c.st.att + c.st.con + c.st.def
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
const noise = (rnd: () => number) => (rnd() - 0.5) * 2 * level().noise

/** Coste de oportunidad de jugar la carta: 0 (la más floja de la mano) a 1 (la mejor) */
function costs<T extends AiCard>(hand: T[]): Map<T, number> {
  const t = hand.map(total)
  const lo = Math.min(...t), hi = Math.max(...t)
  return new Map(hand.map(c => [c, (total(c) - lo) / Math.max(1, hi - lo)]))
}

/** ¿Encaja la carta con la pista de otra? (misma afinidad / juego / equipo, según su pista) */
export function matchesHint(c: AiCard, lead: AiCard): boolean {
  if (lead.hint === 'element') return c.p.element === lead.p.element
  if (lead.hint === 'game') return c.p.game === lead.p.game
  return c.p.team === lead.p.team
}

/**
 * La máquina lleva: para cada carta y número mira lo mejor que podrías responder tú con lo que te queda (tu mayor número
 * del contrario, con error) y juega el que más probabilidad de ganar da gastando la carta más barata. Así ataca por
 * donde eres débil y guarda las cartas fuertes para responder.
 */
export function aiLead<T extends AiCard>(hand: T[], rivalLeft: T[], rnd = Math.random): { card: T; stat: DuelKey } {
  const cost = costs(hand)
  let pick: { card: T; stat: DuelKey; score: number } | null = null
  for (const card of hand) {
    for (const stat of ['att', 'con', 'def'] as const) {
      const k = counter(stat)
      const yourBest = Math.max(-1, ...rivalLeft.map(c => c.st[k])) + noise(rnd)
      const pWin = sigmoid((card.st[stat] - yourBest - 0.5) / 2.5)
      const score = pWin - level().cost * cost.get(card)! + (card.st[stat] - yourBest) / 60 + (rnd() - 0.5) * 0.06
      if (!pick || score > pick.score) pick = { card, stat, score }
    }
  }
  return { card: pick!.card, stat: pick!.stat }
}

/**
 * La máquina responde viendo el número que juegas y la pista de tu carta: tus cartas que encajan con la pista son las
 * candidatas (las altas más probables, porque habrás elegido bien). Juega la carta con más probabilidad de ganarte sin
 * gastar una buena; si ninguna tiene opciones, tira la peor.
 */
export function aiRespond<T extends AiCard>(hand: T[], stat: DuelKey, lead: AiCard, rivalLeft: AiCard[], rnd = Math.random): T {
  const likely = rivalLeft.filter(c => matchesHint(c, lead))
  const cands = (likely.length ? likely : rivalLeft).map(c => c.st[stat] + noise(rnd))
  const top = Math.max(...cands)
  const w = cands.map(v => Math.exp((v - top) / 4))
  const sw = w.reduce((a, b) => a + b, 0)
  const k = counter(stat)
  const cost = costs(hand)
  let bestCard: T | null = null
  let bestScore = -Infinity
  let bestP = 0
  for (const c of hand) {
    const p = cands.reduce((s, v, i) => s + (c.st[k] > v ? w[i] : 0), 0) / sw
    bestP = Math.max(bestP, p)
    const score = p - level().cost * cost.get(c)!
    if (score > bestScore) { bestScore = score; bestCard = c }
  }
  if (bestP < 0.2) return [...hand].sort((a, b) => total(a) - total(b) || a.st[k] - b.st[k])[0]
  return bestCard!
}

export interface BoostOpt { id: string; cost: number; bonus: number }

/**
 * Qué refuerzos (supertécnicas, presión…) gasta la máquina: si va perdiendo por poco (`need` = lo que le falta para
 * ganar), el más barato que lo da, o varios si hace falta; si va ganando por muy poco, a veces uno barato por si acaso.
 * No gasta lo que no cubre la diferencia. `max` limita cuántos usa (una supertécnica por ronda en el duelo).
 */
export function chooseBoosts(opts: BoostOpt[], need: number, budget: number, max = 3, rnd = Math.random): BoostOpt[] {
  const aff = opts.filter(o => o.cost <= budget)
  if (!aff.length) return []
  if (need <= 0) {
    if (need > -3 && rnd() < 0.4) return [[...aff].sort((a, b) => a.cost - b.cost)[0]].filter(o => o.cost <= budget * 0.5)
    return []
  }
  if (rnd() > 0.9) return []
  const single = aff.filter(o => o.bonus >= need).sort((a, b) => a.cost - b.cost)[0]
  if (single) return [single]
  if (max < 2) return []
  const chosen: BoostOpt[] = []
  let left = budget, got = 0
  for (const o of [...aff].sort((a, b) => b.bonus / b.cost - a.bonus / a.cost)) {
    if (chosen.length >= max || o.cost > left) continue
    chosen.push(o); left -= o.cost; got += o.bonus
    if (got >= need) return chosen
  }
  return []
}

/** Lo que la máquina cree que vale tu número (con error) */
export const perceive = (n: number, rnd = Math.random) => n + noise(rnd)
