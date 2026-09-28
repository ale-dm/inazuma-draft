import { useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getPlayer } from '../../data/catalog'
import {
  EVOLUTIONS, boostOf, cancelEvo, completeEvo, eligibleCards, evoReady, evoResult, getEvo, mixiTarget, startEvo, taskProgress,
  type EvoDef,
} from '../../lib/evolutions'
import { useClub } from '../../lib/club'
import { playSfx } from '../../lib/sfx'
import type { TranslationKey } from '../../i18n/translations'
import InaCard from '../InaCard'
import Screen from '../club/Screen'
import Sheet from '../hub/Sheet'
import { ArrowRight } from 'lucide-react'

/** Evoluciones (fase 5): en curso arriba, luego las disponibles; ver lib/evolutions.ts */
export default function Evolutions() {
  const { t } = useAppSettings()
  const club = useClub()
  const [choose, setChoose] = useState<EvoDef | null>(null)
  const [result, setResult] = useState<Player | null>(null)
  const taskText = (event: string, n: number) => t(`obj.ev.${event}` as TranslationKey, { n })

  return (
    <Screen title={t('hub.evolutions')} statsToggle>
      <p className="fd-hint">{t('evo.rules')}</p>

      {club.evos.length > 0 && <h3 className="sheet-label">{t('evo.active')}</h3>}
      {club.evos.map(a => {
        const def = getEvo(a.evo)
        const from = getPlayer(a.cardId)
        const to = evoResult(a)
        const ready = evoReady(a)
        return (
          <div key={a.evo} className="evo-card">
            <b className="evo-card__name">{t(def.nameKey)}</b>
            <div className="evo-card__cards">
              {from && <InaCard player={from} size="sm" />}
              <ArrowRight className="evo-card__arrow" />
              {to && <InaCard player={to} size="sm" />}
            </div>
            <ul className="obj-list">
              {def.tasks.map(tk => {
                const got = taskProgress(a, tk)
                return (
                  <li key={tk.event} className={`obj ${got >= tk.goal ? 'obj--done' : ''}`}>
                    <span className="obj__text">
                      <b>{taskText(tk.event, tk.goal)}</b>
                      <span className="obj__bar"><span style={{ width: `${(got / tk.goal) * 100}%` }} /></span>
                    </span>
                    <span className="chip">{got}/{tk.goal}</span>
                  </li>
                )
              })}
            </ul>
            {!(club.cards[a.cardId] > 0) && <p className="fd-hint">{t('evo.noCard')}</p>}
            <div className="admin-actions">
              <button type="button" className="sheet-cta" disabled={!ready || !(club.cards[a.cardId] > 0)}
                onClick={() => { const r = completeEvo(a); if (r) { playSfx('qualify'); setResult(r) } }}>
                {t('evo.complete')}
              </button>
              <button type="button" className="chip admin-danger" onClick={() => cancelEvo(a.evo)}>{t('evo.cancel')}</button>
            </div>
          </div>
        )
      })}

      <h3 className="sheet-label">{t('evo.available')}</h3>
      <ul className="obj-list">
        {EVOLUTIONS.map(def => {
          const busy = club.evos.some(a => a.evo === def.id)
          const n = busy ? 0 : eligibleCards(def).length
          const b = boostOf(def.id)
          return (
            <li key={def.id} className={`obj ${busy ? 'obj--done' : ''}`} role="button" onClick={() => !busy && n && setChoose(def)}>
              <span className="obj__text">
                <b>{t(def.nameKey)}</b>
                <small>{t(def.descKey)}</small>
                <small>{b ? t('evo.boost', { ovr: b.ovr, stats: b.stats }) : t('evo.realForm')} · {def.tasks.map(tk => taskText(tk.event, tk.goal)).join(' · ')}</small>
              </span>
              <span className="chip on">{busy ? t('evo.inProgress') : t('evo.eligible', { n })}</span>
            </li>
          )
        })}
      </ul>

      <Sheet open={!!choose} title={choose ? t(choose.nameKey) : ''} onClose={() => setChoose(null)}>
        {choose && (
          <>
            <p className="fd-hint">{t('evo.pick')}</p>
            <div className="fd-options">
              {eligibleCards(choose).slice(0, 60).map(p => (
                <span key={p.id} className="evo-pick">
                  <InaCard player={p} size="sm" onClick={() => { startEvo(choose, p); setChoose(null) }} />
                  {choose.id === 'mixi' && <small>→ {mixiTarget(p)?.version}</small>}
                </span>
              ))}
            </div>
          </>
        )}
      </Sheet>
      <Sheet open={!!result} title={t('evo.doneTitle')} onClose={() => setResult(null)}>
        {result && <div className="flex justify-center"><InaCard player={result} size="lg" stats /></div>}
      </Sheet>
    </Screen>
  )
}
