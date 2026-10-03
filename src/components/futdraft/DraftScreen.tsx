import { useState } from 'react'
import { track, trackMax } from '../../lib/club'
import { saveLastDraft } from '../../lib/last-draft'
import { loadDraft } from '../../lib/saved-draft'
import { DRAFT_SUMMARY_HASH } from '../../lib/route'
import { trackEvent } from '../../lib/analytics'
import FutDraft from './FutDraft'

/**
 * #/draft: «Draft» del inicio lleva directo a hacerlo (formación, capitán, once, suplentes y reservas). Si había uno a
 * medias, lo sigue. Al terminar se guarda como último draft y sale su resumen (DraftSummary).
 */
export default function DraftScreen() {
  const [resume] = useState(loadDraft)
  return (
    <FutDraft
      resume={resume}
      onExit={() => { window.location.hash = '#/' }}
      onComplete={(lineup, formation, captain, chem, subs, reserves) => {
        saveLastDraft({ lineup, formation, captain, chem, subs, reserves })
        track('drafts')
        trackMax('chem', chem)
        trackEvent('draft_complete', { players: Object.keys(lineup).length, kind: 'fut' })
        window.location.hash = DRAFT_SUMMARY_HASH
      }}
    />
  )
}
