import { TENSION_MAX } from '../../lib/tension'

/** Barra de tensión: la tuya (degradado), lo que vas a gastar (blanco) y la del rival (marca azul) */
export default function TensionBar({ value, spend = 0, opp, label }: { value: number; spend?: number; opp: number; label: string }) {
  const left = Math.max(0, value - spend)
  return (
    <div className="sim-tension" aria-label={label}>
      <span className="sim-tension__label">{label}</span>
      <div className="sim-tension__bar">
        <i style={{ width: `${(left / TENSION_MAX) * 100}%` }} />
        {spend > 0 && <u style={{ left: `${(left / TENSION_MAX) * 100}%`, width: `${(Math.min(spend, value) / TENSION_MAX) * 100}%` }} />}
        <em style={{ left: `${(opp / TENSION_MAX) * 100}%` }} title={String(opp)} />
      </div>
      <b>{left}<small>/{TENSION_MAX}</small></b>
    </div>
  )
}
