import { useMemo, useState } from 'react'
import type { Category, Player, Position } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getPlayer } from '../../data/catalog'
import { QUICK_SELL, quickSell, useClub } from '../../lib/club'
import { RARITY_CLASS, RARITY_ORDER } from '../../lib/packs'
import InaCard from '../InaCard'
import CardInfo from '../CardInfo'
import Sheet from '../hub/Sheet'
import Screen from './Screen'

const POSITIONS: (Position | 'all')[] = ['all', 'GK', 'DF', 'MF', 'FW']

/** Mis cartas: la colección del club con filtros, repetidas (×N) y venta rápida de las copias */
export default function MyCards() {
  const { t } = useAppSettings()
  const club = useClub()
  const [pos, setPos] = useState<Position | 'all'>('all')
  const [rarity, setRarity] = useState<Category | 'all'>('all')
  const [dupesOnly, setDupesOnly] = useState(false)
  const [open, setOpen] = useState<Player | null>(null)

  const owned = useMemo(() => Object.entries(club.cards)
    .map(([id, n]) => ({ p: getPlayer(id), n }))
    .filter((x): x is { p: Player; n: number } => !!x.p && x.n > 0)
    .sort((a, b) => b.p.ovr - a.p.ovr), [club.cards])
  const shown = owned.filter(({ p, n }) =>
    (pos === 'all' || p.position === pos) && (rarity === 'all' || p.category === rarity) && (!dupesOnly || n > 1))
  const dupeValue = owned.reduce((s, { p, n }) => s + (n - 1) * QUICK_SELL[p.category], 0)

  function sellAllDupes() {
    for (const { p, n } of owned) if (n > 1) quickSell(p.id, n - 1, QUICK_SELL[p.category])
  }

  return (
    <Screen title={t('hub.myCards')}>
      <div className="chip-row">
        {POSITIONS.map(x => (
          <button key={x} type="button" className={`chip ${pos === x ? 'on' : ''}`} onClick={() => setPos(x)}>{x === 'all' ? t('players.all') : x}</button>
        ))}
      </div>
      <div className="chip-row">
        <button type="button" className={`chip ${rarity === 'all' ? 'on' : ''}`} onClick={() => setRarity('all')}>{t('players.all')}</button>
        {[...RARITY_ORDER].reverse().map(c => (
          <button key={c} type="button" className={`chip ${rarity === c ? 'on' : ''}`} onClick={() => setRarity(c)}>
            <i className={`odds odds--${RARITY_CLASS[c]}`} />
          </button>
        ))}
        <button type="button" className={`chip ${dupesOnly ? 'on' : ''}`} onClick={() => setDupesOnly(d => !d)}>×2+</button>
      </div>
      <p className="fd-hint">{t('club.count', { n: owned.length, shown: shown.length })}</p>
      {dupeValue > 0 && (
        <button type="button" className="sheet-choice sheet-choice--row" onClick={sellAllDupes}>
          <small>{t('club.sellDupes')}</small><b>🪙 {dupeValue.toLocaleString()}</b>
        </button>
      )}
      {owned.length === 0 && <p className="fd-hint">{t('club.empty')}</p>}
      <div className="card-grid">
        {shown.slice(0, 300).map(({ p, n }) => (
          <span key={p.id} className="card-grid__item">
            <InaCard player={p} size="sm" onClick={() => setOpen(p)} />
            {n > 1 && <span className="dupe-badge">×{n}</span>}
          </span>
        ))}
      </div>

      <Sheet open={!!open} title={open?.name ?? ''} onClose={() => setOpen(null)}>
        {open && (
          <div className="flex flex-col items-center gap-3">
            <InaCard player={open} size="lg" />
            {(club.cards[open.id] ?? 0) > 1 && (
              <button type="button" className="sheet-cta" onClick={() => quickSell(open.id, club.cards[open.id] - 1, QUICK_SELL[open.category])}>
                {t('club.sell', { n: club.cards[open.id] - 1 })} · 🪙 {((club.cards[open.id] - 1) * QUICK_SELL[open.category]).toLocaleString()}
              </button>
            )}
            <div className="w-full"><CardInfo player={open} /></div>
          </div>
        )}
      </Sheet>
    </Screen>
  )
}
