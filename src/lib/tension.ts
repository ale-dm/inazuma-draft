import type { Special, Technique } from '../types'
import type { DuelKey } from './duel'
import type { FatalCard } from './fatal'

/**
 * Tensión (como en Victory Road, ver docs/tension-vr.md): una barra por equipo que se llena jugando y se gasta en
 * supertécnicas y en elegir carta. En el original el máximo es 300 con la técnica más cara en 100; aquí las técnicas
 * llegan a 200 TP, así que el máximo es 400 y una técnica cuesta el doble de su TP (la mayor gasta la barra entera).
 */
export const TENSION_MAX = 400
export const TENSION_START = 80
/** Tensión que se gana en el Fatal Sim */
export const TENSION_GAIN = { ballWon: 50, ballLost: 25, goal: 50, saved: 25 }
/** Coste de elegir tú la carta entre las 3 que salen */
export const PICK_COST = 100

const tpOf = (t: Technique) => t.tp ?? t.cost ?? 40

/** Número al que suma cada tipo de supertécnica */
export const TECH_KEY: Record<Technique['type'], DuelKey> = { Shoot: 'att', Dribble: 'con', Block: 'def', Catch: 'def' }

export const techCost = (t: Technique) => Math.round(tpOf(t) * 2)

/** Lo que suma al número de la fase: TP/40 (30 TP → +1, 100 → +3, 200 → +5) y +1 si es de la afinidad de la carta */
export const techBonus = (t: Technique, card: FatalCard) => Math.max(1, Math.round(tpOf(t) / 40)) + (t.element && t.element === card.p.element ? 1 : 0)

/** Supertécnicas de la carta que valen para ese número (la parada solo en porteros), de más a menos TP */
export function usableTechs(card: FatalCard, key: DuelKey): Technique[] {
  const seen = new Set<string>()
  return card.p.techniques
    .filter(t => TECH_KEY[t.type] === key && (t.type !== 'Catch' || card.p.position === 'GK') && !seen.has(t.id) && !!seen.add(t.id))
    .sort((a, b) => tpOf(b) - tpOf(a))
}

export const gainTension = (cur: number, n: number) => Math.min(TENSION_MAX, cur + n)

/** Acciones de equipo del Sim (aparte de las supertécnicas) */
export const PRESS = { cost: 80, bonus: 3 }          // presión alta: +3 al control de esa ocasión
export const SHOUT_COST = 120                        // grito del portero: para seguro el ataque rival, una vez por parte
export const COUNTER_BONUS = 2                       // tras parar un ataque, +2 al control de la siguiente ocasión

/**
 * Puntos de aura (modelo Aura Points de Character Reforged, ver docs/balance-tecnicas-auras.md): el espíritu guerrero,
 * la armadura, el tótem y el Mixi Max no gastan tensión. Cada carta tiene su reserva para todo el partido: PEG del keshin
 * (su KP de Galaxy a nivel 6), SP del tótem (su SP a nivel máximo) o PE (aguante) del Mixi Max.
 * - Técnica del keshin / tótem: cuesta su coste de Galaxy en la reserva; suma como una supertécnica de su TP.
 * - Armadura: +2 y las supertécnicas de ese turno no gastan tensión; gasta (KP + ATK) × 0,025 × 0,75 PEG por segundo
 *   (10 s por turno); la primera del partido recupera el 30 % de la reserva; la técnica del keshin no va con armadura.
 * - Mixi Max: sin tiempo, +3 pagando PE cada turno hasta quedarse sin aguante.
 * A 0 el keshin / tótem se retira el resto del partido.
 */
export const ARMOUR = { bonus: 2, drainPerSecond: 0.025 * 0.75, seconds: 10, refill: 0.3 }
export const MIXI = { pe: 100, cost: 25, bonus: 3 }
const DEFAULT_POOL = 200
const DEFAULT_COST = 60

export type AuraKind = 'aura' | 'armour' | 'mixi'
export interface AuraMove { id: string; kind: AuraKind; pool: string; special: Special; points: number; bonus: number; tech?: Technique }
/** Reserva que le queda a cada especial (clave poolKey); si falta, está entera */
export type AuraPools = Record<string, number>

export const poolKey = (cardId: string, sp: Special) => `${cardId}|${sp.type}|${sp.name ?? ''}`
export const poolMax = (sp: Special) => (sp.type === 'mixi' ? MIXI.pe : sp.points ?? DEFAULT_POOL)
export const poolLeft = (pools: AuraPools, cardId: string, sp: Special) => pools[poolKey(cardId, sp)] ?? poolMax(sp)
/** Unidad de la reserva: PEG (espíritu guerrero), SP (tótem), PE (Mixi Max) */
export const poolUnit = (sp: Special) => (sp.type === 'keshin' ? 'PEG' : sp.type === 'soul' ? 'SP' : 'PE')
export const armourDrain = (sp: Special) => Math.round((poolMax(sp) + (sp.atk ?? 80)) * ARMOUR.drainPerSecond * ARMOUR.seconds)

/** Lo que puede hacer la carta con sus especiales en esta fase. `armoured`: claves de reserva que ya se pusieron la armadura */
export function auraMoves(card: FatalCard, key: DuelKey, pools: AuraPools, techOf: (id: string) => Technique | undefined,
  armoured: readonly string[]): AuraMove[] {
  const out: AuraMove[] = []
  for (const sp of card.p.specials) {
    const pool = poolKey(card.p.id, sp)
    const left = poolLeft(pools, card.p.id, sp)
    if (sp.type === 'mixi') {
      if (left >= MIXI.cost) out.push({ id: `mixi:${pool}`, kind: 'mixi', pool, special: sp, points: MIXI.cost, bonus: MIXI.bonus })
      continue
    }
    const tech = sp.hyper_id ? techOf(sp.hyper_id) : undefined
    const cost = sp.cost ?? DEFAULT_COST
    if (tech && TECH_KEY[tech.type] === key && (tech.type !== 'Catch' || card.p.position === 'GK') && left >= cost) {
      out.push({ id: `aura:${pool}`, kind: 'aura', pool, special: sp, points: cost, bonus: techBonus(tech, card), tech })
    }
    if (sp.type === 'keshin' && sp.armed && left > 0) {
      const refill = armoured.includes(pool) ? 0 : Math.round(ARMOUR.refill * poolMax(sp))
      out.push({ id: `armour:${pool}`, kind: 'armour', pool, special: sp, points: armourDrain(sp) - refill, bonus: ARMOUR.bonus })
    }
  }
  return out
}

/** Paga los movimientos de aura elegidos: la reserva baja (la armadura puede recuperar), entre 0 y el máximo */
export function payAura(pools: AuraPools, moves: readonly AuraMove[]): AuraPools {
  const next = { ...pools }
  for (const m of moves) {
    const max = poolMax(m.special)
    next[m.pool] = Math.max(0, Math.min(max, (next[m.pool] ?? max) - m.points))
  }
  return next
}

/** Fatal clásico (duelo de 10 rondas): tensión inicial y ganancia por ronda (+60 al ganarla, +30 al perderla o empatarla) */
export const DUEL_TENSION = { start: 60, win: 60, lose: 30, draw: 30 }
/** Combo: ganar una ronda usando supertécnica abarata la siguiente un 10 % por nivel (máx. 3) */
export const COMBO_MAX = 3
export const COMBO_DISCOUNT = 0.1
export const comboCost = (t: Technique, combo: number) => Math.round(techCost(t) * (1 - COMBO_DISCOUNT * combo))
