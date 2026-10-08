import { useEffect, useRef, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel, techniqueName } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import {
  SIM_CHANCES, SIM_PER_HALF, adaptRival, autoResults, cardOf, controlWinner, fatalTeam, goalChance, rivalTeam, shotResult, simScore, simTeamStats, simulate,
  chooseBoosts, perceive, type FatalCard, type SimChance, type SimResult,
} from '../../lib/fatal'
import {
  COUNTER_BONUS, HYPER, PICK_COST, PRESS, SHOUT_COST, TENSION_GAIN, TENSION_START, gainTension, techBonus, techCost, usableTechs,
} from '../../lib/tension'
import type { DuelKey } from '../../lib/duel'
import type { TranslationKey } from '../../i18n/translations'
import type { Technique } from '../../types'
import { buzz, playSfx } from '../../lib/sfx'
import DuelCard from '../DuelCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import TensionBar from './TensionBar'
import ActButton from './ActButton'
import { ElementIcon, SpecialIcon, TechniqueIcon } from '../GameIcon'
import type { PickedSquad } from './SquadPicker'

export type Paid = { coins: number; xp: number; note: string | null }

const TICK_MS = 55       // un minuto de reloj entre ocasiones
const QUICK_MS = 1600    // fase sin decisión posible: se ve el cara a cara y sigue
const RESULT_MS = 3600   // el resultado se queda en pantalla (o «Siguiente»)
const HALF_WAIT_MS = 20000
/** Cambio táctico del descanso: cuánto sube un número y cuánto baja el otro, el resto de la segunda parte */
const TACTIC_MOD = 2

type Phase = 'run' | 'control' | 'ctrlRes' | 'shot' | 'shotRes' | 'runout' | 'half' | 'end'
type Tactic = 'bal' | 'att' | 'def'
type Side = 0 | 1
type Tone = 'mine' | 'opp' | 'neutral'

interface LogEntry { minute: number; text: string; tone: Tone }

/** Una acción que se puede elegir en tu turno */
interface Action { id: string; label: string; desc: string; cost: number; bonus: number; kind: 'tech' | 'press' | 'hyper' | 'shout'; tech?: Technique }

/** Qué se decide en la fase: dónde juega mi carta y con qué número */
interface Decision { key: DuelKey; pool: FatalCard[]; pick: number; opp: FatalCard; oppKey: DuelKey; who: Side | null }

interface Outcome {
  /** Nombres de lo que usó cada uno (supertécnicas, presión…) */
  mine: string[]
  opp: string | null
  bonus: [number, number]
  shout: boolean
}

