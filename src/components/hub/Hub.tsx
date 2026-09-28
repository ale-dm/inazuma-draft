import { useMemo, useRef, useState, type ReactNode } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getAllPlayers, getCharacterVersions } from '../../data/catalog'
import { loadProgress, uniqueCharacters } from '../../lib/progress'
import { PLAYERS_HASH } from '../../lib/route'
import FutCard from '../FutCard'
import RulesModal from '../RulesModal'
import StatsModal from '../StatsModal'
import Sheet from './Sheet'
import SettingsSheet from './SettingsSheet'

interface Props {
  mode: 'classic' | 'memory'
  seed: string | null
  onModeChange: (mode: 'classic' | 'memory') => void
  /** 'fut' = draft MADFUT (1 de 5 con química) · 'ffi' = draft por sorteo de equipo + juego */
  onStart: (kind: 'fut' | 'ffi') => void
}

/** Foto grande de los paneles: la mejor carta del personaje, mejor con retrato de zukan que con sprite de la wiki */
function heroOf(characterId: string): string | null {
  const isSprite = (url: string) => url.includes('wikia')
  const withImage = getCharacterVersions(characterId).filter(p => p.image)
  return withImage.sort((a, b) => Number(isSprite(a.image!)) - Number(isSprite(b.image!)) || b.ovr - a.ovr)[0]?.image ?? null
}

