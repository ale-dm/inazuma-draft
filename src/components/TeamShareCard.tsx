import { forwardRef } from 'react'
import type { FormationId, LineupMap } from '../lib/lineup'
import { getFormation, lineupToArray } from '../lib/lineup'
import { lineupPower, playerRating } from '../lib/power'
import { useAppSettings } from '../context/AppSettings'
import PlayerAvatar from './PlayerAvatar'
import { Trophy } from 'lucide-react'

interface Props {
  lineup: LineupMap
  formationId: FormationId
  mode: 'classic' | 'memory'
  seed?: string | null
  won?: boolean
}

const TeamShareCard = forwardRef<HTMLDivElement, Props>(function TeamShareCard(
  { lineup, formationId, mode, seed, won },
  ref,
) {
  const { t } = useAppSettings()
  const formation = getFormation(formationId)
  const ordered = lineupToArray(lineup, formationId)
  const power = mode === 'classic' ? lineupPower(lineup, formationId) : null

  return (
    <div
      ref={ref}
      className="team-share-card"
      data-theme="light"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <div className="team-share-card__head">
        <span>FFI 6-0 · Inazuma Draft</span>
        {won && <Trophy size={20} aria-hidden />}
      </div>
      <h2 className="team-share-card__title text-inazuma">{t('draft.team').toUpperCase()}</h2>
      <p className="team-share-card__meta">
        {t(formation.nameKey)} ({formation.layout})
        {power != null && <> · {t('lineup.power')} <strong>{power}</strong></>}
      </p>
      <div className="team-share-card__grid">
        {ordered.map(p => (
          <div key={p.id} className="team-share-card__player">
            <PlayerAvatar
              player={p}
              size="sm"
              variant="zukan"
              showRating={mode === 'classic' ? playerRating(p) : undefined}
            />
            <div className="min-w-0">
              <p className="team-share-card__name">{p.name}</p>
              <p className="team-share-card__pos">{p.position}</p>
            </div>
          </div>
        ))}
      </div>
      {seed && <p className="team-share-card__seed">Seed: {seed}</p>}
      <p className="team-share-card__foot">ffi-6-0.vercel.app</p>
    </div>
  )
})

export default TeamShareCard
