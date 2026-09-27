import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { loadCatalog } from '../data/catalog'
import { useAppSettings } from '../context/AppSettings'

/** Carga el catálogo de Supabase antes de mostrar la app */
export default function CatalogGate({ children }: { children: ReactNode }) {
  const { t } = useAppSettings()
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(() => {
    setState('loading')
    loadCatalog().then(() => setState('ready'), () => setState('error'))
  }, [])

  useEffect(load, [load])

  if (state === 'ready') return <>{children}</>

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-14 h-14 rounded shadow-md animate-pulse" />
      {state === 'loading' ? (
        <p className="font-heading text-iz-muted">{t('catalog.loading')}</p>
      ) : (
        <>
          <p className="font-heading text-red-400">{t('catalog.error')}</p>
          <button type="button" onClick={load} className="btn-primary">{t('catalog.retry')}</button>
        </>
      )}
    </div>
  )
}
