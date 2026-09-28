import type { FormationSlot, LineupMap, SlotId } from '../../lib/lineup'
import type { Chemistry } from '../../lib/chemistry'
import InaCard from '../InaCard'

interface Props {
  slots: FormationSlot[]
  lineup: LineupMap
  chem: Chemistry
  captain?: SlotId | null
  selected?: SlotId | null
  onTapPlaced?: (id: SlotId) => void
  onTapEmpty?: (id: SlotId) => void
}

/** Coordenada y (0–100 de la formación) dentro del campo: margen arriba y el portero en su propia fila abajo */
export const fieldY = (y: number) => (y >= 85 ? 92 : 6 + y * 0.9)

/** Tres puntos de química (0–3) */
export function ChemDots({ value }: { value: number }) {
  return (
    <span className={`chem-dots chem-dots--${value}`} aria-label={`${value}/3`}>
      {[0, 1, 2].map(i => <i key={i} className={i < value ? 'on' : ''} />)}
    </span>
  )
}

/** Campo con la formación: cada puesto con su carta (o un hueco) y debajo la etiqueta de puesto + química */
export default function Pitch({ slots, lineup, chem, captain, selected, onTapPlaced, onTapEmpty }: Props) {
  return (
    <div className="fd-pitch">
      {slots.map(s => {
        const p = lineup[s.id]
        return (
          <div key={s.id} className="fd-slot" style={{ left: `${s.x}%`, top: `${fieldY(s.y)}%` }}>
            {p ? (
              <span className={selected === s.id ? 'fd-selected' : undefined}>
                <InaCard player={p} size="xs" onClick={onTapPlaced ? () => onTapPlaced(s.id) : undefined} />
              </span>
            ) : (
              <button type="button" className="fd-empty" onClick={onTapEmpty ? () => onTapEmpty(s.id) : undefined}>+</button>
            )}
            <span className="slot-tag">
              {s.id === captain && <b>C</b>}
              {s.role}
              <ChemDots value={p ? chem.players[s.id] ?? 0 : 0} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
