import { useMemo, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { getAllPlayers, getPlayer } from '../../data/catalog'
import { fuseCards, useClub } from '../../lib/club'
import { FUSIONS, ingredientsFor, type Fusion, type Owned } from '../../lib/fusion'
import { playSfx } from '../../lib/sfx'
import type { Player } from '../../types'
import InaCard from '../InaCard'
import Sheet from '../hub/Sheet'
import Screen from '../club/Screen'

/** Fusión Mixi Max (docs/plan-modos.md §4): dos personajes del mismo juego se fusionan en su Mixi Max, una vez */
export default function Fusion() {
  const { t } = useAppSettings()
  const club = useClub()
  const [made, setMade] = useState<Player | null>(null)

  const owned = useMemo<Owned[]>(() => Object.entries(club.cards).flatMap(([id, copies]) => {
    const p = getPlayer(id)
    return p ? [{ id, characterId: p.characterId, game: p.game, copies, ovr: p.ovr }] : []
  }), [club.cards])
  // nombre de cada personaje (la primera carta suya que aparezca)
  const names = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of getAllPlayers()) if (!m.has(p.characterId)) m.set(p.characterId, p.name)
    return m
  }, [])

  function fuse(f: Fusion) {
    const plan = ingredientsFor(f, owned, club.fusions)
    if (!plan || !fuseCards(f, plan)) return
    setMade(getPlayer(f.result) ?? null)
    playSfx('win')
  }

  return (
    <Screen title={t('fusion.title')}>
      <p className="fd-hint">{t('fusion.intro')}</p>
      <div className="fusion-list">
        {FUSIONS.map(f => {
          const res = getPlayer(f.result)
          if (!res) return null
          const done = club.fusions.includes(f.id)
          const plan = done ? null : ingredientsFor(f, owned, club.fusions)
          return (
            <div key={f.id} className={`fusion-row ${done ? 'is-done' : ''}`}>
              <InaCard player={res} size="sm" stats />
              <div className="fusion-row__info">
                <b>{names.get(f.a) ?? f.a} + {names.get(f.b) ?? f.b}</b>
                <small>{done ? t('fusion.done') : plan ? t('fusion.ready') : t('fusion.need', { a: names.get(f.a) ?? f.a, b: names.get(f.b) ?? f.b })}</small>
                <button type="button" className="sheet-cta" disabled={!plan} onClick={() => fuse(f)}>
                  {done ? t('fusion.done') : t('fusion.fuse')}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Sheet open={!!made} title={made?.name ?? ''} onClose={() => setMade(null)}>
        {made && (
          <div className="flex flex-col items-center gap-3">
            <p className="fusion-made">{t('fusion.made')}</p>
            <InaCard player={made} size="lg" stats />
          </div>
        )}
      </Sheet>
    </Screen>
  )
}
