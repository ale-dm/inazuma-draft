import { useEffect, useMemo, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel, teamLogo } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import { duelOpponent, duelReward, type DuelKey } from '../../lib/duel'
import {
  FATAL_ROUNDS, SIM_CHANCES, aiLead, aiRespond, captainOf, counter, fatalTeam, finalResult, lineupFor, needsTiebreak,
  playRound, score, simScore, simulate, tiebreak, total, weeklyBoost,
  type FatalCard, type FatalTeam, type Round, type SimChance,
} from '../../lib/fatal'
import { addCoins, addXp, track } from '../../lib/club'
import { playSfx } from '../../lib/sfx'
import type { TranslationKey } from '../../i18n/translations'
import type { Player } from '../../types'
import DuelCard from '../DuelCard'
import FutDraft from '../futdraft/FutDraft'
import Coin from '../Coin'
import Screen from '../club/Screen'
import { ElementIcon } from '../GameIcon'
import SquadPicker, { type PickedSquad } from './SquadPicker'

export type DuelSource = 'club' | 'sim' | 'draft'

const STAT_KEY: Record<DuelKey, TranslationKey> = { att: 'hl.stat.att', con: 'hl.stat.con', def: 'hl.stat.def' }

interface Match {
  me: FatalTeam
  opp: FatalTeam
  myHand: FatalCard[]
  oppHand: FatalCard[]
  rounds: Round[]
  /** Quién lleva la primera ronda (luego se alterna) */
  first: 0 | 1
  /** La máquina ya ha elegido y espera tu respuesta */
  pending: { card: FatalCard; stat: DuelKey } | null
}

function rival(xiRating: number): FatalTeam {
  const o = duelOpponent(xiRating)
  const l = lineupFor(o.xi)
  return fatalTeam(o.name, l, captainOf(l))
}

function payout(res: 0 | 1 | -1) {
  const r = duelReward(res === 0 ? [1, 0] : res === 1 ? [0, 1] : [0, 0])
  addCoins(r.coins)
  addXp(r.xp)
  track('duels')
  if (res === 0) track('duelWins')
  playSfx(res === 0 ? 'qualify' : 'pick')
  return r
}

/**
 * Duelo = el Fatal de MADFUT (ver lib/fatal.ts y docs/duelo.md). Mi club y Draft: 10 rondas por turnos con desempate.
 * Simulación: 6 ocasiones automáticas con una plantilla del club.
 */
export default function Duel({ source }: { source: DuelSource }) {
  const { t } = useAppSettings()
  const [picked, setPicked] = useState<PickedSquad | null>(null)
  const [game, setGame] = useState(0)
  const boost = useMemo(() => weeklyBoost(), [])

  if (source === 'draft' && !picked) {
    return (
      <FutDraft
        ctaLabel={t('duel.playDuel')}
        onExit={() => { window.location.hash = '#/' }}
        onComplete={(l, _formation, captain, chem) => setPicked({
          name: t('duel.you'), xi: Object.values(l).filter((p): p is Player => !!p), chem, lineup: l, captain,
        })}
      />
    )
  }

  const title = `${t('hub.duel')} · ${t(source === 'club' ? 'hub.duelClub' : source === 'sim' ? 'hub.duelSim' : 'hub.draft')}`
  const boostText = t('duel.boost', { n: boost.amount, what: boost.kind === 'game' ? boost.value : t(`element.${boost.value}` as TranslationKey) })

  if (!picked) {
    return (
      <Screen title={title}>
        <p className="fd-hint">{t(source === 'sim' ? 'duel.simRules' : 'duel.rules', { n: SIM_CHANCES })}</p>
        <p className="duel-boost">{boostText}</p>
        <SquadPicker onPick={s => { setPicked(s); setGame(g => g + 1) }} />
      </Screen>
    )
  }

  const again = () => (source === 'draft' ? setPicked(null) : setGame(g => g + 1))
  return source === 'sim'
    ? <SimMatch key={game} title={title} squad={picked} boostText={boostText} onAgain={again} />
    : <FatalMatch key={game} title={title} squad={picked} boostText={boostText} onAgain={again} />
}

