import { Suspense, lazy, useState, type ReactNode } from 'react'
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
import GameShell from './components/hub/GameShell'
import InaCard from './components/InaCard'
import Hub from './components/hub/Hub'
import ExportTeamButton from './components/ExportTeamButton'
import {
  ADMIN_HASH, BADGES_HASH, CODES_HASH, FATAL_HASH, FREE_HASH, SBC_HASH, CLUB_HASH, COLLECTIONS_HASH, CUPS_HASH, DUEL_HASH, HL_HASH, OBJECTIVES_HASH, PLAYERS_HASH, PUZZLES_HASH,
  SQUADS_HASH, STORE_HASH, useHashRoute,
} from './lib/route'
import type { DuelSource } from './components/modes/Duel'
import { addCoins, addPack, addXp, track, trackMax } from './lib/club'
import { getPack } from './lib/packs'
import { trackEvent } from './lib/analytics'
import { clearDraft, loadDraft, type SavedDraft } from './lib/saved-draft'
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
import Coin from './components/Coin'
import { Package, Trophy } from 'lucide-react'

// pantallas que no hacen falta al abrir la app: cada una en su propio archivo, se descargan al entrar en ellas
const Duel = lazy(() => import('./components/modes/Duel'))
const FutDraft = lazy(() => import('./components/futdraft/FutDraft'))
const Draft = lazy(() => import('./components/Draft'))
const LineupReview = lazy(() => import('./components/LineupReview'))
const Tournament = lazy(() => import('./components/Tournament'))
const PlayersExplorer = lazy(() => import('./components/PlayersExplorer'))
const HigherLower = lazy(() => import('./components/modes/HigherLower'))
const Cups = lazy(() => import('./components/modes/Cups'))
const Puzzles = lazy(() => import('./components/modes/Puzzles'))
const Admin = lazy(() => import('./components/admin/Admin'))
const Fatal = lazy(() => import('./components/modes/Fatal'))
const FreePack = lazy(() => import('./components/club/FreePack'))
const Codes = lazy(() => import('./components/club/Codes'))
const SbcScreen = lazy(() => import('./components/phase5/Sbc'))
const Badges = lazy(() => import('./components/phase5/Badges'))
const Squads = lazy(() => import('./components/club/Squads'))
const Store = lazy(() => import('./components/club/Store'))
const MyCards = lazy(() => import('./components/club/MyCards'))
const Collections = lazy(() => import('./components/club/Collections'))
const Objectives = lazy(() => import('./components/club/Objectives'))

