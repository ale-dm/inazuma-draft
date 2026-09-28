import type { ReactNode } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import {
  CAREER_OBJECTIVES, DAILY, DAILY_OBJECTIVES, WEEKLY_OBJECTIVES, careerClaimed, careerProgress, claimCareer, claimDaily,
  claimObjective, claimWeekly, dailyAvailable, dailyDay, objectiveClaimed, objectiveProgress, weeklyClaimed, weeklyProgress,
  type Objective, type Reward,
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
      <ObjList list={DAILY_OBJECTIVES} text={o => t(`obj.${o.id}` as TranslationKey, { n: o.goal })}
        progress={objectiveProgress} claimed={objectiveClaimed} claim={claimObjective} rewardText={rewardText} />

      <h3 className="sheet-label">{t('obj.weekly')}</h3>
      <ObjList list={WEEKLY_OBJECTIVES} text={o => t(`obj.ev.${o.event}` as TranslationKey, { n: o.goal })}
        progress={weeklyProgress} claimed={weeklyClaimed} claim={claimWeekly} rewardText={rewardText} />

      <h3 className="sheet-label">{t('obj.career')}</h3>
      <ObjList list={CAREER_OBJECTIVES} text={o => t(`obj.ev.${o.event}` as TranslationKey, { n: o.goal })}
        progress={careerProgress} claimed={careerClaimed} claim={claimCareer} rewardText={rewardText} />
    </Screen>
  )
}

function ObjList({ list, text, progress, claimed, claim, rewardText }: {
  list: Objective[]
  text: (o: Objective) => string
  progress: (o: Objective) => number
  claimed: (o: Objective) => boolean
  claim: (o: Objective) => boolean
  rewardText: (r: Reward) => ReactNode
}) {
  return (
    <ul className="obj-list">
      {list.map(o => {
        const got = Math.min(progress(o), o.goal)
        const done = claimed(o)
        return (
          <li key={o.id} className={`obj ${done ? 'obj--done' : ''}`}>
            <span className="obj__text">
              <b>{text(o)}</b>
              <small>{rewardText(o.reward)}</small>
              <span className="obj__bar"><span style={{ width: `${(got / o.goal) * 100}%` }} /></span>
            </span>
            <button type="button" className="chip on" disabled={done || got < o.goal} onClick={() => claim(o)}>
              {done ? <Check size={16} /> : `${got}/${o.goal}`}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
