import type { Player } from '../types'
import { useAppSettings } from '../context/AppSettings'
import { techniqueName } from '../data/catalog'
import { ALL_STAT_KEYS } from '../lib/power'
import { TechniqueIcon } from './GameIcon'

/** Estadísticas y supertécnicas de una carta (con el icono de tipo de Victory Road): ficha del jugador y Mis cartas */
export default function CardInfo({ player }: { player: Player }) {
  const { t, locale } = useAppSettings()
  return (
    <>
      <section className="card-info">
        <h3 className="sheet-label">{t('players.stats')}</h3>
        <div className="card-info__stats">
          {ALL_STAT_KEYS.map(k => (
            <div key={k} className="card-info__stat">
              <span>{t(`stats.${k}`)}</span>
              <b>{player.stats[k]}</b>
              <i><span style={{ width: `${player.stats[k]}%` }} /></i>
            </div>
          ))}
        </div>
      </section>
      <section className="card-info">
        <h3 className="sheet-label">{t('players.techniques')}</h3>
        {player.techniques.length === 0
          ? <p className="fd-hint">{t('players.noTechniques')}</p>
          : (
            <ul className="card-info__techs">
              {player.techniques.map(tech => (
                <li key={tech.id} title={tech.description ?? undefined}>
                  <TechniqueIcon type={tech.type} traits={tech.traits} title={t(`tech.${tech.type}`)} className="card-info__tech-icon" />
                  <b title={tech.name}>{techniqueName(tech, locale)}</b>
                  {tech.cost != null && <small title={tech.costGame ?? undefined}>TP {tech.cost}</small>}
                </li>
              ))}
            </ul>
          )}
      </section>
    </>
  )
}
