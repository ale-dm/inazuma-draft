import { useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { redeemCode } from '../../lib/store-extra'
import { RewardBadge } from '../modes/Fatal'
import type { Reward } from '../../lib/objectives'
import { playSfx } from '../../lib/sfx'
import Screen from './Screen'

/** Códigos canjeables (como el botón CODES de MADFUT) */
export default function Codes() {
  const { t } = useAppSettings()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [got, setGot] = useState<Reward | null>(null)

  function submit() {
    const r = redeemCode(code)
    if (r === 'invalid') { setMsg(t('codes.invalid')); setGot(null); return }
    if (r === 'used') { setMsg(t('codes.used')); setGot(null); return }
    playSfx('qualify')
    setMsg(t('codes.ok'))
    setGot(r)
    setCode('')
  }

  return (
    <Screen title={t('codes.title')}>
      <p className="fd-hint">{t('codes.hint')}</p>
      <input className="search-input codes-input" value={code} onChange={e => setCode(e.target.value)} placeholder="INAZUMA"
        onKeyDown={e => { if (e.key === 'Enter') submit() }} />
      <button type="button" className="sheet-cta" disabled={!code.trim()} onClick={submit}>{t('codes.redeem')}</button>
      {msg && <p className="fd-hint">{msg}</p>}
      {got && <div className="flex justify-center"><RewardBadge r={got} /></div>}
    </Screen>
  )
}
