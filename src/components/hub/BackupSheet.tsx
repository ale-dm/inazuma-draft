import { useRef, useState } from 'react'
import { useAppSettings } from '../../context/AppSettings'
import Sheet from './Sheet'

/** Lo que se guarda en la copia: el club, el draft guardado, estadísticas, preferencias y ajustes */
const KEYS = ['ffi-club-v1', 'ffi-saved-draft-v1', 'ffi-draft-local-stats-v1', 'ffi-card-stats', 'iz-lang', 'iz-sound', 'iz-theme']

/** Copia de seguridad (como Backup de MADFUT, sin cuenta): exportar el club a un archivo e importarlo en otro sitio */
export default function BackupSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useAppSettings()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  function exportFile() {
    const data: Record<string, string> = {}
    for (const k of KEYS) {
      const v = localStorage.getItem(k)
      if (v != null) data[k] = v
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'ffi-6-0', date: new Date().toISOString(), data })], { type: 'application/json' }))
    a.download = `ffi-club-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setMsg(t('backup.exported'))
  }

  async function importFile(f: File) {
    try {
      const parsed = JSON.parse(await f.text()) as { app?: string; data?: Record<string, string> }
      if (parsed.app !== 'ffi-6-0' || !parsed.data) throw new Error('formato')
      if (!confirm(t('backup.confirm'))) return
      for (const k of KEYS) {
        if (parsed.data[k] != null) localStorage.setItem(k, parsed.data[k])
      }
      window.location.reload()
    } catch {
      setMsg(t('backup.invalid'))
    }
  }

  return (
    <Sheet open={open} title={t('hub.backup')} onClose={onClose}>
      <p className="fd-hint">{t('backup.hint')}</p>
      <button type="button" className="sheet-cta mb-3" onClick={exportFile}>{t('backup.export')}</button>
      <button type="button" className="sheet-choice sheet-choice--row w-full" onClick={() => file.current?.click()}><b>{t('backup.import')}</b></button>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void importFile(f) }} />
      {msg && <p className="fd-hint mt-3">{msg}</p>}
    </Sheet>
  )
}
