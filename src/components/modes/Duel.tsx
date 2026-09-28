import { useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel } from '../../data/catalog'
import { lineupToArray } from '../../lib/lineup'
import { teamRating } from '../../lib/chemistry'
import {
  DUEL_ROUNDS, aiPick, duelOpponent, duelReward, duelStats, keeperSave, playRound, toDuelTeam,
  type DuelRound, type DuelTeam,
} from '../../lib/duel'
import { addCoins, addXp, track } from '../../lib/club'
import { playSfx } from '../../lib/sfx'
import DuelCard from '../DuelCard'
import FutDraft from '../futdraft/FutDraft'
import Coin from '../Coin'
import Screen from '../club/Screen'
import SquadPicker, { type PickedSquad } from './SquadPicker'

export type DuelSource = 'club' | 'sim' | 'draft'

interface Match {
  me: DuelTeam
  opp: DuelTeam
  myHand: Player[]
  oppHand: Player[]
  rounds: DuelRound[]
}

const goalsOf = (rounds: DuelRound[]): [number, number] => [
  rounds.filter(r => r.shot?.goal && r.shot.by === 0).length,
  rounds.filter(r => r.shot?.goal && r.shot.by === 1).length,
]

function newMatch(name: string, xi: Player[]): Match {
  const me = toDuelTeam(name, xi)
  const o = duelOpponent(teamRating(xi))
  const opp = toDuelTeam(o.name, o.xi)
  return { me, opp, myHand: me.field, oppHand: opp.field, rounds: [] }
}

/** Una jugada más: tu carta (la eliges o, en Simulación, la máquina) contra la de la máquina */
function step(m: Match, mine: Player): Match {
  const theirs = aiPick(m.oppHand)
  const round = playRound(mine, theirs, m.me.gk, m.opp.gk)
  return { ...m, myHand: m.myHand.filter(p => p !== mine), oppHand: m.oppHand.filter(p => p !== theirs), rounds: [...m.rounds, round] }
}

/**
 * Duelo (fase 4): 7 jugadas; en cada una, cada equipo juega una carta de campo. Control contra control → quien gana
 * el balón tira: su ataque contra la defensa de la carta rival y la parada del portero. Ver lib/duel.ts y docs/duelo.md.
 * Mi club y Simulación juegan con una de Mis plantillas (en Simulación elige la máquina); Draft, con un draft nuevo.
 */
export default function Duel({ source }: { source: DuelSource }) {
  const { t, locale } = useAppSettings()
  const [picked, setPicked] = useState<PickedSquad | null>(null)
  const [match, setMatch] = useState<Match | null>(null)
  const [paid, setPaid] = useState(false)

  function start(s: PickedSquad) {
    setPicked(s)
    setPaid(false)
    let m = newMatch(s.name, s.xi)
    if (source === 'sim') while (m.rounds.length < DUEL_ROUNDS) m = step(m, aiPick(m.myHand))
    setMatch(m)
    if (source === 'sim') finish(m)
  }

  function finish(m: Match) {
    const g = goalsOf(m.rounds)
    const r = duelReward(g)
    addCoins(r.coins)
    addXp(r.xp)
    track('duels')
    if (g[0] > g[1]) track('duelWins')
    setPaid(true)
  }

  function play(p: Player) {
    if (!match || match.rounds.length >= DUEL_ROUNDS) return
    const m = step(match, p)
    const last = m.rounds[m.rounds.length - 1]
    if (last.shot?.goal) playSfx(last.shot.by === 0 ? 'goal' : 'pick')
    setMatch(m)
    if (m.rounds.length >= DUEL_ROUNDS) finish(m)
  }

  if (source === 'draft' && !picked) {
    return (
      <FutDraft
        ctaLabel={t('duel.playDuel')}
        onExit={() => { window.location.hash = '#/' }}
        onComplete={(l, formation, _c, chem) => start({ name: t('duel.you'), xi: lineupToArray(l, formation), chem })}
      />
    )
  }

  const title = `${t('hub.duel')} · ${t(source === 'club' ? 'hub.duelClub' : source === 'sim' ? 'hub.duelSim' : 'hub.draft')}`
  if (!match) {
    return (
      <Screen title={title}>
        <p className="fd-hint">{t('duel.rules')}</p>
        <SquadPicker onPick={start} />
      </Screen>
    )
  }

  const goals = goalsOf(match.rounds)
  const over = match.rounds.length >= DUEL_ROUNDS
  const last = match.rounds[match.rounds.length - 1]
  const reward = duelReward(goals)

  return (
    <Screen title={title}>
      <div className="duel-score">
        <span className="duel-score__team">{t('duel.you')}</span>
        <b>{goals[0]}</b><i>–</i><b>{goals[1]}</b>
        <span className="duel-score__team">{teamLabel(match.opp.name, locale)}</span>
        <small className="duel-score__round">{t('duel.round', { n: Math.min(match.rounds.length + (over ? 0 : 1), DUEL_ROUNDS), total: DUEL_ROUNDS })}</small>
      </div>
      <p className="duel-gk">
        {t('duel.keepers', { me: match.me.gk.name, a: keeperSave(match.me.gk), opp: match.opp.gk.name, b: keeperSave(match.opp.gk) })}
      </p>

      {last && <RoundView round={last} />}

      {over ? (
        <div className="duel-end">
          <h2 className="fd-title">{goals[0] > goals[1] ? t('duel.win') : goals[0] === goals[1] ? t('duel.draw') : t('duel.loss')}</h2>
          {paid && <p className="reward-line">+<Coin className="w-5 h-5" /> {reward.coins} · +{reward.xp} XP</p>}
          <ol className="duel-log">
            {match.rounds.map((r, i) => <li key={i}><RoundLine round={r} n={i + 1} /></li>)}
          </ol>
          <button type="button" className="sheet-cta" onClick={() => (source === 'draft' ? setPicked(null) : start(picked!))}>{t('duel.again')}</button>
          <a href="#/" className="chip self-center">{t('players.back')}</a>
        </div>
      ) : (
        <>
          <h3 className="sheet-label">{t('duel.pickCard')}</h3>
          <div className="duel-hand">
            {match.myHand.map(p => <DuelCard key={p.id} player={p} size="md" onClick={() => play(p)} />)}
          </div>
        </>
      )}
    </Screen>
  )
}

/** Última jugada: las dos cartas con la estadística que se ha comparado resaltada */
function RoundView({ round }: { round: DuelRound }) {
  const hl = (side: 0 | 1) => (round.shot ? (round.shot.by === side ? 'att' : 'def') : 'con')
  return (
    <div className="duel-round">
      <DuelCard player={round.cards[0]} size="sm" highlight={hl(0)} />
      <RoundLine round={round} />
      <DuelCard player={round.cards[1]} size="sm" highlight={hl(1)} />
    </div>
  )
}

function RoundLine({ round, n }: { round: DuelRound; n?: number }) {
  const { t } = useAppSettings()
  const [a, b] = round.cards.map(duelStats)
  return (
    <span className="duel-line">
      {n != null && <small>{n}. </small>}
      <span>{t('duel.mid', { a: a.con, b: b.con })} → {round.ball === 0 ? t('duel.ballYou') : round.ball === 1 ? t('duel.ballOpp') : t('duel.ballNone')}</span>
      {round.shot && (
        <span className={round.shot.goal ? (round.shot.by === 0 ? 'is-goal' : 'is-conceded') : ''}>
          {t('duel.shot', { att: round.shot.att, def: round.shot.block, gk: round.shot.gk })} → {round.shot.goal ? t('duel.goal') : t('duel.saved')}
        </span>
      )}
    </span>
  )
}
