import type { Category, Element, GameId, Player } from '../types'
import type { TranslationKey } from '../i18n/translations'
import { getAllPlayers } from '../data/catalog'
import { isoWeek } from './club'

/** Sobres de la tienda: precio, nº de cartas, probabilidades por rareza (%) y, si acaso, filtro por saga */
export interface PackDef {
  id: string
  /** Clave de texto del nombre */
  nameKey: TranslationKey
  price: number | null
  cards: number
  odds: Partial<Record<Category, number>>
  /** Rareza mínima garantizada para la mejor carta */
  guarantee?: Category
  games?: GameId[]
  /** Solo cartas de esas afinidades */
  elements?: Element[]
  /** Solo cartas del equipo de la semana (weeklyTeam) */
  weeklyTeam?: boolean
  /** Media mínima y máxima de las cartas (fichas y sobres especiales) */
  ovrMin?: number
  ovrMax?: number
  /** Clase de color del sobre */
  tone: 'bronze' | 'silver' | 'gold' | 'legend' | 'saga' | 'fire' | 'wood' | 'air' | 'earth' | 'team' | 'special' | 'free'
}

/** Clase de color de cada rareza, con los colores de Victory Road: Common verde · Growing azul · Advanced morado ·
 *  Top amarillo · Legendary naranja. La rareza sale de la media (OVR) de la carta. */
export const RARITY_CLASS: Record<Category, string> = {
  'Legendary Player': 'legendary',
  'Top Player': 'top',
  'Advanced Player': 'advanced',
  'Growing Player': 'growing',
  'Common Player': 'common',
}

export const RARITY_ORDER: Category[] = ['Common Player', 'Growing Player', 'Advanced Player', 'Top Player', 'Legendary Player']

const GOLD_ODDS = { 'Advanced Player': 62, 'Top Player': 32, 'Legendary Player': 6 }

export const PACKS: PackDef[] = [
  { id: 'bronze', nameKey: 'pack.bronze', price: 500, cards: 5, tone: 'bronze', odds: { 'Common Player': 60, 'Growing Player': 35, 'Advanced Player': 5 } },
  { id: 'silver', nameKey: 'pack.silver', price: 1500, cards: 5, tone: 'silver', odds: { 'Growing Player': 55, 'Advanced Player': 38, 'Top Player': 6, 'Legendary Player': 1 } },
  { id: 'gold', nameKey: 'pack.gold', price: 3500, cards: 5, tone: 'gold', odds: GOLD_ODDS, guarantee: 'Top Player' },
  { id: 'legend', nameKey: 'pack.legend', price: 12000, cards: 3, tone: 'legend', odds: { 'Top Player': 70, 'Legendary Player': 30 }, guarantee: 'Legendary Player' },
  { id: 'saga-ie', nameKey: 'pack.sagaIe', price: 2500, cards: 4, tone: 'saga', odds: GOLD_ODDS, games: ['IE1', 'IE2', 'IE3'] },
  { id: 'saga-go', nameKey: 'pack.sagaGo', price: 2500, cards: 4, tone: 'saga', odds: GOLD_ODDS, games: ['GO1', 'GO2', 'GO3'] },
  { id: 'saga-ares', nameKey: 'pack.sagaAres', price: 2500, cards: 4, tone: 'saga', odds: GOLD_ODDS, games: ['ARES', 'ORION'] },
  { id: 'saga-vr', nameKey: 'pack.sagaVr', price: 2500, cards: 4, tone: 'saga', odds: GOLD_ODDS, games: ['VR'] },
  // por afinidad y por equipo (el equipo cambia cada semana)
  { id: 'el-fire', nameKey: 'pack.fire', price: 2000, cards: 4, tone: 'fire', odds: GOLD_ODDS, elements: ['fire'] },
  { id: 'el-air', nameKey: 'pack.air', price: 2000, cards: 4, tone: 'air', odds: GOLD_ODDS, elements: ['air'] },
  { id: 'el-wood', nameKey: 'pack.wood', price: 2000, cards: 4, tone: 'wood', odds: GOLD_ODDS, elements: ['wood'] },
  { id: 'el-earth', nameKey: 'pack.earth', price: 2000, cards: 4, tone: 'earth', odds: GOLD_ODDS, elements: ['earth'] },
  { id: 'team-week', nameKey: 'pack.team', price: 3000, cards: 4, tone: 'team', odds: { 'Growing Player': 20, 'Advanced Player': 45, 'Top Player': 28, 'Legendary Player': 7 }, weeklyTeam: true },
  // premios (no se venden)
  { id: 'starter', nameKey: 'pack.starter', price: null, cards: 8, tone: 'gold', odds: { 'Growing Player': 30, 'Advanced Player': 50, 'Top Player': 18, 'Legendary Player': 2 }, guarantee: 'Top Player' },
  { id: 'reward', nameKey: 'pack.reward', price: null, cards: 3, tone: 'silver', odds: { 'Growing Player': 40, 'Advanced Player': 45, 'Top Player': 13, 'Legendary Player': 2 } },
  // sobre gratis: 9 cartas, casi todas flojas (para tirar)
  { id: 'free', nameKey: 'pack.free', price: null, cards: 9, tone: 'free', odds: { 'Common Player': 62, 'Growing Player': 30, 'Advanced Player': 7, 'Top Player': 0.9, 'Legendary Player': 0.1 } },
  // sobres de hoy y fichas: 1 carta con media mínima
  { id: 'one-80', nameKey: 'pack.one80', price: null, cards: 1, tone: 'special', odds: { 'Advanced Player': 60, 'Top Player': 34, 'Legendary Player': 6 }, ovrMin: 80 },
  { id: 'one-85', nameKey: 'pack.one85', price: null, cards: 1, tone: 'special', odds: { 'Top Player': 80, 'Legendary Player': 20 }, ovrMin: 85, ovrMax: 89 },
  { id: 'one-88', nameKey: 'pack.one88', price: null, cards: 1, tone: 'legend', odds: { 'Top Player': 60, 'Legendary Player': 40 }, ovrMin: 88 },
  { id: 'one-90', nameKey: 'pack.one90', price: null, cards: 1, tone: 'legend', odds: { 'Legendary Player': 100 }, ovrMin: 90 },
  { id: 'one-top', nameKey: 'pack.oneTop', price: null, cards: 1, tone: 'gold', odds: { 'Top Player': 100 } },
  { id: 'one-bronze', nameKey: 'pack.oneBronze', price: null, cards: 1, tone: 'bronze', odds: { 'Common Player': 70, 'Growing Player': 30 } },
  { id: 'one-silver', nameKey: 'pack.oneSilver', price: null, cards: 1, tone: 'silver', odds: { 'Growing Player': 60, 'Advanced Player': 40 } },
  { id: 'x2-random', nameKey: 'pack.x2Random', price: null, cards: 2, tone: 'special', odds: { 'Advanced Player': 45, 'Top Player': 40, 'Legendary Player': 15 } },
]

