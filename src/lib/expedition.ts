/**
 * Expedición (docs/plan-modos.md §2): un roguelike de draft con las cartas que ya tienes. Ocho rivales de media
 * creciente (70 → 88); tras cada victoria, una de tres recompensas que solo dura la expedición. Un empate avanza con
 * la mitad de las monedas; una derrota resta una vida (3 al empezar) y también avanza: cada rival se juega una vez.
 * Pura salvo las operaciones al final, que escriben en el club.
 */
import type { Player, Technique } from '../types'
import type { DuelKey, DuelStats } from './duel'
import type { FormationId, LineupMap, SlotId } from './lineup'
import { getFormationSlots, lineupToArray } from './lineup'
import { addPack, getClub, updateClub } from './club'
import { lastDraftXI, loadLastDraft } from './last-draft'
import type { TeamMods } from './fatal'

export const EXPEDITION_STEPS = 8
export const START_LIVES = 3
export const RIVAL_MIN = 70
export const RIVAL_MAX = 88
/** Refuerzo de la recompensa (+ a un número de una carta) */
export const BOOST_AMOUNT = 5
/** Sobre especial al vencer al octavo rival (packs.ts) */
export const EXPEDITION_PACK = 'expedition'

/** Media del rival del paso (0 a 7): de 70 a 88 en pasos iguales */
export const rivalRating = (step: number): number => RIVAL_MIN + (step * (RIVAL_MAX - RIVAL_MIN)) / (EXPEDITION_STEPS - 1)

/** Monedas por victoria en ese paso: de 150 a 600. Un empate paga la mitad */
export const stepCoins = (step: number): number => Math.round(150 + (450 * step) / (EXPEDITION_STEPS - 1))

export type Reward =
  | { kind: 'player'; slot: SlotId; playerId: string }
  | { kind: 'boost'; playerId: string; stat: DuelKey }
  | { kind: 'chem' }
  | { kind: 'tech'; playerId: string; techId: string }

export interface ExpeditionRun {
  formation: FormationId
  captain: SlotId | null
  /** puesto → id de carta (el once de la expedición) */
  team: Partial<Record<SlotId, string>>
  /** Química base del último draft y los +1 de las recompensas */
  chem: number
  chemBonus: number
  /** Paso actual: el rival que toca (0 a 7) */
  step: number
  lives: number
  wins: number
  coins: number
  /** Refuerzos por carta (+ números) */
  boosts: Record<string, Partial<DuelStats>>
  /** Supertécnicas nuevas por carta (ids de técnica) */
  techs: Record<string, string[]>
  /** Las tres recompensas que se pueden elegir tras la última victoria */
  offer: Reward[] | null
  /** Rivales ya jugados (no se repiten) y resultado de cada paso (0, 1, −1) */
  rivals: string[]
  results: (0 | 1 | -1)[]
  over: boolean
}

export interface ExpeditionState {
  run: ExpeditionRun | null
  /** Mejor número de victorias seguidas en una expedición */
  best: number
}

/** Modificadores del equipo de la expedición (se suman a los límites del Dojo) */
export function runMods(run: ExpeditionRun): TeamMods {
  return { stats: run.boosts, chem: run.chemBonus }
}

/** Elige al azar, sin repetir, `n` elementos de la lista (con el generador `rnd`) */
function pickN<T>(list: T[], n: number, rnd: () => number): T[] {
  const copy = [...list]
  const out: T[] = []
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0])
  return out
}

/**
 * Las tres recompensas de la victoria: un fichaje (si hay alguno que mejore su puesto), un refuerzo y una supertécnica.
 * Sin fichaje: refuerzo, supertécnica y +1 de química.
 */
export function makeOffer(run: ExpeditionRun, candidates: Player[], techs: Technique[], lookup: (id: string) => Player | undefined, rnd = Math.random): Reward[] {
  const slots = getFormationSlots(run.formation)
  const teamIds = Object.values(run.team).filter((x): x is string => !!x)
  const pickPlayer = (): Reward | null => {
    for (const c of pickN(candidates, candidates.length, rnd)) {
      const same = slots.filter(s => s.role === c.position && run.team[s.id])
      // el puesto de esa posición cuyo titular es más flojo
      const weakest = same.reduce<{ id: SlotId; ovr: number } | null>((w, s) => {
        const ovr = lookup(run.team[s.id]!)?.ovr ?? 0
        return !w || ovr < w.ovr ? { id: s.id, ovr } : w
      }, null)
      if (weakest && c.ovr > weakest.ovr) return { kind: 'player', slot: weakest.id, playerId: c.id }
    }
    return null
  }
  const boost = (): Reward => {
    const playerId = teamIds[Math.floor(rnd() * teamIds.length)]
    const stat = (['att', 'con', 'def'] as const)[Math.floor(rnd() * 3)]
    return { kind: 'boost', playerId, stat }
  }
  const tech = (): Reward => {
    const playerId = teamIds[Math.floor(rnd() * teamIds.length)]
    const t = pickN(techs, 1, rnd)[0]
    return { kind: 'tech', playerId, techId: t?.id ?? '' }
  }
  const player = pickPlayer()
  return player ? [player, boost(), tech()] : [boost(), tech(), { kind: 'chem' }]
}

