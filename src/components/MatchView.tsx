import { getTechnique, teamLabel, techniqueName } from '../data/catalog'
import type { MatchResult } from '../types'
import { matchWinner } from '../engine/sim'
import { useAppSettings } from '../context/AppSettings'
import { Goal, X } from 'lucide-react'

function moveLabel(id: string | undefined, fallback: string, locale: string): string {
  const tech = id ? getTechnique(id) : undefined
  return tech ? techniqueName(tech, locale) : fallback
}

interface Props {
  result: MatchResult
  highlightTeam?: string
}

export default function MatchView({ result, highlightTeam }: Props) {
  const { t, locale } = useAppSettings()
  const [s1, s2] = result.score
  const winner = matchWinner(result)
  const regEvents = result.events.filter(e => e.type !== 'penalty')
  const penEvents = result.events.filter(e => e.type === 'penalty')

  return (
    <div className="iz-panel animate-fade-in">
      <div className="iz-panel-head text-center">{t('match.title')}</div>
      <div className="iz-panel-body">
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className={`text-center flex-1 ${winner === 0 ? 'text-accent' : 'text-iz-text'}`}>
          <div className="text-sm text-iz-muted mb-1 font-heading">{teamLabel(result.team1Name, locale)}</div>
          <div className="text-4xl font-heading font-black">{s1}</div>
          {result.penalties && (
            <div className="text-xs text-iz-cyan mt-1 tabular-nums">({result.penalties[0]})</div>
          )}
        </div>
        <div className="text-iz-cyan font-heading font-bold">—</div>
        <div className={`text-center flex-1 ${winner === 1 ? 'text-accent' : 'text-iz-text'}`}>
          <div className="text-sm text-iz-muted mb-1 font-heading">{teamLabel(result.team2Name, locale)}</div>
          <div className="text-4xl font-heading font-black">{s2}</div>
          {result.penalties && (
            <div className="text-xs text-iz-cyan mt-1 tabular-nums">({result.penalties[1]})</div>
          )}
        </div>
      </div>

      {result.decidedByPenalties && result.penalties && (
        <p className="text-center text-xs text-iz-cyan mb-3 font-heading">
          {t('match.penalties', { a: result.penalties[0], b: result.penalties[1] })}
        </p>
      )}

      {regEvents.length > 0 && (
        <div className="space-y-1 border-t divider-iz pt-3">
          {regEvents.map((e, i) => {
            const teamName = e.team === 0 ? result.team1Name : result.team2Name
            const highlight = highlightTeam === teamName
            return (
              <div key={i} className={`text-sm flex gap-2 ${highlight ? 'text-hissatsu font-heading' : 'text-iz-muted'}`}>
                <span className="w-8 text-right tabular-nums">{e.minute}'</span>
                <Goal size={16} className="shrink-0 mt-0.5" aria-hidden />
                <span>{e.player}{e.move ? ` — ${moveLabel(e.moveId, e.move, locale)}` : ''}</span>
              </div>
            )
          })}
        </div>
      )}

      {penEvents.length > 0 && (
        <div className={`space-y-1 ${regEvents.length > 0 ? 'mt-3' : ''} border-t divider-iz pt-3`}>
          <p className="text-xs text-iz-cyan uppercase font-heading mb-2">{t('match.penaltyShootout')}</p>
          {penEvents.map((e, i) => {
            const teamName = e.team === 0 ? result.team1Name : result.team2Name
            const highlight = highlightTeam === teamName
            return (
              <div key={i} className={`text-sm flex gap-2 ${highlight ? 'text-hissatsu font-heading' : 'text-iz-muted'}`}>
                <span className="w-8 text-right tabular-nums">P{i + 1}</span>
                {e.move === 'miss'
                  ? <X size={16} className="shrink-0 mt-0.5 text-red-400" aria-hidden />
                  : <Goal size={16} className="shrink-0 mt-0.5" aria-hidden />}
                <span>{e.player}</span>
              </div>
            )
          })}
        </div>
      )}

      {regEvents.length === 0 && penEvents.length === 0 && (
        <div className="text-center text-iz-muted text-sm border-t divider-iz pt-3">{t('match.draw')}</div>
      )}
      </div>
    </div>
  )
}
