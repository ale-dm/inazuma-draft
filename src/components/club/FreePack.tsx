import { useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getClub, useClub } from '../../lib/club'
import { BONUS_GOAL, openFreePack } from '../../lib/store-extra'
import { playSfx } from '../../lib/sfx'
import InaCard from '../InaCard'
import Screen from './Screen'
import Walkout, { bestOf } from './Walkout'
import { Gift } from 'lucide-react'

/**
 * Sobre gratis (como el Free Pack de MADFUT): un sobre básico de 9 cartas que se abre las veces que quieras. Sale la
 * mejor poco a poco (walkout) y, al tocar, las 9. Sus puntos (lo que cada carta pasa de 50) llenan la barra de bonus
 * (a 500, sobre de oro) y se guarda la mejor puntuación.
 */
export default function FreePack() {
  const { t } = useAppSettings()
  const club = useClub()
  const [owned, setOwned] = useState(() => new Set(Object.keys(getClub().cards)))
  const [got, setGot] = useState<{ cards: Player[]; points: number; bonus: boolean } | null>(null)
  const [revealed, setRevealed] = useState(false)

  function open() {
    setOwned(new Set(Object.keys(getClub().cards)))
    const r = openFreePack()
    r.cards.sort((a, b) => b.ovr - a.ovr)
    for (const p of r.cards) if (p.image) new Image().src = p.image
    if (r.bonus) playSfx('qualify')
    setRevealed(false)
    setGot(r)
  }

  return (
    <Screen title={t('free.title')}>
      <div className="free-top">
        <span className="free-best">
          {got && revealed ? <><b className="free-pts">{got.points}</b><small>{t('free.pts')}</small></> : <><small>{t('free.best')}</small><b>{club.freePack.best} {t('free.pts')}</b></>}
        </span>
        <span className="free-bonus">
          <b>BONUS <Gift size={16} /></b>
          <span className="free-bonus__bar"><span style={{ width: `${(club.freePack.bonus / BONUS_GOAL) * 100}%` }} /></span>
          <small>{club.freePack.bonus} / {BONUS_GOAL}</small>
        </span>
      </div>
      {got && !revealed && <div className="pack-stage"><Walkout player={bestOf(got.cards)} onDone={() => setRevealed(true)} /></div>}
      {got && revealed ? (
        <>
          {got.bonus && <p className="reward-line">{t('free.bonus')}</p>}
          <div className="free-grid">
            {got.cards.map(p => (
              <span key={p.id} className="card-grid__item">
                <InaCard player={p} size="sm" />
                {!owned.has(p.id) && <span className="new-badge new-badge--sm">{t('pack.new')}</span>}
              </span>
            ))}
          </div>
          <button type="button" className="sheet-cta" onClick={() => setGot(null)}>{t('free.save')}</button>
        </>
      ) : (
        <>
          <button type="button" className="pack pack--free pack--sealed free-pack" onClick={open}>
            <span className="pack__name">{t('pack.free')}</span>
            <span className="pack__count">×9</span>
            <span className="pack__tap">{t('pack.tap')}</span>
          </button>
          <p className="fd-hint">{t('free.intro')}</p>
        </>
      )}
    </Screen>
  )
}