// ---------------------------------------------------------------- Mi club / Draft

function FatalMatch({ title, squad, boostText, onAgain }: { title: string; squad: PickedSquad; boostText: string; onAgain: () => void }) {
  const { t, locale } = useAppSettings()
  const [m, setM] = useState<Match>(() => {
    const me = fatalTeam(t('duel.you'), squad.lineup, squad.captain)
    const opp = rival(teamRating(squad.xi))
    return { me, opp, myHand: me.cards, oppHand: opp.cards, rounds: [], first: Math.random() < 0.5 ? 0 : 1, pending: null }
  })
  const [sel, setSel] = useState<FatalCard | null>(null)
  const [paid, setPaid] = useState<{ coins: number; xp: number } | null>(null)

  const i = m.rounds.length
  const over = i >= FATAL_ROUNDS
  const lead: 0 | 1 = ((m.first + i) % 2) as 0 | 1
  const s = score(m.rounds)
  const tb = over && needsTiebreak(s) ? tiebreak(m.myHand[0], m.oppHand[0]) : null
  const result = over ? finalResult(s, tb) : null
  const last = m.rounds[i - 1]

  // la máquina lleva: elige al empezar su ronda
  useEffect(() => {
    if (!over && lead === 1 && !m.pending) setM(x => ({ ...x, pending: aiLead(x.oppHand) }))
  }, [over, lead, m.pending])

  useEffect(() => {
    if (result !== null && !paid) setPaid(payout(result))
  }, [result, paid])

  function finish(round: Round, mine: FatalCard, theirs: FatalCard) {
    if (round.winner === 0) playSfx('goal')
    setM(x => ({ ...x, myHand: x.myHand.filter(c => c !== mine), oppHand: x.oppHand.filter(c => c !== theirs), rounds: [...x.rounds, round], pending: null }))
    setSel(null)
  }

  function leadWith(stat: DuelKey) {
    if (!sel) return
    const theirs = aiRespond(m.oppHand, stat, sel, m.myHand)
    finish(playRound(0, stat, sel, theirs), sel, theirs)
  }

  function respondWith(c: FatalCard) {
    if (!m.pending) return
    finish(playRound(1, m.pending.stat, c, m.pending.card), c, m.pending.card)
  }

  return (
    <Screen title={title}>
      <div className="duel-score">
        <span className="duel-score__team">{t('duel.you')}</span>
        <b>{s[0]}</b><i>–</i><b>{s[1]}</b>
        <span className="duel-score__team">{teamLabel(m.opp.name, locale)}</span>
        <small className="duel-score__round">{over ? t('duel.fullTime') : t('duel.round', { n: i + 1, total: FATAL_ROUNDS })}</small>
      </div>
      <p className="duel-boost">{boostText}</p>

      {last && <RoundView round={last} />}

      {over ? (
        <div className="duel-end">
          {tb !== null && (
            <div className="duel-tb">
              <small className="sheet-label">{t('duel.tiebreak')}</small>
              <div className="duel-round">
                <DuelCard player={m.myHand[0].p} size="sm" values={m.myHand[0].st} mod={m.myHand[0].mod} />
                <span className="duel-line"><b>{total(m.myHand[0])} – {total(m.oppHand[0])}</b><span>{t('duel.tbRule')}</span></span>
                <DuelCard player={m.oppHand[0].p} size="sm" values={m.oppHand[0].st} mod={m.oppHand[0].mod} />
              </div>
            </div>
          )}
          <h2 className="fd-title">{result === 0 ? t('duel.win') : result === -1 ? t('duel.draw') : t('duel.loss')}</h2>
          {paid && <p className="reward-line">+<Coin className="w-5 h-5" /> {paid.coins} · +{paid.xp} XP</p>}
          <button type="button" className="sheet-cta" onClick={onAgain}>{t('duel.again')}</button>
          <a href="#/" className="chip self-center">{t('players.back')}</a>
        </div>
      ) : lead === 0 ? (
        <>
          <h3 className="sheet-label">{sel ? t('duel.pickStat') : t('duel.youLead')}</h3>
          {sel && (
            <div className="duel-stats-pick">
              {(['att', 'con', 'def'] as const).map(k => (
                <button key={k} type="button" className={`duel-stat-btn ic__stat--${k}`} onClick={() => leadWith(k)}>
                  <small>{t(STAT_KEY[k])}</small><b>{sel.st[k]}</b><em>{t('duel.vs', { k: t(STAT_KEY[counter(k)]) })}</em>
                </button>
              ))}
            </div>
          )}
          <Hand hand={m.myHand} selected={sel} onPick={c => setSel(c === sel ? null : c)} />
        </>
      ) : m.pending && (
        <>
          <div className="fatal-hint-row">
            <Hint card={m.pending.card} stat={m.pending.stat} />
            <p className="fd-hint">{t('duel.respond', { k: t(STAT_KEY[m.pending.stat]), mine: t(STAT_KEY[counter(m.pending.stat)]) })}</p>
          </div>
          <Hand hand={m.myHand} highlight={counter(m.pending.stat)} onPick={respondWith} />
        </>
      )}
    </Screen>
  )
}