export function getPack(id: string): PackDef {
  return PACKS.find(p => p.id === id) ?? PACKS[0]
}

function rollRarity(odds: Partial<Record<Category, number>>): Category {
  const entries = Object.entries(odds) as [Category, number][]
  let r = Math.random() * entries.reduce((s, [, w]) => s + w, 0)
  return (entries.find(([, w]) => (r -= w) < 0) ?? entries[entries.length - 1])[0]
}

const NON_TEAMS = new Set(['Unaffiliated', 'Sub Character', 'Adult', 'Mixi Max'])
let teamRotation: string[] | null = null

/** Equipo del sobre de la semana: rota por los 30 equipos con más cartas con foto (mismo equipo toda la semana) */
export function weeklyTeam(week = isoWeek()): string {
  if (!teamRotation) {
    const n = new Map<string, number>()
    for (const p of getAllPlayers()) if (p.image && !NON_TEAMS.has(p.team)) n.set(p.team, (n.get(p.team) ?? 0) + 1)
    teamRotation = [...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30).map(([t]) => t).sort()
  }
  const k = Number(week.slice(0, 4)) * 53 + Number(week.slice(6))
  return teamRotation[k % teamRotation.length] ?? 'Raimon'
}

/** Abre un sobre: cartas con foto, sin repetir personaje dentro del mismo sobre; la mejor, la última (se revela al final) */
export function openPack(pack: PackDef): Player[] {
  const team = pack.weeklyTeam ? weeklyTeam() : null
  const pool = getAllPlayers().filter(p => p.image && (!pack.games || pack.games.includes(p.game))
    && (!pack.elements || pack.elements.includes(p.element)) && (!team || p.team === team || p.extraTeams.includes(team))
    && (pack.ovrMin == null || p.ovr >= pack.ovrMin) && (pack.ovrMax == null || p.ovr <= pack.ovrMax))
  const byCat = new Map<Category, Player[]>()
  for (const p of pool) {
    const l = byCat.get(p.category)
    if (l) l.push(p)
    else byCat.set(p.category, [p])
  }
  const rarities = Array.from({ length: pack.cards }, () => rollRarity(pack.odds))
  if (pack.guarantee) {
    const min = RARITY_ORDER.indexOf(pack.guarantee)
    if (!rarities.some(r => RARITY_ORDER.indexOf(r) >= min)) rarities[0] = pack.guarantee
  }
  const out: Player[] = []
  const chars = new Set<string>()
  for (const r of rarities) {
    const list = byCat.get(r) ?? pool
    for (let tries = 0; tries < 30; tries++) {
      const p = list[Math.floor(Math.random() * list.length)]
      if (p && !chars.has(p.characterId)) {
        chars.add(p.characterId)
        out.push(p)
        break
      }
    }
  }
  return out.sort((a, b) => RARITY_ORDER.indexOf(a.category) - RARITY_ORDER.indexOf(b.category) || a.ovr - b.ovr)
}
