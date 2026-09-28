import type { Category, DraftPool, DraftPoolKey, Element, GameId, Player, Position, Special, Staff, StaffRole, Technique } from '../types'
import { GAME_LABEL } from './games'

/**
 * Catálogo de jugadores desde Supabase (generado por tools/db/build.py).
 * Se carga una vez al arrancar (loadCatalog) y después se consulta de forma síncrona.
 * La clave publishable es pública por diseño: solo permite leer.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://xacgoiaejdgjrvvsnqyi.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_iaMxVv0YacdSYbqOArEMJw_7OMGCMhb'
const PAGE = 1000

export const GAMES: GameId[] = ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3', 'ARES', 'ORION', 'VR']
export const POSITIONS: Position[] = ['GK', 'DF', 'MF', 'FW']
export const CATEGORIES: Category[] = ['Legendary Player', 'Top Player', 'Advanced Player', 'Growing Player', 'Common Player']
export const ELEMENTS: Element[] = ['fire', 'wood', 'air', 'earth']

/** Equipos que no forman un pool de draft (scouts, versiones adultas, Mixi Max) */
const NON_TEAMS = new Set(['Unaffiliated', 'Sub Character', 'Adult', 'Mixi Max'])
const MIN_POOL_SIZE = 8

interface CardRow {
  id: string
  character_id: string
  name: string
  game: GameId
  version: string
  team: string | null
  position: Position
  element: Element | null
  ovr: number
  category: Category
  tier: Player['tier']
  shooting: number
  control: number
  physical: number
  speed: number
  defense: number
  goalkeeping: number
  image_url: string | null
  is_version: boolean
  zukan_no: number | null
  no: number | null
  specials: Special[] | null
  extra_teams: string[] | null
  card_techniques: { slot: number; technique_id: string }[]
}

interface TechniqueRow {
  id: string
  name: string
  name_es: string | null
  name_fr: string | null
  name_it: string | null
  type: Technique['type']
  element: Element | null
  cost: number | null
  cost_game: string | null
  description: string | null
  image_url: string | null
}

interface StaffRow {
  zukan_no: number
  name: string
  role: StaffRole
  team: string | null
  teams: string[] | null
  games: GameId[] | null
  image_url: string | null
  description: string | null
}

interface TeamRow {
  name: string
  name_es: string | null
  name_fr: string | null
  name_it: string | null
}

type LocalNames = Partial<Record<'es' | 'fr' | 'it', string | null | undefined>>

/** El nombre en el idioma de la interfaz si se conoce; si no, el inglés */
function localName(en: string, names: LocalNames | undefined, locale: string): string {
  return (locale !== 'en' && names?.[locale as keyof LocalNames]) || en
}

let players: Player[] = []
let teamNames = new Map<string, LocalNames>()
let staff: Staff[] = []
let techniquesById = new Map<string, Technique>()
let byId = new Map<string, Player>()
let pools: DraftPool[] = []
let poolRosters = new Map<string, Player[]>()

async function rest<T>(path: string, headers?: Record<string, string>): Promise<{ data: T; total: number | null }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_KEY, ...headers } })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  const total = Number(res.headers.get('content-range')?.split('/')[1])     // "0-999/5378" con Prefer: count=exact
  return { data: await res.json() as T, total: Number.isFinite(total) ? total : null }
}

const get = async <T>(path: string) => (await rest<T>(path)).data

// solo lo que usa la app: las descripciones se piden al abrir la ficha (loadDescription)
const CARD_COLUMNS = 'id,character_id,name,game,version,team,position,element,ovr,category,tier,'
  + 'shooting,control,physical,speed,defense,goalkeeping,image_url,is_version,zukan_no,no,specials,extra_teams,'
  + 'card_techniques(slot,technique_id)'
const TECHNIQUE_COLUMNS = 'id,name,name_es,name_fr,name_it,type,element,cost,cost_game,description,image_url'
const cardsPage = (offset: number, headers?: Record<string, string>) =>
  rest<CardRow[]>(`cards?select=${CARD_COLUMNS}&order=id&limit=${PAGE}&offset=${offset}`, headers)

