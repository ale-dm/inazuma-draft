import type { Player } from '../types'
import { random } from '../lib/run-rng'
import type { DraftPoolKey } from '../types'
import { displayPoolLabel, draftPoolKey, getDraftPools, getTeamRoster, parseDraftPoolKey } from './catalog'
import { pickBestXI } from './ffi-rosters'

export interface TournamentOpponent {
  key: DraftPoolKey
  name: string
  country: string
  flag: string
  players: Player[]
}

const META: Partial<Record<DraftPoolKey, { country: string; flag: string }>> = {
  'IE3:Orpheus': { country: 'Italie', flag: '🇮🇹' },
  'IE3:Unicorn': { country: 'USA', flag: '🇺🇸' },
  'IE3:The Empire': { country: 'Argentine', flag: '🇦🇷' },
  'IE3:The Kingdom': { country: 'Brésil', flag: '🇧🇷' },
  'IE3:Red Matador': { country: 'Espagne', flag: '🇪🇸' },
  'IE3:Rose Griffons': { country: 'France', flag: '🇫🇷' },
  'IE3:Brocken Brigade': { country: 'Allemagne', flag: '🇩🇪' },
  'IE3:Little Gigantes': { country: 'Cotarl', flag: '🌍' },
  'IE1:Zeus': { country: 'Grèce', flag: '🇬🇷' },
  'IE1:Royal Academy': { country: 'Japon', flag: '🇯🇵' },
  'IE1:Raimon': { country: 'Japon', flag: '🇯🇵' },
  'IE1:Occult': { country: 'Japon', flag: '🇯🇵' },
  'IE2:Alpine': { country: 'Suisse', flag: '🇨🇭' },
  'IE2:Epsilon': { country: 'Japon', flag: '🇯🇵' },
}

const COUNTRY_I18N: Record<string, { en: string; es: string; it: string }> = {
  Allemagne: { en: 'Germany', es: 'Alemania', it: 'Germania' },
  Argentine: { en: 'Argentina', es: 'Argentina', it: 'Argentina' },
  Brésil: { en: 'Brazil', es: 'Brasil', it: 'Brasile' },
  Espagne: { en: 'Spain', es: 'España', it: 'Spagna' },
  France: { en: 'France', es: 'Francia', it: 'Francia' },
  Grèce: { en: 'Greece', es: 'Grecia', it: 'Grecia' },
  Italie: { en: 'Italy', es: 'Italia', it: 'Italia' },
  Japon: { en: 'Japan', es: 'Japón', it: 'Giappone' },
  Suisse: { en: 'Switzerland', es: 'Suiza', it: 'Svizzera' },
  USA: { en: 'USA', es: 'EE. UU.', it: 'USA' },
}

/** Nom de pays affiché selon la langue (les clés META sont en français) */
export function localizeCountry(country: string, locale: 'en' | 'es' | 'fr' | 'it'): string {
  if (locale === 'fr') return country
  return COUNTRY_I18N[country]?.[locale] ?? country
}

export function makeTournamentOpponent(key: DraftPoolKey): TournamentOpponent | null {
  const pool = parseDraftPoolKey(key)
  const roster = getTeamRoster(pool)
  if (roster.length < 7) return null
  const meta = META[key] ?? { country: pool.game, flag: '⚽' }
  const xi = pickBestXI(roster)
  if (xi.length < 7) return null
  return {
    key,
    name: displayPoolLabel(pool),
    country: meta.country,
    flag: meta.flag,
    players: xi,
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickUniqueOpponents(count: number, exclude: Set<DraftPoolKey> = new Set()): TournamentOpponent[] {
  const keys = shuffle(
    getDraftPools()
      .map(p => draftPoolKey(p) as DraftPoolKey)
      .filter(k => !exclude.has(k)),
  )
  const picked: TournamentOpponent[] = []
  for (const key of keys) {
    const opp = makeTournamentOpponent(key)
    if (!opp) continue
    picked.push(opp)
    if (picked.length >= count) break
  }
  return picked
}

/** Tirage aléatoire du tableau FFI (tous pools draft jouables) */
export function rollTournamentField(): {
  playerOpponents: TournamentOpponent[]
  blockB: TournamentOpponent[]
} {
  const playerOpponents = pickUniqueOpponents(4)
  const used = new Set(playerOpponents.map(o => o.key))
  let blockB = pickUniqueOpponents(5, used)
  if (blockB.length < 5) {
    blockB = pickUniqueOpponents(5)
  }
  return { playerOpponents, blockB }
}
