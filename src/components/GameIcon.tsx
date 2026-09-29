import type { Element, GameId, Position, Technique } from '../types'

/**
 * Iconos de Inazuma Eleven: Victory Road (public/icons/, sacados de las wikis española e inglesa de Fandom).
 * Puestos, afinidades, tipos de supertécnica y poderes especiales. Ver docs/app-log.md.
 */
const BASE = `${import.meta.env.BASE_URL}icons/`

const POSITION: Record<Position, string> = { GK: 'pos-gk', DF: 'pos-df', MF: 'pos-mf', FW: 'pos-fw' }
const ELEMENT: Record<Element, string> = { fire: 'el-fire', air: 'el-air', wood: 'el-wood', earth: 'el-earth' }
const TECH: Record<Technique['type'], string> = { Shoot: 'tech-shoot', Dribble: 'tech-dribble', Block: 'tech-block', Catch: 'tech-catch' }
const SPECIAL = { keshin: 'sp-keshin', mixi: 'sp-mixi', soul: 'sp-soul' } as const
/** Pestañas "onglet_seriesNN" de los assets del juego (mismo orden que GAMES) */
const SERIES: Record<GameId, string> = {
  IE1: 'game-ie1', IE2: 'game-ie2', IE3: 'game-ie3',
  GO1: 'game-go1', GO2: 'game-go2', GO3: 'game-go3',
  ARES: 'game-ares', ORION: 'game-orion', VR: 'game-vr',
}

interface Props {
  className?: string
  title?: string
}

function Icon({ file, alt, className = '', title }: { file: string; alt: string } & Props) {
  return <img src={`${BASE}${file}.png`} alt={alt} title={title ?? alt} className={`game-icon ${className}`} draggable={false} />
}

export function PositionIcon({ position, ...p }: { position: Position } & Props) {
  return <Icon file={POSITION[position]} alt={position} {...p} />
}

export function ElementIcon({ element, ...p }: { element: Element } & Props) {
  return <Icon file={ELEMENT[element]} alt={element} {...p} />
}

/** Tipo de supertécnica; los tiros largos y los bloqueos de tiros llevan su propio icono (rasgos de la técnica) */
export function TechniqueIcon({ type, traits, ...p }: { type: Technique['type']; traits?: string[] } & Props) {
  const file = type === 'Shoot' && traits?.includes('long') ? 'tech-longshot'
    : type === 'Block' && traits?.includes('block') ? 'tech-shotblock' : TECH[type]
  return <Icon file={file} alt={type} {...p} />
}

export function SpecialIcon({ type, ...p }: { type: keyof typeof SPECIAL } & Props) {
  return <Icon file={SPECIAL[type]} alt={type} {...p} />
}

export function SeriesIcon({ game, ...p }: { game: GameId } & Props) {
  return <Icon file={SERIES[game]} alt={game} {...p} />
}