/**
 * Fatal Sim interactivo: 90 minutos (2 partes de 45) con 12 ocasiones. Cada ocasión tiene dos pasos: **medio campo**
 * (control: quién se queda el balón) y **ataque** (quien lo gana remata contra la defensa del otro). En tu turno puedes
 * gastar tensión (elegir carta, supertécnica, presión alta, hiperenergía, grito del portero); el partido espera a que
 * decidas. Una crónica va contando lo que pasa. Reglas en lib/tension.ts; ver docs/fatal-sim.md.
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
  const oppName = teamLabel(opp.name, locale)
  const [chances, setChances] = useState<SimChance[]>(init)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('run')
  const [clock, setClock] = useState(0)
  const [results, setResults] = useState<SimResult[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const [tension, setTension] = useState<[number, number]>([TENSION_START, TENSION_START])
  const [tactic, setTactic] = useState<Tactic>('bal')
  const [sel, setSel] = useState<string[]>([])
  const [outcome, setOutcome] = useState<Outcome>({ mine: [], opp: null, bonus: [0, 0], shout: false })
  const [hyperUsed, setHyperUsed] = useState(false)
  const [shoutUsed, setShoutUsed] = useState<[boolean, boolean]>([false, false])
  const [oppHyperUsed, setOppHyperUsed] = useState(false)
  const [oppShoutUsed, setOppShoutUsed] = useState<[boolean, boolean]>([false, false])
  const [oppTactic, setOppTactic] = useState<Tactic>('bal')
  const [counter, setCounter] = useState(false)
  const [paid, setPaid] = useState<Paid | null>(null)
  const [last, setLast] = useState<SimResult | null>(null)
  const [ballNow, setBallNow] = useState<0 | 1 | -1>(-1)
  const done = phase === 'end'
  const c = chances[Math.min(idx, chances.length - 1)]
  const s = simScore(results)
  const stats = [simTeamStats(me), simTeamStats(opp)]
  const secondHalf = idx > SIM_PER_HALF || (idx === SIM_PER_HALF && phase === 'run')
  const half = secondHalf ? 1 : 0

  const say = (text: string, tone: Tone, minute = c.minute) => setLog(l => [{ minute, text, tone }, ...l])

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

  const tacticBonus = (key: DuelKey) => (secondHalf && tactic !== 'bal' ? (key === 'att' ? 1 : key === 'def' ? -1 : 0) * (tactic === 'att' ? TACTIC_MOD : -TACTIC_MOD) : 0)
  const statLabel = (k: DuelKey) => t(`hl.stat.${k}` as TranslationKey)

  /** Acciones disponibles en esta fase */
  function actions(): Action[] {
    if (!dec || !myCard) return []
    const out: Action[] = usableTechs(myCard, dec.key).map(x => ({
      id: `t:${x.id}`, kind: 'tech', tech: x, label: techniqueName(x, locale), cost: techCost(x), bonus: techBonus(x, myCard), desc: t('sim.act.tech', { n: techBonus(x, myCard), stat: statLabel(dec.key) }),
    }))
    if (phase === 'control') out.push({ id: 'press', kind: 'press', label: t('sim.act.press'), cost: PRESS.cost, bonus: PRESS.bonus, desc: t('sim.act.pressDesc', { n: PRESS.bonus }) })
    if (!hyperUsed && myCard.p.specials.length) out.push({ id: 'hyper', kind: 'hyper', label: t('sim.act.hyper'), cost: HYPER.cost, bonus: HYPER.bonus, desc: t('sim.act.hyperDesc', { n: HYPER.bonus, stat: statLabel(dec.key) }) })
    if (dec.who === 1 && !shoutUsed[half]) out.push({ id: 'shout', kind: 'shout', label: t('sim.act.shout'), cost: SHOUT_COST, bonus: 0, desc: t('sim.act.shoutDesc') })
    return out
  }
  const acts = actions()
  const selCost = acts.filter(a => sel.includes(a.id)).reduce((n, a) => n + a.cost, 0)
  const free = tension[0] - selCost
  const canPick = !!dec && tension[0] >= PICK_COST
  const hasOptions = canPick || acts.some(a => a.cost <= tension[0])

  const toggle = (a: Action) => setSel(l => (l.includes(a.id) ? l.filter(x => x !== a.id) : a.cost <= free ? [...l, a.id] : l))

  const choosePick = (k: number) => {
    if (!dec || k === dec.pick || free < PICK_COST) return
    setTension(([a, b]) => [a - PICK_COST, b])
    playSfx('pick')
    setSel([])
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

  /** Táctica de la IA (en la segunda parte): +/- TACTIC_MOD al ataque y la defensa */
  const oppTacticBonus = (key: DuelKey) => (secondHalf && oppTactic !== 'bal' ? (key === 'att' ? 1 : key === 'def' ? -1 : 0) * (oppTactic === 'att' ? TACTIC_MOD : -TACTIC_MOD) : 0)

  /**
   * La IA decide sus refuerzos como un jugador: mira cuánto le falta (con tus números vistos con error y sin saber qué vas
   * a usar), y gasta lo más barato que cubra la diferencia: supertécnica, presión alta, hiperenergía o grito del portero.
   */
  function aiPlan(d: Decision, mine: FatalCard): { bonus: number; cost: number; names: string[]; tech: Technique | null; shout: boolean; hyper: boolean } {
    const own = d.opp
    const ownNum = own.st[d.oppKey] + oppTacticBonus(d.oppKey)
    const myNum = perceive(mine.st[d.key] + tacticBonus(d.key) + (phase === 'control' && counter ? COUNTER_BONUS : 0))
    const none = { bonus: 0, cost: 0, names: [] as string[], tech: null, shout: false, hyper: false }
    // grito del portero: si defiende y tu ataque tiene muchas opciones
    if (d.who === 0 && !oppShoutUsed[half] && tension[1] >= SHOUT_COST && goalChance(mine.st.att, own.st.def) >= 0.5 && Math.random() < 0.85) {
      return { ...none, cost: SHOUT_COST, shout: true, names: [t('sim.act.shout')] }
    }
    const techs = usableTechs(own, d.oppKey)
    const opts: { id: string; cost: number; bonus: number }[] = techs.map(x => ({ id: `t:${x.id}`, cost: techCost(x), bonus: techBonus(x, own) }))
    if (phase === 'control') opts.push({ id: 'press', cost: PRESS.cost, bonus: PRESS.bonus })
    if (!oppHyperUsed && own.p.specials.length) opts.push({ id: 'hyper', cost: HYPER.cost, bonus: HYPER.bonus })
    // control: hay que superar tu número; ataque: llegar a la altura de tu defensa + 5; defensa: dejar tu ataque a ≤ 1
    const need = d.key === 'con' ? myNum - ownNum + 1 : d.who === 0 ? myNum - ownNum - 1 : myNum - ownNum + 6
    const picked = chooseBoosts(opts, need, tension[1], 2)
    if (!picked.length) return none
    const tech = techs.find(x => picked.some(o => o.id === `t:${x.id}`)) ?? null
    return {
      bonus: picked.reduce((n, o) => n + o.bonus, 0), cost: picked.reduce((n, o) => n + o.cost, 0), tech, shout: false, hyper: picked.some(o => o.id === 'hyper'),
      names: picked.map(o => (o.id === 'press' ? t('sim.act.press') : o.id === 'hyper' ? t('sim.act.hyper') : tech ? techniqueName(tech, locale) : '')),
    }
  }

  function confirm() {
    if (!dec || !myCard) return
    const chosen = acts.filter(a => sel.includes(a.id) && a.cost <= tension[0])
    const ai = aiPlan(dec, myCard)
    const spent: [number, number] = [chosen.reduce((n, a) => n + a.cost, 0), ai.cost]
    const bm = chosen.reduce((n, a) => n + a.bonus, 0) + tacticBonus(dec.key) + (phase === 'control' && counter ? COUNTER_BONUS : 0)
    const bo = ai.bonus + oppTacticBonus(dec.oppKey)
    if (ai.hyper) setOppHyperUsed(true)
    if (ai.shout) setOppShoutUsed(([a, b]) => (half ? [a, true] : [true, b]))
    const shout = chosen.some(a => a.kind === 'shout') || ai.shout
    if (chosen.some(a => a.kind === 'hyper')) setHyperUsed(true)
    if (shout) setShoutUsed(([a, b]) => (half ? [a, true] : [true, b]))
    const names = chosen.map(a => a.label)
    setOutcome({ mine: names, opp: ai.names.length ? ai.names.join(' + ') : null, bonus: [bm, bo], shout })
    setSel([])
    if (phase === 'control') {
      const ball = controlWinner(c, [bm, bo])
      setBallNow(ball)
      setCounter(false)
      setTension(([a, b]) => [
        gainTension(a - spent[0], ball === 0 ? TENSION_GAIN.ballWon : TENSION_GAIN.ballLost),
        gainTension(b - spent[1], ball === 1 ? TENSION_GAIN.ballWon : TENSION_GAIN.ballLost),
      ])
      const a = cardOf(c.control, 0), b = cardOf(c.control, 1)
      say(ball === -1 ? t('sim.log.out') : t('sim.log.ctrl', { name: (ball === 0 ? a : b).p.name, team: ball === 0 ? t('duel.you') : oppName }), ball === 0 ? 'mine' : ball === 1 ? 'opp' : 'neutral')
      setPhase('ctrlRes')
      return
    }
    const who = dec.who as Side
    const bonus: [number, number] = who === 0 ? [bm, bo] : [bo, bm]
    const r = shotResult(c, who, bonus)
    const goal = r.goal && !shout
    const res: SimResult = { minute: c.minute, ball: who, goal, chance: r.chance, scorer: r.scorer, assist: r.assist }
    setLast(res)
    setResults(x => [...x, res])
    setTension(([a, b]) => {
      const gain = (side: Side) => (goal ? (side === who ? TENSION_GAIN.goal : 0) : (side !== who ? TENSION_GAIN.saved : 0))
      return [gainTension(a - spent[0], gain(0)), gainTension(b - spent[1], gain(1))]
    })
    const defender = cardOf(c.atk[who], 1)
    const assist = r.assist !== r.scorer ? t('sim.log.assist', { name: r.assist.p.name }) : ''
    if (goal) {
      say(t('sim.log.goal', { team: who === 0 ? t('duel.you') : oppName, name: r.scorer.p.name, def: defender.p.name }) + assist, who === 0 ? 'mine' : 'opp')
      playSfx(who === 0 ? 'goal' : 'lose')
      buzz(who === 0 ? 'goal' : 'conceded')
    } else {
      say(shout ? t('sim.log.shout') : t('sim.log.saved', { def: defender.p.name, name: r.scorer.p.name }), who === 0 ? 'opp' : 'mine')
      playSfx(shout ? 'shout' : 'tick')
      if (shout) buzz('tap')
      if (who === 1) setCounter(true)
    }
    setPhase('shotRes')
  }
  const act = useRef(confirm)
  act.current = confirm

  const next = (nextIdx: number) => {
    setIdx(nextIdx)
    setOutcome({ mine: [], opp: null, bonus: [0, 0], shout: false })
    setLast(null)
    setPhase(nextIdx === SIM_PER_HALF || nextIdx === chances.length ? 'runout' : 'run')
  }
  const advance = () => {
    if (phase === 'ctrlRes') {
      if (ballNow === -1) {
        setResults(x => [...x, { minute: c.minute, ball: -1, goal: false }])
        next(idx + 1)
      } else setPhase('shot')
    } else if (phase === 'shotRes') next(idx + 1)
  }
  const adv = useRef(advance)
  adv.current = advance

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

  // la IA, como tú, puede pagar para jugar la mejor de sus 3 cartas (si le compensa y le llega la tensión)
  const aiPicked = useRef('')
  useEffect(() => {
    if ((phase !== 'control' && phase !== 'shot') || (phase === 'shot' && ballNow === -1)) return
    const key = `${idx}-${phase}`
    if (aiPicked.current === key || !dec || !myCard) return
    aiPicked.current = key
    const pool = dec.who === 0 ? c.atk[0].pools[1] : dec.who === 1 ? c.atk[1].pools[0] : c.control.pools[1]
    const cur = pool.indexOf(dec.opp)
    const bestI = pool.reduce((b, x, i) => (x.st[dec.oppKey] > pool[b].st[dec.oppKey] ? i : b), 0)
    const gain = pool[bestI].st[dec.oppKey] - dec.opp.st[dec.oppKey]
    const close = Math.abs(myCard.st[dec.key] - dec.opp.st[dec.oppKey]) <= 10
    if (bestI === cur || gain < 3 || !close || tension[1] < PICK_COST + 20) return
    setTension(([a, b]) => [a, b - PICK_COST])
    setChances(list => list.map((x, i) => {
      if (i !== idx) return x
      if (phase === 'control') return { ...x, control: { ...x.control, pick: [x.control.pick[0], bestI] } }
      const w = ballNow as Side
      const d = x.atk[w]
      const pick: [number, number] = w === 0 ? [d.pick[0], bestI] : [bestI, d.pick[1]]
      const atk: [typeof d, typeof d] = w === 0 ? [{ ...d, pick }, x.atk[1]] : [x.atk[0], { ...d, pick }]
      return { ...x, atk }
    }))
    say(t('sim.log.aiSwap', { name: pool[bestI].p.name }), 'opp')
  }, [phase, idx, ballNow]) // eslint-disable-line react-hooks/exhaustive-deps

  // decisiones (esperan si hay algo que decidir) y resultados (se quedan en pantalla)
  useEffect(() => {
    if (phase === 'control' || phase === 'shot') {
      if (phase === 'shot' && ballNow === -1) return
      if (hasOptions) return
      const id = setTimeout(() => act.current(), QUICK_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'ctrlRes' || phase === 'shotRes') {
      const id = setTimeout(() => adv.current(), RESULT_MS)
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

  useEffect(() => {
    if (phase === 'half') { say(t('sim.log.half', { a: s[0], b: s[1] }), 'neutral', 45); setOppTactic(s[1] < s[0] ? 'att' : s[1] > s[0] ? 'def' : 'bal') }
    if (phase === 'end') say(t('sim.log.end', { a: s[0], b: s[1] }), 'neutral', 90)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const skip = () => {
    setResults(x => [...x, ...autoResults(chances.slice(x.length))])
    setIdx(chances.length)
    setClock(90)
    setPhase('end')
  }

  const step = phase === 'control' || phase === 'ctrlRes' ? 0 : phase === 'shot' || phase === 'shotRes' ? 1 : -1
  const resultStep = phase === 'ctrlRes' || phase === 'shotRes'

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
          <span className="sim-team__name">{oppName}</span>
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
      <TensionBar value={tension[0]} spend={selCost} opp={tension[1]} label={t('sim.tension')} />

      {!done && <section className="sim-stage">
        {step >= 0 && (
          <>
            <header className="sim-stage__head">
              <small>{t('sim.chanceN', { n: Math.min(idx + 1, SIM_CHANCES), total: SIM_CHANCES })} · {c.minute}'</small>
              <ol className="sim-steps">
                {(['control', 'attack', 'result'] as const).map((k, i) => (
                  <li key={k} className={(i === 2 ? resultStep : i === step && !resultStep) ? 'is-on' : i < step || (i < 2 && resultStep && i <= step) ? 'is-done' : ''}>{t(`sim.step.${k}` as TranslationKey)}</li>
                ))}
              </ol>
            </header>
            <p className="sim-say">{narration()}</p>
          </>
        )}
        {(phase === 'run' || phase === 'runout') && <p className="sim-run">{secondHalf ? t('sim.secondHalf') : t('sim.firstHalf')}…</p>}
        {dec && myCard && <FaceOff mine={myCard} theirs={dec.opp} myKey={dec.key} theirKey={dec.oppKey} bonus={[selBonus(), 0]} oppName={oppName} />}
        {resultStep && <ResultFace c={c} phase={phase} ball={ballNow} last={last} outcome={outcome} oppName={oppName} />}

        {dec && myCard && hasOptions && (
          <div className="sim-turn">
            <p className="sim-turn__head"><b>{t('sim.yourTurn')}</b><small>{t('sim.waits')}</small></p>
            {canPick && dec.pool.length > 1 && (
              <div className="sim-switch">
                <small>{t('sim.switch', { n: PICK_COST })}</small>
                <div>
                  {dec.pool.map((card, k) => k === dec.pick ? null : (
                    <button key={card.p.id} type="button" disabled={free < PICK_COST} onClick={() => choosePick(k)}>
                      <b>{card.p.name}</b><span>{card.st[dec.key]}{card.st[dec.key] > myCard.st[dec.key] ? ' ▲' : card.st[dec.key] < myCard.st[dec.key] ? ' ▼' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="sim-acts">
              {acts.map(a => (
                <ActButton key={a.id} label={a.label} desc={a.desc} cost={a.cost} on={sel.includes(a.id)} disabled={!sel.includes(a.id) && a.cost > free} onClick={() => toggle(a)}
                  tone={a.tech?.element ?? (a.kind === 'tech' ? 'none' : a.kind)}
                  icon={a.tech ? <><TechniqueIcon type={a.tech.type} traits={a.tech.traits} className="act-icon" />{a.tech.element && <ElementIcon element={a.tech.element} className="act-icon act-icon--el" />}</>
                    : a.kind === 'hyper' ? <SpecialIcon type={myCard!.p.specials[0].type} className="act-icon" /> : <span className="act-glyph">{a.kind === 'press' ? '⚡' : '🧤'}</span>} />
              ))}
            </div>
            <button type="button" className="sheet-cta" onClick={confirm}>{t('sim.go')}{selCost ? ` (−${selCost})` : ''}</button>
          </div>
        )}
        {dec && !hasOptions && <p className="sim-hint">{t('sim.noTension')}</p>}

        {phase === 'half' && (
          <>
            <Summary title={t('sim.halfTime')} chances={results} />
            <div className="sim-turn">
              <p className="sim-turn__head"><b>{t('sim.tactic')}</b></p>
              <p className="sim-hint">{t('sim.tacticHint', { n: TACTIC_MOD })}</p>
              <div className="sim-tactics">
                {(['att', 'bal', 'def'] as Tactic[]).map(k => (
                  <button key={k} type="button" className={`chip ${tactic === k ? 'is-on' : ''}`} onClick={() => setTactic(k)}>{t(`sim.tactic.${k}` as TranslationKey)}</button>
                ))}
              </div>
              <button type="button" className="sheet-cta" onClick={() => setPhase('run')}>{t('sim.secondHalf')}</button>
            </div>
          </>
        )}
        {resultStep && <button type="button" className="sim-next" onClick={advance}>{t('sim.next')} ▶</button>}
      </section>}

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

      <section className="sim-log">
        <h3 className="sheet-label">{t('sim.log')}</h3>
        <ul>
          {log.slice(0, 6).map((e, i) => <li key={`${log.length - i}`} className={`is-${e.tone}`}><b>{e.minute}'</b><span>{e.text}</span></li>)}
          {!log.length && <li className="is-neutral"><span>{t('sim.log.start')}</span></li>}
        </ul>
      </section>
      <p className="duel-boost">{boostText}</p>
    </Screen>
  )

  /** Lo que sumarían las acciones elegidas (para enseñarlo ya en los números) */
  function selBonus() {
    return acts.filter(a => sel.includes(a.id)).reduce((n, a) => n + a.bonus, 0) + (dec ? tacticBonus(dec.key) : 0) + (phase === 'control' && counter ? COUNTER_BONUS : 0)
  }

  /** Una frase que dice qué está pasando */
  function narration(): string {
    if (phase === 'control') return counter ? `${t('sim.say.control')} ${t('sim.say.counter', { n: COUNTER_BONUS })}` : t('sim.say.control')
    if (phase === 'ctrlRes') return ballNow === -1 ? t('sim.say.outRes') : ballNow === 0 ? t('sim.say.ballYou') : t('sim.say.ballOpp', { team: oppName })
    if (phase === 'shot' && dec) return dec.who === 0 ? t('sim.say.myAttack', { name: cardOf(c.atk[0], 0).p.name }) : t('sim.say.oppAttack', { team: oppName, name: cardOf(c.atk[1], 0).p.name })
    if (phase === 'shotRes' && last) return last.goal ? t('sim.say.goal') : t('sim.say.noGoal')
    return ''
  }
}

/** Cara a cara: mi carta (y las tácticas/acciones ya contadas en el número) contra la del rival */
function FaceOff({ mine, theirs, myKey, theirKey, bonus, oppName }: { mine: FatalCard; theirs: FatalCard; myKey: DuelKey; theirKey: DuelKey; bonus: [number, number]; oppName: string }) {
  const { t } = useAppSettings()
  const a = mine.st[myKey] + bonus[0]
  const b = theirs.st[theirKey] + bonus[1]
  return (
    <div className="sim-face">
      <div className="sim-side sim-side--mine">
        <small>{t('duel.you')}</small>
        <DuelCard player={mine.p} size="sm" values={mine.st} mod={mine.mod} highlight={myKey} />
      </div>
      <div className="sim-nums">
        <small>{t(`hl.stat.${myKey}` as TranslationKey)}</small>
        <b className={bonus[0] ? 'is-boost' : ''}>{a}</b>
        <i>vs</i>
        <b>{b}</b>
        <small>{t(`hl.stat.${theirKey}` as TranslationKey)}</small>
      </div>
      <div className="sim-side sim-side--opp">
        <small>{oppName}</small>
        <DuelCard player={theirs.p} size="sm" values={theirs.st} mod={theirs.mod} highlight={theirKey} />
      </div>
    </div>
  )
}

/** Resultado de la fase con los números finales, lo que se usó y, en el ataque, la probabilidad y el gol */
function ResultFace({ c, phase, ball, last, outcome, oppName }: { c: SimChance; phase: Phase; ball: 0 | 1 | -1; last: SimResult | null; outcome: Outcome; oppName: string }) {
  const { t } = useAppSettings()
  const [bm, bo] = outcome.bonus
  const used = (
    <p className="sim-used">
      {outcome.mine.length > 0 && <span className="is-mine">{t('sim.used', { name: outcome.mine.join(' + ') })}</span>}
      {outcome.opp && <span className="is-opp">{t('sim.usedOpp', { name: outcome.opp })}</span>}
    </p>
  )
  if (phase === 'ctrlRes') {
    const a = cardOf(c.control, 0), b = cardOf(c.control, 1)
    return (
      <>
        <FaceOff mine={a} theirs={b} myKey="con" theirKey="con" bonus={[bm, bo]} oppName={oppName} />
        {used}
        <p className={`sim-verdict ${ball === 0 ? 'is-goal' : ball === 1 ? 'is-conceded' : ''}`}>{ball === -1 ? t('duel.out') : ball === 0 ? t('duel.ballYou') : t('duel.ballOpp')}</p>
      </>
    )
  }
  if (!last || ball === -1) return null
  const w = ball as Side
  const d = c.atk[w]
  const sc = cardOf(d, 0), df = cardOf(d, 1)
  const [ba, bd] = w === 0 ? [bm, bo] : [bo, bm]
  const mine = w === 0
  return (
    <div className={last.goal ? 'sim-goalbox' : ''}>
      <FaceOff mine={mine ? sc : df} theirs={mine ? df : sc} myKey={mine ? 'att' : 'def'} theirKey={mine ? 'def' : 'att'} bonus={[mine ? ba : bd, mine ? bd : ba]} oppName={oppName} />
      {used}
      <p className="sim-goalchance">{t('sim.chance', { n: Math.round((last.chance ?? goalChance(sc.st.att + ba, df.st.def + bd)) * 100) })}</p>
      <p className={`sim-verdict ${last.goal ? (mine ? 'is-goal' : 'is-conceded') : ''}`}>{last.goal ? t('sim.goal', { name: sc.p.name }) : outcome.shout ? t('sim.shout') : t('duel.saved')}</p>
      {last.goal && last.assist && last.assist !== last.scorer && <p className="sim-assist">{t('sim.assist', { name: last.assist.p.name })}</p>}
    </div>
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
