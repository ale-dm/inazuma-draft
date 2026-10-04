import type { Technique } from '../types'
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

/** Lo que suma al número de la fase: TP/17 (30 TP → +2, 100 → +6, 200 → +12) y +2 si es de la afinidad de la carta */
export const techBonus = (t: Technique, card: FatalCard) => Math.max(2, Math.round(tpOf(t) / 17)) + (t.element && t.element === card.p.element ? 2 : 0)

/** Supertécnicas de la carta que valen para ese número (la parada solo en porteros), de más a menos TP */
export function usableTechs(card: FatalCard, key: DuelKey): Technique[] {
  const seen = new Set<string>()
  return card.p.techniques
    .filter(t => TECH_KEY[t.type] === key && (t.type !== 'Catch' || card.p.position === 'GK') && !seen.has(t.id) && !!seen.add(t.id))
    .sort((a, b) => tpOf(b) - tpOf(a))
}

export const gainTension = (cur: number, n: number) => Math.min(TENSION_MAX, cur + n)

/** Acciones de equipo del Sim (aparte de las supertécnicas) */
export const PRESS = { cost: 80, bonus: 4 }          // presión alta: +4 al control de esa ocasión
export const HYPER = { cost: 200, bonus: 6 }         // hiperenergía: una vez por partido, carta con espíritu guerrero / Mixi Max / tótem
export const SHOUT_COST = 120                        // grito del portero: para seguro el ataque rival, una vez por parte
export const COUNTER_BONUS = 3                       // tras parar un ataque, +3 al control de la siguiente ocasión

/** Fatal clásico (duelo de 10 rondas): tensión inicial y ganancia por ronda (+60 al ganarla, +30 al perderla o empatarla) */
export const DUEL_TENSION = { start: 60, win: 60, lose: 30, draw: 30 }
/** Combo: ganar una ronda usando supertécnica abarata la siguiente un 10 % por nivel (máx. 3) */
export const COMBO_MAX = 3
export const COMBO_DISCOUNT = 0.1
export const comboCost = (t: Technique, combo: number) => Math.round(techCost(t) * (1 - COMBO_DISCOUNT * combo))