export default function App() {
  const { t } = useAppSettings()
  const [phase, setPhase] = useState<GamePhase>('landing')
  const [mode, setMode] = useState<'classic' | 'memory'>(() => readModeFromLocation() ?? 'classic')
  const [runSeed, setRunSeed] = useState<string | null>(() => readSeedFromLocation())
  const [drafted, setDrafted] = useState<Player[]>([])
  const [lineup, setLineup] = useState<LineupMap>({})
  const [formationId, setFormationId] = useState<FormationId>(DEFAULT_FORMATION)
  const [won, setWon] = useState(false)
  /** Química del draft MADFUT; null en el draft FFI (sorteo) */
  const [chem, setChem] = useState<number | null>(null)
  const route = useHashRoute()
  const inPlayers = route === PLAYERS_HASH
  /** Premio del último torneo (se enseña en la pantalla de resultado) */
  const [reward, setReward] = useState<{ coins: number; xp: number; pack?: string } | null>(null)

  /** Draft guardado que se sigue (null: draft nuevo) */
  const [resume, setResume] = useState<SavedDraft | null>(null)

  function startRun(kind: 'fut' | 'fut-resume' | 'ffi') {
    if (kind === 'fut-resume') {
      setResume(loadDraft())
      setPhase('futdraft')
      return
    }
    if (kind === 'fut') {
      clearDraft()
      setResume(null)
    }
    const seed = runSeed ?? generateSeedString()
    initRunRng(seed)
    setRunSeed(seed)
    syncRunUrl(seed, mode)
    recordRunStarted()
    recordGlobalRunStarted()
    trackEvent('run_started', { mode: kind === 'fut' ? 'fut' : mode, seed })
    setPhase(kind === 'fut' ? 'futdraft' : 'draft')
  }

  function reset() {
    resetRunRng()
    setPhase('landing')
    setDrafted([])
    setLineup({})
    setFormationId(DEFAULT_FORMATION)
    setRunSeed(null)
    setWon(false)
    setChem(null)
    setReward(null)
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
      return <Hub mode={mode} seed={runSeed} onModeChange={handleModeChange} onStart={startRun} />

    }

    if (phase === 'futdraft') {
      return (
        <FutDraft
          resume={resume}
          persist
          onExit={reset}
          onComplete={(l, formation, _captain, chemistry, bench) => {
            const players = lineupToArray(l, formation)
            recordDraftComplete([...players, ...bench], [])
            track('drafts')
            trackMax('chem', chemistry)
            recordGlobalDraftComplete()
            trackEvent('draft_complete', { players: players.length, teams_rolled: 0, kind: 'fut' })
            setDrafted(players)
            setLineup(l)
            setFormationId(formation)
            setChem(chemistry)
            setPhase('tournament')
          }}
        />
      )
    }

    if (phase === 'draft') {
      return (
        <GameShell title={t('hub.modeFfi')} onExit={reset}>
          <Draft
            mode={mode}
            seed={runSeed}
            onCopySeed={() => void copySeed()}
            onComplete={(p, l, teamsRolled, formation) => {
              recordDraftComplete(p, teamsRolled)
              track('drafts')
              recordGlobalDraftComplete()
              trackEvent('draft_complete', { players: p.length, teams_rolled: teamsRolled.length })
              setDrafted(p)
              setLineup(l)
              setFormationId(formation)
              setPhase('lineup')
            }}
          />
        </GameShell>
      )
    }

    if (phase === 'lineup') {
      return (
        <GameShell title={t('rules.sections.lineup.title')} onExit={reset}>
          <LineupReview
            players={drafted}
            lineup={lineup}
            formationId={formationId}
            mode={mode}
            onLineupChange={setLineup}
            onConfirm={() => setPhase('tournament')}
          />
        </GameShell>
      )
    }

    if (phase === 'tournament') {
      return (
        <GameShell title="FFI" onExit={reset}>
          <Tournament
            playerTeam={lineupToArray(lineup, formationId)}
            chemistry={chem ?? undefined}
            onEnd={(outcome: TournamentOutcome) => {
              recordTournamentOutcome(outcome)
              if (outcome.stage === 'final') {
                recordGlobalFinalReached()
                trackEvent('final_reached', { won: outcome.won })
              } else {
                trackEvent('tournament_out', { stage: outcome.stage })
              }
              setWon(outcome.stage === 'final' && outcome.won)
              // premio del club: monedas, XP y, en la final, un sobre
              const r = outcome.stage === 'groups' ? { coins: 250, xp: 50 }
                : outcome.stage === 'semi' ? { coins: 500, xp: 100 }
                : outcome.won ? { coins: 1500, xp: 250, pack: 'gold' } : { coins: 800, xp: 150, pack: 'reward' }
              addCoins(r.coins)
              addXp(r.xp)
              if (r.pack) addPack(r.pack)
              setReward(r)
              if (outcome.stage !== 'groups') track('semis')
              if (outcome.stage === 'final' && outcome.won) track('titles')
              setPhase('result')
            }}
          />
        </GameShell>
      )
    }

    return (
      <GameShell title="FFI" onExit={reset}>
        <div className="flex flex-col items-center justify-center p-6 animate-fade-in min-h-[60vh]">
          {won ? (
            <>
              <Trophy className="w-16 h-16 mb-4 text-[#ffd23d]" strokeWidth={1.5} aria-hidden />
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
          <div className="card-grid w-full max-w-lg mb-6">
            {lineupToArray(lineup, formationId).map(p => (
              <InaCard key={p.id} player={p} size="sm" showRating={mode === 'classic' || chem != null} />
            ))}
          </div>
          {reward && (
            <p className="reward-line mb-6">
              +<Coin className="w-5 h-5" /> {reward.coins.toLocaleString()} · +{reward.xp} XP
              {reward.pack && <> · +<Package className="w-5 h-5" /> {t(getPack(reward.pack).nameKey)}</>}
            </p>
          )}
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
          <button type="button" onClick={reset} className="sheet-cta max-w-sm">{t('result.replay')}</button>
        </div>
      </GameShell>
    )
  }

  const [duelSource, seriesId] = route.startsWith(`${DUEL_HASH}/`) ? route.slice(DUEL_HASH.length + 1).split('/') as [DuelSource, string?] : [null]
  const clubScreen = duelSource && ['club', 'sim', 'draft'].includes(duelSource)
    ? <Duel key={route} source={duelSource} seriesId={seriesId} />
    : {
      [STORE_HASH]: <Store />, [CLUB_HASH]: <MyCards />, [COLLECTIONS_HASH]: <Collections />, [OBJECTIVES_HASH]: <Objectives />,
      [SQUADS_HASH]: <Squads />, [HL_HASH]: <HigherLower />, [CUPS_HASH]: <Cups />, [PUZZLES_HASH]: <Puzzles />, [ADMIN_HASH]: <Admin />,
      [SBC_HASH]: <SbcScreen />, [FATAL_HASH]: <Fatal />, [FREE_HASH]: <FreePack />, [CODES_HASH]: <Codes />, [BADGES_HASH]: <Badges />,
    }[route]

  return (
    <Suspense fallback={<div className="hub"><span className="app-loading" aria-label="…" /></div>}>
      {clubScreen}
      {inPlayers && (
        <GameShell title={t('hub.players')} backHref="#/">
          <PlayersExplorer />
        </GameShell>
      )}
      <div style={inPlayers || clubScreen ? { display: 'none' } : undefined}>{renderGame()}</div>
    </Suspense>
  )
}
