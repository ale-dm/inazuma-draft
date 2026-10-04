import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel, teamLogo } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import { duelReward, type DuelKey } from '../../lib/duel'
import { getFormation } from '../../lib/lineup'
import { fieldY } from '../pitch/Pitch'
import {
  FATAL_ROUNDS, SIM_CHANCES, aiLead, adaptRivalDuel, aiRespond, chooseBoosts, counter, fatalTeam, finalResult, needsTiebreak, perceive, playRound, rivalTeam,
  score, simScore, simulate, tiebreak, total, weeklyBoost,
  type FatalCard, type FatalTeam, type Round, type SimChance,
} from '../../lib/fatal'
import { addCoins, addXp, track } from '../../lib/club'
import { addDraftResult, addSeriesResult, findSeries } from '../../lib/fatal-series'
import { playSfx } from '../../lib/sfx'
import type { TranslationKey } from '../../i18n/translations'
import type { Technique } from '../../types'
import DuelCard from '../DuelCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import { ElementIcon, TechniqueIcon } from '../GameIcon'
import SimMatch from './SimMatch'
import TensionBar from './TensionBar'
import ActButton from './ActButton'

import { COMBO_DISCOUNT, COMBO_MAX, DUEL_TENSION, comboCost, gainTension, techBonus, techCost, usableTechs } from '../../lib/tension'
import { techniqueName } from '../../data/catalog'
import SquadPicker, { draftSquad, type PickedSquad } from './SquadPicker'
import { DRAFT_HASH, FATAL_DRAFT_HASH } from '../../lib/route'

export type DuelSource = 'club' | 'sim' | 'draft' | 'draftsim'

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

type Paid = { coins: number; xp: number; note: string | null }
/** Tras cada partido: puntos de la serie / división de Fatal (texto para enseñar), o null fuera de Fatal */
type OnResult = (res: 0 | 1 | -1) => string | null

function payout(res: 0 | 1 | -1, onResult: OnResult): Paid {
  const r = duelReward(res === 0 ? [1, 0] : res === 1 ? [0, 1] : [0, 0])
  addCoins(r.coins)
  addXp(r.xp)
  track('duels')
  if (res === 0) track('duelWins')
  playSfx(res === 0 ? 'qualify' : 'pick')
  return { ...r, note: onResult(res) }
}

/**
 * Duelo = el Fatal de MADFUT (ver lib/fatal.ts y docs/duelo.md). Mi club y Draft: 10 rondas por turnos con desempate.
 * Simulación: 6 ocasiones automáticas con una plantilla del club.
 */
