import type { Player } from '../types'
import { useAppSettings } from '../context/AppSettings'
import { ALL_STAT_KEYS } from '../lib/power'
import { DUEL40_KEYS, STAT40_ICONS, STAT40_KEYS, duels40, rankClass, statRank } from '../lib/stats40'
import TechBlock from './TechBlock'

/** Estadísticas y supertécnicas de una carta (con el icono de tipo de Victory Road): ficha del jugador y Mis cartas */
export default function CardInfo({ player }: { player: Player }) {
  const { t } = useAppSettings()
  const s40 = player.stats40?.length === 7 ? player.stats40 : null
  const duelValues = s40 ? duels40(s40) : null
  return (
    <>
      <section className="card-info">
        <h3 className="sheet-label">
          {t('players.stats')}
          {s40 && <small className="stats40-level">{t('players.level40')}</small>}
        </h3>
        {s40 ? (
          <>
            <div className="card-info__stats stats40">
              {STAT40_KEYS.map((k, i) => {
                const rank = statRank(player, i)
                return (
                  <div key={k} className="card-info__stat">
                    <span className="stats40-label">
                      <img src={STAT40_ICONS[i]} alt="" className="stats40-icon" />
                      {t(`stats.${k}`)}
                    </span>
                    <b>{s40[i]}</b>
                    {rank && <em className={`stats40-rank ${rankClass(rank)}`}>{rank}</em>}
                    <i><span style={{ width: `${Math.min(100, Math.max(4, (s40[i] / 160) * 100))}%` }} /></i>
                  </div>
                )
              })}
            </div>
            {player.freedom != null && (
              <p className="stats40-meta">{t('players.freedom')}: <b>{player.freedom}</b></p>
            )}
            <div className="stats40-duels">
              <span className="sheet-label">{t('players.duels')}</span>
              <div className="stats40-duels__grid">
                {DUEL40_KEYS.map(k => (
                  <div key={k}><span>{t(`duels.${k}`)}</span><b>{Math.round(duelValues![k])}</b></div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="card-info__stats">
            {ALL_STAT_KEYS.map(k => (
              <div key={k} className="card-info__stat">
                <span>{t(`stats.${k}`)}</span>
                <b>{player.stats[k]}</b>
                <i><span style={{ width: `${player.stats[k]}%` }} /></i>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="card-info">
        <h3 className="sheet-label">{t('players.techniques')}</h3>
        {player.techniques.length === 0
          ? <p className="fd-hint">{t('players.noTechniques')}</p>
          : (
            <ul className="card-info__techs">
              {player.techniques.map(tech => (
                <li key={tech.id}>
                  <TechBlock tech={tech} />
                </li>
              ))}
            </ul>
          )}
      </section>
    </>
  )
}
