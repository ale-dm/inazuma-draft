import { useEffect, useMemo } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import { MAX_TEAM_CHEM } from '../../lib/chemistry'
import { GAMES } from '../../data/catalog'
import { clearDraft } from '../../lib/saved-draft'
import { draftTier, lastDraftXI, loadLastDraft, ratingStars } from '../../lib/last-draft'
import { CUPS_HASH, DRAFT_HASH, FATAL_DRAFT_HASH } from '../../lib/route'
import Screen from '../club/Screen'
import { Shield } from 'lucide-react'

const POINTS_MAX = 700

/**
 * Resumen del draft (como en MADFUT): media con estrellas, química, puntos de draft con su récord, variedad del once
 * y, abajo, qué hacer con él: Fatal Draft o Copas de draft. Con "Nuevo draft" se empieza otro.
 */
export default function DraftSummary() {
  const { t } = useAppSettings()
  const club = useClub()
  const draft = useMemo(loadLastDraft, [])
  useEffect(() => { if (!draft) window.location.hash = DRAFT_HASH }, [draft])
  if (!draft) return null

  const { xi } = lastDraftXI(draft)
  const games = new Set(xi.map(p => p.game)).size
  const teams = new Set(xi.map(p => p.team)).size
  const elements = new Set(xi.map(p => p.element)).size
  const tier = draftTier(draft.points)
  const record = draft.points >= club.draftBest

  return (
    <Screen title={t('hub.draft')}>
      <div className="sum">
        <div className="sum-top">
          <div className="sum-rating">
            <span className="sum-big"><b>{draft.rating}</b><small>{t('fd.rating')}</small></span>
            <span className="sum-stars" aria-label={`${ratingStars(draft.rating)}/5`}>
              {[1, 2, 3, 4, 5].map(n => <i key={n} className={n <= ratingStars(draft.rating) ? 'on' : ''}>★</i>)}
            </span>
          </div>
          <div className="sum-chem">
            <span className="sum-big"><b>{draft.chem}</b><small>{t('fd.chemistry')}</small></span>
            <span className="sum-bar"><span style={{ width: `${(draft.chem / MAX_TEAM_CHEM) * 100}%` }} /></span>
          </div>
        </div>

        <div className="sum-score">
          <div className="sum-ring" style={{ ['--pct' as string]: `${Math.min(100, (draft.points / POINTS_MAX) * 100)}%` }}>
            <b>{draft.points}</b>
            <small>{t('sum.points')}</small>
          </div>
          <div className="sum-tier">
            <span className={`sum-shield sum-shield--${tier}`}><Shield size={44} strokeWidth={1.4} /><b>{t(`sum.tier.${tier}`)}</b></span>
            <span className="sum-best"><small>{t('free.best')}</small> {club.draftBest}</span>
            {record && <span className="sum-new">{t('sum.newBest')}</span>}
          </div>
        </div>

        <div className="sum-stats">
          <span><b>{games}</b><i style={{ ['--w' as string]: `${(games / GAMES.length) * 100}%` }} /><small>{t('sum.games')}</small></span>
          <span><b>{teams}</b><i style={{ ['--w' as string]: `${(teams / xi.length) * 100}%` }} /><small>{t('sum.teams')}</small></span>
          <span><b>{elements}</b><i style={{ ['--w' as string]: `${(elements / 4) * 100}%` }} /><small>{t('sum.elements')}</small></span>
        </div>

        <div className="sum-actions">
          <a href={FATAL_DRAFT_HASH} className="sum-btn sum-btn--fatal"><span>FATAL</span><small>DRAFT</small></a>
          <a href={CUPS_HASH} className="sum-btn sum-btn--cups">{t('sum.cups')}</a>
        </div>
        <a href={DRAFT_HASH} className="chip sum-again" onClick={() => clearDraft()}>{t('hub.newDraft')}</a>
      </div>
    </Screen>
  )
}
