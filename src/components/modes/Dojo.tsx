import { useMemo, useState } from 'react'
import type { Category, Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getPlayer } from '../../data/catalog'
import { raiseLimit, useClub } from '../../lib/club'
import { canRaise, limitCap } from '../../lib/dojo'
import { limitBonus } from '../../lib/duel'
import { RARITY_CLASS, RARITY_ORDER } from '../../lib/packs'
import InaCard from '../InaCard'
import Sheet from '../hub/Sheet'
import Screen from '../club/Screen'

/** Puntos del límite: rellenos hasta el nivel actual, vacíos hasta el tope de la rareza */
export function LimitDots({ level, cap }: { level: number; cap: number }) {
  return (
    <span className="dojo-dots" aria-label={`${level}/${cap}`}>
      {Array.from({ length: cap }, (_, i) => <i key={i} className={i < level ? 'on' : ''} />)}
    </span>
  )
}

/** Límite de una carta y el botón de ascender (lo usan el Dojo y la ficha de Mis cartas) */
export function LimitControl({ player, copies, level }: { player: Player; copies: number; level: number }) {
  const { t } = useAppSettings()
  const cap = limitCap(player.category)
  const can = canRaise(copies, level, player.category)
  const hint = level >= cap ? t('dojo.max') : copies < 2 ? t('dojo.noSpare') : t('dojo.next', { n: limitBonus(level + 1) - limitBonus(level) })
  return (
    <div className="dojo-control">
      <div className="dojo-control__row">
        <small>{t('dojo.limit')}</small>
        <LimitDots level={level} cap={cap} />
      </div>
      <small className="dojo-control__hint">{hint}</small>
      <button type="button" className="sheet-cta" disabled={!can} onClick={() => raiseLimit(player.id, player.category)}>
        {t('dojo.raise')}
      </button>
    </div>
  )
}

/** Dojo: las cartas con copias de sobra o con límite; las que más se pueden subir, primero */
export default function Dojo() {
  const { t } = useAppSettings()
  const club = useClub()
  const [rarity, setRarity] = useState<Category | 'all'>('all')
  const [open, setOpen] = useState<Player | null>(null)

  const rows = useMemo(() => Object.entries(club.cards)
    .map(([id, n]) => ({ p: getPlayer(id), n, level: club.limits[id] ?? 0 }))
    .filter((x): x is { p: Player; n: number; level: number } => !!x.p && (x.n >= 2 || x.level > 0))
    .sort((a, b) => Number(canRaise(b.n, b.level, b.p.category)) - Number(canRaise(a.n, a.level, a.p.category))
      || b.level - a.level || b.p.ovr - a.p.ovr), [club.cards, club.limits])
  const shown = rows.filter(({ p }) => rarity === 'all' || p.category === rarity)
  const openRow = open ? rows.find(r => r.p.id === open.id) ?? { p: open, n: club.cards[open.id] ?? 0, level: club.limits[open.id] ?? 0 } : null

  return (
    <Screen title={t('dojo.title')}>
      <p className="fd-hint">{t('dojo.intro')}</p>
      <div className="chip-row chip-row--scroll">
        <button type="button" className={`chip ${rarity === 'all' ? 'on' : ''}`} onClick={() => setRarity('all')}>{t('players.all')}</button>
        {[...RARITY_ORDER].reverse().map(c => (
          <button key={c} type="button" className={`chip ${rarity === c ? 'on' : ''}`} onClick={() => setRarity(c)}>
            <i className={`odds odds--${RARITY_CLASS[c]}`} />
          </button>
        ))}
      </div>
      {rows.length === 0 && <p className="fd-hint">{t('dojo.empty')}</p>}
      <div className="card-grid">
        {shown.map(({ p, n, level }) => (
          <span key={p.id} className="card-grid__item dojo-item">
            <InaCard player={p} size="sm" stats limit={level} onClick={() => setOpen(p)} />
            {n > 1 && <span className="dupe-badge">{t('dojo.spare', { n: n - 1 })}</span>}
            <LimitDots level={level} cap={limitCap(p.category)} />
          </span>
        ))}
      </div>

      <Sheet open={!!open} title={open?.name ?? ''} onClose={() => setOpen(null)}>
        {openRow && (
          <div className="flex flex-col items-center gap-3">
            <InaCard player={openRow.p} size="lg" stats limit={openRow.level} />
            <LimitControl player={openRow.p} copies={openRow.n} level={openRow.level} />
          </div>
        )}
      </Sheet>
    </Screen>
  )
}
