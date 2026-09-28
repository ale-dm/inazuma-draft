import { useSyncExternalStore } from 'react'

/** Preferencia de la carta: enseñar los 3 números de duelo (ataque, control, defensa) dentro de la carta */
const KEY = 'ffi-card-stats'
const listeners = new Set<() => void>()

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

let showStats = read()

export function useCardStats(): boolean {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb) }, () => showStats)
}

export function toggleCardStats() {
  showStats = !showStats
  try {
    localStorage.setItem(KEY, showStats ? '1' : '0')
  } catch {
    /* sin almacenamiento: dura hasta recargar */
  }
  listeners.forEach(l => l())
}