function Hand({ hand, selected, highlight, onPick }: { hand: FatalCard[]; selected?: FatalCard | null; highlight?: DuelKey; onPick: (c: FatalCard) => void }) {
  return (
    <div className="duel-hand">
      {hand.map(c => (
        <span key={c.p.id + c.slot} className={selected === c ? 'fd-selected' : undefined}>
          <DuelCard player={c.p} size="sm" values={c.st} mod={c.mod} highlight={highlight} onClick={() => onPick(c)} />
        </span>
      ))}
    </div>
  )
}

/** Carta boca abajo de la máquina: solo la pista (afinidad, escudo, juego) y el número que ha elegido */
function Hint({ card, stat }: { card: FatalCard; stat: DuelKey }) {
  const { t } = useAppSettings()
  const logo = teamLogo(card.p.team, card.p.game)
  return (
    <span className="fatal-hint">
      <ElementIcon element={card.p.element} className="fatal-hint__el" />
      {logo && <img className="fatal-hint__crest" src={logo} alt="" />}
      <span className="fatal-hint__game">{card.p.game}</span>
      <b className={`fatal-hint__stat ic__stat--${stat}`}>{t(STAT_KEY[stat])}</b>
    </span>
  )
}

function RoundView({ round }: { round: Round }) {
  const { t } = useAppSettings()
  const [mine, theirs] = round.cards
  const myKey = round.lead === 0 ? round.stat : counter(round.stat)
  const theirKey = round.lead === 1 ? round.stat : counter(round.stat)
  return (
    <div className="duel-round">
      <DuelCard player={mine.p} size="sm" values={mine.st} mod={mine.mod} highlight={myKey} />
      <span className="duel-line">
        <span>{t(STAT_KEY[myKey])} <b>{mine.st[myKey]}</b> – <b>{theirs.st[theirKey]}</b> {t(STAT_KEY[theirKey])}</span>
        {round.byTotal && <small>{t('duel.byTotal', { a: total(mine), b: total(theirs) })}</small>}
        <span className={round.winner === 0 ? 'is-goal' : round.winner === 1 ? 'is-conceded' : ''}>
          {round.winner === 0 ? t('duel.point') : round.winner === 1 ? t('duel.pointOpp') : t('duel.noPoint')}
        </span>
      </span>
      <DuelCard player={theirs.p} size="sm" values={theirs.st} mod={theirs.mod} highlight={theirKey} />
    </div>
  )
}

// ---------------------------------------------------------------- Simulación

