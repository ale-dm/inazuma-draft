import { useEffect, useRef, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import Screen from '../club/Screen'
import { barPos, calibrate, CAL_PERIOD_MS, type CalResult } from '../../lib/minigames/calibrate'
import { BLUFF_TYPES, aiBluffGuess, bluffOutcome, type TechType } from '../../lib/minigames/bluff'
import { FORECAST_POINTS, forecastScore, pickOf, type Pick } from '../../lib/minigames/forecast'
import { playSfx } from '../../lib/sfx'
import type { TranslationKey } from '../../i18n/translations'

/** Pantalla para probar los minijuegos nuevos (calibrar, farol, pronóstico). Sin premio: es para sentir el juego. */
export default function Minigames() {
  const { t } = useAppSettings()
  return (
    <Screen title={t('mg.title')}>
      <p className="fd-hint">{t('mg.intro')}</p>
      <Calibrate />
      <Bluff />
      <Forecast />
    </Screen>
  )
}

function Calibrate() {
  const { t } = useAppSettings()
  const [running, setRunning] = useState(false)
  const [pos, setPos] = useState(0)
  const [res, setRes] = useState<CalResult | null>(null)
  const start = useRef(0)
  const raf = useRef(0)

  useEffect(() => {
    if (!running) return
    const tick = (now: number) => {
      setPos(barPos(now - start.current))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [running])

  const go = () => { start.current = performance.now(); setRes(null); setRunning(true) }
  const stop = () => {
    const r = calibrate(pos)
    setRunning(false)
    setRes(r)
    playSfx(r.tier === 'perfect' || r.tier === 'good' ? 'win' : r.tier === 'weak' ? 'tick' : 'lose')
  }

  return (
    <section className="sim-panel mg">
      <h3 className="sheet-label">{t('mg.calib.title')}</h3>
      <p className="fd-hint">{t('mg.calib.hint', { ms: CAL_PERIOD_MS })}</p>
      <div className="mg-bar" aria-label={t('mg.calib.title')}>
        <i className="mg-bar__zone" />
        <b className="mg-bar__needle" style={{ left: `${pos * 100}%` }} />
      </div>
      {res && <p className={`mg-result mg-result--${res.tier}`}>{t(`mg.calib.${res.tier}` as TranslationKey)} · {Math.round(res.power * 100)} %</p>}
      <div className="ds-actions">
        {running
          ? <button type="button" className="sheet-cta" onClick={stop}>{t('mg.calib.stop')}</button>
          : <button type="button" className="sheet-cta" onClick={go}>{t(res ? 'mg.calib.again' : 'mg.calib.go')}</button>}
      </div>
    </section>
  )
}

function Bluff() {
  const { t } = useAppSettings()
  const [history, setHistory] = useState<TechType[]>([])
  const [played, setPlayed] = useState<TechType | null>(null)
  const [guess, setGuess] = useState<TechType | null>(null)
  const [result, setResult] = useState<'blocked' | 'through' | null>(null)

  const play = (type: TechType) => {
    const g = aiBluffGuess(history)
    const r = bluffOutcome(type, g)
    setPlayed(type)
    setGuess(g)
    setResult(r.outcome)
    setHistory(h => [...h, type])
    playSfx(r.outcome === 'blocked' ? 'lose' : 'tick')
  }

  return (
    <section className="sim-panel mg">
      <h3 className="sheet-label">{t('mg.bluff.title')}</h3>
      <p className="fd-hint">{t('mg.bluff.hint')}</p>
      <div className="mg-types">
        {BLUFF_TYPES.map(k => <button key={k} type="button" onClick={() => play(k)}>{t(`tech.${k}` as TranslationKey)}</button>)}
      </div>
      {result && played && guess && (
        <p className={`mg-result mg-result--${result === 'blocked' ? 'miss' : 'good'}`}>
          {t('mg.bluff.reveal', { played: t(`tech.${played}` as TranslationKey), guess: t(`tech.${guess}` as TranslationKey) })} · {t(result === 'blocked' ? 'mg.bluff.blocked' : 'mg.bluff.through')}
        </p>
      )}
    </section>
  )
}

function Forecast() {
  const { t } = useAppSettings()
  const [pick, setPick] = useState<Pick | null>(null)
  const [out, setOut] = useState<{ res: 0 | 1 | -1; hit: boolean; points: number } | null>(null)
  const PICKS: Pick[] = ['win', 'draw', 'loss']

  const play = (p: Pick) => {
    // partido de prueba: gana el 45 %, empata el 20 %, pierde el 35 %
    const x = Math.random()
    const res: 0 | 1 | -1 = x < 0.45 ? 0 : x < 0.65 ? -1 : 1
    const s = forecastScore(p, res)
    setPick(p)
    setOut({ res, ...s })
    playSfx(s.hit ? 'win' : 'lose')
  }

  return (
    <section className="sim-panel mg">
      <h3 className="sheet-label">{t('mg.forecast.title')}</h3>
      <p className="fd-hint">{t('mg.forecast.hint', { n: FORECAST_POINTS })}</p>
      <div className="mg-types">
        {PICKS.map(p => <button key={p} type="button" onClick={() => play(p)}>{t(`mg.forecast.${p}` as TranslationKey)}</button>)}
      </div>
      {out && pick && (
        <p className={`mg-result mg-result--${out.hit ? 'perfect' : 'miss'}`}>
          {t('mg.forecast.result', { res: t(`mg.forecast.${pickOf(out.res)}` as TranslationKey) })} · {out.hit ? t('mg.forecast.hit', { n: out.points }) : t('mg.forecast.miss')}
        </p>
      )}
    </section>
  )
}
