import { useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { addCards, getClub, takePack, track } from '../../lib/club'
import { getPack, openPack } from '../../lib/packs'
import { playSfx } from '../../lib/sfx'
import InaCard from '../InaCard'

/**
 * Apertura de un sobre guardado: sobre cerrado → tocar → las cartas salen una a una (la mejor, al final, con brillo
 * si es Leyenda o Élite) → resumen con las nuevas marcadas.
 */
export default function PackOpening({ packId, onClose }: { packId: string; onClose: () => void }) {
  const { t } = useAppSettings()
  const pack = getPack(packId)
  const [cards, setCards] = useState<Player[] | null>(null)
  const [owned] = useState(() => new Set(Object.keys(getClub().cards)))
  const [shown, setShown] = useState(0)

  function open() {
    if (!takePack(packId)) return onClose()
    const got = openPack(pack)
    for (const p of got) if (p.image) new Image().src = p.image      // las fotos llegan antes de enseñar cada carta
    addCards(got.map(p => p.id))
    track('packs')
    setCards(got)
    setShown(1)
  }

  const done = !!cards && shown >= cards.length
  const current = cards?.[shown - 1]
  const walkout = current && (current.category === 'Legendary Player' || current.category === 'Top Player')

  function next() {
    if (!cards) return
    if (shown < cards.length) {
      setShown(shown + 1)
      const nxt = cards[shown]
      if (nxt && (nxt.category === 'Legendary Player')) playSfx('qualify')
    }
  }

  return (
    <div className="pack-stage" onClick={cards && !done ? next : undefined}>
      {!cards && (
        <button type="button" className={`pack pack--${pack.tone} pack--sealed`} onClick={open}>
          <span className="pack__name">{t(pack.nameKey)}</span>
          <span className="pack__count">×{pack.cards}</span>
          <span className="pack__tap">{t('pack.tap')}</span>
        </button>
      )}

      {cards && !done && current && (
        <div key={shown} className={`pack-reveal ${walkout ? 'pack-reveal--walkout' : ''}`}>
          <InaCard player={current} size="lg" />
          {!owned.has(current.id) && <span className="new-badge">{t('pack.new')}</span>}
          <p className="pack-reveal__hint">{shown}/{cards.length} · {t('pack.next')}</p>
        </div>
      )}

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
