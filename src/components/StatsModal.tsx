import { useAppSettings } from '../context/AppSettings'
import type { TranslationKey } from '../i18n/translations'
import { useClub } from '../lib/club'
import Sheet from './hub/Sheet'

/** Mis estadísticas: los contadores de siempre del club (drafts, duelos, copas, sobres, puzzles, retos) */
export default function StatsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useAppSettings()
  const club = useClub()
  const c = (k: string) => club.career[k] ?? 0
  const rows: [TranslationKey, number][] = [
    ['stats.me.drafts', c('drafts')], ['stats.me.chem', c('chem')], ['stats.me.best', club.draftBest],
    ['stats.me.duels', c('duels')], ['stats.me.wins', c('duelWins')], ['stats.me.cups', c('cups')], ['stats.me.cupWins', c('cupWins')],
    ['stats.me.packs', c('packs')], ['stats.me.puzzles', c('puzzles')], ['stats.me.hl', club.hlBest], ['stats.me.sbcs', c('sbcs')],
  ]
  return (
    <Sheet open={open} title={t('hub.myStats')} onClose={onClose}>
      <dl className="stat-rows">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{t(k)}</dt><dd>{v.toLocaleString()}</dd></div>
        ))}
      </dl>
    </Sheet>
  )
}
