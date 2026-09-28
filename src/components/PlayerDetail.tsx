import { useEffect, useState } from 'react'
import type { Player } from '../types'
import { cardTeamLabel, getCharacterVersions, hyperName, loadDescription, type CardDescription, specialName, teamName } from '../data/catalog'
import { GAME_LABEL } from '../data/games'
import { useAppSettings } from '../context/AppSettings'
import PlayerAvatar from './PlayerAvatar'
import InaCard from './InaCard'
import CardInfo from './CardInfo'
import { ElementIcon, PositionIcon, SpecialIcon } from './GameIcon'
import { CATEGORY_CLASS } from '../lib/categories'


interface Props {
  player: Player
  onClose: () => void
  onOpen: (p: Player) => void
}


export default function PlayerDetail({ player, onClose, onOpen }: Props) {
  const { t, locale } = useAppSettings()
  const versions = getCharacterVersions(player.characterId).filter(v => v.id !== player.id)
  const [desc, setDesc] = useState<CardDescription | null>(null)

  useEffect(() => {
    let live = true
    setDesc(null)
    loadDescription(player.id).then(d => { if (live) setDesc(d) }).catch(() => {})
    return () => { live = false }
  }, [player.id])
  // castellano solo en español; en el resto, la oficial de zukan (inglés)
  const descEs = locale === 'es' && desc?.es
  const descText = descEs || desc?.en || desc?.es

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
            <InaCard player={player} size="sm" />
            <div className="min-w-0 space-y-1">
              <span className={`cat-pill ${CATEGORY_CLASS[player.category]}`}>{player.category}</span>
              <p className="font-heading font-bold text-iz-heading">
                <PositionIcon position={player.position} className="h-5 align-middle" />{' '}
                <ElementIcon element={player.element} className="h-5 w-5 align-middle" /> <span className={`element-${player.element}`}>{t(`element.${player.element}`)}</span>
              </p>
              <p className="text-sm text-iz-text">
                {cardTeamLabel(player, locale)}
              </p>
              <p className="text-xs text-iz-muted">
                {player.game} · {GAME_LABEL[player.game]}{player.no ? ` · Nº ${player.no}` : ''}
              </p>
            </div>
          </div>

          {descText && (
            <section>
              <h3 className="font-heading text-sm font-bold text-accent mb-2">{t('players.description')}</h3>
              <p className="text-sm text-iz-text italic" lang={descEs || !desc?.en ? 'es' : 'en'}>“{descText}”</p>
            </section>
          )}

          {player.specials.length > 0 && (
            <section>
              <h3 className="font-heading text-sm font-bold text-accent mb-2">{t('players.specials')}</h3>
              <ul className="space-y-1.5">
                {player.specials.map((sp, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <SpecialIcon type={sp.type} className="w-7 h-7 shrink-0" />
                    <span className="text-[0.65rem] text-iz-muted">{t(`special.${sp.type}`)}</span>
                    <span className="font-heading font-bold text-iz-heading truncate">
                      {specialName(sp, locale)}
                    </span>
                    {sp.armed && <span className="ml-auto text-xs text-accent font-heading">{t('special.armed')}</span>}
                  </li>
                ))}
                {player.specials.filter(sp => sp.hyper).map((sp, i) => (
                  <li key={`h${i}`} className="flex items-center gap-2 text-sm">
                    <SpecialIcon type="keshin" className="w-7 h-7 shrink-0 opacity-70" />
                    <span className="text-[0.65rem] text-iz-muted">{t('special.hyper')}</span>
                    <span className="font-heading font-bold text-hissatsu truncate">{hyperName(sp, locale)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CardInfo player={player} />

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
