import { useEffect, useRef, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel, techniqueName } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import {
  SIM_PER_HALF, adaptRival, autoResults, cardOf, controlWinner, fatalTeam, rivalTeam, shotResult, simScore, simTeamStats, simulate,
  type FatalCard, type SimChance, type SimResult,
} from '../../lib/fatal'
import { PICK_COST, TENSION_GAIN, TENSION_MAX, TENSION_START, gainTension, techBonus, techCost, usableTechs } from '../../lib/tension'
import type { DuelKey } from '../../lib/duel'
import type { Technique } from '../../types'
import { playSfx } from '../../lib/sfx'
import DuelCard from '../DuelCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import type { PickedSquad } from './SquadPicker'

export type Paid = { coins: number; xp: number; note: string | null }

const TICK_MS = 55      // un minuto de reloj entre ocasiones
const QUICK_MS = 700    // fase sin decisión posible
const DECIDE_MS = 5000  // tiempo para decidir (elegir carta / usar supertécnica)
const RESULT_MS = 1900
const HALF_WAIT_MS = 9000
/** Cambio táctico del descanso: cuánto sube un número y cuánto baja el contrario, el resto de la segunda parte */
const TACTIC_MOD = 3
/** Probabilidad de que la IA use una supertécnica asequible en cada fase */
const AI_TECH_PROB = 0.35

type Phase = 'run' | 'control' | 'ctrlRes' | 'shot' | 'shotRes' | 'runout' | 'half' | 'end'
type Tactic = 'bal' | 'att' | 'def'
type Side = 0 | 1
interface Used { mine: Technique | null; opp: Technique | null }

/** Qué se decide en la fase: dónde juega mi carta y con qué número */
interface Decision { key: DuelKey; pool: FatalCard[]; pick: number; opp: FatalCard; oppKey: DuelKey; who: Side | null }

/**
 * Fatal Sim interactivo (como en MADFUT, pero con tensión): partido de 90 minutos (2 partes de 45) con 12 ocasiones, 6 por
 * parte. En cada una (control → ataque/defensa) puedes, gastando tensión, elegir tú la carta entre las 3 que salen o
 * usar una supertécnica de la carta que juega; en el descanso eliges táctica. La IA también usa técnicas. Ver
 * docs/fatal-sim.md.
 */
