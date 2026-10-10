import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import { claimWeekly, weeklyClaimed, weeklyProgress } from '../../lib/objectives'
import { weekChallenges } from '../../lib/challenges'
import { RewardBadge } from './Fatal'

/** Los 3 retos de la semana de Fatal, con su progreso y el botón de cobrar */
export default function Challenges() {
  const { t } = useAppSettings()
  useClub()
  return (
    <section className="fatal-panel chal">
      <header>
        <b className="fatal-panel__title">{t('ch.title')}</b>
      </header>
      <ul className="chal__list">
        {weekChallenges().map(c => {
          const have = weeklyProgress(c)
          const done = weeklyClaimed(c)
          const ready = have >= c.goal && !done
          return (
            <li key={c.id} className={done ? 'is-done' : ''}>
              <div className="chal__text">
                <span>{t(c.text, { n: c.goal })}</span>
                <small>{Math.min(have, c.goal)}/{c.goal}</small>
              </div>
              <div className="chal__bar"><i style={{ width: `${Math.min(100, (have / c.goal) * 100)}%` }} /></div>
              <div className="chal__foot">
                <RewardBadge r={c.reward} />
                {done ? <span className="chal__ok">{t('ch.done')}</span>
                  : <button type="button" className="chip" disabled={!ready} onClick={() => claimWeekly(c)}>{t('ch.claim')}</button>}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
