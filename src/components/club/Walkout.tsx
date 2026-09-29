import { useEffect, useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { teamLogo, teamName } from '../../data/catalog'
import { RARITY_CLASS } from '../../lib/packs'
import { playSfx } from '../../lib/sfx'
import InaCard from '../InaCard'
import { ElementIcon } from '../GameIcon'

const NO_TEAM = new Set(['Unaffiliated', 'Sub Character'])
const STEP_MS = 1100

/** La mejor carta de un sobre (más media; si empatan, la primera) */
export const bestOf = (cards: Player[]) => cards.reduce((a, b) => (b.ovr > a.ovr ? b : a))

/**
 * Salida de la mejor carta del sobre, como el walkout de FIFA y con su mismo orden: primero la afinidad (la bandera),
 * luego el puesto, luego el escudo (el club) y al final la carta. Tocar en cualquier momento → todas las cartas.
 */
export default function Walkout({ player, onDone }: { player: Player; onDone: () => void }) {
  const { t, locale } = useAppSettings()
  const logo = NO_TEAM.has(player.team) ? undefined : teamLogo(player.team, player.game)
  const steps = logo ? 4 : 3
  const [step, setStep] = useState(0)
  const last = step >= steps - 1

  useEffect(() => {
    if (player.image) new Image().src = player.image
    if (logo) new Image().src = logo
  }, [player, logo])

  useEffect(() => {
    if (last) {
      if (player.category === 'Legendary Player' || player.category === 'Top Player') playSfx('qualify')
      return
    }
    playSfx('pick')
    const id = setTimeout(() => setStep(s => s + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [step, last, player.category])

  const kind = step === 0 ? 'element' : step === 1 ? 'position' : step === 2 && logo ? 'crest' : 'card'

  return (
    <div className={`walkout walkout--${RARITY_CLASS[player.category]}`} onClick={onDone} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onDone() }} aria-label={t('pack.showAll')}>
      <span className="walkout__beams" aria-hidden />
      <div key={step} className={`walkout__step walkout__step--${kind}`}>
        {kind === 'element' && (<><ElementIcon element={player.element} className="walkout__el" /><b>{t(`element.${player.element}`)}</b></>)}
        {kind === 'position' && <b className="walkout__pos">{player.position}</b>}
        {kind === 'crest' && logo && (<><img className="walkout__crest" src={logo} alt="" /><b>{teamName(player.team, locale)}</b></>)}
        {kind === 'card' && <InaCard player={player} size="lg" />}
      </div>
      <p className="walkout__hint">{t('pack.showAll')}</p>
    </div>
  )
}
