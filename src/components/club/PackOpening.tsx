import { useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { addCards, getClub, takePack, track } from '../../lib/club'
import { getPack, openPack } from '../../lib/packs'
import InaCard from '../InaCard'
import Walkout, { bestOf } from './Walkout'

/**
 * Apertura de un sobre guardado: sobre cerrado → tocar → sale la mejor carta poco a poco (afinidad, puesto, escudo y
 * carta, como el walkout de FIFA) → tocar → todas las cartas de golpe, de mayor a menor media, con las nuevas marcadas.
 */
export default function PackOpening({ packId, onClose }: { packId: string; onClose: () => void }) {
  const { t } = useAppSettings()
  const pack = getPack(packId)
  const [cards, setCards] = useState<Player[] | null>(null)
  const [owned] = useState(() => new Set(Object.keys(getClub().cards)))
  const [done, setDone] = useState(false)

  function open() {
    if (!takePack(packId)) return onClose()
    const got = openPack(pack).sort((a, b) => b.ovr - a.ovr)
    for (const p of got) if (p.image) new Image().src = p.image      // las fotos llegan antes del resumen
    addCards(got.map(p => p.id))
    track('packs')
    setCards(got)
  }

  return (
    <div className="pack-stage">
      {!cards && (
        <button type="button" className={`pack pack--${pack.tone} pack--sealed`} onClick={open}>
          <span className="pack__name">{t(pack.nameKey)}</span>
          <span className="pack__count">×{pack.cards}</span>
          <span className="pack__tap">{t('pack.tap')}</span>
        </button>
      )}

      {cards && !done && <Walkout player={bestOf(cards)} onDone={() => setDone(true)} />}

      {done && cards && (
        <div className="pack-summary">
          <h2 className="fd-title">{t(pack.nameKey)}</h2>
          <div className="fd-options">
            {cards.map(p => (
              <span key={p.id} className="pack-summary__card">
                <InaCard player={p} size="sm" />
                {!owned.has(p.id) && <span className="new-badge new-badge--sm">{t('pack.new')}</span>}
              </span>
            ))}
          </div>
          <button type="button" className="sheet-cta" onClick={onClose}>{t('pack.continue')}</button>
        </div>
      )}
    </div>
  )
}