export default function SimMatch({ title, squad, boostText, settle, onAgain, backHref }: {
  title: string; squad: PickedSquad; boostText: string; settle: (res: 0 | 1 | -1) => Paid; onAgain: () => void; backHref: string
}) {
  const { t, locale } = useAppSettings()
  const [{ me, opp, init }] = useState(() => {
    const me_ = fatalTeam(t('duel.you'), squad.lineup, squad.captain, squad.formation)
    const opp_ = adaptRival(me_, rivalTeam(teamRating(squad.xi)))
    return { me: me_, opp: opp_, init: simulate(me_, opp_) }
  })
  const [chances, setChances] = useState<SimChance[]>(init)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('run')
  const [clock, setClock] = useState(0)
  const [results, setResults] = useState<SimResult[]>([])
  const [tension, setTension] = useState<[number, number]>([TENSION_START, TENSION_START])
  const [tactic, setTactic] = useState<Tactic>('bal')
  const [used, setUsed] = useState<Used>({ mine: null, opp: null })
  const [chosen, setChosen] = useState<Technique | null>(null)   // supertécnica que voy a usar en esta fase
  const [paid, setPaid] = useState<Paid | null>(null)
  const [last, setLast] = useState<SimResult | null>(null)
  const [ballNow, setBallNow] = useState<0 | 1 | -1>(-1)
  const [bonusNow, setBonusNow] = useState<[number, number]>([0, 0])
  const done = phase === 'end'
  const c = chances[Math.min(idx, chances.length - 1)]
  const s = simScore(results)
  const stats = [simTeamStats(me), simTeamStats(opp)]
  const secondHalf = idx > SIM_PER_HALF || (idx === SIM_PER_HALF && phase === 'run')

  /** Qué hay que decidir en la fase actual (control, o mi ataque / mi defensa) */
  function decision(): Decision | null {
    if (phase === 'control') {
      const d = c.control
      return { key: 'con', pool: d.pools[0], pick: d.pick[0], opp: cardOf(d, 1), oppKey: 'con', who: null }
    }
    if (phase === 'shot' && ballNow !== -1) {
      const w = ballNow as Side
      const d = c.atk[w]
      return w === 0
        ? { key: 'att', pool: d.pools[0], pick: d.pick[0], opp: cardOf(d, 1), oppKey: 'def', who: 0 }
        : { key: 'def', pool: d.pools[1], pick: d.pick[1], opp: cardOf(d, 0), oppKey: 'att', who: 1 }
    }
    return null
  }
  const dec = decision()
  const myCard = dec ? dec.pool[dec.pick] : null
  const techs = dec && myCard ? usableTechs(myCard, dec.key) : []
  const canPick = !!dec && tension[0] >= PICK_COST
  const canTech = techs.some(x => techCost(x) <= tension[0])
  const hasOptions = canPick || canTech

  const tacticBonus = (key: DuelKey) => (secondHalf ? (tactic === 'att' ? (key === 'att' ? TACTIC_MOD : key === 'def' ? -TACTIC_MOD : 0) : tactic === 'def' ? (key === 'def' ? TACTIC_MOD : key === 'att' ? -TACTIC_MOD : 0) : 0) : 0)

  const choosePick = (k: number) => {
    if (!dec || k === dec.pick || tension[0] < PICK_COST) return
    setTension(([a, b]) => [a - PICK_COST, b])
    playSfx('pick')
    setChances(list => list.map((x, i) => {
      if (i !== idx) return x
      if (phase === 'control') return { ...x, control: { ...x.control, pick: [k, x.control.pick[1]] } }
      const w = ballNow as Side
      const d = x.atk[w]
      const pick: [number, number] = w === 0 ? [k, d.pick[1]] : [d.pick[0], k]
      const atk: [typeof d, typeof d] = w === 0 ? [{ ...d, pick }, x.atk[1]] : [x.atk[0], { ...d, pick }]
      return { ...x, atk }
    }))
  }

  /** La IA usa su mejor técnica asequible con probabilidad AI_TECH_PROB (no ve la mía) */
  function aiTech(card: FatalCard, key: DuelKey): Technique | null {
    const opts = usableTechs(card, key).filter(x => techCost(x) <= tension[1])
    return opts.length && Math.random() < AI_TECH_PROB ? opts[0] : null
  }

  function confirm() {
    if (!dec || !myCard) return
    const mine = chosen && techCost(chosen) <= tension[0] ? chosen : null
    const oppT = aiTech(dec.opp, dec.oppKey)
    const bm = (mine ? techBonus(mine, myCard) : 0) + tacticBonus(dec.key)
    const bo = oppT ? techBonus(oppT, dec.opp) : 0
    const spent: [number, number] = [mine ? techCost(mine) : 0, oppT ? techCost(oppT) : 0]
    setUsed({ mine, opp: oppT })
    setChosen(null)
    if (phase === 'control') {
      const ball = controlWinner(c, [bm, bo])
      setBonusNow([bm, bo])
      setBallNow(ball)
      setTension(([a, b]) => [
        gainTension(a - spent[0], ball === 0 ? TENSION_GAIN.ballWon : TENSION_GAIN.ballLost),
        gainTension(b - spent[1], ball === 1 ? TENSION_GAIN.ballWon : TENSION_GAIN.ballLost),
      ])
      setPhase('ctrlRes')
      return
    }
    const who = dec.who as Side
    const bonus: [number, number] = who === 0 ? [bm, bo] : [bo, bm]
    const r = shotResult(c, who, bonus)
    const res: SimResult = { minute: c.minute, ball: who, goal: r.goal, chance: r.chance, scorer: r.scorer, assist: r.assist }
    setBonusNow([bm, bo])
    setLast(res)
    setResults(x => [...x, res])
    const scorerSide: Side = who
    setTension(([a, b]) => {
      const gain = (side: Side) => (r.goal ? (side === scorerSide ? TENSION_GAIN.goal : 0) : (side !== scorerSide ? TENSION_GAIN.saved : 0))
      return [gainTension(a - spent[0], gain(0)), gainTension(b - spent[1], gain(1))]
    })
    if (r.goal) playSfx(who === 0 ? 'goal' : 'pick')
    setPhase('shotRes')
  }
  const act = useRef(confirm)
  act.current = confirm

  const next = (nextIdx: number) => {
    setIdx(nextIdx)
    setUsed({ mine: null, opp: null })
    setLast(null)
    setPhase(nextIdx === SIM_PER_HALF || nextIdx === chances.length ? 'runout' : 'run')
  }

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

  // decisiones y resultados
  useEffect(() => {
    if (phase === 'control' || phase === 'shot') {
      if (phase === 'shot' && ballNow === -1) return
      const id = setTimeout(() => act.current(), hasOptions ? DECIDE_MS : QUICK_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'ctrlRes') {
      const id = setTimeout(() => {
        if (ballNow === -1) {
          setResults(x => [...x, { minute: c.minute, ball: -1, goal: false }])
          next(idx + 1)
        } else setPhase('shot')
      }, 1500)
      return () => clearTimeout(id)
    }
    if (phase === 'shotRes') {
      const id = setTimeout(() => next(idx + 1), RESULT_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'half') {
      const id = setTimeout(() => setPhase('run'), HALF_WAIT_MS)
      return () => clearTimeout(id)
    }
  }, [phase, idx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (done && !paid) {
      const f = simScore(results)
      setPaid(settle(f[0] === f[1] ? -1 : f[0] > f[1] ? 0 : 1))
    }
  }, [done, paid, results]) // eslint-disable-line react-hooks/exhaustive-deps

  const skip = () => {
    setResults(x => [...x, ...autoResults(chances.slice(x.length))])
    setIdx(chances.length)
    setClock(90)
    setPhase('end')
  }
  const shown = phase === 'half' ? results.slice(0, SIM_PER_HALF) : results

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
        {results.map((r, k) => (r.ball !== -1 ? (
          <span key={k} className={`sim-mark ${r.goal ? (r.ball === 0 ? 'is-goal' : 'is-conceded') : ''}`} style={{ left: `${(r.minute / 90) * 100}%` }}>{r.goal ? '⚽' : '·'}</span>
        ) : null))}
      </div>
      <TensionBar value={tension[0]} opp={tension[1]} label={t('sim.tension')} />
      <p className="duel-boost">{boostText}</p>

      {dec && (
        <DecisionPanel
          dec={dec} techs={techs} tension={tension[0]} chosen={chosen} onChoose={x => setChosen(chosen === x ? null : x)}
          onPick={choosePick} onGo={confirm} fast={!hasOptions} oppName={teamLabel(opp.name, locale)} phaseKey={`${idx}-${phase}`} locale={locale}
        />
      )}
      {phase === 'ctrlRes' && (
        <ResultPanel oppName={teamLabel(opp.name, locale)} c={c} kind="control" ball={ballNow} bonus={bonusNow} used={used} locale={locale} />
      )}
      {phase === 'shotRes' && last && <ResultPanel oppName={teamLabel(opp.name, locale)} c={c} kind="shot" ball={last.ball} bonus={bonusNow} used={used} res={last} locale={locale} />}
      {(phase === 'run' || phase === 'runout') && <p className="sim-run">{secondHalf ? t('sim.secondHalf') : t('sim.firstHalf')}…</p>}
      {phase === 'half' && (
        <>
          <Summary title={t('sim.halfTime')} chances={shown} />
          <section className="sim-panel">
            <h3 className="sheet-label">{t('sim.tactic')}</h3>
            <p className="fd-hint">{t('sim.tacticHint', { n: TACTIC_MOD })}</p>
            <div className="sim-tactics">
              {(['att', 'bal', 'def'] as Tactic[]).map(k => (
                <button key={k} type="button" className={`chip ${tactic === k ? 'is-on' : ''}`} onClick={() => setTactic(k)}>{t(`sim.tactic.${k}` as const)}</button>
              ))}
            </div>
            <button type="button" className="sheet-cta" onClick={() => setPhase('run')}>{t('sim.secondHalf')}</button>
          </section>
        </>
      )}
      {!done && phase !== 'half' && <button type="button" className="chip self-center" onClick={skip}>{t('duel.skip')}</button>}

      {done && (
        <div className="duel-end">
          <h2 className="fd-title">{s[0] > s[1] ? t('duel.win') : s[0] === s[1] ? t('duel.draw') : t('duel.loss')}</h2>
          <Summary title={t('duel.fullTime')} chances={results} />
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
function Summary({ title, chances }: { title: string; chances: SimResult[] }) {
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

function TensionBar({ value, opp, label }: { value: number; opp: number; label: string }) {
  return (
    <div className="sim-tension" aria-label={label}>
      <span className="sim-tension__label">{label}</span>
      <div className="sim-tension__bar">
        <i style={{ width: `${(value / TENSION_MAX) * 100}%` }} />
        <em style={{ left: `${(opp / TENSION_MAX) * 100}%` }} title={String(opp)} />
      </div>
      <b>{value}</b>
    </div>
  )
}

/** Fase con decisión: tus 3 cartas (toca otra para jugarla, cuesta tensión) y las supertécnicas de la que juega */
function DecisionPanel({ dec, techs, tension, chosen, onChoose, onPick, onGo, fast, oppName, phaseKey, locale }: {
  dec: Decision; techs: Technique[]; tension: number; chosen: Technique | null; onChoose: (t: Technique) => void
  onPick: (k: number) => void; onGo: () => void; fast: boolean; oppName: string; phaseKey: string; locale: string
}) {
  const { t } = useAppSettings()
  const mine = dec.pool[dec.pick]
  const title = dec.key === 'con' ? t('sim.control') : dec.who === 0 ? t('sim.attack', { team: t('duel.you') }) : t('sim.attack', { team: oppName })
  return (
    <section className="sim-panel">
      <h3 className="sheet-label">{title}</h3>
      <div className="sim-versus">
        <div className="sim-pool">
          {dec.pool.map((card, k) => (
            <button key={card.p.id} type="button" disabled={k === dec.pick || tension < PICK_COST} onClick={() => onPick(k)}
              className={k === dec.pick ? 'sim-pool__card is-played' : 'sim-pool__card is-pickable'}>
              <DuelCard player={card.p} size="xs" values={card.st} mod={card.mod} highlight={dec.key} />
            </button>
          ))}
        </div>
        <span className="sim-vs">{t(`hl.stat.${dec.key}` as const)}<b>{mine.st[dec.key]}</b><i>vs</i><b>{dec.opp.st[dec.oppKey]}</b>{t(`hl.stat.${dec.oppKey}` as const)}</span>
        <div className="sim-pool"><div className="sim-pool__card is-played"><DuelCard player={dec.opp.p} size="xs" values={dec.opp.st} mod={dec.opp.mod} highlight={dec.oppKey} /></div></div>
      </div>
      {!fast && (
        <>
          {tension >= PICK_COST && <p className="fd-hint">{t('sim.pick', { n: PICK_COST })}</p>}
          <div className="sim-techs">
            {techs.map(x => {
              const cost = techCost(x)
              return (
                <button key={x.id} type="button" disabled={cost > tension} onClick={() => onChoose(x)} className={`sim-tech ${chosen?.id === x.id ? 'is-on' : ''}`}>
                  <b>{techniqueName(x, locale)}</b><small>+{techBonus(x, mine)} · {cost}</small>
                </button>
              )
            })}
          </div>
          <button type="button" className="sheet-cta" onClick={onGo}>{t('sim.go')}</button>
          <i key={phaseKey} className="sim-countdown" style={{ animationDuration: `${DECIDE_MS}ms` }} />
        </>
      )}
    </section>
  )
}

/** Resultado de la fase: números con lo sumado, supertécnicas usadas y, en el ataque, probabilidad y gol */
function ResultPanel({ c, kind, ball, bonus, used, res, locale, oppName }: {
  oppName: string; c: SimChance; kind: 'control' | 'shot'; ball: 0 | 1 | -1; bonus: [number, number]; used: Used; res?: SimResult; locale: string
}) {
  const { t } = useAppSettings()
  if (kind === 'control') {
    const a = cardOf(c.control, 0), b = cardOf(c.control, 1)
    return (
      <section className="sim-panel">
        <h3 className="sheet-label">{t('sim.control')}</h3>
        <div className="sim-versus">
          <div className="sim-pool"><div className="sim-pool__card is-played"><DuelCard player={a.p} size="xs" values={a.st} mod={a.mod} highlight="con" /></div></div>
          <span className="sim-vs">{t('hl.stat.con')}<b>{a.st.con + bonus[0]}</b><i>vs</i><b>{b.st.con + bonus[1]}</b></span>
          <div className="sim-pool"><div className="sim-pool__card is-played"><DuelCard player={b.p} size="xs" values={b.st} mod={b.mod} highlight="con" /></div></div>
        </div>
        <TechUsed used={used} locale={locale} />
        <p className={`sim-verdict ${ball === 0 ? 'is-goal' : ball === 1 ? 'is-conceded' : ''}`}>{ball === -1 ? t('duel.out') : ball === 0 ? t('duel.ballYou') : t('duel.ballOpp')}</p>
      </section>
    )
  }
  const w = ball as Side
  const d = c.atk[w]
  const sc = cardOf(d, 0), df = cardOf(d, 1)
  const [ba, bd] = w === 0 ? bonus : [bonus[1], bonus[0]]
  const mine = w === 0
  return (
    <section className={`sim-panel ${res?.goal ? 'sim-panel--goal' : ''}`}>
      <h3 className="sheet-label">{t('sim.attack', { team: mine ? t('duel.you') : oppName })}</h3>
      <div className="sim-versus">
        <div className="sim-pool"><div className="sim-pool__card is-played"><DuelCard player={(mine ? sc : df).p} size="xs" values={(mine ? sc : df).st} mod={(mine ? sc : df).mod} highlight={mine ? 'att' : 'def'} /></div></div>
        <span className="sim-vs">
          {mine ? <>{t('hl.stat.att')}<b>{sc.st.att + ba}</b><i>vs</i><b>{df.st.def + bd}</b>{t('hl.stat.def')}</> : <>{t('hl.stat.def')}<b>{df.st.def + bd}</b><i>vs</i><b>{sc.st.att + ba}</b>{t('hl.stat.att')}</>}
        </span>
        <div className="sim-pool"><div className="sim-pool__card is-played"><DuelCard player={(mine ? df : sc).p} size="xs" values={(mine ? df : sc).st} mod={(mine ? df : sc).mod} highlight={mine ? 'def' : 'att'} /></div></div>
      </div>
      <TechUsed used={used} locale={locale} />
      <p className="sim-goalchance">{t('sim.chance', { n: Math.round((res?.chance ?? 0) * 100) })}</p>
      <p className={`sim-verdict ${res?.goal ? (mine ? 'is-goal' : 'is-conceded') : ''}`}>
        {res?.goal ? t('sim.goal', { name: sc.p.name }) : t('duel.saved')}
      </p>
      {res?.goal && res.assist && res.assist !== res.scorer && <p className="sim-assist">{t('sim.assist', { name: res.assist.p.name })}</p>}
    </section>
  )
}

function TechUsed({ used, locale }: { used: Used; locale: string }) {
  const { t } = useAppSettings()
  if (!used.mine && !used.opp) return null
  return (
    <p className="sim-used">
      {used.mine && <span className="is-mine">{t('sim.used', { name: techniqueName(used.mine, locale) })}</span>}
      {used.opp && <span className="is-opp">{t('sim.usedOpp', { name: techniqueName(used.opp, locale) })}</span>}
    </p>
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

