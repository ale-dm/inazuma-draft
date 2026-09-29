import { useSyncExternalStore } from 'react'
import { applyDbChange, type AdminTable } from '../data/catalog'

/**
 * CRUD en tiempo real (#/admin): lee y escribe directamente en Supabase con las funciones de supabase/admin.sql.
 * La clave publishable solo lee; para escribir hace falta la contraseña de admin (se guarda en este dispositivo).
 * Cada cambio se aplica al momento en la base y en el catálogo de este dispositivo (applyDbChange); el resto lo ve al
 * volver a abrir la app. La recarga del catálogo (db-load.yml) no los borra: admin_replay() los vuelve a aplicar.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://xacgoiaejdgjrvvsnqyi.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_iaMxVv0YacdSYbqOArEMJw_7OMGCMhb'
const PASS_KEY = 'ffi-admin-pass'

export type AdminStatus = 'unset' | 'ok' | 'wrong'
export type Row = Record<string, unknown>

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = `Error ${res.status}`
    try { msg = (JSON.parse(text) as { message?: string }).message ?? msg } catch { /* texto plano */ }
    throw new Error(msg)
  }
  return (text ? JSON.parse(text) : null) as T
}

// ---------------------------------------------------------------- contraseña

let pass: string = (() => { try { return localStorage.getItem(PASS_KEY) ?? '' } catch { return '' } })()
let unlocked = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())

/** true cuando la contraseña guardada es la buena (tras checkPass) */
export function useUnlocked(): boolean {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb) }, () => unlocked)
}

export const savedPass = () => pass

export async function checkPass(p = pass): Promise<AdminStatus> {
  const status = await rpc<AdminStatus>('admin_status', { pass: p })
  if (status === 'ok') {
    pass = p
    try { localStorage.setItem(PASS_KEY, p) } catch { /* sin almacenamiento: dura hasta recargar */ }
  }
  unlocked = status === 'ok'
  emit()
  return status
}

/** Crea la contraseña (solo si todavía no hay ninguna) */
export async function claimPass(p: string): Promise<boolean> {
  const ok = await rpc<boolean>('admin_claim', { pass: p })
  if (ok) await checkPass(p)
  return ok
}

export function lock() {
  pass = ''
  unlocked = false
  try { localStorage.removeItem(PASS_KEY) } catch { /* nada */ }
  emit()
}

// ---------------------------------------------------------------- lectura y escritura

/** Fila completa y al día (las cartas, con `techniques`: ids en orden) */
export function getRow(tbl: Exclude<AdminTable, 'card_techniques'>, key: Row): Promise<Row | null> {
  return rpc<Row | null>('admin_get', { tbl, data: key })
}

/** Guarda en la base (crear si no existe, o cambiar solo los campos que vienen) y lo aplica aquí */
export async function writeRow(tbl: AdminTable, data: Row): Promise<Row> {
  const row = await rpc<Row>('admin_write', { pass, tbl, data, del: false })
  applyDbChange(tbl, row ?? data)
  return row
}

export async function deleteRow(tbl: Exclude<AdminTable, 'card_techniques'>, key: Row): Promise<void> {
  await rpc<Row>('admin_write', { pass, tbl, data: key, del: true })
  applyDbChange(tbl, key, true)
}

export interface LogEntry { id: number; at: string; tbl: AdminTable; data: Row; deleted: boolean }

export function history(lim = 100): Promise<LogEntry[]> {
  return rpc<LogEntry[]>('admin_history', { pass, lim })
}
