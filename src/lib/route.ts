import { useEffect, useState } from 'react'

export const PLAYERS_HASH = '#/jugadores'
/** Pantallas del club (fase 3) */
export const STORE_HASH = '#/tienda'
export const CLUB_HASH = '#/club'
export const COLLECTIONS_HASH = '#/colecciones'
export const OBJECTIVES_HASH = '#/objetivos'
export const SQUADS_HASH = '#/plantillas'
/** Modos (fase 4) */
export const DUEL_HASH = '#/duelo'
export const HL_HASH = '#/higher-lower'
export const CUPS_HASH = '#/copas'
export const PUZZLES_HASH = '#/puzzles'
/** Fase 5 */
export const SBC_HASH = '#/retos'
export const EVO_HASH = '#/evoluciones'
export const BADGES_HASH = '#/insignias'
/** CRUD oculto (sin enlace: 7 toques en el logo de la pantalla principal) */
export const ADMIN_HASH = '#/admin'

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
