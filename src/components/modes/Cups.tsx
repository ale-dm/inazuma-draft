import { useState } from 'react'
import type { MatchResult } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel } from '../../data/catalog'
import { MAX_TEAM_CHEM, teamRating } from '../../lib/chemistry'
import { CUPS, ROUND_KEYS, boostCount, cupOpponents, type CupDef, type CupOpponent } from '../../lib/cups'
import { giveReward } from '../../lib/objectives'
import { getPack } from '../../lib/packs'
import { addCoins, addXp, today, track, updateClub, useClub } from '../../lib/club'
import { DRAFT_HASH } from '../../lib/route'
import { formatLeft, msToReset } from '../../lib/store-extra'
import { matchWinner, simulateMatch } from '../../engine/sim'
import { playSfx } from '../../lib/sfx'
import type { TranslationKey } from '../../i18n/translations'
import MatchView from '../MatchView'
import Coin from '../Coin'
import Screen from '../club/Screen'
import { RewardBadge } from './Fatal'
import { draftSquad, type PickedSquad } from './SquadPicker'
import { Clock, Package, Trophy, Zap } from 'lucide-react'

interface Run {
  cup: CupDef
  squad: PickedSquad
  /** Química con el boost de la copa si el once lo cumple */
  chem: number
  opponents: CupOpponent[]
  results: MatchResult[]
}

/** Texto del boost de una copa: "Cartas de IE: mín. 4" / "Juegos distintos: mín. 4" */
function boostText(t: (k: TranslationKey, v?: Record<string, string | number>) => string, c: CupDef): string {
  return c.boost.games
    ? t('cup.boostGames', { games: c.boost.games.join('/'), min: c.boost.min })
    : t('cup.boostDistinct', { min: c.boost.min })
}

