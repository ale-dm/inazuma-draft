import { useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { addPack, spend, useClub } from '../../lib/club'
import { PACKS, RARITY_CLASS, getPack, weeklyTeam } from '../../lib/packs'
import { teamLogo, teamName } from '../../data/catalog'
import type { Category } from '../../types'
import { playSfx } from '../../lib/sfx'
import Screen from './Screen'
import PackOpening from './PackOpening'
import Coin from '../Coin'

/** Tienda: sobres a la venta y los sobres guardados (comprados o ganados) listos para abrir */
export default function Store() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const week = weeklyTeam()
  const [opening, setOpening] = useState<string | null>(null)
  const saved = club.packs.reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {})

  function buy(id: string, price: number) {
    if (!spend(price)) return
    addPack(id)
    playSfx('pick')
  }

  if (opening) return <PackOpening packId={opening} onClose={() => setOpening(null)} />

  return (
    <Screen title={t('hub.store')}>
      {Object.keys(saved).length > 0 && (
        <>
          <h3 className="sheet-label">{t('store.myPacks')}</h3>
          <div className="pack-grid">
            {Object.entries(saved).map(([id, n]) => {
              const p = getPack(id)
              return (
                <button key={id} type="button" className={`pack pack--${p.tone}`} onClick={() => setOpening(id)}>
                  <span className="pack__name">{t(p.nameKey)}</span>
                  <span className="pack__count">×{p.cards}</span>
                  {n > 1 && <span className="pack__stack">{n}</span>}
                  <span className="pack__buy">{t('store.open')}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
      <h3 className="sheet-label">{t('store.forSale')}</h3>
      <div className="pack-grid">
        {PACKS.filter(p => p.price != null).map(p => (
          <button key={p.id} type="button" className={`pack pack--${p.tone}`} disabled={club.coins < p.price!} onClick={() => buy(p.id, p.price!)}>
            <span className="pack__name">{t(p.nameKey)}</span>
            {p.weeklyTeam && (
              <span className="pack__team">
                {teamLogo(week) && <img className="ic__badge" src={teamLogo(week)} alt="" />}{teamName(week, locale)}
              </span>
            )}
            <span className="pack__count">×{p.cards}</span>
            <span className="pack__odds">
              {(Object.entries(p.odds) as [Category, number][]).map(([c, w]) => <i key={c} className={`odds odds--${RARITY_CLASS[c]}`}>{w}%</i>)}
            </span>
            <span className="pack__buy"><Coin /> {p.price!.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </Screen>
  )
}