function SimMatch({ title, squad, boostText, onAgain }: { title: string; squad: PickedSquad; boostText: string; onAgain: () => void }) {
  const { t, locale } = useAppSettings()
  const [{ opp, chances }] = useState(() => {
    const me = fatalTeam(t('duel.you'), squad.lineup, squad.captain)
    const opp_ = rival(teamRating(squad.xi))
    return { opp: opp_, chances: simulate(me, opp_) }
  })
  const [shown, setShown] = useState(0)
  const [paid, setPaid] = useState<{ coins: number; xp: number } | null>(null)
  const done = shown >= chances.length
  const s = simScore(chances.slice(0, shown))

  useEffect(() => {
    if (done) return
    const id = setTimeout(() => {
      const c = chances[shown]
      if (c.goal) playSfx(c.ball === 0 ? 'goal' : 'pick')
      setShown(n => n + 1)
    }, 1400)
    return () => clearTimeout(id)
  }, [shown, done, chances])

  useEffect(() => {
    if (done && !paid) {
      const f = simScore(chances)
      setPaid(payout(f[0] === f[1] ? -1 : f[0] > f[1] ? 0 : 1))
    }
  }, [done, paid, chances])

  return (
    <Screen title={title}>
      <div className="duel-score">
        <span className="duel-score__team">{t('duel.you')}</span>
        <b>{s[0]}</b><i>–</i><b>{s[1]}</b>
        <span className="duel-score__team">{teamLabel(opp.name, locale)}</span>
        <small className="duel-score__round">{done ? t('duel.fullTime') : t('duel.chance', { n: Math.min(shown + 1, SIM_CHANCES), total: SIM_CHANCES })}</small>
      </div>
      <p className="duel-boost">{boostText}</p>
      {!done && <button type="button" className="chip self-center" onClick={() => setShown(chances.length)}>{t('duel.skip')}</button>}
      {done && (
        <div className="duel-end">
          <h2 className="fd-title">{s[0] > s[1] ? t('duel.win') : s[0] === s[1] ? t('duel.draw') : t('duel.loss')}</h2>
          {paid && <p className="reward-line">+<Coin className="w-5 h-5" /> {paid.coins} · +{paid.xp} XP</p>}
          <button type="button" className="sheet-cta" onClick={onAgain}>{t('duel.again')}</button>
          <a href="#/" className="chip self-center">{t('players.back')}</a>
        </div>
      )}
      <ol className="duel-log">
        {chances.slice(0, shown).map((c, k) => <li key={k}><ChanceView c={c} n={k + 1} /></li>).reverse()}
      </ol>
    </Screen>
  )
}

function ChanceView({ c, n }: { c: SimChance; n: number }) {
  const { t } = useAppSettings()
  // en el tiro, a la izquierda siempre tu carta
  const shotMine = c.shot ? (c.ball === 0 ? c.shot[0] : c.shot[1]) : null
  const shotTheirs = c.shot ? (c.ball === 0 ? c.shot[1] : c.shot[0]) : null
  return (
    <div className="sim-chance">
      <small className="sheet-label">{t('duel.chanceN', { n })}</small>
      <div className="duel-round">
        <DuelCard player={c.control[0].p} size="xs" values={c.control[0].st} highlight="con" />
        <span className="duel-line">
          <span>{t('hl.stat.con')} <b>{c.control[0].st.con}</b> – <b>{c.control[1].st.con}</b></span>
          <span>{c.ball === 0 ? t('duel.ballYou') : c.ball === 1 ? t('duel.ballOpp') : t('duel.out')}</span>
        </span>
        <DuelCard player={c.control[1].p} size="xs" values={c.control[1].st} highlight="con" />
      </div>
      {c.shot && shotMine && shotTheirs && (
        <div className="duel-round">
          <DuelCard player={shotMine.p} size="xs" values={shotMine.st} highlight={c.ball === 0 ? 'att' : 'def'} />
          <span className="duel-line">
            {c.ball === 0
              ? <span>{t('hl.stat.att')} <b>{shotMine.st.att}</b> – <b>{shotTheirs.st.def}</b> {t('hl.stat.def')}</span>
              : <span>{t('hl.stat.def')} <b>{shotMine.st.def}</b> – <b>{shotTheirs.st.att}</b> {t('hl.stat.att')}</span>}
            <span className={c.goal ? (c.ball === 0 ? 'is-goal' : 'is-conceded') : ''}>{c.goal ? t('duel.goal') : t('duel.saved')}</span>
          </span>
          <DuelCard player={shotTheirs.p} size="xs" values={shotTheirs.st} highlight={c.ball === 0 ? 'def' : 'att'} />
        </div>
      )}
    </div>
  )
}
