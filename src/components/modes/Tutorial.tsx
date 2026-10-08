import { useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import type { TranslationKey } from '../../i18n/translations'

/** Guía de tres pasos: se enseña la primera vez que se entra al modo y no vuelve a salir (se recuerda en el dispositivo) */
export type TutorialKind = 'fatal' | 'sim'

const KEY = (kind: TutorialKind) => `ffi-tut-${kind}-v1`
const STEPS: Record<TutorialKind, [TranslationKey, TranslationKey, TranslationKey]> = {
  fatal: ['tut.fatal.1', 'tut.fatal.2', 'tut.fatal.3'],
  sim: ['tut.sim.1', 'tut.sim.2', 'tut.sim.3'],
}

function seen(kind: TutorialKind): boolean {
  try {
    return localStorage.getItem(KEY(kind)) === '1'
  } catch {
    return true
  }
}

function markSeen(kind: TutorialKind) {
  try {
    localStorage.setItem(KEY(kind), '1')
  } catch {
    /* sin almacenamiento: saldrá otra vez, sin más */
  }
}

export default function Tutorial({ kind }: { kind: TutorialKind }) {
  const { t } = useAppSettings()
  const [open, setOpen] = useState(() => !seen(kind))
  const [i, setI] = useState(0)
  if (!open) return null
  const steps = STEPS[kind]
  const last = i === steps.length - 1
  const close = () => { markSeen(kind); setOpen(false) }
  return (
    <div className="ds-backdrop tut" role="dialog" aria-modal="true">
      <div className="ds-panel tut__panel">
        <small className="tut__count">{i + 1} / {steps.length}</small>
        <p className="tut__text" key={i}>{t(steps[i])}</p>
        <div className="tut__dots">
          {steps.map((_, k) => <i key={k} className={k === i ? 'is-on' : k < i ? 'is-done' : ''} />)}
        </div>
        <div className="ds-actions">
          <button type="button" className="chip" onClick={close}>{t('tut.skip')}</button>
          <button type="button" className="sheet-cta" onClick={() => (last ? close() : setI(i + 1))}>
            {last ? t('tut.done') : t('tut.next')}
          </button>
        </div>
      </div>
    </div>
  )
}
