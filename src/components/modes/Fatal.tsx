import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import {
  CLUB_SERIES, DIVISION_REWARD, DIV_GOAL, SERIES_GOAL, SIM_SERIES, fatalProgress, seasonNumber, seriesDone, seriesPoints,
  type Series,
} from '../../lib/fatal-series'
import { getPack } from '../../lib/packs'
import { DUEL_HASH, FATAL_DRAFT_HASH } from '../../lib/route'
import { formatLeft } from '../../lib/store-extra'
import type { Reward } from '../../lib/objectives'
import Coin from '../Coin'
import Screen from '../club/Screen'
import MatchHistory from './MatchHistory'
import Challenges from './Challenges'
import { Check, Clock } from 'lucide-react'

/** Milisegundos hasta el lunes que viene (nueva temporada) */
export function msToSeason(now = new Date()): number {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 8 - day)
  return d.getTime() - now.getTime()
}

/** Premio en pequeño: sobre (color del sobre), ficha (moneda con la media) o monedas */
export function RewardBadge({ r }: { r: Reward }) {
  const { t } = useAppSettings()
  if (r.token) {
    const p = getPack(r.token)
    return <span className={`rw-token rw-token--${p.tone}`} title={t(p.nameKey)}>{p.ovrMin ?? (r.token.includes('silver') ? 'P' : 'B')}</span>
  }
  if (r.pack) {
    const p = getPack(r.pack)
    return <span className={`rw-pack pack--${p.tone}`} title={t(p.nameKey)}>×{p.cards}</span>
  }
  return <span className="rw-coins"><Coin /> {r.coins?.toLocaleString()}</span>
}

function SeriesRow({ list }: { list: Series[] }) {
  return (
    <div className="fatal-series">
      {list.map(s => {
        const done = seriesDone(s)
        const pts = seriesPoints(s)
        return (
          <a key={s.id} href={`${DUEL_HASH}/${s.mode === 'club' ? 'club' : 'sim'}/${s.id}`} className={`fatal-series__item ${done ? 'is-done' : ''}`}
            style={{ ['--pct' as string]: `${(pts / SERIES_GOAL) * 100}%` }}>
            <span className="fatal-series__ring"><RewardBadge r={s.reward} />{done && <Check className="fatal-series__check" size={18} />}</span>
            <b>{s.cap ?? 'X'}</b>
            <small>{pts}/{SERIES_GOAL}</small>
          </a>
        )
      })}
    </div>
  )
}

/**
 * Fatal (como en MADFUT): Mi club y Simulación por series (media máxima del once, premio al llegar a 9 puntos) y
 * Draft por divisiones. Todo se reinicia cada lunes (temporada). Ver lib/fatal-series.ts.
 */
export default function Fatal() {
  const { t } = useAppSettings()
  useClub()
  const f = fatalProgress()
  const season = seasonNumber()
  const left = formatLeft(msToSeason())
  const divName = f.division === 0 ? t('fatal.elite') : t('fatal.division', { n: f.division })

  return (
    <Screen title="FATAL">
      <p className="fd-hint">{t('fatal.intro')}</p>
      <section className="fatal-panel fatal-panel--club">
        <header>
          <b className="fatal-panel__title">{t('hub.duelClub')}</b>
          <span className="fatal-panel__season"><small>{t('fatal.season', { n: season })}</small><span><Clock size={14} /> {left}</span></span>
        </header>
        <SeriesRow list={CLUB_SERIES} />
      </section>
      <section className="fatal-panel fatal-panel--sim">
        <header>
          <b className="fatal-panel__title">{t('hub.duelSim')}</b>
          <span className="fatal-panel__season"><small>{t('fatal.season', { n: season })}</small><span><Clock size={14} /> {left}</span></span>
        </header>
        <SeriesRow list={SIM_SERIES} />
      </section>
      <section className="fatal-panel fatal-panel--draft">
        <header>
          <b className="fatal-panel__title">{t('hub.draft')}</b>
          <span className="fatal-panel__season"><small>{divName}</small><span>{f.division ? `${f.divPoints}/${DIV_GOAL}` : ''}</span></span>
        </header>
        <div className="fatal-divs">
          {[3, 2, 1].map(d => <i key={d} className={f.division < d ? 'done' : f.division === d ? 'now' : ''} />)}
        </div>
        <div className="fatal-draft">
          <span className="fatal-draft__rewards">
            <small>{f.division ? t('fatal.promoReward') : t('fatal.eliteReward')}</small>
            <RewardBadge r={DIVISION_REWARD[f.division]} />
          </span>
          <a href={FATAL_DRAFT_HASH} className="sheet-cta fatal-draft__play">{t('modes.play')}</a>
        </div>
      </section>
      <Challenges />
      <MatchHistory />
    </Screen>
  )
}
