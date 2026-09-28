import { useMemo, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { draftPoolKey, getDraftPools, getTeamRoster, teamName } from '../../data/catalog'
import { GAME_SHORT } from '../../data/games'
import { updateClub, useClub } from '../../lib/club'
import { COLLECTION_REWARD, giveReward } from '../../lib/objectives'
import Screen from './Screen'

/** Colecciones: cada equipo de cada juego (su plantilla del draft); premio al completarla */
export default function Collections() {
  const { t, locale } = useAppSettings()
  const club = useClub()
  const [q, setQ] = useState('')

  const rows = useMemo(() => getDraftPools().map(pool => {
    const roster = getTeamRoster(pool)
    const have = roster.filter(p => (club.cards[p.id] ?? 0) > 0).length
    return { key: draftPoolKey(pool), pool, total: roster.length, have, pct: roster.length ? Math.floor((have / roster.length) * 100) : 0 }
  }).filter(r => r.total > 0), [club.cards])

  const claimed = new Set(club.collections)
  const query = q.trim().toLowerCase()
  const shown = rows
    .filter(r => !query || r.pool.teamId.toLowerCase().includes(query) || teamName(r.pool.teamId, locale).toLowerCase().includes(query))
    .sort((a, b) => Number(b.pct === 100 && !claimed.has(b.key)) - Number(a.pct === 100 && !claimed.has(a.key)) || b.pct - a.pct || b.total - a.total)
  const done = rows.filter(r => r.pct === 100).length

  function claim(key: string) {
    if (claimed.has(key)) return
    updateClub(s => ({ ...s, collections: [...s.collections, key] }))
    giveReward(COLLECTION_REWARD)
  }

  return (
    <Screen title={t('hub.collection')}>
      <p className="fd-hint">{t('coll.summary', { done, total: rows.length })}</p>
      <input className="search-input" placeholder={t('players.search')} value={q} onChange={e => setQ(e.target.value)} />
      <ul className="obj-list">
        {shown.slice(0, 120).map(r => (
          <li key={r.key} className={`obj ${claimed.has(r.key) ? 'obj--done' : ''}`}>
            <span className="obj__text">
              <b>{teamName(r.pool.teamId, locale)} <small>· {GAME_SHORT[r.pool.game]}</small></b>
              <small>{r.have}/{r.total}</small>
              <span className="obj__bar"><span style={{ width: `${r.pct}%` }} /></span>
            </span>
            {r.pct === 100
              ? <button type="button" className="chip on" disabled={claimed.has(r.key)} onClick={() => claim(r.key)}>{claimed.has(r.key) ? '✓' : t('obj.claim')}</button>
              : <span className="chip">{r.pct}%</span>}
          </li>
        ))}
      </ul>
    </Screen>
  )
}
