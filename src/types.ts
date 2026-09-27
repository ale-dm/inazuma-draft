export type Element = 'fire' | 'wood' | 'air' | 'earth'
export type Position = 'GK' | 'DF' | 'MF' | 'FW'

export type GameId = 'IE1' | 'IE2' | 'IE3' | 'GO1' | 'GO2' | 'GO3'

export interface DraftPool {
  game: GameId
  teamId: string
  label: string
}

export type DraftPoolKey = `${GameId}:${string}`

/** Stats de la carta (escala 25–99, base de datos Supabase) */
export interface PlayerStats {
  shooting: number
  control: number
  physical: number
  speed: number
  defense: number
  goalkeeping: number
}

export type Category = 'Legendary Player' | 'Top Player' | 'Advanced Player' | 'Growing Player' | 'Common Player'

export interface Technique {
  id: string
  name: string
  /** Nombre en castellano (inazuma.fandom.com/es), si se conoce */
  nameEs: string | null
  type: 'Shoot' | 'Dribble' | 'Block' | 'Catch'
  element: Element | null
  /** Coste mostrado (Galaxy si existe) */
  cost: number | null
  costGame: string | null
}

export interface Player {
  id: string
  characterId: string
  name: string
  game: GameId
  team: string
  /** 'base' o versión (Dark Emperors, Chrono Storm, Adult…) */
  version: string
  element: Element
  position: Position
  stats: PlayerStats
  ovr: number
  category: Category
  tier: 'S' | 'A' | 'B' | 'C'
  image: string | null
  techniques: Technique[]
  /** Nombres de las técnicas (compatibilidad con el motor) */
  hissatsu: string[]
  isVersion: boolean
  /** Nº oficial de la ficha en zukan.inazuma.jp (null en versiones que solo están en la wiki) */
  zukanNo: number | null
  /** Descripción oficial de zukan (inglés) */
  description: string | null
}

export type StaffRole = 'Manager' | 'Coach' | 'Coordinator'

/** Cuerpo técnico de zukan (entrenadores y gerentes), de momento sin stats */
export interface Staff {
  zukanNo: number
  name: string
  role: StaffRole
  team: string | null
  teams: string[]
  games: GameId[]
  image: string | null
  description: string | null
}

export interface MatchEvent {
  minute: number
  type: 'goal' | 'save' | 'hissatsu' | 'penalty'
  team: 0 | 1
  player: string
  move?: string
  /** Id de la técnica (para mostrarla en el idioma elegido) */
  moveId?: string
}

export interface MatchResult {
  team1Name: string
  team2Name: string
  score: [number, number]
  events: MatchEvent[]
  /** Tirs au but si match nul en temps réglementaire (match à élimination) */
  penalties?: [number, number]
  decidedByPenalties?: boolean
}

export interface GroupStanding {
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  points: number
}

export interface FFITeam {
  name: string
  country: string
  flag: string
  block: 'A' | 'B'
  players: Player[]
}

export type GamePhase = 'landing' | 'draft' | 'lineup' | 'tournament' | 'result'
