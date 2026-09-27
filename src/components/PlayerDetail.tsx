import { useEffect } from 'react'
import type { Player } from '../types'
import { cardTeamLabel, getCharacterVersions, teamName, techniqueName } from '../data/catalog'
import { GAME_LABEL } from '../data/games'
import { ALL_STAT_KEYS } from '../lib/power'
import { useAppSettings } from '../context/AppSettings'
import PlayerAvatar from './PlayerAvatar'
import { CATEGORY_CLASS } from '../lib/categories'

const TECH_ICON: Record<string, string> = { Shoot: '⚽', Dribble: '💨', Block: '🛡️', Catch: '🧤' }

interface Props {
  player: Player
  onClose: () => void
  onOpen: (p: Player) => void
}

const SPECIAL_ICON: Record<string, string> = { keshin: '👤', soul: '🐾', mixi: '🌀' }

export default function PlayerDetail({ player, onClose, onOpen }: Props) {
  const { t, locale } = useAppSettings()
  const versions = getCharacterVersions(player.characterId).filter(v => v.id !== player.id)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="iz-panel max-w-xl w-full max-h-[90vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="iz-panel-head flex items-center justify-between gap-4">
          <span className="truncate">{player.name}</span>
          <button type="button" onClick={onClose} className="iz-nav-btn !text-[0.6rem] !py-0.5 shrink-0">{t('players.close')}</button>
        </div>
        <div className="iz-panel-body overflow-y-auto max-h-[80vh] space-y-5">
          <div className="flex gap-4 items-center">
            <PlayerAvatar player={player} size="lg" variant="zukan" showRating={player.ovr} />
            <div className="min-w-0 space-y-1">
              <span className={`cat-pill ${CATEGORY_CLASS[player.category]}`}>{player.category}</span>
              <p className="font-heading font-bold text-iz-heading">
                {player.position} · <span className={`element-${player.element}`}>{t(`element.${player.element}`)}</span>
              </p>
              <p className="text-sm text-iz-text">
                {cardTeamLabel(player, locale)}
              </p>
              <p className="text-xs text-iz-muted">
                {player.game} · {GAME_LABEL[player.game]}{player.no ? ` · Nº ${player.no}` : ''}
              </p>
            </div>
          </div>

          <section>
            <h3 className="font-heading text-sm font-bold text-accent mb-2">{t('players.stats')}</h3>
            <div className="space-y-1.5">
              {ALL_STAT_KEYS.map(k => (
                <div key={k} className="grid grid-cols-[6.5rem_2rem_1fr] items-center gap-2 text-sm">
                  <span className="text-iz-muted">{t(`stats.${k}`)}</span>
                  <strong className="tabular-nums text-right text-iz-heading">{player.stats[k]}</strong>
                  <div className="stat-bar"><span style={{ width: `${player.stats[k]}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          {(player.description || player.descriptionEs) && (
            <section>
              <h3 className="font-heading text-sm font-bold text-accent mb-2">{t('players.description')}</h3>
              {locale === 'es' && player.descriptionEs
                ? <p className="text-sm text-iz-text italic" lang="es">“{player.descriptionEs}”</p>
                : <p className="text-sm text-iz-text italic" lang="en">“{player.description ?? player.descriptionEs}”</p>}
            </section>
          )}

          {player.specials.length > 0 && (
            <section>
              <h3 className="font-heading text-sm font-bold text-accent mb-2">{t('players.specials')}</h3>
              <ul className="space-y-1.5">
                {player.specials.map((sp, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span aria-hidden>{SPECIAL_ICON[sp.type]}</span>
                    <span className="text-[0.65rem] text-iz-muted">{t(`special.${sp.type}`)}</span>
                    <span className="font-heading font-bold text-iz-heading truncate">
                      {(locale === 'es' && sp.name_es) || sp.name || '—'}
                    </span>
                    {sp.armed && <span className="ml-auto text-xs text-accent font-heading">{t('special.armed')}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="font-heading text-sm font-bold text-accent mb-2">{t('players.techniques')}</h3>
            {player.techniques.length === 0 ? (
              <p className="text-sm text-iz-muted">{t('players.noTechniques')}</p>
            ) : (
              <ul className="space-y-1.5">
                {player.techniques.map(tech => (
                  <li key={tech.id} className="flex items-center gap-2 text-sm">
                    <span aria-hidden>{TECH_ICON[tech.type]}</span>
                    <span className="font-heading font-bold text-hissatsu truncate" title={tech.name}>{techniqueName(tech, locale)}</span>
                    <span className="text-[0.65rem] text-iz-muted">{t(`tech.${tech.type}`)}</span>
                    {tech.cost != null && (
                      <span className="ml-auto text-xs tabular-nums text-iz-text" title={tech.costGame ?? undefined}>
                        TP {tech.cost}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {versions.length > 0 && (
            <section>
              <h3 className="font-heading text-sm font-bold text-accent mb-2">{t('players.versions')}</h3>
              <div className="flex flex-wrap gap-2">
                {versions.map(v => (
                  <button key={v.id} type="button" onClick={() => onOpen(v)}
                    className="team-tile !w-auto flex items-center gap-2 !py-1.5">
                    <PlayerAvatar player={v} size="xs" variant="zukan" />
                    <span className="text-xs">
                      <strong className="tabular-nums">{v.ovr}</strong> · {v.game} · {teamName(v.version === 'base' ? v.team : v.version, locale)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
