import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import {
  DAILY, DAILY_OBJECTIVES, claimDaily, claimObjective, dailyAvailable, dailyDay, objectiveClaimed, objectiveProgress,
  type Reward,
} from '../../lib/objectives'
import { getPack } from '../../lib/packs'
import type { TranslationKey } from '../../i18n/translations'
import Screen from './Screen'
import Coin from '../Coin'
import { Check, Package } from 'lucide-react'

/** Premio diario con racha de 7 días y objetivos del día */
export default function Objectives() {
  const { t } = useAppSettings()
  useClub()                                            // se vuelve a pintar al cobrar
  const day = dailyDay()
  const rewardText = (r: Reward) => (
    <span className="reward-inline">
      {r.coins ? <><Coin /> {r.coins.toLocaleString()}</> : null}
      {r.coins && r.pack ? ' + ' : null}
      {r.pack ? <><Package size={14} /> {t(getPack(r.pack).nameKey)}</> : null}
    </span>
  )

  return (
    <Screen title={t('hub.objectives')}>
      <h3 className="sheet-label">{t('obj.daily')}</h3>
      <div className="streak">
        {DAILY.map((r, i) => (
          <span key={i} className={`streak__day ${i + 1 < day || (i + 1 === day && !dailyAvailable()) ? 'done' : ''} ${i + 1 === day ? 'today' : ''}`}>
            <small>{t('obj.day', { n: i + 1 })}</small>
            <b>{r.pack ? <Package size={18} /> : r.coins}</b>
          </span>
        ))}
      </div>
      <button type="button" className="sheet-cta" disabled={!dailyAvailable()} onClick={() => claimDaily()}>
        {dailyAvailable() ? <>{t('obj.claim')} · {rewardText(DAILY[day - 1])}</> : t('obj.comeBack')}
      </button>

      <h3 className="sheet-label">{t('obj.today')}</h3>
      <ul className="obj-list">
        {DAILY_OBJECTIVES.map(o => {
          const got = Math.min(objectiveProgress(o), o.goal)
          const claimed = objectiveClaimed(o)
          return (
            <li key={o.id} className={`obj ${claimed ? 'obj--done' : ''}`}>
              <span className="obj__text">
                <b>{t(`obj.${o.id}` as TranslationKey, { n: o.goal })}</b>
                <small>{rewardText(o.reward)}</small>
                <span className="obj__bar"><span style={{ width: `${(got / o.goal) * 100}%` }} /></span>
              </span>
              <button type="button" className="chip on" disabled={claimed || got < o.goal} onClick={() => claimObjective(o)}>
                {claimed ? <Check size={16} /> : `${got}/${o.goal}`}
              </button>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
