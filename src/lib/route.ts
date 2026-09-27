import { useEffect, useState } from 'react'

export const PLAYERS_HASH = '#/jugadores'

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