/** Cartas en páginas de PAGE pedidas a la vez (la primera dice cuántas hay) */
async function loadCards(): Promise<CardRow[]> {
  const first = await cardsPage(0, { Prefer: 'count=exact' })
  const total = first.total ?? first.data.length
  const offsets = []
  for (let o = PAGE; o < total; o += PAGE) offsets.push(o)
  const rest_ = await Promise.all(offsets.map(o => cardsPage(o).then(r => r.data)))
  return [first.data, ...rest_].flat()
}

export async function loadCatalog(): Promise<void> {
  if (players.length) return
  // todo a la vez; equipos y cuerpo técnico son opcionales (sin ellos: nombres en inglés, sin pestaña de staff)
  const [techniques, teams, staffRows, rows] = await Promise.all([
    get<TechniqueRow[]>(`techniques?select=${TECHNIQUE_COLUMNS}`),
    get<TeamRow[]>('teams?select=name,name_es,name_fr,name_it').catch(() => [] as TeamRow[]),
    get<StaffRow[]>('staff?select=zukan_no,name,role,team,teams,games,image_url,description&order=zukan_no').catch(() => [] as StaffRow[]),
    loadCards(),
  ])
  const techById = new Map<string, Technique>(techniques.map(t => [t.id, {
    id: t.id, name: t.name, nameEs: t.name_es, nameFr: t.name_fr, nameIt: t.name_it, type: t.type, element: t.element,
    cost: t.cost, costGame: t.cost_game, description: t.description, image: t.image_url,
  }]))
  techniquesById = techById
  teamNames = new Map(teams.map(t => [t.name, { es: t.name_es, fr: t.name_fr, it: t.name_it }]))
  staff = staffRows.map(s => ({
    zukanNo: s.zukan_no, name: s.name, role: s.role, team: s.team, teams: s.teams ?? [], games: s.games ?? [],
    image: s.image_url, description: s.description,
  }))

  players = rows.map(r => {
    const techs = [...r.card_techniques].sort((a, b) => a.slot - b.slot)
      .map(ct => techById.get(ct.technique_id)).filter((t): t is Technique => !!t)
    return {
      id: r.id,
      characterId: r.character_id,
      name: r.name,
      game: r.game,
      team: r.team ?? 'Unaffiliated',
      version: r.version,
      element: r.element ?? 'earth',
      position: r.position,
      stats: {
        shooting: r.shooting, control: r.control, physical: r.physical,
        speed: r.speed, defense: r.defense, goalkeeping: r.goalkeeping,
      },
      ovr: r.ovr,
      category: r.category,
      tier: r.tier,
      image: r.image_url,
      techniques: techs,
      hissatsu: techs.map(t => t.name),
      isVersion: r.is_version,
      zukanNo: r.zukan_no,
      no: r.no ?? r.zukan_no,
      specials: r.specials ?? [],
      extraTeams: r.extra_teams ?? [],
    }
  })
  byId = new Map(players.map(p => [p.id, p]))

  const groups = new Map<string, Player[]>()
  for (const p of players) {
    for (const team of [p.team, ...p.extraTeams]) {
      if (NON_TEAMS.has(team)) continue
      const key = `${p.game}:${team}`
      const list = groups.get(key)
      if (list) list.push(p)
      else groups.set(key, [p])
    }
  }
  // una carta por jugador y equipo: la versión de ese equipo (Sor del Chrono Storm, no su forma normal) o la de más nota
  for (const [key, list] of groups) {
    const team = key.slice(key.indexOf(':') + 1)
    const best = new Map<string, Player>()
    for (const p of list) {
      const cur = best.get(p.characterId)
      const score = (x: Player) => (x.version === team ? 1000 : 0) + x.ovr
      if (!cur || score(p) > score(cur)) best.set(p.characterId, p)
    }
    groups.set(key, [...best.values()])
  }
  poolRosters = new Map([...groups].filter(([, list]) => list.length >= MIN_POOL_SIZE))
  // Orden estable: las partidas con semilla deben sortear igual en todos los navegadores
  pools = [...poolRosters.keys()].sort().map(parseDraftPoolKey)
}

export function getTechnique(id: string): Technique | undefined {
  return techniquesById.get(id)
}

/** Nombre de la técnica en el idioma de la interfaz (inglés si no se conoce) */
export function techniqueName(t: Technique, locale: string): string {
  return localName(t.name, { es: t.nameEs, fr: t.nameFr, it: t.nameIt }, locale)
}

