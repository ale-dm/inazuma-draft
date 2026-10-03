import { useEffect, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import { SIM_PER_HALF, adaptRival, fatalTeam, rivalTeam, simScore, simTeamStats, simulate, type FatalCard, type SimChance } from '../../lib/fatal'
import { playSfx } from '../../lib/sfx'
import DuelCard from '../DuelCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import type { PickedSquad } from './SquadPicker'

export type Paid = { coins: number; xp: number; note: string | null }

const TICK_MS = 55      // un minuto de reloj entre ocasiones
const CONTROL_MS = 1500
const SHOT_MS = 1700
const HALF_MS = 3500

type Phase = 'run' | 'control' | 'shot' | 'runout' | 'half' | 'end'

/**
 * Fatal Sim (como en MADFUT): partido pasivo de 90 minutos (2 partes de 45) con 12 ocasiones, 6 por parte. En cada una,
 * 3 cartas de control al azar por equipo (una juega); gana el balón la de más control (empate: fuera) y ataca con 1 de
 * 3 atacantes contra 1 de 3 defensas; si el ataque supera a la defensa, gol. El reloj corre entre ocasiones, hay
 * descanso con estadísticas y un resumen final. Solo se mira; ver docs/fatal-sim.md.
 */
export default function SimMatch({ title, squad, boostText, settle, onAgain, backHref }: {
  title: string; squad: PickedSquad; boostText: string; settle: (res: 0 | 1 | -1) => Paid; onAgain: () => void; backHref: string
}) {
  const { t, locale } = useAppSettings()
  const [{ me, opp, chances }] = useState(() => {
    const me_ = fatalTeam(t('duel.you'), squad.lineup, squad.captain, squad.formation)
    const opp_ = adaptRival(me_, rivalTeam(teamRating(squad.xi)))
    return { me: me_, opp: opp_, chances: simulate(me_, opp_) }
  })
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('run')
  const [clock, setClock] = useState(0)
  const [paid, setPaid] = useState<Paid | null>(null)
  const done = phase === 'end'
  const c = chances[Math.min(idx, chances.length - 1)]
  const resolved = done ? chances : chances.filter((_, k) => k < idx || (k === idx && phase === 'shot'))
  const s = simScore(resolved)
  const stats = [simTeamStats(me), simTeamStats(opp)]
  const secondHalf = idx > SIM_PER_HALF || (idx === SIM_PER_HALF && phase === 'run')

  // el reloj corre hasta la siguiente ocasión (o hasta el pitido de la parte)
  useEffect(() => {
    if (phase !== 'run' && phase !== 'runout') return
    const target = phase === 'run' ? chances[idx].minute : idx === SIM_PER_HALF ? 45 : 90
    if (clock >= target) {
      setPhase(phase === 'run' ? 'control' : idx === SIM_PER_HALF ? 'half' : 'end')
      return
    }
    const id = setTimeout(() => setClock(m => m + 1), TICK_MS)
    return () => clearTimeout(id)
  }, [phase, clock, idx, chances])

  useEffect(() => {
    if (phase === 'control') {
      const id = setTimeout(() => setPhase('shot'), CONTROL_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'shot') {
      if (c.goal) playSfx(c.ball === 0 ? 'goal' : 'pick')
      const id = setTimeout(() => {
        const next = idx + 1
        setIdx(next)
        // última de la parte: el reloj llega al pitido antes del descanso o del final
        setPhase(next === SIM_PER_HALF || next === chances.length ? 'runout' : 'run')
      }, SHOT_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'half') {
      const id = setTimeout(() => setPhase('run'), HALF_MS)
      return () => clearTimeout(id)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (done && !paid) {
      const f = simScore(chances)
      setPaid(settle(f[0] === f[1] ? -1 : f[0] > f[1] ? 0 : 1))
    }
  }, [done, paid, chances]) // eslint-disable-line react-hooks/exhaustive-deps

  const skip = () => { setIdx(chances.length); setClock(90); setPhase('end') }
  const first = chances.slice(0, SIM_PER_HALF)
  const shown = phase === 'half' ? first : chances

  return (
    <Screen title={title}>
      <div className="sim-board">
        <div className="sim-team">
          <span className="sim-team__name">{t('duel.you')}</span>
          <Shields st={stats[0]} />
        </div>
        <div className="sim-mid">
          <b className="sim-score">{s[0]} – {s[1]}</b>
          <small>{done ? t('duel.fullTime') : phase === 'half' ? t('sim.halfTime') : `${clock}'`}</small>
        </div>
        <div className="sim-team sim-team--opp">
          <span className="sim-team__name">{teamLabel(opp.name, locale)}</span>
          <Shields st={stats[1]} />
        </div>
      </div>
      <div className="sim-clock" aria-label={t('sim.timeline')}>
        <i className="sim-clock__fill" style={{ width: `${Math.min(100, (clock / 90) * 100)}%` }} />
        <i className="sim-clock__half" />
        {chances.map((ch, k) => {
          const past = done || k < idx || (k === idx && phase === 'shot')
          return past && ch.shot ? (
            <span key={k} className={`sim-mark ${ch.goal ? (ch.ball === 0 ? 'is-goal' : 'is-conceded') : ''}`} style={{ left: `${(ch.minute / 90) * 100}%` }}>{ch.goal ? '⚽' : '·'}</span>
          ) : null
        })}
      </div>
      <p className="duel-boost">{boostText}</p>

      {(phase === 'control' || phase === 'shot') && <ChancePanel c={c} second={phase === 'shot'} oppName={teamLabel(opp.name, locale)} />}
      {(phase === 'run' || phase === 'runout') && <p className="sim-run">{secondHalf ? t('sim.secondHalf') : t('sim.firstHalf')}…</p>}
      {phase === 'half' && <Summary title={t('sim.halfTime')} chances={shown} />}
      {!done && <button type="button" className="chip self-center" onClick={skip}>{t('duel.skip')}</button>}

      {done && (
        <div className="duel-end">
          <h2 className="fd-title">{s[0] > s[1] ? t('duel.win') : s[0] === s[1] ? t('duel.draw') : t('duel.loss')}</h2>
          <Summary title={t('duel.fullTime')} chances={chances} />
          {paid && <p className="reward-line">+<Coin className="w-5 h-5" /> {paid.coins} · +{paid.xp} XP</p>}
          {paid?.note && <p className="fatal-note">{paid.note}</p>}
          <button type="button" className="sheet-cta" onClick={onAgain}>{t('duel.again')}</button>
          <a href={backHref} className="chip self-center">{t('fatal.back')}</a>
        </div>
      )}
    </Screen>
  )
}

/** Estadísticas del descanso y del final: posesión (balones ganados), ocasiones y goles */
function Summary({ title, chances }: { title: string; chances: SimChance[] }) {
  const { t } = useAppSettings()
  const mine = chances.filter(c => c.ball === 0).length
  const theirs = chances.filter(c => c.ball === 1).length
  const pos = mine + theirs ? Math.round((mine / (mine + theirs)) * 100) : 50
  const g = simScore(chances)
  const rows: [string, string | number, string | number][] = [
    [t('sim.possession'), `${pos}%`, `${100 - pos}%`], [t('sim.shots'), mine, theirs], [t('sim.goals'), g[0], g[1]],
  ]
  return (
    <section className="sim-panel sim-summary">
      <h3 className="sheet-label">{title}</h3>
      {rows.map(([k, a, b]) => <div key={k} className="sim-stat"><b>{a}</b><span>{k}</span><b>{b}</b></div>)}
    </section>
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
      <p className="sim-goalchance">{t('sim.chance', { n: Math.round((c.chance ?? 0) * 100) })}</p>
      <p className={`sim-verdict ${c.goal ? (mine ? 'is-goal' : 'is-conceded') : ''}`}>
        {c.goal ? t('sim.goal', { name: x.p.name }) : t('duel.saved')}
      </p>
    </section>
  )
}
