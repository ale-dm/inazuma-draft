import { useEffect, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { addPack, spend, useClub } from '../../lib/club'
import { PACKS, RARITY_CLASS, getPack, weeklyTeam } from '../../lib/packs'
import { teamLogo, teamName } from '../../data/catalog'
import {
  TOKENS, claimFreeToken, formatLeft, freeTokenAvailable, msToReset, offerLeft, redeemToken, takeOffer, todayOffers,
} from '../../lib/store-extra'
import type { Category } from '../../types'
import { playSfx } from '../../lib/sfx'
import Screen from './Screen'
import PackOpening from './PackOpening'
import Coin from '../Coin'
import { Clock, Gift } from 'lucide-react'

type Tab = 'today' | 'mine' | 'tokens'

/** Tienda (como la de MADFUT): sobres de hoy + a la venta, mis sobres y fichas */
export default function Store() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const [tab, setTab] = useState<Tab>(club.packs.length ? 'mine' : 'today')
  const [opening, setOpening] = useState<string | null>(null)
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 30000)
    return () => clearInterval(id)
  }, [])
  const saved = club.packs.reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {})
  const week = weeklyTeam()

  function buy(id: string, price: number) {
    if (!spend(price)) return
    addPack(id)
    playSfx('pick')
  }

  if (opening) return <PackOpening packId={opening} onClose={() => setOpening(null)} />

  return (
    <Screen title={t('hub.store')}>
      <div className="store-tabs">
        {(['today', 'mine', 'tokens'] as const).map(k => (
          <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {t(`store.tab.${k}`)}{k === 'mine' && club.packs.length ? <em>{club.packs.length}</em> : null}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          <ul className="offer-list">
            {todayOffers().map((o, i) => {
              const p = getPack(o.pack)
              const left = offerLeft(o)
              return (
                <li key={o.id} className="offer">
                  <span className="offer__n">{left}</span>
                  <span className="offer__text">
                    <b>{t(o.nameKey)}</b>
                    <small>{t(o.descKey)}</small>
                    <small className="offer__time"><Clock size={12} /> {formatLeft(msToReset())}</small>
                  </span>
                  <span className={`offer__pack pack--${p.tone}`}>{p.ovrMin ? `${p.ovrMin}+` : `×${p.cards}`}</span>
                  <button type="button" className="offer__buy" disabled={left <= 0 || club.coins < o.price}
                    onClick={() => { if (takeOffer(o)) { playSfx('pick'); setTab('mine') } }} data-i={i}>
                    {left <= 0 ? t('store.soldOut') : o.price ? <><Coin /> {o.price.toLocaleString()}</> : t('store.free')}
                  </button>
                </li>
              )
            })}
          </ul>
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
        </>
      )}

      {tab === 'mine' && (
        Object.keys(saved).length === 0
          ? <p className="fd-hint">{t('store.noPacks')}</p>
          : (
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
          )
      )}

      {tab === 'tokens' && (
        <>
          <button type="button" className="token-free" disabled={!freeTokenAvailable()} onClick={() => { if (claimFreeToken()) playSfx('qualify') }}>
            <Gift size={28} />
            <b>{freeTokenAvailable() ? t('store.freeToken') : t('obj.comeBack')}</b>
            <span className="rw-token rw-token--special">80</span>
          </button>
          <div className="token-grid">
            {TOKENS.map(id => {
              const p = getPack(id)
              const n = club.tokens[id] ?? 0
              return (
                <button key={id} type="button" className="token" disabled={!n} onClick={() => { if (redeemToken(id)) { setOpening(id) } }}>
                  <span className={`rw-token rw-token--${p.tone} rw-token--big`}>{p.ovrMin ?? (id.includes('silver') ? t('token.silver') : t('token.bronze'))}</span>
                  {n > 0 && <span className="pack__stack">{n}</span>}
                  <small>{t(p.nameKey)}</small>
                </button>
              )
            })}
          </div>
          <p className="fd-hint">{t('store.tokensHint')}</p>
        </>
      )}
    </Screen>
  )
}
