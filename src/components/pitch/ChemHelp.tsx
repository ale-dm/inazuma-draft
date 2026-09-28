import { Gamepad2, Shield, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { CHEM_GROUPS, THRESHOLDS, type ChemGroup } from '../../lib/chemistry'
import { ElementIcon } from '../GameIcon'
import Sheet from '../hub/Sheet'
import { ChemDots } from './Pitch'

const GROUP_ICON: Record<ChemGroup, ReactNode> = {
  game: <Gamepad2 size={22} />,
  element: (
    <span className="chem-help__els">
      {(['fire', 'air', 'wood', 'earth'] as const).map(e => <ElementIcon key={e} element={e} />)}
    </span>
  ),
  team: <Shield size={22} />,
}

/** "Cómo funciona la química": los umbrales de cada grupo (mismo juego, misma afinidad, mismo equipo) */
export default function ChemHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useAppSettings()
  return (
    <Sheet open={open} title={t('chem.title')} onClose={onClose}>
      {CHEM_GROUPS.map(g => (
        <section key={g} className="chem-help">
          <h3 className="chem-help__head"><span>{t(`chem.group.${g}`)}</span>{GROUP_ICON[g]}</h3>
          {THRESHOLDS[g].map((n, i) => (
            <div key={n} className="chem-help__row">
              <span className="chem-help__who">
                <span className="chem-help__people">{Array.from({ length: n }, (_, k) => <User key={k} size={14} fill="currentColor" strokeWidth={0} />)}</span>
                <span><b>{n}</b> {t(`chem.row.${g}`)}</span>
              </span>
              <span className="chem-help__pts">
                <b>+{i + 1}</b>
                <ChemDots value={i + 1} />
              </span>
            </div>
          ))}
        </section>
      ))}
      <p className="fd-hint">{t('chem.note')}</p>
    </Sheet>
  )
}
