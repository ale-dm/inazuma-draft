import { useAppSettings } from '../../context/AppSettings'
import { getPlayer, techniqueName, getAllTechniques } from '../../data/catalog'
import { useClub } from '../../lib/club'
import { BOOST_AMOUNT, EXPEDITION_STEPS, endExpedition, rivalRating, startExpedition, chooseExpeditionReward, type Reward } from '../../lib/expedition'
import { loadLastDraft } from '../../lib/last-draft'
import { DRAFT_HASH, DUEL_HASH } from '../../lib/route'
import type { TranslationKey } from '../../i18n/translations'
import Screen from '../club/Screen'
import { Heart } from 'lucide-react'
import Coin from '../Coin'

/** Expedición (docs/plan-modos.md §2): ocho rivales de media 68 → 80; tras cada victoria, elige una de tres recompensas */
export default function Expedition() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const { run, best } = club.expedition

  const rewardText = (r: Reward): string => {
    if (r.kind === 'player') {
      const p = getPlayer(r.playerId)
      return t('exp.reward.player', { name: p?.nickname ?? p?.name ?? '?', ovr: p?.ovr ?? 0, slot: r.slot })
    }
    if (r.kind === 'boost') {
      const p = getPlayer(r.playerId)
      return t('exp.reward.boost', { name: p?.nickname ?? p?.name ?? '?', stat: t(`hl.stat.${r.stat}` as TranslationKey), n: BOOST_AMOUNT })
    }
    if (r.kind === 'chem') return t('exp.reward.chem')
    const p = getPlayer(r.playerId)
    const tech = getAllTechniques().find(x => x.id === r.techId)
    return t('exp.reward.tech', { name: p?.nickname ?? p?.name ?? '?', tech: tech ? techniqueName(tech, locale) : '?' })
  }

  if (!run) {
    const hasDraft = !!loadLastDraft()
    return (
      <Screen title={t('exp.title')}>
        <p className="fd-hint">{t('exp.intro')}</p>
        <p className="exp-best">{t('exp.best', { n: best })}</p>
        {hasDraft
          ? <button type="button" className="sheet-cta" onClick={() => startExpedition()}>{t('exp.start')}</button>
          : <><p className="fd-hint">{t('exp.noDraft')}</p><a href={DRAFT_HASH} className="sheet-cta">{t('fdr.makeDraft')}</a></>}
      </Screen>
    )
  }

  if (run.over) {
    const won = run.wins === EXPEDITION_STEPS
    return (
      <Screen title={t('exp.title')}>
        <h2 className="fd-title">{won ? t('exp.won') : t('exp.lost')}</h2>
        <p className="exp-summary">{t('exp.summary', { wins: run.wins, n: EXPEDITION_STEPS, coins: run.coins })}</p>
        {won && <p className="exp-prize">{t('exp.prize')}</p>}
        <div className="exp-map">{renderSteps(run, t)}</div>
        <button type="button" className="sheet-cta" onClick={() => endExpedition()}>{t('exp.close')}</button>
      </Screen>
    )
  }

  return (
    <Screen title={t('exp.title')}>
      <div className="exp-bar">
        <span className="exp-lives">{Array.from({ length: 3 }, (_, i) => <Heart key={i} size={18} className={i < run.lives ? 'on' : ''} />)}</span>
        <span><Coin /> {run.coins}</span>
        <span>{t('exp.wins', { n: run.wins, total: EXPEDITION_STEPS })}</span>
      </div>

      {run.offer ? (
        <section className="exp-offer">
          <p className="fd-hint">{t('exp.chooseReward')}</p>
          {run.offer.map((r, i) => (
            <button key={i} type="button" className="exp-reward" onClick={() => chooseExpeditionReward(i)}>{rewardText(r)}</button>
          ))}
        </section>
      ) : (
        <>
          <div className="exp-map">{renderSteps(run, t)}</div>
          <a href={`${DUEL_HASH}/expedition`} className="sheet-cta">{t('exp.play', { n: run.step + 1 })}</a>
          <button type="button" className="chip exp-quit" onClick={() => endExpedition()}>{t('exp.abandon')}</button>
        </>
      )}
    </Screen>
  )
}

/** Los ocho nodos: los jugados (con su resultado), el que toca y los que quedan */
function renderSteps(run: { step: number; results: (0 | 1 | -1)[] }, t: (k: TranslationKey, p?: Record<string, string | number>) => string) {
  return Array.from({ length: EXPEDITION_STEPS }, (_, i) => {
    const res = run.results[i]
    const state = res === undefined ? (i === run.step ? 'current' : 'future') : res === 0 ? 'win' : res === -1 ? 'draw' : 'loss'
    return (
      <div key={i} className={`exp-node exp-node--${state}`}>
        <b>{i + 1}</b>
        <span>{t('exp.rival', { ovr: Math.round(rivalRating(i)) })}</span>
        <small>{state === 'win' ? t('exp.res.win') : state === 'draw' ? t('exp.res.draw') : state === 'loss' ? t('exp.res.loss') : state === 'current' ? t('exp.res.next') : ''}</small>
      </div>
    )
  })
}
