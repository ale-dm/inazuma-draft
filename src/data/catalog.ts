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
  zukan_no?: number | null
  description?: string | null
  description_es?: string | null
  no?: number | null
  specials?: Special[] | null
  extra_teams?: string[] | null
  card_techniques: { slot: number; technique_id: string }[]
}

interface TechniqueRow {
  id: string
  name: string
  name_es: string | null
  type: Technique['type']
  element: Element | null
  cost: number | null
  cost_game: string | null
  description?: string | null
  image_url?: string | null
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
}

let players: Player[] = []
let teamsEs = new Map<string, string>()
let staff: Staff[] = []
let techniquesById = new Map<string, Technique>()
let byId = new Map<string, Player>()
let pools: DraftPool[] = []
let poolRosters = new Map<string, Player[]>()

async function rest<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_KEY } })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json() as Promise<T>
}

// '*' y no una lista: así la app funciona también antes de que la base tenga columnas nuevas (zukan_no…)
const CARD_COLUMNS = '*,card_techniques(slot,technique_id)'

export async function loadCatalog(): Promise<void> {
  if (players.length) return
  const techniques = await rest<TechniqueRow[]>('techniques?select=*')
  const techById = new Map<string, Technique>(techniques.map(t => [t.id, {
    id: t.id, name: t.name, nameEs: t.name_es ?? null, type: t.type, element: t.element, cost: t.cost, costGame: t.cost_game,
    description: t.description ?? null, image: t.image_url ?? null,
  }]))

  techniquesById = techById
  // la tabla de equipos es opcional: sin ella se muestran los nombres en inglés
  const teams = await rest<TeamRow[]>('teams?select=*').catch(() => [] as TeamRow[])
  teamsEs = new Map(teams.filter(t => t.name_es).map(t => [t.name, t.name_es as string]))
  // cuerpo técnico: también opcional
  const staffRows = await rest<StaffRow[]>('staff?select=*&order=zukan_no').catch(() => [] as StaffRow[])
  staff = staffRows.map(s => ({
    zukanNo: s.zukan_no, name: s.name, role: s.role, team: s.team, teams: s.teams ?? [], games: s.games ?? [],
    image: s.image_url, description: s.description,
  }))
  const rows: CardRow[] = []
  for (let offset = 0; ; offset += PAGE) {
    const page = await rest<CardRow[]>(`cards?select=${CARD_COLUMNS}&order=id&limit=${PAGE}&offset=${offset}`)
    rows.push(...page)
    if (page.length < PAGE) break
  }

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
      zukanNo: r.zukan_no ?? null,
      description: r.description ?? null,
      descriptionEs: r.description_es ?? null,
      no: r.no ?? r.zukan_no ?? null,
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

/** Nombre de la técnica en el idioma de la interfaz (castellano si existe) */
export function techniqueName(t: Technique, locale: string): string {
  return locale === 'es' && t.nameEs ? t.nameEs : t.name
}

/** Nombre del equipo en el idioma de la interfaz (castellano si existe) */
export function teamName(team: string, locale: string): string {
  return (locale === 'es' && teamsEs.get(team)) || team
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
  if (locale !== 'es') return label
  const [, head, suffix = ''] = label.match(/^(.*?)( \([^()]*\))?$/u) ?? [label, label]
  if (teamsEs.has(head)) return teamsEs.get(head) + suffix
  const sp = head.indexOf(' ')                                   // prefijo de bandera: "🇯🇵 Equipo"
  if (sp > 0 && teamsEs.has(head.slice(sp + 1))) return head.slice(0, sp + 1) + teamsEs.get(head.slice(sp + 1)) + suffix
  return label
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
