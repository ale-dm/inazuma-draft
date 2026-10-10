import { Suspense, lazy, type ReactNode } from 'react'
import { useAppSettings } from './context/AppSettings'
import GameShell from './components/hub/GameShell'
import Hub from './components/hub/Hub'
import {
  ADMIN_HASH, BADGES_HASH, CODES_HASH, DRAFT_HASH, DRAFT_SUMMARY_HASH, FATAL_DRAFT_HASH, FATAL_HASH, FREE_HASH, SBC_HASH, CLUB_HASH,
  COLLECTIONS_HASH, CUPS_HASH, DUEL_HASH, HL_HASH, MINIGAMES_HASH, OBJECTIVES_HASH, PLAYERS_HASH, PUZZLES_HASH, SQUADS_HASH, STORE_HASH, useHashRoute,
} from './lib/route'
import type { DuelSource } from './components/modes/Duel'

// pantallas que no hacen falta al abrir la app: cada una en su propio archivo, se descargan al entrar en ellas
const Duel = lazy(() => import('./components/modes/Duel'))
const DraftScreen = lazy(() => import('./components/futdraft/DraftScreen'))
const DraftSummary = lazy(() => import('./components/futdraft/DraftSummary'))
const FatalDraft = lazy(() => import('./components/modes/FatalDraft'))
const PlayersExplorer = lazy(() => import('./components/PlayersExplorer'))
const HigherLower = lazy(() => import('./components/modes/HigherLower'))
const Cups = lazy(() => import('./components/modes/Cups'))
const Minigames = lazy(() => import('./components/minigames/Minigames'))
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

/** Pantalla de cada ruta (hash); sin ruta conocida, el inicio */
function screenFor(route: string): ReactNode | null {
  const [duelSource, seriesId] = route.startsWith(`${DUEL_HASH}/`) ? route.slice(DUEL_HASH.length + 1).split('/') as [DuelSource, string?] : [null]
  if (duelSource && ['club', 'sim', 'draft', 'draftsim'].includes(duelSource)) return <Duel key={route} source={duelSource} seriesId={seriesId} />
  const screens: Record<string, ReactNode> = {
    [DRAFT_HASH]: <DraftScreen />, [DRAFT_SUMMARY_HASH]: <DraftSummary />, [FATAL_DRAFT_HASH]: <FatalDraft />,
    [STORE_HASH]: <Store />, [CLUB_HASH]: <MyCards />, [COLLECTIONS_HASH]: <Collections />, [OBJECTIVES_HASH]: <Objectives />,
    [SQUADS_HASH]: <Squads />, [HL_HASH]: <HigherLower />, [CUPS_HASH]: <Cups />, [PUZZLES_HASH]: <Puzzles />, [MINIGAMES_HASH]: <Minigames />, [ADMIN_HASH]: <Admin />,
    [SBC_HASH]: <SbcScreen />, [FATAL_HASH]: <Fatal />, [FREE_HASH]: <FreePack />, [CODES_HASH]: <Codes />, [BADGES_HASH]: <Badges />,
  }
  return screens[route] ?? null
}

export default function App() {
  const { t } = useAppSettings()
  const route = useHashRoute()
  return (
    <Suspense fallback={<div className="hub"><span className="app-loading" aria-label="…" /></div>}>
      {route === PLAYERS_HASH
        ? <GameShell title={t('hub.players')} backHref="#/"><PlayersExplorer /></GameShell>
        : screenFor(route) ?? <Hub />}
    </Suspense>
  )
}
