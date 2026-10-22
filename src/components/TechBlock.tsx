import type { CSSProperties } from 'react'
import type { Technique } from '../types'
import { techniqueName } from '../data/catalog'
import { useAppSettings } from '../context/AppSettings'

/** Elemento de la app → número del juego (1 Aire, 2 Bosque, 3 Fuego, 4 Montaña, 5 Vacío) */
export const EL_NUM: Record<string, number> = { air: 1, wood: 2, fire: 3, earth: 4, void: 5 }
/** Tipo de técnica → icono de categoría (icon_sp_area01..04) */
const AREA: Record<Technique['type'], number> = { Shoot: 1, Dribble: 2, Block: 3, Catch: 4 }
/** Juegos con logo en /icons (game-*.png); Strikers no tiene y va en texto */
const LOGO = new Set(['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3', 'ARES', 'ORION', 'VR'])
const GAME_LABEL: Record<string, string> = { STRIKERS: 'Strikers' }

/** Bloque de técnica como en el juego: placa del elemento, icono de categoría, nombre, marcas y TP. */
export default function TechBlock({ tech }: { tech: Technique }) {
  const { t, locale } = useAppSettings()
  const el = tech.element ? EL_NUM[tech.element] : 0
  const plate = el ? `/icons/plate_fsp_${el}.png` : null
  const name = techniqueName(tech, locale)
  const tip = [
    name,
    t(`tech.${tech.type}`),
    tech.element ? t(`element.${tech.element}`) : null,
    tech.tp != null ? `TP ${tech.tp}` : null,
    tech.powerMin != null && tech.powerMax != null ? `${tech.powerMin}-${tech.powerMax}` : null,
    tech.debut ? t('tech.debut', { game: GAME_LABEL[tech.debut] ?? tech.debut }) : null,
    tech.users && tech.users > 1 ? t('tech.users', { n: tech.users }) : null,
  ].filter(Boolean).join(' · ')

  return (
    <div
      className={`tblock${plate ? ' plate' : ` tb-el${el || 5}`}`}
      style={plate ? ({ '--plate': `url('${plate}')` } as CSSProperties) : undefined}
      title={tip}
    >
      <img className="tb-cat" src={`/icons/icon_sp_area0${AREA[tech.type]}.png`} alt={t(`tech.${tech.type}`)} />
      <span className="tbn">{name}</span>
      {tech.traits?.includes('long') && <img className="tbf" src="/icons/icon_sp_sub01.png" alt="" title={t('tech.long')} />}
      {tech.traits?.includes('block') && <img className="tbf" src="/icons/icon_sp_sub02.png" alt="" title={t('tech.blockShot')} />}
      {tech.users != null && tech.users > 1 && <span className="tbu" title={t('tech.users', { n: tech.users })}>×{tech.users}</span>}
      {tech.debut && (LOGO.has(tech.debut)
        ? <img className="tbg" src={`/icons/game-${tech.debut.toLowerCase()}.png`} alt={tech.debut} title={t('tech.debut', { game: tech.debut })} />
        : <span className="tbg tbg--txt" title={t('tech.debut', { game: GAME_LABEL[tech.debut] ?? tech.debut })}>{(GAME_LABEL[tech.debut] ?? tech.debut).slice(0, 3)}</span>)}
      {tech.tp != null && <span className="tbtp"><small>TP</small>{tech.tp}</span>}
    </div>
  )
}
