import { useMemo } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { parseDraftPoolKey, teamLogo, teamName } from '../../data/catalog'
import { GAME_SHORT } from '../../data/games'
import { ACHIEVEMENTS } from '../../lib/achievements'
import { updateClub, useClub } from '../../lib/club'
import Screen from '../club/Screen'
import { Check, Shield } from 'lucide-react'

/**
 * Insignias (fase 5): el escudo de cada equipo cuya colección has completado (se puede poner como escudo del club, en
 * la barra de arriba) y los logros.
 */
export default function Badges() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const crests = useMemo(() => club.collections.map(parseDraftPoolKey), [club.collections])

  return (
    <Screen title={t('hub.badges')}>
      <h3 className="sheet-label">{t('badge.crests', { n: crests.length })}</h3>
      {crests.length === 0 && <p className="fd-hint">{t('badge.none')}</p>}
      <div className="badge-grid">
        {crests.map(pool => {
          const logo = teamLogo(pool.teamId)
          const on = club.crest === pool.teamId
          return (
            <button key={`${pool.game}:${pool.teamId}`} type="button" className={`badge ${on ? 'on' : ''}`}
              onClick={() => updateClub(s => ({ ...s, crest: on ? null : pool.teamId }))} title={t('badge.setCrest')}>
              {logo ? <img src={logo} alt="" /> : <Shield size={36} strokeWidth={1.4} />}
              <small>{teamName(pool.teamId, locale)}</small>
              <em>{GAME_SHORT[pool.game]}</em>
            </button>
          )
        })}
      </div>
      {crests.length > 0 && <p className="fd-hint">{t('badge.crestHint')}</p>}

      <h3 className="sheet-label">{t('badge.achievements')}</h3>
      <ul className="obj-list">
        {ACHIEVEMENTS.map(a => {
          const v = Math.min(a.goal, a.value(club))
          const done = v >= a.goal
          return (
            <li key={a.id} className={`obj ${done ? 'obj--done ach--done' : ''}`}>
              <span className="obj__text">
                <b>{t(a.key, { n: a.goal })}</b>
                <span className="obj__bar"><span style={{ width: `${(v / a.goal) * 100}%` }} /></span>
              </span>
              <span className="chip">{done ? <Check size={16} /> : `${v}/${a.goal}`}</span>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
