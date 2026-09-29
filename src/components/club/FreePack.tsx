import { useEffect, useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getClub, useClub } from '../../lib/club'
import { BONUS_GOAL, formatLeft, freePackReadyIn, openFreePack } from '../../lib/store-extra'
import { playSfx } from '../../lib/sfx'
import InaCard from '../InaCard'
import Screen from './Screen'
import { Gift } from 'lucide-react'

/**
 * Sobre gratis (como el de MADFUT): 9 cartas flojas cada 10 minutos; sus puntos (lo que cada carta pasa de 50) llenan
 * la barra de bonus (a 500, sobre de oro) y se guarda la mejor puntuación.
 */
export default function FreePack() {
  const { t } = useAppSettings()
  const club = useClub()
  const [owned] = useState(() => new Set(Object.keys(getClub().cards)))
  const [got, setGot] = useState<{ cards: Player[]; points: number; bonus: boolean } | null>(null)
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 15000)
    return () => clearInterval(id)
  }, [])
  const wait = freePackReadyIn()

  function open() {
    const r = openFreePack()
    if (!r) return
    playSfx(r.bonus ? 'qualify' : 'pick')
    setGot(r)
  }

  return (
    <Screen title={t('free.title')}>
      <div className="free-top">
        {got && <span className="free-best"><small>{t('free.best')}</small><b>{club.freePack.best} {t('free.pts')}</b></span>}
        <span className="free-bonus">
          <b>BONUS <Gift size={16} /></b>
          <span className="free-bonus__bar"><span style={{ width: `${(club.freePack.bonus / BONUS_GOAL) * 100}%` }} /></span>
          <small>{club.freePack.bonus} / {BONUS_GOAL}</small>
        </span>
      </div>
      {got ? (
        <>
          <p className="reward-line">+{got.points} {t('free.pts')}{got.bonus ? ` · ${t('free.bonus')}` : ''}</p>
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
          <div className="pack pack--free pack--sealed free-pack">
            <span className="pack__name">{t('pack.free')}</span>
            <span className="pack__count">×9</span>
          </div>
          <button type="button" className="sheet-cta" disabled={wait > 0} onClick={open}>
            {wait > 0 ? t('free.wait', { t: formatLeft(wait) }) : t('free.open')}
          </button>
        </>
      )}
    </Screen>
  )
}