/** Pantalla principal estilo MADFUT: barra de progreso arriba y tres páginas de paneles que se deslizan */
export default function Hub({ mode, seed, onModeChange, onStart }: Props) {
  const { t } = useAppSettings()
  const [page, setPage] = useState(0)
  const [sheet, setSheet] = useState<'mode' | 'settings' | 'rules' | 'stats' | null>(null)
  const pager = useRef<HTMLDivElement>(null)
  const progress = useMemo(loadProgress, [sheet])            // se recalcula al cerrar las estadísticas (reinicio)
  const heroes = useMemo(() => ({
    draft: heroOf('endou-mamoru'),
    packs: heroOf('gouenji-shuuya'),
    club: heroOf('matsukaze-tenma'),
  }), [])
  const latest = useMemo(() => uniqueCharacters(getAllPlayers().filter(p => p.game === 'VR' && p.image)
    .sort((a, b) => b.ovr - a.ovr)).slice(0, 3), [])

  const goPlayers = () => { window.location.hash = PLAYERS_HASH }
  const goPage = (i: number) => pager.current?.scrollTo({ left: i * pager.current.clientWidth, behavior: 'smooth' })

  return (
    <div className="hub">
      <header className="hub-top safe-top">
        <div className="hub-top__row">
          <span className="hub-logo">FFI <b>6-0</b></span>
          <button type="button" className="hub-icon-btn" onClick={() => setSheet('settings')} aria-label={t('hub.settings')}>⚙️</button>
        </div>
        <div className="hub-bar">
          <span className="hub-bar__crest" aria-hidden>⚡</span>
          <span className="hub-bar__lvl"><small>{t('hub.level')}</small>{progress.level}</span>
          <span className="hub-bar__item" title={t('hub.titles')}>🏆 {progress.titles}</span>
          <span className="hub-bar__item" title={t('hub.cards')}>🃏 {progress.owned}</span>
          <span className="hub-bar__pct">
            <span className="hub-bar__track"><span style={{ width: `${progress.levelPct}%` }} /></span>
            {progress.levelPct}%
          </span>
        </div>
      </header>

      <div
        ref={pager}
        className="hub-pager"
        onScroll={e => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {/* 1 · Jugar */}
        <section className="hub-page hub-page--teal">
          <HeroTile title={t('hub.draft')} sub={t('hub.draftSub')} image={heroes.draft} onClick={() => setSheet('mode')} />
          <button type="button" className="tile tile--wide hub-ffi" onClick={() => setSheet('stats')}>
            <span className="hub-ffi__title">FFI</span>
            <span className="hub-ffi__cols">
              {([['hub.titles', progress.titles], ['hub.finals', progress.finals], ['hub.drafts', progress.drafts]] as const).map(([k, v]) => (
                <span key={k}><b>{t(k)}</b><small>{v}</small></span>
              ))}
            </span>
          </button>
          <div className="hub-grid">
            <Tile label={t('hub.players')} onClick={goPlayers}>
              <CardFan players={progress.showcase} />
            </Tile>
            <Tile label={t('hub.modes')} onClick={() => setSheet('mode')}>
              <span className="tile__big">{mode === 'classic' ? t('landing.mode.classic') : t('landing.mode.memory')}</span>
            </Tile>
            <Tile label={t('hub.rules')} onClick={() => setSheet('rules')} wide>
              <span className="tile__icon" aria-hidden>📖</span>
            </Tile>
          </div>
        </section>

        {/* 2 · Sobres y tienda (próximamente) */}
        <section className="hub-page hub-page--violet">
          <HeroTile title={t('hub.packs')} image={heroes.packs} soon={t('hub.soon')} />
          <div className="hub-grid">
            <Tile label={t('hub.store')} soon={t('hub.soon')}><span className="tile__icon" aria-hidden>🛒</span></Tile>
            <Tile label={t('hub.latest')} onClick={goPlayers}><CardFan players={latest} /></Tile>
            <Tile label={t('hub.objectives')} soon={t('hub.soon')}><span className="tile__icon" aria-hidden>🎯</span></Tile>
            <Tile label={t('hub.sbc')} soon={t('hub.soon')}><span className="tile__icon" aria-hidden>🧩</span></Tile>
          </div>
        </section>

        {/* 3 · Club */}
        <section className="hub-page hub-page--blue">
          <Tile label={t('hub.myCards')} onClick={goPlayers} wide>
            <CardFan players={progress.showcase} size="md" />
          </Tile>
          <div className="hub-grid">
            <Tile label={t('hub.collection')} onClick={goPlayers}>
              <span className="hub-ring" style={{ ['--pct' as string]: `${progress.collectionPct}%` }}>{progress.collectionPct}%</span>
            </Tile>
            <Tile label={t('hub.badges')} soon={t('hub.soon')}><span className="tile__icon" aria-hidden>🛡️</span></Tile>
            <Tile label={t('hub.myStats')} onClick={() => setSheet('stats')}><span className="tile__big">{progress.drafts}</span></Tile>
            <Tile label={t('hub.squads')} soon={t('hub.soon')}><span className="tile__icon" aria-hidden>📋</span></Tile>
          </div>
          <div className="hub-grid hub-grid--3">
            <Tile label={t('hub.settings')} onClick={() => setSheet('settings')}><span className="tile__icon" aria-hidden>⚙️</span></Tile>
            <Tile label={t('hub.backup')} soon={t('hub.soon')}><span className="tile__icon" aria-hidden>☁️</span></Tile>
            <Tile label={t('hub.rules')} onClick={() => setSheet('rules')}><span className="tile__icon" aria-hidden>📖</span></Tile>
          </div>
          {heroes.club && <img className="hub-page__ghost" src={heroes.club} alt="" aria-hidden />}
        </section>
      </div>

      <nav className="hub-dots safe-bottom">
        {[0, 1, 2].map(i => (
          <button key={i} type="button" aria-label={`${i + 1}`} onClick={() => goPage(i)} className={page === i ? 'on' : ''} />
        ))}
      </nav>

      <Sheet open={sheet === 'mode'} title={t('hub.chooseMode')} onClose={() => setSheet(null)}>
        {seed && <p className="sheet-note">{t('seed.sharedRun', { seed })}</p>}
        <button type="button" className="sheet-choice sheet-choice--mode mb-4" onClick={() => onStart('fut')}>
          <b>{t('hub.modeFut')}</b>
          <small>{t('hub.modeFutSub')}</small>
        </button>
        <div className="sheet-choice mb-3">
          <b>{t('hub.modeFfi')}</b>
          <small>{t('hub.modeFfiSub')}</small>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(['classic', 'memory'] as const).map(m => (
              <button key={m} type="button" onClick={() => onModeChange(m)} className={`sheet-choice sheet-choice--row ${mode === m ? 'on' : ''}`}>
                <b>{m === 'classic' ? t('landing.mode.classic') : t('landing.mode.memory')}</b>
              </button>
            ))}
          </div>
          <small className="mt-1">{mode === 'classic' ? t('landing.mode.classicHint') : t('landing.mode.memoryHint')}</small>
        </div>
        <button type="button" className="sheet-cta" onClick={() => onStart('ffi')}>{t('landing.play')}</button>
      </Sheet>
      <SettingsSheet open={sheet === 'settings'} onClose={() => setSheet(null)} />
      <RulesModal open={sheet === 'rules'} onClose={() => setSheet(null)} />
      <StatsModal open={sheet === 'stats'} onClose={() => setSheet(null)} />
    </div>
  )
}

function HeroTile({ title, sub, image, soon, onClick }: { title: string; sub?: string; image: string | null; soon?: string; onClick?: () => void }) {
  return (
    <button type="button" className="tile tile--hero" onClick={onClick} disabled={!onClick}>
      <span className="tile--hero__title">{title}</span>
      {sub && <span className="tile--hero__sub">{sub}</span>}
      {soon && <span className="tile__soon">{soon}</span>}
      {image && <img className="tile--hero__img" src={image} alt="" aria-hidden />}
    </button>
  )
}

function Tile({ label, children, onClick, soon, wide }: { label: string; children?: ReactNode; onClick?: () => void; soon?: string; wide?: boolean }) {
  return (
    <button type="button" className={`tile ${wide ? 'tile--wide' : ''} ${soon ? 'tile--soon' : ''}`} onClick={onClick} disabled={!onClick}>
      <span className="tile__body">{children}</span>
      <span className="tile__label">{label}</span>
      {soon && <span className="tile__soon">{soon}</span>}
    </button>
  )
}

function CardFan({ players, size = 'sm' }: { players: Player[]; size?: 'sm' | 'md' }) {
  return (
    <span className={`card-fan card-fan--${size}`}>
      {players.map(p => <FutCard key={p.id} player={p} size={size} />)}
    </span>
  )
}
