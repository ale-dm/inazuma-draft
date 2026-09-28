import { useState, useMemo } from 'react'
import type { Player, MatchResult, GroupStanding } from '../types'
import { localizeCountry, rollTournamentField } from '../data/ffi-teams'
import { ffiKnockoutPairings } from '../data/ffi-tournament'
import { simulateMatch, simulateGroupStage, simulateRemainingGroupMatches, matchWinner } from '../engine/sim'
import { useAppSettings } from '../context/AppSettings'
import { teamLabel, teamLogo } from '../data/catalog'
import { playSfx } from '../lib/sfx'
import type { TournamentOutcome } from '../lib/local-stats'
import MatchView from './MatchView'
import { CircleCheck, Trophy } from 'lucide-react'

type TourneyPhase = 'intro' | 'groups' | 'qualified' | 'eliminated' | 'semis' | 'final' | 'done'

interface Props {
  playerTeam: Player[]
  /** Química del draft MADFUT (0–100); sin ella, la simulación de siempre */
  chemistry?: number
  onEnd: (outcome: TournamentOutcome) => void
}

const PLAYER_NAME = 'Inazuma Japan'

export default function Tournament({ playerTeam, chemistry, onEnd }: Props) {
  const { t, locale } = useAppSettings()
  const [phase, setPhase] = useState<TourneyPhase>('intro')
  const [matchIdx, setMatchIdx] = useState(0)
  const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(null)
  const [playerMatches, setPlayerMatches] = useState<MatchResult[]>([])
  const [groupAStandings, setGroupAStandings] = useState<GroupStanding[] | null>(null)
  const [groupBStandings, setGroupBStandings] = useState<GroupStanding[] | null>(null)
  const [semiResult, setSemiResult] = useState<MatchResult | null>(null)
  const [otherSemiResult, setOtherSemiResult] = useState<MatchResult | null>(null)
  const [finalOpponentName, setFinalOpponentName] = useState<string | null>(null)
  const [finalResult, setFinalResult] = useState<MatchResult | null>(null)
  const [playerRank, setPlayerRank] = useState(0)
  const [resolvingGroup, setResolvingGroup] = useState(false)
  const [{ playerOpponents, blockB: blockBTeams }] = useState(() => rollTournamentField())

  const opponentByName = useMemo(() => {
    const map = new Map<string, Player[]>()
    for (const o of [...playerOpponents, ...blockBTeams]) {
      map.set(o.name, o.players)
    }
    return map
  }, [playerOpponents, blockBTeams])

  const blockA = useMemo(
    () => [
      { name: PLAYER_NAME, players: playerTeam },
      ...playerOpponents.map(o => ({ name: o.name, players: o.players })),
    ],
    [playerTeam, playerOpponents],
  )

  const blockB = useMemo(
    () => blockBTeams.map(o => ({ name: o.name, players: o.players })),
    [blockBTeams],
  )

  function teamPlayers(name: string): Player[] {
    if (name === PLAYER_NAME) return playerTeam
    return opponentByName.get(name) ?? []
  }

  const wins = playerMatches.filter(m => m.score[0] > m.score[1]).length
  const losses = playerMatches.filter(m => m.score[0] < m.score[1]).length

  function playPlayerMatch(idx: number): MatchResult {
    const opp = playerOpponents[idx]
    return simulateMatch(playerTeam, opp.players, PLAYER_NAME, opp.name, { chemistry1: chemistry })
  }

  function startGroups() {
    setPhase('groups')
    setMatchIdx(0)
    setPlayerMatches([])
    setGroupAStandings(null)
    setCurrentMatch(null)
  }

  function runCurrentMatch() {
    const result = playPlayerMatch(matchIdx)
    setCurrentMatch(result)
    setPlayerMatches(prev => [...prev, result])
    if (result.score[0] > 0) playSfx('goal')
  }

  function finishGroupStage() {
    setResolvingGroup(true)
    const { standings } = simulateRemainingGroupMatches(blockA, playerMatches)
    setGroupAStandings(standings)
    const rank = standings.findIndex(s => s.teamName === PLAYER_NAME) + 1
    setPlayerRank(rank)
    setResolvingGroup(false)
    if (rank <= 2) {
      const { standings: bStandings } = simulateGroupStage(blockB)
      setGroupBStandings(bStandings)
      playSfx('qualify')
      setPhase('qualified')
    } else {
      setPhase('eliminated')
    }
  }

  function nextGroupMatch() {
    if (!currentMatch) return
    const next = matchIdx + 1
    if (next >= playerOpponents.length) {
      finishGroupStage()
      return
    }
    setMatchIdx(next)
    setCurrentMatch(null)
  }

  function playSemi() {
    if (!groupAStandings || !groupBStandings) return
    const poolA = groupAStandings.map(s => s.teamName)
    const poolB = groupBStandings.map(s => s.teamName)
    const { playerSemiOpponent, otherSemi } = ffiKnockoutPairings(poolA, poolB, PLAYER_NAME)

    const otherResult = simulateMatch(
      teamPlayers(otherSemi.home),
      teamPlayers(otherSemi.away),
      otherSemi.home,
      otherSemi.away,
      { decisive: true },
    )
    setOtherSemiResult(otherResult)
    const otherWin = matchWinner(otherResult)
    setFinalOpponentName(otherWin === 0 ? otherSemi.home : otherSemi.away)

    const result = simulateMatch(
      playerTeam,
      teamPlayers(playerSemiOpponent),
      PLAYER_NAME,
      playerSemiOpponent,
      { decisive: true, chemistry1: chemistry },
    )
    setSemiResult(result)
    setPhase('semis')
  }

  function playFinal() {
    if (!finalOpponentName) return
    const result = simulateMatch(
      playerTeam,
      teamPlayers(finalOpponentName),
      PLAYER_NAME,
      finalOpponentName,
      { decisive: true, chemistry1: chemistry },
    )
    setFinalResult(result)
    setPhase('final')
  }

  function finishTournament() {
    if (!finalResult) return
    setPhase('done')
    onEnd({ stage: 'final', won: matchWinner(finalResult) === 0 })
  }

  const wonSemi = semiResult && matchWinner(semiResult) === 0
  const lostSemi = semiResult && matchWinner(semiResult) !== 0

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto w-full">
        <div className="iz-panel mb-6">
          <div className="iz-panel-head">
            {t('tournament.title')} — {t('tournament.place')}
          </div>
        </div>

        {phase === 'intro' && (
          <div className="iz-panel animate-fade-in">
            <div className="iz-panel-body text-center">
            <p className="text-iz-text mb-6">{t('tournament.intro')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <TeamList
                title={t('tournament.blocA')}
                teams={[PLAYER_NAME, ...playerOpponents.map(o => o.name)]}
                highlight={PLAYER_NAME}
              />
              <TeamList
                title={t('tournament.blocB')}
                teams={blockBTeams.map(o => o.name)}
              />
            </div>
            <button type="button" onClick={startGroups} className="btn-primary">{t('tournament.start')}</button>
            </div>
          </div>
        )}

        {phase === 'groups' && (
          <div className="animate-fade-in">
            <p className="text-sm text-iz-cyan mb-4 font-heading">
              {t('tournament.group', { current: matchIdx + 1, total: playerOpponents.length })}
              {playerMatches.length > 0 && (
                <span className="text-iz-muted ml-2">
                  {t('tournament.record', { wins, losses })}
                </span>
              )}
            </p>

            {!currentMatch ? (
              <div className="iz-panel">
                <div className="iz-panel-body text-center">
                <p className="text-iz-text mb-2 font-heading text-lg">
                  {t('tournament.vs', { home: teamLabel(PLAYER_NAME, locale), away: teamLabel(playerOpponents[matchIdx].name, locale) })}
                </p>
                <p className="text-iz-muted text-sm mb-6">
                  {localizeCountry(playerOpponents[matchIdx].country, locale)}
                </p>
                <button type="button" onClick={runCurrentMatch} className="btn-primary w-full">
                  {t('tournament.playMatch')}
                </button>
                </div>
              </div>
            ) : (
              <>
                <MatchView result={currentMatch} highlightTeam={PLAYER_NAME} />
                <button
                  type="button"
                  onClick={nextGroupMatch}
                  disabled={resolvingGroup}
                  className="btn-primary mt-6 w-full"
                >
                  {resolvingGroup
                    ? t('tournament.resolving')
                    : matchIdx + 1 >= playerOpponents.length
                      ? t('tournament.closeGroup')
                      : t('tournament.nextMatch')}
                </button>
              </>
            )}
          </div>
        )}

        {phase === 'qualified' && groupAStandings && groupBStandings && (
          <div className="animate-fade-in text-center">
            <CircleCheck className="w-12 h-12 mb-4 mx-auto text-[#3dff8a]" strokeWidth={1.6} aria-hidden />
            <h3 className="font-heading text-2xl font-bold text-inazuma mb-2">{t('tournament.qualified')}</h3>
            <p className="text-iz-muted mb-2">
              {t(playerRank === 1 ? 'tournament.qualifiedHint1' : 'tournament.qualifiedHint2')}
            </p>
            <StandingsTable title={t('tournament.standingsA')} standings={groupAStandings} highlight={PLAYER_NAME} />
            <StandingsTable title={t('tournament.standingsB')} standings={groupBStandings} className="mt-4" />
            <Bracket
              semis={semiPairs(groupAStandings, groupBStandings)}
              highlight={PLAYER_NAME}
            />
            <button type="button" onClick={playSemi} className="btn-primary mt-6">{t('tournament.semiBtn')}</button>
          </div>
        )}

        {phase === 'eliminated' && groupAStandings && (
          <div className="animate-fade-in text-center">
            <h3 className="font-heading text-2xl font-bold text-red-400 mb-4">{t('tournament.eliminated')}</h3>
            <p className="text-iz-muted mb-4">{t('tournament.eliminatedHint', { rank: playerRank })}</p>
            <StandingsTable title={t('tournament.standingsAFinal')} standings={groupAStandings} highlight={PLAYER_NAME} />
            <button type="button" onClick={() => onEnd({ stage: 'groups' })} className="btn-secondary mt-6">{t('tournament.finish')}</button>
          </div>
        )}

        {phase === 'semis' && semiResult && (
          <div className="animate-fade-in">
            <p className="text-sm text-iz-cyan mb-4 font-heading">{t('tournament.semi')}</p>
            <MatchView result={semiResult} highlightTeam={PLAYER_NAME} />
            <Bracket semis={[semiResult, otherSemiResult]} highlight={PLAYER_NAME} />
            {wonSemi && (
              <button type="button" onClick={playFinal} className="btn-primary mt-6 w-full">{t('tournament.finalBtn')}</button>
            )}
            {lostSemi && (
              <>
                <p className="text-red-400 text-center mt-6 font-heading">{t('tournament.semiOut')}</p>
                <button type="button" onClick={() => onEnd({ stage: 'semi' })} className="btn-secondary mt-6 w-full">{t('tournament.finish')}</button>
              </>
            )}
          </div>
        )}

        {phase === 'final' && finalResult && (
          <div className="animate-fade-in">
            <h3 className="font-heading text-3xl font-black text-inazuma text-center mb-6"><Trophy className="inline w-8 h-8 -mt-1 mr-1" aria-hidden />{t('tournament.final')}</h3>
            <MatchView result={finalResult} highlightTeam={PLAYER_NAME} />
            <Bracket semis={[semiResult, otherSemiResult]} final={finalResult} highlight={PLAYER_NAME} />
            <button type="button" onClick={finishTournament} className="btn-primary mt-6 w-full">{t('tournament.finish')}</button>
          </div>
        )}

        {phase === 'done' && finalResult && (
          <div className="animate-fade-in text-center">
            {matchWinner(finalResult) === 0 ? (
              <h3 className="font-heading text-4xl font-black text-inazuma">{t('tournament.champion')}</h3>
            ) : (
              <>
                <h3 className="font-heading text-3xl font-bold text-red-400">{t('tournament.finalLoss')}</h3>
                <button type="button" onClick={() => onEnd({ stage: 'final', won: false })} className="btn-secondary mt-6">{t('tournament.finish')}</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamList({ title, teams, highlight }: { title: string; teams: string[]; highlight?: string }) {
  const { locale } = useAppSettings()
  return (
    <div className="iz-panel text-left">
      <div className="iz-panel-head !text-[0.65rem]">{title}</div>
      <div className="iz-panel-body !py-2 !px-3">
      <ul className="text-xs space-y-1">
        {teams.map(team => (
          <li key={team} className={team === highlight ? 'text-accent font-bold' : 'text-iz-text'}>{teamLabel(team, locale)}</li>
        ))}
      </ul>
      </div>
    </div>
  )
}

function StandingsTable({
  title,
  standings,
  highlight,
  className = '',
  qualify = 2,
}: {
  title: string
  standings: GroupStanding[]
  highlight?: string
  className?: string
  /** Los primeros N pasan (se marcan en verde) */
  qualify?: number
}) {
  const { t, locale } = useAppSettings()

  return (
    <div className={`standings ${className}`}>
      <h4 className="standings__title">{title}</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th className="standings__team">{t('tournament.team')}</th>
            <th>{t('tournament.played')}</th>
            <th>{t('tournament.w')}</th>
            <th>{t('tournament.d')}</th>
            <th>{t('tournament.l')}</th>
            <th>{t('tournament.diff')}</th>
            <th>{t('tournament.pts')}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.teamName} className={`${i < qualify ? 'is-q' : ''} ${s.teamName === highlight ? 'is-me' : ''}`}>
              <td>{i + 1}</td>
              <td className="standings__team">
                {teamLogo(s.teamName.replace(/ \(.*\)$/, '')) && <img className="ic__badge" src={teamLogo(s.teamName.replace(/ \(.*\)$/, ''))} alt="" />}
                {teamLabel(s.teamName, locale)}
              </td>
              <td>{s.played}</td>
              <td>{s.won}</td>
              <td>{s.drawn}</td>
              <td>{s.lost}</td>
              <td>{s.gf - s.ga > 0 ? `+${s.gf - s.ga}` : s.gf - s.ga}</td>
              <td className="standings__pts">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Pair = { team1Name: string; team2Name: string; score?: [number, number]; penalties?: [number, number] }

/** Semifinales del FFI: 1.º A – 2.º B y 1.º B – 2.º A (el del jugador, primero) */
function semiPairs(a: GroupStanding[], b: GroupStanding[]): Pair[] {
  const { playerSemiOpponent, otherSemi } = ffiKnockoutPairings(a.map(s => s.teamName), b.map(s => s.teamName), PLAYER_NAME)
  return [{ team1Name: PLAYER_NAME, team2Name: playerSemiOpponent }, { team1Name: otherSemi.home, team2Name: otherSemi.away }]
}

const pairWinner = (m: Pair) => (m.score ? matchWinner(m as MatchResult) : -1)

/** Cuadro final (semis → final) con marcadores; el ganador de cada cruce, resaltado */
export function Bracket({ semis, final, highlight }: { semis: (Pair | null)[]; final?: Pair | null; highlight?: string }) {
  const { t, locale } = useAppSettings()
  const winners = semis.map(m => (m && m.score ? (pairWinner(m) === 0 ? m.team1Name : m.team2Name) : null))
  const fin: Pair | null = final ?? (winners[0] || winners[1] ? { team1Name: winners[0] ?? '?', team2Name: winners[1] ?? '?' } : null)
  const Row = ({ m, side }: { m: Pair; side: 0 | 1 }) => {
    const name = side === 0 ? m.team1Name : m.team2Name
    const w = pairWinner(m)
    return (
      <span className={`bracket__team ${w === side ? 'is-win' : w >= 0 ? 'is-out' : ''} ${name === highlight ? 'is-me' : ''}`}>
        <span className="bracket__name">{name === '?' ? '—' : teamLabel(name, locale)}</span>
        {m.score && <b>{m.score[side]}{m.penalties ? <small> ({m.penalties[side]})</small> : null}</b>}
      </span>
    )
  }
  const Match = ({ m }: { m: Pair | null }) => (
    <div className="bracket__match">{m ? <><Row m={m} side={0} /><Row m={m} side={1} /></> : <span className="bracket__team">—</span>}</div>
  )
  return (
    <div className="bracket">
      <div className="bracket__col">
        <small className="bracket__label">{t('tournament.semi')}</small>
        {semis.map((m, i) => <Match key={i} m={m} />)}
      </div>
      <div className="bracket__col bracket__col--final">
        <small className="bracket__label">{t('tournament.final')}</small>
        <Match m={fin} />
      </div>
    </div>
  )
}
