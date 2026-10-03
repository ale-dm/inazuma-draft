import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { teamLabel, teamLogo } from '../../data/catalog'
import { teamRating } from '../../lib/chemistry'
import { duelReward, type DuelKey } from '../../lib/duel'
import { getFormation } from '../../lib/lineup'
import { fieldY } from '../pitch/Pitch'
import {
  FATAL_ROUNDS, SIM_CHANCES, aiLead, aiRespond, counter, fatalTeam, finalResult, needsTiebreak, playRound, rivalTeam,
  score, simScore, simulate, tiebreak, total, weeklyBoost,
  type FatalCard, type FatalTeam, type Round, type SimChance,
} from '../../lib/fatal'
import { addCoins, addXp, track } from '../../lib/club'
import { addDraftResult, addSeriesResult, findSeries } from '../../lib/fatal-series'
import { playSfx } from '../../lib/sfx'
import type { TranslationKey } from '../../i18n/translations'
import DuelCard from '../DuelCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import { ElementIcon } from '../GameIcon'
import SimMatch from './SimMatch'
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

function FatalMatch({ title, squad, boostText, onAgain, onResult, backHref }: { title: string; squad: PickedSquad; boostText: string; onAgain: () => void; onResult: OnResult; backHref: string }) {
  const { t, locale } = useAppSettings()
  const [m, setM] = useState<Match>(() => {
    const me = fatalTeam(t('duel.you'), squad.lineup, squad.captain, squad.formation)
    const opp = rivalTeam(teamRating(squad.xi))
    return { me, opp, myHand: me.cards, oppHand: opp.cards, rounds: [], first: Math.random() < 0.5 ? 0 : 1, pending: null }
  })
  const [sel, setSel] = useState<FatalCard | null>(null)
  const [paid, setPaid] = useState<Paid | null>(null)

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
    if (result !== null && !paid) setPaid(payout(result, onResult))
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

  const played = new Set(m.rounds.flatMap(r => r.cards))
  const [page, setPage] = useState(0)
  const pager = useRef<HTMLDivElement>(null)
  const goPage = (n: number) => pager.current?.scrollTo({ left: n * pager.current.clientWidth, behavior: 'smooth' })

  function tapMine(c: FatalCard) {
    if (over || played.has(c)) return
    if (lead === 1) respondWith(c)
    else setSel(c === sel ? null : c)
  }

  const endBlock = over && (
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

      {!over && (
        <div className="fatal-bar">
          {lead === 1 && m.pending ? (
            <div className="fatal-hint-row">
              <Hint card={m.pending.card} stat={m.pending.stat} />
              <p>{t('duel.respond', { k: t(STAT_KEY[m.pending.stat]), mine: t(STAT_KEY[counter(m.pending.stat)]) })}</p>
            </div>
          ) : lead === 0 && sel ? (
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
    </Screen>
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
