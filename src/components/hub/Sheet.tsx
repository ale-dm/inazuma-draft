import { useEffect, type ReactNode } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Panel que sube desde abajo (móvil) o ventana centrada (escritorio); se cierra con Escape o tocando fuera */
export default function Sheet({ open, title, onClose, children }: Props) {
  const { t } = useAppSettings()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet safe-bottom" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="sheet__head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} className="hub-icon-btn" aria-label={t('players.close')}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
