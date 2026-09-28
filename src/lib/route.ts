import { useEffect, useState } from 'react'

export const PLAYERS_HASH = '#/jugadores'
/** Pantallas del club (fase 3) */
export const STORE_HASH = '#/tienda'
export const CLUB_HASH = '#/club'
export const COLLECTIONS_HASH = '#/colecciones'
export const OBJECTIVES_HASH = '#/objetivos'

/** Ruta mínima por hash: '#/jugadores' abre el explorador sin perder la partida en curso */
export function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}
