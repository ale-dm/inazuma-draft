import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import { DIVISION_REWARD, DIV_GOAL, fatalProgress, seasonNumber } from '../../lib/fatal-series'
import { weeklyBoost } from '../../lib/fatal'
import { loadLastDraft } from '../../lib/last-draft'
import { formatLeft } from '../../lib/store-extra'
import { DRAFT_HASH, DUEL_HASH } from '../../lib/route'
import type { TranslationKey } from '../../i18n/translations'
import { MAX_TEAM_CHEM } from '../../lib/chemistry'
import Screen from '../club/Screen'
import { ElementIcon } from '../GameIcon'
import { RewardBadge, msToSeason } from './Fatal'
import { Check, Clock } from 'lucide-react'

/**
 * Fatal Draft (como en MADFUT): división y puntos de la temporada, el boost de la semana, la escalera de divisiones
 * con su premio y, abajo, los dos modos: Fatal Classic (los duelos de cartas con tu último draft) y Fatal Sim (la
 * simulación del partido, todavía sin hacer).
 */
export default function FatalDraft() {
  const { t } = useAppSettings()
  useClub()
  const f = fatalProgress()
  const boost = weeklyBoost()
  const last = loadLastDraft()
  const left = formatLeft(msToSeason())
  const pts = f.division ? f.divPoints : DIV_GOAL

  return (
    <Screen title="FATAL DRAFT">
      <header className="fdr-head">
        <span>
          <h2 className="fdr-div">{f.division === 0 ? t('fatal.elite') : t('fatal.division', { n: f.division })}</h2>
          <small>{t('fatal.season', { n: seasonNumber() })}</small>
        </span>
        <span className="fdr-timer"><Clock size={16} /><small>{t('fdr.newSeason')}</small><b>{left}</b></span>
      </header>
      <div className="fdr-progress" aria-label={`${pts}/${DIV_GOAL}`}>
        <span className="fdr-progress__fill" style={{ width: `${(pts / DIV_GOAL) * 100}%` }} />
        <b>{pts}<small> {t('free.pts')}</small></b>
        <em>{DIV_GOAL}</em>
      </div>

      <section className="fdr-boost">
        <h3>FATAL BOOST</h3>
        <p>
          <span className="fdr-boost__icon">
            {boost.kind === 'element' ? <ElementIcon element={boost.value as never} /> : <b>{boost.value}</b>}
          </span>
          {t('duel.boost', { n: boost.amount, what: boost.kind === 'game' ? boost.value : t(`element.${boost.value}` as TranslationKey) })}
        </p>
      </section>

      <ol className="fdr-ladder">
        {[3, 2, 1, 0].map(d => {
          const state = f.division === d ? 'now' : f.division < d ? 'done' : 'todo'
          return (
            <li key={d} className={`fdr-div-row is-${state}`}>
              <span className="fdr-shield">{d === 0 ? '★' : d}</span>
              <span className="fdr-div-row__pts">
                {d === 0 ? t('fatal.eliteReward') : <>{state === 'now' ? `${f.divPoints}/` : ''}{DIV_GOAL} <small>{t('free.pts')}</small></>}
              </span>
              <span className="fdr-div-row__reward"><RewardBadge r={DIVISION_REWARD[d]} /></span>
              {state === 'done' && <Check className="fdr-div-row__check" size={18} />}
            </li>
          )
        })}
      </ol>

      {last ? (
        <p className="fd-hint">{t('fdr.yourDraft', { r: last.rating, c: last.chem, m: MAX_TEAM_CHEM })} · <a href={DRAFT_HASH} className="underline">{t('hub.newDraft')}</a></p>
      ) : (
        <div className="fdr-nodraft">
          <p>{t('fdr.noDraft')}</p>
          <a href={DRAFT_HASH} className="sheet-cta">{t('fdr.makeDraft')}</a>
        </div>
      )}

      <div className="fdr-modes">
        <button type="button" className="fdr-mode fdr-mode--sim" disabled><span>FATAL</span><small>SIM</small><em>{t('hub.soon')}</em></button>
        {last
          ? <a href={`${DUEL_HASH}/draft`} className="fdr-mode fdr-mode--classic"><span>FATAL</span><small>CLASSIC</small></a>
          : <button type="button" className="fdr-mode fdr-mode--classic" disabled><span>FATAL</span><small>CLASSIC</small></button>}
      </div>
    </Screen>
  )
}