export default function Duel({ source, seriesId }: { source: DuelSource; seriesId?: string }) {
  const { t } = useAppSettings()
  // Fatal Draft se juega con el último draft; Mi club y Simulación, con una de Mis plantillas
  const [picked, setPicked] = useState<PickedSquad | null>(() => (source === 'draft' || source === 'draftsim' ? draftSquad(t('duel.you')) : null))
  const [game, setGame] = useState(0)
  const boost = useMemo(() => weeklyBoost(), [])
  const series = seriesId ? findSeries(seriesId) ?? null : null

  const onResult: OnResult = res => {
    if (source === 'draft' || source === 'draftsim') {
      const r = addDraftResult(res)
      return r.promoted ? t('fatal.promoted') : t('fatal.divPoints', { n: r.points })
    }
    if (!series) return null
    const r = addSeriesResult(series, res)
    return r.completed ? t('fatal.seriesDone') : r.points ? t('fatal.seriesPoints', { n: r.points }) : null
  }

  const title = `${t('hub.duel')} · ${t(source === 'club' ? 'hub.duelClub' : source === 'sim' ? 'hub.duelSim' : source === 'draftsim' ? 'sim.title' : 'hub.draft')}${series ? ` ${series.cap ?? 'X'}` : ''}`
  const boostText = t('duel.boost', { n: boost.amount, what: boost.kind === 'game' ? boost.value : t(`element.${boost.value}` as TranslationKey) })

  if (!picked && (source === 'draft' || source === 'draftsim')) {
    return (
      <Screen title={title}>
        <p className="fd-hint">{t('fdr.noDraft')}</p>
        <a href={DRAFT_HASH} className="sheet-cta">{t('fdr.makeDraft')}</a>
      </Screen>
    )
  }

  if (!picked) {
    return (
      <Screen title={title}>
        <p className="fd-hint">{t(source === 'sim' ? 'duel.simRules' : 'duel.rules', { n: SIM_CHANCES })}</p>
        <p className="duel-boost">{boostText}</p>
        {series && <p className="fd-hint">{t('fatal.cap', { n: series.cap ?? 'X' })}</p>}
        <SquadPicker cap={series?.cap ?? null} onPick={s => { setPicked(s); setGame(g => g + 1) }} />
      </Screen>
    )
  }

  const again = () => setGame(g => g + 1)
  const back = source === 'draft' || source === 'draftsim' ? FATAL_DRAFT_HASH : '#/fatal'
  return source === 'sim' || source === 'draftsim'
    ? <SimMatch key={game} title={title} squad={picked} boostText={boostText} settle={res => payout(res, onResult)} onAgain={again} backHref={back} />
    : <FatalMatch key={game} title={title} squad={picked} boostText={boostText} onAgain={again} onResult={onResult} backHref={back} />
}

// ---------------------------------------------------------------- Mi club / Draft

type Step = 'pick' | 'prep' | 'think' | 'reveal'
/** Qué se jugó en cada ronda: las cartas originales (para marcarlas como usadas) y las supertécnicas */
interface Meta { orig: [FatalCard, FatalCard] }
/** Una ronda ya resuelta, que se enseña poco a poco (rv 0–3) y se aplica al marcador al llegar al veredicto */
interface Plan {
  index: number
  round: Round
  orig: [FatalCard, FatalCard]
  myKey: DuelKey
  theirKey: DuelKey
  base: [number, number]
  bonus: [number, number]
  mineTech: Technique | null
  oppTech: Technique | null
  tension: [number, number]
  combo: number
  gain: [number, number]
}

const DUEL_THINK_MS = 1400
const AI_LEAD_MS = 1300

const withBonus = (c: FatalCard, k: DuelKey, n: number): FatalCard => (n ? { ...c, st: { ...c.st, [k]: c.st[k] + n } } : c)

