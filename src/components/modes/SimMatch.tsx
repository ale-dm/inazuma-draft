import { useEffect, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import { SIM_MINUTES, fatalTeam, rivalTeam, simScore, simTeamStats, simulate, type FatalCard, type SimChance } from '../../lib/fatal'
import { playSfx } from '../../lib/sfx'
import DuelCard from '../DuelCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import type { PickedSquad } from './SquadPicker'

export type Paid = { coins: number; xp: number; note: string | null }

const STEP_MS = 1700

/**
 * Fatal Sim (como en MADFUT): partido pasivo de 6 ocasiones. En cada una, 3 cartas de control al azar por equipo (una
 * juega); gana el balón la de más control (empate: fuera) y ataca con 1 de 3 atacantes contra 1 de 3 defensas; si el
 * ataque supera a la defensa, gol. Solo se mira; ver docs/fatal-sim.md.
 */
export default function SimMatch({ title, squad, boostText, settle, onAgain, backHref }: {
  title: string; squad: PickedSquad; boostText: string; settle: (res: 0 | 1 | -1) => Paid; onAgain: () => void; backHref: string
}) {
  const { t, locale } = useAppSettings()
  const [{ me, opp, chances }] = useState(() => {
    const me_ = fatalTeam(t('duel.you'), squad.lineup, squad.captain, squad.formation)
    const opp_ = rivalTeam(teamRating(squad.xi))
    return { me: me_, opp: opp_, chances: simulate(me_, opp_) }
  })
  // paso 0 = batalla de control de la ocasión, 1 = ataque / defensa (o balón fuera), y vuelta a empezar con la siguiente
  const [step, setStep] = useState(0)
  const [paid, setPaid] = useState<Paid | null>(null)
  const idx = Math.min(Math.floor(step / 2), chances.length - 1)
  const done = step >= chances.length * 2
  const c = chances[idx]
  const resolved = done ? chances : chances.slice(0, idx + (step % 2 === 1 ? 1 : 0))
  const s = simScore(resolved)
  const stats = [simTeamStats(me), simTeamStats(opp)]

  useEffect(() => {
    if (done) return
    const id = setTimeout(() => {
      if (step % 2 === 1 && c.goal) playSfx(c.ball === 0 ? 'goal' : 'pick')
      setStep(n => n + 1)
    }, STEP_MS)
    return () => clearTimeout(id)
  }, [step, done, c])

  useEffect(() => {
    if (done && !paid) {
      const f = simScore(chances)
      setPaid(settle(f[0] === f[1] ? -1 : f[0] > f[1] ? 0 : 1))
    }
  }, [done, paid, chances]) // eslint-disable-line react-hooks/exhaustive-deps

  const minute = done ? SIM_MINUTES[SIM_MINUTES.length - 1] : c.minute

  return (
    <Screen title={title}>
      <div className="sim-board">
        <div className="sim-team">
          <span className="sim-team__name">{t('duel.you')}</span>
          <Shields st={stats[0]} />
        </div>
        <div className="sim-mid">
          <b className="sim-score">{s[0]} – {s[1]}</b>
          <small>{done ? t('duel.fullTime') : `${minute}'`}</small>
        </div>
        <div className="sim-team sim-team--opp">
          <span className="sim-team__name">{teamLabel(opp.name, locale)}</span>
          <Shields st={stats[1]} />
        </div>
      </div>
      <ol className="sim-timeline" aria-label={t('sim.timeline')}>
        {chances.map((ch, k) => {
          const past = done || k < idx || (k === idx && step % 2 === 1)
          return (
            <li key={k} className={`sim-tl ${past ? 'is-past' : ''} ${past && ch.goal ? (ch.ball === 0 ? 'is-goal' : 'is-conceded') : ''}`}>
              <small>{ch.minute}'</small>
              <span>{!past ? '·' : ch.goal ? '⚽' : ch.ball === -1 ? '↗' : '✕'}</span>
            </li>
          )
        })}
      </ol>
      <p className="duel-boost">{boostText}</p>

      {!done && <ChancePanel c={c} second={step % 2 === 1} oppName={teamLabel(opp.name, locale)} />}
      {!done && <button type="button" className="chip self-center" onClick={() => setStep(chances.length * 2)}>{t('duel.skip')}</button>}

      {done && (
        <div className="duel-end">
          <h2 className="fd-title">{s[0] > s[1] ? t('duel.win') : s[0] === s[1] ? t('duel.draw') : t('duel.loss')}</h2>
          {paid && <p className="reward-line">+<Coin className="w-5 h-5" /> {paid.coins} · +{paid.xp} XP</p>}
          {paid?.note && <p className="fatal-note">{paid.note}</p>}
          <button type="button" className="sheet-cta" onClick={onAgain}>{t('duel.again')}</button>
          <a href={backHref} className="chip self-center">{t('fatal.back')}</a>
        </div>
      )}
    </Screen>
  )
}

function Shields({ st }: { st: { att: number; con: number; def: number } }) {
  const { t } = useAppSettings()
  return (
    <span className="sim-shields">
      {(['att', 'con', 'def'] as const).map(k => (
        <span key={k} className={`sim-shield sim-shield--${k}`} title={t(`hl.stat.${k}` as const)}><i>{t(`hl.stat.${k}` as const)}</i><b>{st[k]}</b></span>
      ))}
    </span>
  )
}

function Pool({ pool, played, highlight }: { pool: FatalCard[]; played: FatalCard; highlight: 'att' | 'con' | 'def' }) {
  return (
    <div className="sim-pool">
      {pool.map(card => (
        <div key={card.p.id} className={card === played ? 'sim-pool__card is-played' : 'sim-pool__card'}>
          <DuelCard player={card.p} size="xs" values={card.st} mod={card.mod} highlight={highlight} />
        </div>
      ))}
    </div>
  )
}

function ChancePanel({ c, second, oppName }: { c: SimChance; second: boolean; oppName: string }) {
  const { t } = useAppSettings()
  if (!second || !c.shot || !c.shotPools) {
    const out = second && c.ball === -1
    return (
      <section className="sim-panel">
        <h3 className="sheet-label">{t('sim.control')}</h3>
        <div className="sim-versus">
          <Pool pool={c.controlPools[0]} played={c.control[0]} highlight="con" />
          <span className="sim-vs">{t('hl.stat.con')}<b>{c.control[0].st.con}</b><i>–</i><b>{c.control[1].st.con}</b></span>
          <Pool pool={c.controlPools[1]} played={c.control[1]} highlight="con" />
        </div>
        {second && <p className={`sim-verdict ${c.ball === 0 ? 'is-goal' : c.ball === 1 ? 'is-conceded' : ''}`}>{out ? t('duel.out') : c.ball === 0 ? t('duel.ballYou') : t('duel.ballOpp')}</p>}
      </section>
    )
  }
  const mine = c.ball === 0
  const [x, y] = c.shot
  const [xp, yp] = c.shotPools
  const label = mine ? t('sim.attack', { team: t('duel.you') }) : t('sim.attack', { team: oppName })
  return (
    <section className="sim-panel">
      <h3 className="sheet-label">{label}</h3>
      <div className="sim-versus">
        <Pool pool={mine ? xp : yp} played={mine ? x : y} highlight={mine ? 'att' : 'def'} />
        <span className="sim-vs">
          {mine ? <>{t('hl.stat.att')}<b>{x.st.att}</b><i>–</i><b>{y.st.def}</b>{t('hl.stat.def')}</>
                : <>{t('hl.stat.def')}<b>{y.st.def}</b><i>–</i><b>{x.st.att}</b>{t('hl.stat.att')}</>}
        </span>
        <Pool pool={mine ? yp : xp} played={mine ? y : x} highlight={mine ? 'def' : 'att'} />
      </div>
      <p className={`sim-verdict ${c.goal ? (mine ? 'is-goal' : 'is-conceded') : ''}`}>
        {c.goal ? t('sim.goal', { name: x.p.name }) : t('duel.saved')}
      </p>
    </section>
  )
}
