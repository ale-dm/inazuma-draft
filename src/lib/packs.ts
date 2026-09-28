import type { Category, GameId, Player } from '../types'
import type { TranslationKey } from '../i18n/translations'
import { getAllPlayers } from '../data/catalog'

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
  /** Clase de color del sobre */
  tone: 'bronze' | 'silver' | 'gold' | 'legend' | 'saga'
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
  // premios (no se venden)
  { id: 'starter', nameKey: 'pack.starter', price: null, cards: 8, tone: 'gold', odds: { 'Growing Player': 30, 'Advanced Player': 50, 'Top Player': 18, 'Legendary Player': 2 }, guarantee: 'Top Player' },
  { id: 'reward', nameKey: 'pack.reward', price: null, cards: 3, tone: 'silver', odds: { 'Growing Player': 40, 'Advanced Player': 45, 'Top Player': 13, 'Legendary Player': 2 } },
]

export function getPack(id: string): PackDef {
  return PACKS.find(p => p.id === id) ?? PACKS[0]
}

function rollRarity(odds: Partial<Record<Category, number>>): Category {
  const entries = Object.entries(odds) as [Category, number][]
  let r = Math.random() * entries.reduce((s, [, w]) => s + w, 0)
  return (entries.find(([, w]) => (r -= w) < 0) ?? entries[entries.length - 1])[0]
}

/** Abre un sobre: cartas con foto, sin repetir personaje dentro del mismo sobre; la mejor, la última (se revela al final) */
export function openPack(pack: PackDef): Player[] {
  const pool = getAllPlayers().filter(p => p.image && (!pack.games || pack.games.includes(p.game)))
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
