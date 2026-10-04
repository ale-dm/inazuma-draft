import type { ReactNode } from 'react'
import type { Element } from '../../types'

/** Color de fondo del botón: la afinidad de la técnica, o el de la acción (presión, hiperenergía, grito) */
export type ActTone = Element | 'press' | 'hyper' | 'shout' | 'none'

/** Botón de acción del Sim y del duelo: icono, nombre, efecto y coste, con el color de la afinidad de fondo */
export default function ActButton({ icon, label, desc, cost, on, disabled, tone, onClick }: {
  icon: ReactNode; label: string; desc: string; cost: number; on: boolean; disabled: boolean; tone: ActTone; onClick: () => void
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`sim-act act-tone--${tone} ${on ? 'is-on' : ''}`}>
      <span className="sim-act__icon">{icon}</span>
      <b>{label}</b>
      <small>{desc}</small>
      <em>{cost}</em>
    </button>
  )
}