/** Aplica una recompensa al equipo de la expedición (sin tocar el club) */
export function applyReward(run: ExpeditionRun, r: Reward): ExpeditionRun {
  if (r.kind === 'player') return { ...run, team: { ...run.team, [r.slot]: r.playerId } }
  if (r.kind === 'chem') return { ...run, chemBonus: run.chemBonus + 1 }
  if (r.kind === 'boost') {
    const cur = run.boosts[r.playerId] ?? {}
    return { ...run, boosts: { ...run.boosts, [r.playerId]: { ...cur, [r.stat]: (cur[r.stat] ?? 0) + BOOST_AMOUNT } } }
  }
  return { ...run, techs: { ...run.techs, [r.playerId]: [...(run.techs[r.playerId] ?? []), r.techId] } }
}

/**
 * Avanza tras un partido: victoria (monedas y recompensa, o el premio final), empate (media moneda, sin recompensa)
 * o derrota (una vida menos). Siempre pasa al rival siguiente.
 */
export function afterMatch(run: ExpeditionRun, res: 0 | 1 | -1, rivalName: string, candidates: Player[], techs: Technique[], lookup: (id: string) => Player | undefined, rnd = Math.random): ExpeditionRun {
  const last = run.step === EXPEDITION_STEPS - 1
  const next: ExpeditionRun = { ...run, step: run.step + 1, rivals: [...run.rivals, rivalName], results: [...run.results, res] }
  if (res === 0) {
    next.wins = run.wins + 1
    next.coins = run.coins + stepCoins(run.step)
  } else if (res === -1) {
    next.coins = run.coins + Math.floor(stepCoins(run.step) / 2)
  } else {
    next.lives = run.lives - 1
  }
  next.over = last || next.lives <= 0
  if (res === 0 && !last) next.offer = makeOffer({ ...next, offer: null }, candidates, techs, lookup, rnd)
  return next
}

// ---------------------------------------------------------------- club

/** Empieza una expedición con el último draft (once completo). Falso si no hay draft o ya hay una en curso */
export function startExpedition(): boolean {
  const cur = getClub().expedition
  if (cur.run && !cur.run.over) return false
  const d = loadLastDraft()
  if (!d) return false
  const { lineup, xi } = lastDraftXI(d)
  if (xi.length !== 11) return false
  const team: Partial<Record<SlotId, string>> = {}
  for (const [slot, p] of Object.entries(lineup)) if (p) team[slot as SlotId] = p.id
  const run: ExpeditionRun = {
    formation: d.formation, captain: d.captain, team, chem: d.chem, chemBonus: 0, step: 0, lives: START_LIVES, wins: 0, coins: 0,
    boosts: {}, techs: {}, offer: null, rivals: [], results: [], over: false,
  }
  updateClub(s => ({ ...s, expedition: { ...s.expedition, run } }))
  return true
}

/** Guarda el resultado del partido y avanza. Al vencer al octavo, sobre especial */
export function recordExpeditionMatch(res: 0 | 1 | -1, rivalName: string, candidates: Player[], techs: Technique[], lookup: (id: string) => Player | undefined): void {
  const cur = getClub().expedition
  if (!cur.run || cur.run.over) return
  const won = res === 0 && cur.run.step === EXPEDITION_STEPS - 1
  const next = afterMatch(cur.run, res, rivalName, candidates, techs, lookup)
  updateClub(s => ({
    ...s,
    coins: s.coins + (next.coins - cur.run!.coins),
    expedition: { run: next, best: Math.max(s.expedition.best, next.wins) },
  }))
  if (won) addPack(EXPEDITION_PACK)
}

/** Elige una de las tres recompensas tras una victoria */
export function chooseExpeditionReward(i: number): void {
  const cur = getClub().expedition.run
  const r = cur?.offer?.[i]
  if (!cur || !r) return
  updateClub(s => ({ ...s, expedition: { ...s.expedition, run: { ...applyReward(cur, r), offer: null } } }))
}

/** Deja la expedición (o la cierra al terminar) y guarda el récord */
export function endExpedition(): void {
  const cur = getClub().expedition
  updateClub(s => ({ ...s, expedition: { run: null, best: Math.max(cur.best, cur.run?.wins ?? 0) } }))
}

/**
 * El once de la expedición, listo para el partido: las cartas con sus supertécnicas nuevas. Null si falta alguna carta
 * (no debería pasar: las cartas no se venden durante la expedición).
 */
export function expeditionSquad(run: ExpeditionRun, lookup: (id: string) => Player | undefined, techLookup: (id: string) => Technique | undefined):
  { xi: Player[]; lineup: LineupMap; chem: number; captain: SlotId | null; formation: FormationId } | null {
  const lineup: LineupMap = {}
  for (const [slot, id] of Object.entries(run.team)) {
    const p = id ? lookup(id) : undefined
    if (!p) return null
    const extra = (run.techs[p.id] ?? []).map(techLookup).filter((t): t is Technique => !!t)
    lineup[slot as SlotId] = { ...p, techniques: [...p.techniques, ...extra] }
  }
  const xi = lineupToArray(lineup, run.formation)
  if (xi.length !== 11) return null
  return { xi, lineup, chem: run.chem + run.chemBonus, captain: run.captain, formation: run.formation }
}
