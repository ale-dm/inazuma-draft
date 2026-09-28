import type { Player } from '../types'
import type { TranslationKey } from '../i18n/translations'
import { getCharacterVersions, getPlayer } from '../data/catalog'
import { EVO_BOOST, evoId } from './evo-boosts'
import { getClub, swapCard, track, updateClub, type ActiveEvo } from './club'

/**
 * Evoluciones (fase 5, como las de FC/MADFUT, con las formas de Inazuma): eliges una carta tuya que cumpla los
 * requisitos, haces las tareas (cuentan desde que empiezas) y la carta cambia:
 * - training / keshin / armed / soul: la misma carta con más media y stats (evo-boosts.ts), id "evo~<evo>~<id>"
 * - mixi: la carta pasa a ser su versión Mixi Max real del catálogo
 */
export interface EvoTask {
  event: string
  goal: number
}

export interface EvoDef {
  id: 'training' | 'keshin' | 'armed' | 'soul' | 'mixi'
  nameKey: TranslationKey
  descKey: TranslationKey
  tasks: EvoTask[]
  eligible: (p: Player) => boolean
}

const has = (p: Player, type: string) => p.specials.some(s => s.type === type)
const isMixiVersion = (p: Player) => /mixi/i.test(p.version)
const done = (p: Player, evo: string) => (p.evo ?? []).includes(evo)

/** Versión Mixi Max del personaje a la que puede evolucionar la carta (la de más media) */
export function mixiTarget(p: Player): Player | null {
  if (isMixiVersion(p)) return null
  return getCharacterVersions(p.characterId).filter(v => v.id !== p.id && isMixiVersion(v)).sort((a, b) => b.ovr - a.ovr)[0] ?? null
}

export const EVOLUTIONS: EvoDef[] = [
  {
    id: 'mixi', nameKey: 'evo.mixi', descKey: 'evo.mixiDesc',
    tasks: [{ event: 'duelWins', goal: 2 }, { event: 'puzzles', goal: 1 }, { event: 'drafts', goal: 1 }],
    eligible: p => !p.evo?.length && !!mixiTarget(p),
  },
  {
    id: 'keshin', nameKey: 'evo.keshin', descKey: 'evo.keshinDesc',
    tasks: [{ event: 'duelWins', goal: 3 }, { event: 'cups', goal: 1 }],
    eligible: p => has(p, 'keshin') && !done(p, 'keshin'),
  },
  {
    id: 'armed', nameKey: 'evo.armed', descKey: 'evo.armedDesc',
    tasks: [{ event: 'duelWins', goal: 5 }, { event: 'cupWins', goal: 1 }],
    eligible: p => done(p, 'keshin') && !done(p, 'armed') && p.specials.some(s => s.type === 'keshin' && s.armed),
  },
  {
    id: 'soul', nameKey: 'evo.soul', descKey: 'evo.soulDesc',
    tasks: [{ event: 'duelWins', goal: 3 }, { event: 'hl', goal: 2 }],
    eligible: p => has(p, 'soul') && !done(p, 'soul'),
  },
  {
    id: 'training', nameKey: 'evo.training', descKey: 'evo.trainingDesc',
    tasks: [{ event: 'drafts', goal: 2 }, { event: 'duels', goal: 2 }],
    eligible: p => p.ovr <= 75 && !done(p, 'training'),
  },
]

export const getEvo = (id: string) => EVOLUTIONS.find(e => e.id === id)!

export const boostOf = (id: string) => EVO_BOOST[id]

/** Cartas tuyas que pueden hacer esa evolución */
export function eligibleCards(def: EvoDef): Player[] {
  const busy = new Set(getClub().evos.map(a => a.cardId))
  return Object.keys(getClub().cards).map(getPlayer)
    .filter((p): p is Player => !!p && def.eligible(p) && !busy.has(p.id))
    .sort((a, b) => b.ovr - a.ovr)
}

export function taskProgress(a: ActiveEvo, t: EvoTask): number {
  return Math.min(t.goal, (getClub().career[t.event] ?? 0) - (a.start[t.event] ?? 0))
}

export const evoReady = (a: ActiveEvo) => getEvo(a.evo).tasks.every(t => taskProgress(a, t) >= t.goal)

/** Empieza una evolución (una a la vez de cada tipo) */
export function startEvo(def: EvoDef, card: Player) {
  const s = getClub()
  if (s.evos.some(a => a.evo === def.id)) return
  const active: ActiveEvo = { evo: def.id, cardId: card.id, target: def.id === 'mixi' ? mixiTarget(card)?.id : undefined, start: { ...s.career } }
  updateClub(c => ({ ...c, evos: [...c.evos, active] }))
}

export function cancelEvo(evo: string) {
  updateClub(c => ({ ...c, evos: c.evos.filter(a => a.evo !== evo) }))
}

/** Resultado de la evolución: la carta nueva */
export function evoResult(a: ActiveEvo): Player | undefined {
  return getPlayer(a.evo === 'mixi' ? a.target ?? '' : evoId(a.evo, a.cardId))
}

/** Termina la evolución: cambia una copia de la carta por la evolucionada */
export function completeEvo(a: ActiveEvo): Player | null {
  const out = evoResult(a)
  if (!out || !evoReady(a) || !(getClub().cards[a.cardId] > 0)) return null
  swapCard(a.cardId, out.id)
  cancelEvo(a.evo)
  track('evos')
  return out
}
