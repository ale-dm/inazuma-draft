import { useMemo, useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getPlayer, teamName } from '../../data/catalog'
import { SBCS, reqOk, reqValue, sbcAvailable, sbcReady, submitSbc, type Sbc, type SbcReq } from '../../lib/sbc'
import { getPack } from '../../lib/packs'
import { useClub } from '../../lib/club'
import { playSfx } from '../../lib/sfx'
import type { Reward } from '../../lib/objectives'
import InaCard from '../InaCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import { Check, Package, Repeat } from 'lucide-react'

export function RewardText({ r }: { r: Reward }) {
  const { t } = useAppSettings()
  return (
    <span className="reward-inline">
      {r.coins ? <><Coin /> {r.coins.toLocaleString()}</> : null}
      {r.coins && r.pack ? ' + ' : null}
      {r.pack ? <><Package size={14} /> {t(getPack(r.pack).nameKey)}</> : null}
    </span>
  )
}

function ReqText({ r, size }: { r: SbcReq; size: number }) {
  const { t, locale } = useAppSettings()
  switch (r.kind) {
    case 'rating': return <>{t('sbc.req.rating', { n: r.n })}</>
    case 'sameGame': return <>{t('sbc.req.sameGame', { n: r.n })}</>
    case 'sameTeam': return <>{t('sbc.req.sameTeam', { n: r.n })}</>
    case 'sameElement': return <>{t('sbc.req.sameElement', { n: r.n })}</>
    case 'minCategory': return <>{t('sbc.req.minTop', { n: r.n })}</>
    case 'team': return <>{t('sbc.req.team', { n: r.n, team: teamName(r.team, locale) })}</>
    case 'games': return <>{t('sbc.req.games', { n: size, games: r.games.join(' / ') })}</>
  }
}

/** Retos (SBC, fase 5): lista y entrega de cartas repetidas */
export default function SbcScreen() {
  const { t } = useAppSettings()
  const club = useClub()
  const [open, setOpen] = useState<Sbc | null>(null)
  if (open) return <SbcView sbc={open} onBack={() => setOpen(null)} />
  return (
    <Screen title={t('hub.sbc')} statsToggle>
      <p className="fd-hint">{t('sbc.rules')}</p>
      <ul className="obj-list">
        {SBCS.map(c => {
          const n = club.sbcDone[c.id] ?? 0
          const avail = sbcAvailable(c)
          return (
            <li key={c.id} className={`obj ${avail ? '' : 'obj--done'}`} role="button" onClick={() => avail && setOpen(c)}>
              <span className="obj__text">
                <b>{t(c.nameKey)} {c.repeatable && <Repeat size={12} className="inline opacity-70" />}</b>
                <small>{t('sbc.cards', { n: c.size })} · {c.reqs.map((r, i) => <span key={i}>{i ? ' · ' : ''}<ReqText r={r} size={c.size} /></span>)}</small>
                <small><RewardText r={c.reward} /></small>
              </span>
              <span className="chip on">{avail ? (n ? `×${n}` : t('modes.play')) : <Check size={16} />}</span>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}

function SbcView({ sbc, onBack }: { sbc: Sbc; onBack: () => void }) {
  const { t } = useAppSettings()
  const club = useClub()
  const [picked, setPicked] = useState<Player[]>([])
  const [msg, setMsg] = useState('')
  const dupes = useMemo(() => Object.entries(club.cards).filter(([, n]) => n > 1).map(([id]) => getPlayer(id))
    .filter((p): p is Player => !!p).sort((a, b) => b.ovr - a.ovr), [club.cards])
  const pool = dupes.filter(p => !picked.includes(p))
  const ready = sbcReady(sbc, picked)

  function toggle(p: Player) {
    setMsg('')
    setPicked(l => (l.includes(p) ? l.filter(x => x !== p) : l.length < sbc.size ? [...l, p] : l))
  }

  function submit() {
    if (!submitSbc(sbc, picked)) return
    playSfx('qualify')
    setPicked([])
    setMsg(t('sbc.done'))
    if (!sbc.repeatable) onBack()
  }

  return (
    <Screen title={t(sbc.nameKey)} statsToggle>
      <button type="button" className="chip self-start" onClick={onBack}>← {t('hub.sbc')}</button>
      <ul className="sbc-reqs">
        <li className={picked.length === sbc.size ? 'ok' : ''}>{t('sbc.cards', { n: sbc.size })} <b>{picked.length}/{sbc.size}</b></li>
        {sbc.reqs.map((r, i) => (
          <li key={i} className={reqOk(r, picked, sbc.size) ? 'ok' : ''}><ReqText r={r} size={sbc.size} /> <b>{reqValue(r, picked)}</b></li>
        ))}
        <li className="sbc-reqs__reward"><RewardText r={sbc.reward} /></li>
      </ul>
      <div className="sbc-slots">
        {Array.from({ length: sbc.size }, (_, i) => picked[i]
          ? <InaCard key={picked[i].id} player={picked[i]} size="xs" onClick={() => toggle(picked[i])} />
          : <span key={i} className="fd-empty sbc-slot">+</span>)}
      </div>
      <button type="button" className="sheet-cta" disabled={!ready} onClick={submit}>{t('sbc.submit')}</button>
      {msg && <p className="reward-line">{msg}</p>}
      <h3 className="sheet-label">{t('sbc.dupes', { n: dupes.length })}</h3>
      {dupes.length === 0 && <p className="fd-hint">{t('sbc.noDupes')}</p>}
      <div className="card-grid">
        {pool.slice(0, 200).map(p => (
          <span key={p.id} className="card-grid__item">
            <InaCard player={p} size="sm" onClick={() => toggle(p)} />
            <span className="dupe-badge">×{club.cards[p.id]}</span>
          </span>
        ))}
      </div>
    </Screen>
  )
}