function FatalMatch({ title, squad, boostText, onAgain, onResult, backHref }: { title: string; squad: PickedSquad; boostText: string; onAgain: () => void; onResult: OnResult; backHref: string }) {
  const { t, locale } = useAppSettings()
  const [m, setM] = useState<Match>(() => {
    const me = fatalTeam(t('duel.you'), squad.lineup, squad.captain, squad.formation)
    const opp = adaptRivalDuel(me, rivalTeam(teamRating(squad.xi)))
    return { me, opp, myHand: me.cards, oppHand: opp.cards, rounds: [], first: Math.random() < 0.5 ? 0 : 1, pending: null }
  })
  const [metas, setMetas] = useState<Meta[]>([])
  const [sel, setSel] = useState<FatalCard | null>(null)
  const [paid, setPaid] = useState<Paid | null>(null)
  const [step, setStep] = useState<Step>('pick')
  const [choice, setChoice] = useState<{ card: FatalCard; stat: DuelKey } | null>(null)
  const [techSel, setTechSel] = useState<string | null>(null)
  const [tension, setTension] = useState<[number, number]>([DUEL_TENSION.start, DUEL_TENSION.start])
  const [combo, setCombo] = useState(0)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [rv, setRv] = useState(0)
  const [theirsHidden, setTheirsHidden] = useState<FatalCard | null>(null)
  const applied = useRef(false)

  const i = m.rounds.length
  const over = i >= FATAL_ROUNDS
  const lead: 0 | 1 = ((m.first + i) % 2) as 0 | 1
  const s = score(m.rounds)
  const tb = over && needsTiebreak(s) ? tiebreak(m.myHand[0], m.oppHand[0]) : null
  const result = over ? finalResult(s, tb) : null
  const last = m.rounds[i - 1]
  const played = new Set(metas.flatMap(x => x.orig))

  // la máquina lleva: se toma un momento y elige al empezar su ronda
  useEffect(() => {
    if (over || lead !== 1 || m.pending || step !== 'pick') return
    const id = setTimeout(() => setM(x => ({ ...x, pending: aiLead(x.oppHand, x.myHand) })), AI_LEAD_MS)
    return () => clearTimeout(id)
  }, [over, lead, m.pending, step])

  useEffect(() => {
    if (result !== null && !paid && step === 'pick') setPaid(payout(result, onResult))
  }, [result, paid, step])

  const myTechs = choice ? usableTechs(choice.card, choice.stat) : []
  const techCostNow = (x: Technique) => comboCost(x, combo)
  const selTech = myTechs.find(x => x.id === techSel) ?? null
  const preview = selTech && techCostNow(selTech) <= tension[0] ? techBonus(selTech, choice!.card) : 0

  /** Prepara la jugada: elegir supertécnica (si hay) y confirmar */
  function startPlay(card: FatalCard, stat: DuelKey) {
    setChoice({ card, stat })
    setTechSel(null)
    setStep('prep')
  }

  /** Confirmado: si llevo yo, el rival elige su respuesta; si lleva él, se descubre ya */
  function play() {
    if (!choice) return
    if (lead === 1 && m.pending) {
      beginReveal(choice, m.pending.card, m.pending.stat)
    } else {
      const theirs = aiRespond(m.oppHand, choice.stat, choice.card, m.myHand)
      setTheirsHidden(theirs)
      setStep('think')
      setTimeout(() => beginReveal(choice, theirs, counter(choice.stat)), DUEL_THINK_MS)
    }
  }

  /** La IA usa su supertécnica si con ella pasa de perder (o de ganar por muy poco) a ganar, viendo tu número con error */
  function aiTech(card: FatalCard, key: DuelKey, myNum: number): Technique | null {
    const techs = usableTechs(card, key)
    const opts = techs.map(x => ({ id: x.id, cost: techCost(x), bonus: techBonus(x, card) }))
    const pick = chooseBoosts(opts, perceive(myNum) - card.st[key] + 1, tension[1], 1)[0]
    return pick ? techs.find(x => x.id === pick.id) ?? null : null
  }

  function beginReveal(mine: { card: FatalCard; stat: DuelKey }, theirs: FatalCard, theirKey: DuelKey) {
    const myKey = lead === 0 ? mine.stat : counter(m.pending!.stat)
    const mineTech = selTech && comboCost(selTech, combo) <= tension[0] ? selTech : null
    const oppTech = aiTech(theirs, theirKey, mine.card.st[myKey])
    const bm = mineTech ? techBonus(mineTech, mine.card) : 0
    const bo = oppTech ? techBonus(oppTech, theirs) : 0
    const statLead = lead === 0 ? myKey : theirKey
    const round = playRound(lead, statLead, withBonus(mine.card, myKey, bm), withBonus(theirs, theirKey, bo))
    const w = round.winner
    const gain: [number, number] = [w === 0 ? DUEL_TENSION.win : w === 1 ? DUEL_TENSION.lose : DUEL_TENSION.draw, w === 1 ? DUEL_TENSION.win : w === 0 ? DUEL_TENSION.lose : DUEL_TENSION.draw]
    const spent: [number, number] = [mineTech ? comboCost(mineTech, combo) : 0, oppTech ? techCost(oppTech) : 0]
    // combo: ganar usando supertécnica sube un nivel; usarla sin ganar (o perder) lo pierde
    const newCombo = mineTech ? (w === 0 ? Math.min(COMBO_MAX, combo + 1) : 0) : w === 1 ? 0 : combo
    setPlan({
      index: i, round, orig: [mine.card, theirs], myKey, theirKey, base: [mine.card.st[myKey], theirs.st[theirKey]], bonus: [bm, bo], mineTech, oppTech,
      tension: [gainTension(tension[0] - spent[0], gain[0]), gainTension(tension[1] - spent[1], gain[1])], combo: newCombo, gain,
    })
    applied.current = false
    setTheirsHidden(theirs)
    setRv(0)
    setStep('reveal')
  }

  // la ronda se descubre poco a poco: rival boca abajo → se da la vuelta → supertécnicas → veredicto
  useEffect(() => {
    if (step !== 'reveal' || !plan) return
    if (rv >= 3) return
    const wait = rv === 0 ? 900 : rv === 1 ? 1300 : plan.mineTech || plan.oppTech ? 1500 : 500
    const id = setTimeout(() => setRv(x => x + 1), wait)
    return () => clearTimeout(id)
  }, [step, plan, rv])

  // al llegar al veredicto se apunta la ronda
  useEffect(() => {
    if (step !== 'reveal' || !plan || rv < 3 || applied.current) return
    applied.current = true
    const { round, orig } = plan
    if (round.winner === 0) playSfx('goal')
    setM(x => ({ ...x, myHand: x.myHand.filter(c => c !== orig[0]), oppHand: x.oppHand.filter(c => c !== orig[1]), rounds: [...x.rounds, round], pending: null }))
    setMetas(x => [...x, { orig }])
    setTension(plan.tension)
    setCombo(plan.combo)
  }, [step, plan, rv])

  function next() {
    setStep('pick')
    setChoice(null)
    setSel(null)
    setTechSel(null)
    setPlan(null)
    setTheirsHidden(null)
    setRv(0)
  }

  function leadWith(stat: DuelKey) {
    if (!sel) return
    startPlay(sel, stat)
  }

  const [page, setPage] = useState(0)
  const pager = useRef<HTMLDivElement>(null)
  const goPage = (n: number) => pager.current?.scrollTo({ left: n * pager.current.clientWidth, behavior: 'smooth' })

  function tapMine(c: FatalCard) {
    if (over || played.has(c) || step !== 'pick') return
    if (lead === 1) { if (m.pending) { setSel(c); startPlay(c, counter(m.pending.stat)) } }
    else setSel(c === sel ? null : c)
  }

  const endBlock = over && step === 'pick' && (
    <div className="duel-end">
      <h2 className="fd-title">{result === 0 ? t('duel.win') : result === -1 ? t('duel.draw') : t('duel.loss')}</h2>
      {tb !== null && (
        <div className="duel-tb">
          <small className="sheet-label">{t('duel.tiebreak')}</small>
          <div className="duel-round">
            <DuelCard player={m.myHand[0].p} size="xs" values={m.myHand[0].st} mod={m.myHand[0].mod} />
            <span className="duel-line"><b>{total(m.myHand[0])} – {total(m.oppHand[0])}</b><span>{t('duel.tbRule')}</span></span>
            <DuelCard player={m.oppHand[0].p} size="xs" values={m.oppHand[0].st} mod={m.oppHand[0].mod} />
          </div>
        </div>
      )}
      {paid && <p className="reward-line">+<Coin className="w-5 h-5" /> {paid.coins} · +{paid.xp} XP</p>}
      {paid?.note && <p className="fatal-note">{paid.note}</p>}
      <div className="duel-end__actions">
        <button type="button" className="sheet-cta" onClick={onAgain}>{t('duel.again')}</button>
        <a href={backHref} className="chip">{t('fatal.back')}</a>
      </div>
    </div>
  )

  return (
    <Screen title={title}>
      <div className="fatal-top">
        <span className="fatal-dots">
          {Array.from({ length: FATAL_ROUNDS }, (_, k) => {
            const r = m.rounds[k]
            return <i key={k} className={r ? (r.winner === 0 ? 'w' : r.winner === 1 ? 'l' : 'd') : k === i ? 'now' : ''} />
          })}
        </span>
        <div className="duel-score duel-score--compact">
          <span className="duel-score__team">{t('duel.you')}</span>
          <b>{s[0]}</b><i>–</i><b>{s[1]}</b>
          <span className="duel-score__team">{teamLabel(m.opp.name, locale)}</span>
          <small className="duel-score__round">{over ? t('duel.fullTime') : lead === 0 ? t('duel.youLead') : t('duel.rivalLeads')} · {boostText}</small>
        </div>
        <TensionBar value={tension[0]} spend={step === 'prep' && preview ? techCostNow(selTech!) : 0} opp={tension[1]} label={t('sim.tension')} />
        {combo > 0 && <p className="duel-combo">{t('duel.combo', { n: combo, p: Math.round(combo * COMBO_DISCOUNT * 100) })}</p>}
      </div>

      {endBlock}

      <div className="fatal-field">
        <div className="fatal-pager" ref={pager} onScroll={e => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          <section className="fatal-page">
            <FatalPitch team={m.me} used={played} selected={sel} highlight={lead === 1 && m.pending ? counter(m.pending.stat) : undefined} onTap={tapMine} />
          </section>
          <section className="fatal-page">
            <FatalPitch team={m.opp} used={played} hidden pending={m.pending?.card ?? null} />
          </section>
        </div>
        <div className="fatal-tabs">
          <button type="button" className={page === 0 ? 'on' : ''} onClick={() => goPage(0)} aria-label={t('duel.you')}>{t('duel.you')}</button>
          <button type="button" className={page === 1 ? 'on' : ''} onClick={() => goPage(1)} aria-label={t('duel.rival')}>{t('duel.rival')}</button>
        </div>
      </div>

      {!over && step === 'pick' && (
        <div className="fatal-bar">
          {lead === 1 ? (
            m.pending ? (
              <div className="fatal-hint-row duel-pop" key="hint">
                <Hint card={m.pending.card} stat={m.pending.stat} />
                <p>{t('duel.respond', { k: t(STAT_KEY[m.pending.stat]), mine: t(STAT_KEY[counter(m.pending.stat)]) })}</p>
              </div>
            ) : (
              <p className="duel-thinking">{t('duel.thinking')}<span className="dots"><i /><i /><i /></span></p>
            )
          ) : sel ? (
            <div className="duel-stats-pick">
              {(['att', 'con', 'def'] as const).map(k => (
                <button key={k} type="button" className={`duel-stat-btn ic__stat--${k}`} onClick={() => leadWith(k)}>
                  <small>{t(STAT_KEY[k])}</small><b>{sel.st[k]}</b><em>{t('duel.vs', { k: t(STAT_KEY[counter(k)]) })}</em>
                </button>
              ))}
            </div>
          ) : (
            <>
              {last ? <RoundView round={last} /> : null}
              <p className="fatal-bar__hint">{t('duel.pickOnPitch')}</p>
            </>
          )}
        </div>
      )}

      {(step === 'prep' || step === 'think' || step === 'reveal') && choice && (
        <Stage
          step={step} rv={rv} plan={plan} choice={choice} lead={lead} pending={m.pending} theirsHidden={theirsHidden} round={i + 1}
          myTechs={myTechs} techSel={techSel} onTech={id => setTechSel(techSel === id ? null : id)} tension={tension} combo={combo}
          preview={preview} oppName={teamLabel(m.opp.name, locale)} onPlay={play} onCancel={next} onNext={next} onSkip={() => setRv(3)} last={i + 1 >= FATAL_ROUNDS || (plan !== null && plan.index + 1 >= FATAL_ROUNDS)}
        />
      )}
    </Screen>
  )
}

/** Ventana de la jugada: preparar (supertécnica), el rival piensa, y se descubre paso a paso con animaciones */
function Stage({ step, rv, plan, choice, lead, pending, theirsHidden, round, myTechs, techSel, onTech, tension, combo, preview, oppName, onPlay, onCancel, onNext, onSkip, last }: {
  step: Step; rv: number; plan: Plan | null; choice: { card: FatalCard; stat: DuelKey }; lead: 0 | 1; pending: { card: FatalCard; stat: DuelKey } | null
  theirsHidden: FatalCard | null; round: number; myTechs: Technique[]; techSel: string | null; onTech: (id: string) => void; tension: [number, number]; combo: number
  preview: number; oppName: string; onPlay: () => void; onCancel: () => void; onNext: () => void; onSkip: () => void; last: boolean
}) {
  const { t, locale } = useAppSettings()
  const reveal = step === 'reveal' && plan
  const myKey = reveal ? plan.myKey : choice.stat
  const theirKey = reveal ? plan.theirKey : lead === 1 && pending ? pending.stat : counter(choice.stat)
  const theirCard = reveal ? plan.orig[1] : lead === 1 && pending ? pending.card : theirsHidden
  const flipped = reveal && rv >= 1
  const boosted = reveal && rv >= 2
  const mineNum = (reveal ? plan.base[0] : choice.card.st[myKey]) + (boosted ? plan.bonus[0] : step === 'prep' ? preview : 0)
  const theirNum = reveal && flipped ? plan.base[1] + (boosted ? plan.bonus[1] : 0) : null
  const verdict = reveal && rv >= 3 ? plan.round.winner : null
  const say = step === 'prep'
    ? t('duel.say.prep', { name: choice.card.p.name, stat: t(STAT_KEY[myKey]) })
    : step === 'think' ? t('duel.thinking')
    : rv === 0 ? t('duel.say.wait') : rv === 1 ? t('duel.say.flip') : rv === 2 ? ((plan?.mineTech || plan?.oppTech) ? t('duel.say.boost') : t('duel.say.numbers')) : ''
  return (
    <div className="ds-backdrop" onClick={() => reveal && rv < 3 && onSkip()}>
      <div className="ds-panel" onClick={e => e.stopPropagation()}>
        <header className="ds-head">
          <small>{t('duel.stage.round', { n: reveal ? plan.index + 1 : round, total: FATAL_ROUNDS })}</small>
          <small>{(reveal ? plan.round.lead : lead) === 0 ? t('duel.youLead') : t('duel.rivalLeads')}</small>
        </header>
        <p className="ds-say" key={say}>{say || ' '}</p>
        <div className="ds-face">
          <div className={`ds-side ds-side--mine ${reveal ? 'ds-slide-l' : ''} ${verdict === 0 ? 'is-win' : verdict === 1 ? 'is-lose' : ''}`}>
            <small>{t('duel.you')}</small>
            <DuelCard player={choice.card.p} size="sm" values={choice.card.st} mod={choice.card.mod} highlight={myKey} />
          </div>
          <div className="ds-vs">
            <small>{t(STAT_KEY[myKey])}</small>
            <b key={mineNum} className={boosted && plan!.bonus[0] ? 'is-boost' : ''}>{mineNum}</b>
            <i>vs</i>
            <b key={`o${theirNum}`} className={boosted && plan!.bonus[1] ? 'is-boost is-opp' : ''}>{theirNum ?? '?'}</b>
            <small>{t(STAT_KEY[theirKey])}</small>
          </div>
          <div className={`ds-side ds-side--opp ${reveal ? 'ds-slide-r' : ''} ${verdict === 1 ? 'is-win' : verdict === 0 ? 'is-lose' : ''}`}>
            <small>{oppName}</small>
            <div className={`ds-flip ${flipped ? 'is-flipped' : ''}`}>
              <div className="ds-flip__back">{theirCard ? <HintBack card={theirCard} /> : <span className="ds-unknown">?</span>}</div>
              <div className="ds-flip__front">{theirCard && flipped && <DuelCard player={theirCard.p} size="sm" values={theirCard.st} mod={theirCard.mod} highlight={theirKey} />}</div>
            </div>
          </div>
        </div>

        {step === 'prep' && (
          <div className="ds-prep">
            {myTechs.length > 0 ? (
              <>
                <p className="fd-hint">{t('duel.techHint', { stat: t(STAT_KEY[myKey]) })}</p>
                <div className="sim-acts">
                  {myTechs.map(x => {
                    const cost = comboCost(x, combo)
                    return (
                      <ActButton key={x.id} label={techniqueName(x, locale)} desc={t('sim.act.tech', { n: techBonus(x, choice.card), stat: t(STAT_KEY[myKey]) })} cost={cost}
                        on={techSel === x.id} disabled={cost > tension[0]} onClick={() => onTech(x.id)} tone={x.element ?? 'none'}
                        icon={<><TechniqueIcon type={x.type} traits={x.traits} className="act-icon" />{x.element && <ElementIcon element={x.element} className="act-icon act-icon--el" />}</>} />
                    )
                  })}
                </div>
              </>
            ) : <p className="fd-hint">{t('duel.noTech')}</p>}
            <div className="ds-actions">
              <button type="button" className="chip" onClick={onCancel}>{t('duel.change')}</button>
              <button type="button" className="sheet-cta" onClick={onPlay}>{t('duel.play')}</button>
            </div>
          </div>
        )}
        {step === 'think' && <p className="duel-thinking">{t('duel.thinking')}<span className="dots"><i /><i /><i /></span></p>}
        {reveal && rv >= 2 && (plan.mineTech || plan.oppTech) && (
          <p className="sim-used ds-used">
            {plan.mineTech && <span className="is-mine">{t('sim.used', { name: techniqueName(plan.mineTech, locale) })} (+{plan.bonus[0]})</span>}
            {plan.oppTech && <span className="is-opp">{t('sim.usedOpp', { name: techniqueName(plan.oppTech, locale) })} (+{plan.bonus[1]})</span>}
          </p>
        )}
        {verdict !== null && (
          <div className="ds-result">
            <p className={`sim-verdict ds-verdict ${verdict === 0 ? 'is-goal' : verdict === 1 ? 'is-conceded' : ''}`}>
              {verdict === 0 ? t('duel.point') : verdict === 1 ? t('duel.pointOpp') : t('duel.noPoint')}
            </p>
            {plan!.round.byTotal && <small className="ds-note">{t('duel.byTotal', { a: total(plan!.round.cards[0]), b: total(plan!.round.cards[1]) })}</small>}
            <p className="ds-gain"><span>{t('sim.tension')} +{plan!.gain[0]}</span></p>
            <button type="button" className="sheet-cta" onClick={onNext}>{last ? t('duel.last') : t('duel.next')}</button>
          </div>
        )}
        {reveal && rv < 3 && <button type="button" className="ds-skip" onClick={onSkip}>{t('duel.skip')}</button>}
      </div>
    </div>
  )
}

/** Posición de cada carta en el campo: la de su formación o, sin formación, filas por puesto */
function positions(team: FatalTeam): Map<FatalCard, { x: number; y: number }> {
  const out = new Map<FatalCard, { x: number; y: number }>()
  const slots = team.formation ? getFormation(team.formation).slots : []
  const rows: Record<string, FatalCard[]> = { FW: [], MF: [], DF: [], GK: [] }
  for (const c of team.cards) {
    const s = slots.find(x => x.id === c.slot)
    if (s) out.set(c, { x: s.x, y: fieldY(s.y) })
    else rows[c.p.position].push(c)
  }
  const rowY = { FW: 8, MF: 36, DF: 64, GK: 92 }
  for (const [pos, list] of Object.entries(rows)) {
    list.forEach((c, k) => out.set(c, { x: list.length === 1 ? 50 : 10 + (k * 80) / (list.length - 1), y: rowY[pos as keyof typeof rowY] }))
  }
  return out
}

/** Campo del duelo: tus cartas con sus números; las del rival boca abajo con su pista hasta que se juegan */
function FatalPitch({ team, used, hidden, selected, highlight, pending, onTap }: {
  team: FatalTeam
  used: Set<FatalCard>
  hidden?: boolean
  selected?: FatalCard | null
  highlight?: DuelKey
  pending?: FatalCard | null
  onTap?: (c: FatalCard) => void
}) {
  const pos = positions(team)
  // se estira la formación a todo el campo (0–1 en cada eje) para que las cartas no se pisen
  const all = [...pos.values()]
  const span = (k: 'x' | 'y') => { const v = all.map(p => p[k]); const lo = Math.min(...v), hi = Math.max(...v); return (n: number) => hi > lo ? (n - lo) / (hi - lo) : .5 }
  const nx = span('x'), ny = span('y')
  return (
    <div className="fd-pitch fatal-pitch">
      {team.cards.map(c => {
        const at = pos.get(c)!
        const isUsed = used.has(c)
        return (
          <span key={c.p.id + c.slot} className={`fatal-spot ${isUsed ? 'is-used' : ''} ${selected === c ? 'fd-selected' : ''} ${pending === c ? 'is-pending' : ''}`}
            style={{ ['--x' as string]: nx(at.x), ['--y' as string]: ny(at.y) }}>
            {hidden && !isUsed
              ? <HintBack card={c} />
              : <DuelCard player={c.p} size="xs" values={c.st} mod={c.mod} highlight={isUsed ? undefined : highlight}
                  onClick={onTap && !isUsed ? () => onTap(c) : undefined} />}
          </span>
        )
      })}
    </div>
  )
}

/** Carta del rival boca abajo: solo su pista (afinidad, juego o escudo) */
function HintBack({ card }: { card: FatalCard }) {
  const logo = teamLogo(card.p.team, card.p.game)
  return (
    <span className="fatal-back">
      {card.hint === 'element' && <ElementIcon element={card.p.element} className="fatal-back__el" />}
      {card.hint === 'game' && <b className="fatal-back__game">{card.p.game}</b>}
      {card.hint === 'crest' && logo && <img className="fatal-back__crest" src={logo} alt="" />}
      <small>{card.p.position}</small>
    </span>
  )
}

/** La carta que ha elegido la máquina: boca abajo con su pista y el número que juega */
function Hint({ card, stat }: { card: FatalCard; stat: DuelKey }) {
  const { t } = useAppSettings()
  return (
    <span className="fatal-hint">
      <HintBack card={card} />
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
      <DuelCard player={mine.p} size="xs" values={mine.st} mod={mine.mod} highlight={myKey} />
      <span className="duel-line">
        <span>{t(STAT_KEY[myKey])} <b>{mine.st[myKey]}</b> – <b>{theirs.st[theirKey]}</b> {t(STAT_KEY[theirKey])}</span>
        {round.byTotal && <small>{t('duel.byTotal', { a: total(mine), b: total(theirs) })}</small>}
        <span className={round.winner === 0 ? 'is-goal' : round.winner === 1 ? 'is-conceded' : ''}>
          {round.winner === 0 ? t('duel.point') : round.winner === 1 ? t('duel.pointOpp') : t('duel.noPoint')}
        </span>
      </span>
      <DuelCard player={theirs.p} size="xs" values={theirs.st} mod={theirs.mod} highlight={theirKey} />
    </div>
  )
}
