import { useState, type ReactNode } from 'react'
import type { GamePhase, Player } from './types'
import { DEFAULT_FORMATION, lineupToArray, type FormationId, type LineupMap } from './lib/lineup'
import {
  buildShareUrl,
  generateSeedString,
  readModeFromLocation,
  readSeedFromLocation,
  syncRunUrl,
} from './lib/rng'
import { initRunRng, resetRunRng } from './lib/run-rng'
import { useAppSettings } from './context/AppSettings'
import AppLayout from './components/AppLayout'
import Landing from './components/Landing'
import Draft from './components/Draft'
import LineupReview from './components/LineupReview'
import Tournament from './components/Tournament'
import PlayerCard from './components/PlayerCard'
import ExportTeamButton from './components/ExportTeamButton'
import PlayersExplorer from './components/PlayersExplorer'
import { PLAYERS_HASH, useHashRoute } from './lib/route'
import { trackEvent } from './lib/analytics'
import {
  recordGlobalDraftComplete,
  recordGlobalFinalReached,
  recordGlobalRunStarted,
} from './lib/global-metrics'
import {
  recordDraftComplete,
  recordRunStarted,
  recordTournamentOutcome,
  type TournamentOutcome,
} from './lib/local-stats'

export default function App() {
  const { t } = useAppSettings()
  const [phase, setPhase] = useState<GamePhase>('landing')
  const [mode, setMode] = useState<'classic' | 'memory'>(() => readModeFromLocation() ?? 'classic')
  const [runSeed, setRunSeed] = useState<string | null>(() => readSeedFromLocation())
  const [drafted, setDrafted] = useState<Player[]>([])
  const [lineup, setLineup] = useState<LineupMap>({})
  const [formationId, setFormationId] = useState<FormationId>(DEFAULT_FORMATION)
  const [won, setWon] = useState(false)
  const inPlayers = useHashRoute() === PLAYERS_HASH

  function startRun() {
    const seed = runSeed ?? generateSeedString()
    initRunRng(seed)
    setRunSeed(seed)
    syncRunUrl(seed, mode)
    recordRunStarted()
    recordGlobalRunStarted()
    trackEvent('run_started', { mode, seed })
    setPhase('draft')
  }

  function reset() {
    resetRunRng()
    setPhase('landing')
    setDrafted([])
    setLineup({})
    setFormationId(DEFAULT_FORMATION)
    setRunSeed(null)
    setWon(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('seed')
    url.searchParams.delete('mode')
    window.history.replaceState(null, '', url.pathname + url.search)
  }

  function handleModeChange(next: 'classic' | 'memory') {
    setMode(next)
    if (runSeed) syncRunUrl(runSeed, next)
  }

  async function copySeed() {
    if (!runSeed) return
    try {
      await navigator.clipboard.writeText(buildShareUrl(runSeed, mode))
    } catch {
      // ignore
    }
  }

  function renderGame(): ReactNode {
    if (phase === 'landing') {
      return (
        <AppLayout variant="landing">
          <Landing
            mode={mode}
            seed={runSeed}
            onModeChange={handleModeChange}
            onStart={startRun}
          />
        </AppLayout>
      )
    }

    if (phase === 'draft') {
      return (
        <AppLayout>
          <Draft
            mode={mode}
            seed={runSeed}
            onCopySeed={() => void copySeed()}
            onComplete={(p, l, teamsRolled, formation) => {
              recordDraftComplete(p, teamsRolled)
              recordGlobalDraftComplete()
              trackEvent('draft_complete', { players: p.length, teams_rolled: teamsRolled.length })
              setDrafted(p)
              setLineup(l)
              setFormationId(formation)
              setPhase('lineup')
            }}
          />
        </AppLayout>
      )
    }

    if (phase === 'lineup') {
      return (
        <AppLayout>
          <LineupReview
            players={drafted}
            lineup={lineup}
            formationId={formationId}
            mode={mode}
            onLineupChange={setLineup}
            onConfirm={() => setPhase('tournament')}
          />
        </AppLayout>
      )
    }

    if (phase === 'tournament') {
      return (
        <AppLayout>
          <Tournament
            playerTeam={lineupToArray(lineup, formationId)}
            onEnd={(outcome: TournamentOutcome) => {
              recordTournamentOutcome(outcome)
              if (outcome.stage === 'final') {
                recordGlobalFinalReached()
                trackEvent('final_reached', { won: outcome.won })
              } else {
                trackEvent('tournament_out', { stage: outcome.stage })
              }
              setWon(outcome.stage === 'final' && outcome.won)
              setPhase('result')
            }}
          />
        </AppLayout>
      )
    }

    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-6 animate-fade-in min-h-[60vh]">
          {won ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="font-heading text-5xl md:text-6xl font-black text-inazuma text-center mb-4 drop-shadow-lg">
                {t('result.champion')}
              </h1>
              <p className="text-iz-text mb-8">{t('result.championSub')}</p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-4xl font-bold text-red-400 mb-4">{t('result.out')}</h1>
              <p className="text-iz-muted mb-8">{t('result.outSub')}</p>
            </>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg mb-6 stagger">
            {lineupToArray(lineup, formationId).map(p => (
              <PlayerCard key={p.id} player={p} mode={mode} compact />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <ExportTeamButton
              lineup={lineup}
              formationId={formationId}
              mode={mode}
              won={won}
            />
            {runSeed && (
              <button type="button" onClick={() => void copySeed()} className="btn-secondary">
                {t('seed.copy')}
              </button>
            )}
          </div>
          <button type="button" onClick={reset} className="btn-primary">{t('result.replay')}</button>
        </div>
      </AppLayout>
    )
  }

  return (
    <>
      {inPlayers && (
        <AppLayout>
          <PlayersExplorer />
        </AppLayout>
      )}
      <div style={inPlayers ? { display: 'none' } : undefined}>{renderGame()}</div>
    </>
  )
}
