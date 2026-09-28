import { useState } from 'react'
import type { MatchResult } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import { CUPS, ROUND_KEYS, cupOpponents, type CupDef, type CupOpponent } from '../../lib/cups'
import { giveReward } from '../../lib/objectives'
import { getPack } from '../../lib/packs'
import { addCoins, addXp, today, track, updateClub, useClub } from '../../lib/club'
import { matchWinner, simulateMatch } from '../../engine/sim'
import { playSfx } from '../../lib/sfx'
import MatchView from '../MatchView'
import Coin from '../Coin'
import Screen from '../club/Screen'
import SquadPicker, { type PickedSquad } from './SquadPicker'
import { Package, Trophy } from 'lucide-react'

interface Run {
  cup: CupDef
  squad: PickedSquad
  opponents: CupOpponent[]
  results: MatchResult[]
}

/** Copas por saga y copa diaria (fase 4): eliminatoria con una de Mis plantillas */
export default function Cups() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const [cup, setCup] = useState<CupDef | null>(null)
  const [run, setRun] = useState<Run | null>(null)
  const dailyDone = club.dailyCup === today()

  function start(squad: PickedSquad) {
    if (!cup) return
    if (cup.daily) updateClub(s => ({ ...s, dailyCup: today() }))
    setRun({ cup, squad, opponents: cupOpponents(cup, teamRating(squad.xi)), results: [] })
  }

  function playNext() {
    if (!run) return
    const i = run.results.length
    const opp = run.opponents[i]
    const res = simulateMatch(run.squad.xi, opp.xi, run.squad.name, opp.name, { decisive: true, chemistry1: run.squad.chem })
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

  if (!cup) {
    return (
      <Screen title={t('hub.cups')}>
        <p className="fd-hint">{t('cup.rules')}</p>
        <div className="cup-grid">
          {CUPS.map(c => (
            <button key={c.id} type="button" className={`cup cup--${c.id}`} disabled={c.daily && dailyDone} onClick={() => setCup(c)}>
              <Trophy className="cup__icon" strokeWidth={1.5} aria-hidden />
              <b>{t(c.nameKey)}</b>
              <small>{c.rounds === 3 ? t('cup.teams8') : t('cup.teams4')}</small>
              <small className="cup__prize">
                <Coin /> {c.prize.coins} {c.prize.pack && <>+ <Package size={12} /> {t(getPack(c.prize.pack).nameKey)}</>}
              </small>
              {c.daily && dailyDone && <span className="tile__soon">{t('obj.comeBack')}</span>}
            </button>
          ))}
        </div>
      </Screen>
    )
  }

  if (!run) {
    return (
      <Screen title={t(cup.nameKey)}>
        <button type="button" className="chip self-start" onClick={() => setCup(null)}>← {t('hub.cups')}</button>
        <SquadPicker onPick={start} />
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
      {last && <MatchView result={last} highlightTeam={run.squad.name} />}
      {champion ? (
        <div className="duel-end">
          <Trophy className="w-14 h-14 mx-auto text-[#ffd23d]" strokeWidth={1.5} aria-hidden />
          <h2 className="fd-title">{t('cup.champion')}</h2>
          <p className="reward-line">+<Coin className="w-5 h-5" /> {(run.cup.prize.coins ?? 0) + run.cup.perRound * i}{run.cup.prize.pack && <> · +<Package className="w-5 h-5" /> {t(getPack(run.cup.prize.pack).nameKey)}</>}</p>
          <button type="button" className="sheet-cta" onClick={() => { setRun(null); setCup(null) }}>{t('hub.cups')}</button>
        </div>
      ) : lost ? (
        <div className="duel-end">
          <h2 className="fd-title">{t('cup.out', { round: t(names[i - 1]) })}</h2>
          {i > 1 && <p className="reward-line">+<Coin className="w-5 h-5" /> {run.cup.perRound * (i - 1)}</p>}
          <button type="button" className="sheet-cta" onClick={() => { setRun(null); setCup(null) }}>{t('hub.cups')}</button>
        </div>
      ) : (
        <button type="button" className="sheet-cta" onClick={playNext}>
          {t('cup.play', { round: t(names[i]) })}
        </button>
      )}
    </Screen>
  )
}