/** Copas de draft: eliminatoria con tu último draft (por saga y la diaria) */
export default function Cups() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const [run, setRun] = useState<Run | null>(null)
  const squad = draftSquad(t('duel.you'))
  const dailyDone = club.dailyCup === today()

  function start(cup: CupDef) {
    if (!squad) return
    if (cup.daily) updateClub(s => ({ ...s, dailyCup: today() }))
    const boosted = boostCount(cup.boost, squad.xi) >= cup.boost.min
    setRun({
      cup, squad, chem: Math.min(MAX_TEAM_CHEM, squad.chem + (boosted ? cup.boost.chem : 0)),
      opponents: cupOpponents(cup, teamRating(squad.xi)), results: [],
    })
  }

  function playNext() {
    if (!run) return
    const i = run.results.length
    const opp = run.opponents[i]
    const res = simulateMatch(run.squad.xi, opp.xi, run.squad.name, opp.name, { decisive: true, chemistry1: run.chem })
    const won = matchWinner(res) === 0
    const results = [...run.results, res]
    if (res.score[0] > 0) playSfx('goal')
    if (won) addCoins(run.cup.perRound)
    const finished = !won || results.length === run.opponents.length
    if (finished) {
      track('cups')
      addXp(won ? 200 : 40 * results.length)
      if (won) {
        track('cupWins')
        giveReward(run.cup.prize)
        playSfx('qualify')
      }
    }
    setRun({ ...run, results })
  }

  if (!run) {
    return (
      <Screen title={t('hub.cups')}>
        {!squad && (
          <div className="fdr-nodraft">
            <p>{t('cup.noDraft')}</p>
            <a href={DRAFT_HASH} className="sheet-cta">{t('fdr.makeDraft')}</a>
          </div>
        )}
        <div className="cupx-list">
          {CUPS.map(c => {
            const have = squad ? boostCount(c.boost, squad.xi) : 0
            const on = have >= c.boost.min
            const locked = !squad || (c.daily && dailyDone)
            return (
              <button key={c.id} type="button" className={`cupx cupx--${c.id}`} disabled={locked} onClick={() => start(c)}>
                <span className="cupx__head">
                  <b>{t(c.nameKey)}</b>
                  <span className="cupx__timer"><Clock size={14} />{c.daily ? (dailyDone ? `${t('obj.comeBack')} · ` : '') + formatLeft(msToReset()) : t(c.rounds === 3 ? 'cup.teams8' : 'cup.teams4')}</span>
                </span>
                <span className="cupx__mid">
                  <Trophy className="cupx__trophy" strokeWidth={1.4} aria-hidden />
                  <span className="cupx__rounds">
                    <span className="cupx__dots">{ROUND_KEYS[c.rounds].map(k => <i key={k} />)}</span>
                    <small>{ROUND_KEYS[c.rounds].map(k => t(k)).join(' · ')}</small>
                  </span>
                  <span className="cupx__prize">
                    {c.prize.pack && <RewardBadge r={{ pack: c.prize.pack }} />}
                    <RewardBadge r={{ coins: c.prize.coins }} />
                  </span>
                </span>
                <span className="cupx__boost">
                  <b><Zap size={14} fill="currentColor" />BOOST</b>
                  <span>{boostText(t, c)} · +{c.boost.chem}</span>
                  {squad && <em className={on ? 'is-on' : ''}>{Math.min(have, c.boost.min)}/{c.boost.min}</em>}
                </span>
              </button>
            )
          })}
        </div>
        <p className="fd-hint">{t('cup.rules')}</p>
      </Screen>
    )
  }

  const i = run.results.length
  const last = run.results[i - 1]
  const lost = last && matchWinner(last) !== 0
  const champion = !lost && i === run.opponents.length
  const names = ROUND_KEYS[run.cup.rounds]

  return (
    <Screen title={t(run.cup.nameKey)}>
      <ol className="cup-path">
        {run.opponents.map((o, k) => {
          const r = run.results[k]
          const w = r ? matchWinner(r) === 0 : null
          return (
            <li key={o.name} className={`cup-path__step ${w === true ? 'is-win' : w === false ? 'is-out' : k === i ? 'is-next' : ''}`}>
              <small>{t(names[k])}</small>
              <span>{teamLabel(o.name, locale)} <em>{o.rating}</em></span>
              {r && <b>{r.score[0]}–{r.score[1]}{r.penalties ? ` (${r.penalties[0]}–${r.penalties[1]})` : ''}</b>}
            </li>
          )
        })}
      </ol>
      {run.chem > run.squad.chem && <p className="duel-boost"><Zap size={13} fill="currentColor" /> {t('cup.boostOn', { n: run.chem - run.squad.chem })}</p>}
      {last && <MatchView result={last} highlightTeam={run.squad.name} />}
      {champion ? (
        <div className="duel-end">
          <Trophy className="w-14 h-14 mx-auto text-[#ffd23d]" strokeWidth={1.5} aria-hidden />
          <h2 className="fd-title">{t('cup.champion')}</h2>
          <p className="reward-line">+<Coin className="w-5 h-5" /> {(run.cup.prize.coins ?? 0) + run.cup.perRound * i}{run.cup.prize.pack && <> · +<Package className="w-5 h-5" /> {t(getPack(run.cup.prize.pack).nameKey)}</>}</p>
          <button type="button" className="sheet-cta" onClick={() => setRun(null)}>{t('hub.cups')}</button>
        </div>
      ) : lost ? (
        <div className="duel-end">
          <h2 className="fd-title">{t('cup.out', { round: t(names[i - 1]) })}</h2>
          {i > 1 && <p className="reward-line">+<Coin className="w-5 h-5" /> {run.cup.perRound * (i - 1)}</p>}
          <button type="button" className="sheet-cta" onClick={() => setRun(null)}>{t('hub.cups')}</button>
        </div>
      ) : (
        <button type="button" className="sheet-cta" onClick={playNext}>
          {t('cup.play', { round: t(names[i]) })}
        </button>
      )}
    </Screen>
  )
}
