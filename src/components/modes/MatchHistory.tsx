import { useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { useClub, type MatchRecord } from '../../lib/club'
import { historyStats } from '../../lib/history'
import type { TranslationKey } from '../../i18n/translations'

type Filter = 'all' | 'club' | 'sim' | 'draft'
const FILTERS: [Filter, TranslationKey][] = [['all', 'hist.all'], ['club', 'hub.duelClub'], ['sim', 'hub.duelSim'], ['draft', 'hub.draft']]
/** Qué modo entra en cada filtro (la simulación con draft cuenta como Sim) */
const IN: Record<Filter, (m: MatchRecord) => boolean> = {
  all: () => true,
  club: m => m.mode === 'club',
  sim: m => m.mode === 'sim' || m.mode === 'draftsim',
  draft: m => m.mode === 'draft',
}
const MODE_KEY: Record<MatchRecord['mode'], TranslationKey> = { club: 'hub.duelClub', sim: 'hub.duelSim', draft: 'hub.draft', draftsim: 'hub.duelSim' }
const resKey = (r: 0 | 1 | -1): TranslationKey => (r === 0 ? 'duel.win' : r === 1 ? 'duel.loss' : 'duel.draw')

/** Historial de Fatal (en este dispositivo): números, racha, forma y los últimos partidos */
export default function MatchHistory() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const [filter, setFilter] = useState<Filter>('all')
  const all = club.history ?? []
  const list = all.filter(IN[filter])
  const st = historyStats(list)
  const form = list.slice(0, 5)

  return (
    <section className="fatal-panel hist">
      <header>
        <b className="fatal-panel__title">{t('hist.title')}</b>
        <span className="fatal-panel__season"><small>{t('hist.played', { n: st.played })}</small></span>
      </header>
      <div className="hist__filters">
        {FILTERS.map(([k, label]) => (
          <button key={k} type="button" className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{t(label)}</button>
        ))}
      </div>
      {!list.length ? <p className="fd-hint">{t('hist.empty')}</p> : (
        <>
          <div className="hist__stats">
            <span><b>{st.won}</b><small>{t('duel.win')}</small></span>
            <span><b>{st.drawn}</b><small>{t('duel.draw')}</small></span>
            <span><b>{st.lost}</b><small>{t('duel.loss')}</small></span>
            <span><b>{st.gf}–{st.ga}</b><small>{t('hist.goals')}</small></span>
            <span><b>{st.streak}</b><small>{t('hist.streak')}</small></span>
            <span><b>{st.bestStreak}</b><small>{t('hist.bestStreak')}</small></span>
          </div>
          <div className="hist__form" aria-label={t('hist.form')}>
            {form.map((m, i) => <i key={i} className={m.res === 0 ? 'w' : m.res === 1 ? 'l' : 'd'} />)}
          </div>
          <ol className="hist__list">
            {list.slice(0, 8).map(m => (
              <li key={m.at} className={m.res === 0 ? 'w' : m.res === 1 ? 'l' : 'd'}>
                <span className="hist__mode">{t(MODE_KEY[m.mode])}</span>
                <span className="hist__rival">{t('hist.vs', { name: m.rival })}</span>
                <b className="hist__score">{m.gf}–{m.ga}</b>
                <small>{t(resKey(m.res))} · {new Date(m.at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</small>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