/** Nombre del equipo en el idioma de la interfaz (inglés si no se conoce) */
export function teamName(team: string, locale: string): string {
  return localName(team, teamNames.get(team), locale)
}

/** Espíritu guerrero / tótem en el idioma de la interfaz */
export function specialName(sp: Special, locale: string): string {
  return localName(sp.name ?? '—', { es: sp.name_es, fr: sp.name_fr, it: sp.name_it }, locale)
}

/** Hipertécnica del espíritu guerrero en el idioma de la interfaz */
export function hyperName(sp: Special, locale: string): string {
  return localName(sp.hyper ?? '', { es: sp.hyper_es, fr: sp.hyper_fr, it: sp.hyper_it }, locale)
}

/** "Equipo · Versión" de una carta, sin repetir ("Mixi Max (Shawn)", no "Mixi Max · Mixi Max (Shawn)") */
export function cardTeamLabel(p: Pick<Player, 'team' | 'version'>, locale: string): string {
  if (p.version === 'base' || p.version === p.team) return teamName(p.team, locale)
  if (p.version.startsWith(p.team)) return teamName(p.version, locale)
  return `${teamName(p.team, locale)} · ${teamName(p.version, locale)}`
}

/**
 * Traduce una etiqueta que contiene un equipo: "Dark Emperors", "Dark Emperors (Inazuma Eleven 2)"
 * o "🇯🇵 Dark Emperors (…)". Lo que no sea un equipo conocido se deja igual.
 */
export function teamLabel(label: string, locale: string): string {
  if (locale === 'en') return label
  const [, head, suffix = ''] = label.match(/^(.*?)( \([^()]*\))?$/u) ?? [label, label]
  if (teamNames.has(head)) return teamName(head, locale) + suffix
  const sp = head.indexOf(' ')                                   // prefijo antes del equipo: "XX Equipo"
  if (sp > 0 && teamNames.has(head.slice(sp + 1))) return head.slice(0, sp + 1) + teamName(head.slice(sp + 1), locale) + suffix
  return label
}

export interface CardDescription {
  en: string | null
  es: string | null
}

const descriptions = new Map<string, Promise<CardDescription>>()

/** Descripción de la carta (zukan en inglés + wiki en castellano), pedida la primera vez que se abre la ficha */
export function loadDescription(id: string): Promise<CardDescription> {
  let d = descriptions.get(id)
  if (!d) {
    d = get<{ description: string | null; description_es: string | null }[]>(
      `cards?select=description,description_es&id=eq.${encodeURIComponent(id)}`)
      .then(([r]) => ({ en: r?.description ?? null, es: r?.description_es ?? null }))
    d.catch(() => descriptions.delete(id))                       // un fallo de red no se queda guardado
    descriptions.set(id, d)
  }
  return d
}

export function getStaff(): Staff[] {
  return staff
}

export function getAllPlayers(): Player[] {
  return players
}

export function getPlayer(id: string): Player | undefined {
  return byId.get(id)
}

/** Todas las versiones de un personaje, de la más antigua a la más reciente */
export function getCharacterVersions(characterId: string): Player[] {
  return players
    .filter(p => p.characterId === characterId)
    .sort((a, b) => GAMES.indexOf(a.game) - GAMES.indexOf(b.game) || a.ovr - b.ovr)
}

// ---------------------------------------------------------------- pools de draft / torneo

export function draftPoolKey(pool: DraftPool): DraftPoolKey {
  return `${pool.game}:${pool.teamId}`
}

export function parseDraftPoolKey(key: string): DraftPool {
  const i = key.indexOf(':')
  const game = key.slice(0, i) as GameId
  const teamId = key.slice(i + 1)
  return { game, teamId, label: `${teamId} (${GAME_LABEL[game] ?? game})` }
}

export function displayPoolLabel(pool: DraftPool | string): string {
  return typeof pool === 'string' ? parseDraftPoolKey(pool).label : pool.label
}

export function getDraftPools(): DraftPool[] {
  return pools
}

export function getTeamRoster(pool: DraftPool): Player[] {
  return poolRosters.get(draftPoolKey(pool)) ?? []
}

export function isPlayerInPoolRoster(player: Player, pool: DraftPool): boolean {
  return getTeamRoster(pool).some(p => p.id === player.id)
}
