import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { GameId, Player } from '../../types'
import {
  CATEGORIES, ELEMENTS, GAMES, POSITIONS, getAllPlayers, getAllTechniques, getPlayer, getStaff, getTeamRows, getTechnique,
  type AdminTable,
} from '../../data/catalog'
import { checkPass, claimPass, deleteRow, getRow, history, lock, savedPass, useUnlocked, writeRow, type LogEntry, type Row } from '../../lib/admin-db'
import { clearEdits, editCount, getEdits } from '../../lib/admin-edits'
import { duelStats } from '../../lib/duel'
import InaCard from '../InaCard'
import Screen from '../club/Screen'
import { ArrowLeft, Check, History, LogOut, Plus, Search, Trash2, Undo2 } from 'lucide-react'

/**
 * CRUD (#/admin, o 7 toques en el logo de la pantalla principal): cartas, equipos, técnicas y cuerpo técnico,
 * leídos y guardados directamente en la base (Supabase) al pulsar Guardar. Protegido con contraseña de admin
 * (supabase/admin.sql). Solo en castellano: es una herramienta interna.
 */
type Tab = 'cards' | 'teams' | 'techniques' | 'staff' | 'history'
type Open = { tbl: Exclude<AdminTable, 'card_techniques' | 'characters'>; key: Row | null }

export default function Admin() {
  const unlocked = useUnlocked()
  return (
    <Screen title="CRUD">
      {unlocked ? <Workspace /> : <Login />}
    </Screen>
  )
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'carta'
const SAGA: Record<GameId, string> = { IE1: 'IE', IE2: 'IE', IE3: 'IE', GO1: 'GO', GO2: 'GO', GO3: 'GO', ARES: 'IE', ORION: 'IE', VR: 'IE' }

// ---------------------------------------------------------------- contraseña

function Login() {
  const [status, setStatus] = useState<'loading' | 'unset' | 'wrong' | 'ask'>('loading')
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    checkPass(savedPass()).then(s => setStatus(s === 'unset' ? 'unset' : savedPass() ? 'wrong' : 'ask'))
      .catch(e => { setMsg(String(e.message ?? e)); setStatus('ask') })
  }, [])

  async function submit() {
    setBusy(true)
    setMsg('')
    try {
      if (status === 'unset') {
        if (p1.length < 8) throw new Error('Mínimo 8 caracteres')
        if (p1 !== p2) throw new Error('Las dos contraseñas no coinciden')
        if (!await claimPass(p1)) throw new Error('Ya había una contraseña creada')
      } else if (await checkPass(p1) !== 'ok') {
        setStatus('wrong')
        throw new Error('Contraseña incorrecta')
      }
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return <p className="fd-hint">Conectando con la base…</p>
  return (
    <form className="admin-login" onSubmit={e => { e.preventDefault(); void submit() }}>
      <h2 className="fd-title">{status === 'unset' ? 'Crea la contraseña' : 'Admin'}</h2>
      <p className="fd-hint">
        {status === 'unset'
          ? 'Todavía no hay contraseña de admin. La que pongas ahora será la única que puede cambiar la base.'
          : 'Los cambios se guardan directamente en la base de datos.'}
      </p>
      <input className="admin-input" type="password" autoComplete={status === 'unset' ? 'new-password' : 'current-password'}
        placeholder="Contraseña" value={p1} onChange={e => setP1(e.target.value)} />
      {status === 'unset' && (
        <input className="admin-input" type="password" autoComplete="new-password" placeholder="Repite la contraseña" value={p2} onChange={e => setP2(e.target.value)} />
      )}
      <button type="submit" className="sheet-cta" disabled={busy || !p1}>{busy ? '…' : status === 'unset' ? 'CREAR Y ENTRAR' : 'ENTRAR'}</button>
      {msg && <p className="admin-msg admin-msg--error">{msg}</p>}
    </form>
  )
}

// ---------------------------------------------------------------- zona de trabajo

const TABS: [Tab, string][] = [['cards', 'Cartas'], ['teams', 'Equipos'], ['techniques', 'Técnicas'], ['staff', 'Cuerpo técnico'], ['history', 'Historial']]

function Workspace() {
  const [tab, setTab] = useState<Tab>('cards')
  const [open, setOpen] = useState<Open | null>(null)

  if (open) return <Editor open={open} onClose={() => setOpen(null)} onOpen={setOpen} />
  return (
    <>
      <div className="admin-status">
        <span className="admin-status__dot" /> <span>Conectado a la base · <b>se guarda al momento</b></span>
        <button type="button" className="hub-icon-btn" onClick={lock} aria-label="Salir"><LogOut size={16} /></button>
      </div>
      <LegacyEdits />
      <div className="chip-row chip-row--scroll">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" className={`chip ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            {k === 'history' && <History size={14} />}{label}
          </button>
        ))}
      </div>
      {tab === 'cards' && <CardList onOpen={setOpen} />}
      {tab === 'teams' && <TeamList onOpen={setOpen} />}
      {tab === 'techniques' && <TechList onOpen={setOpen} />}
      {tab === 'staff' && <StaffList onOpen={setOpen} />}
      {tab === 'history' && <HistoryList onOpen={setOpen} />}
    </>
  )
}

function SearchBox({ value, onChange, placeholder, action }: { value: string; onChange: (v: string) => void; placeholder: string; action?: ReactNode }) {
  return (
    <div className="admin-row">
      <label className="admin-search">
        <Search size={16} />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      </label>
      {action}
    </div>
  )
}

function CardList({ onOpen }: { onOpen: (o: Open) => void }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const k = norm(q.trim())
    if (k.length < 2) return []
    return getAllPlayers().filter(p => norm(`${p.name} ${p.id} ${p.team} ${p.game}`).includes(k)).slice(0, 60)
  }, [q])
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Nombre, equipo, juego o id…"
        action={<button type="button" className="chip on" onClick={() => onOpen({ tbl: 'cards', key: null })}><Plus size={15} /> Nueva</button>} />
      {q.trim().length < 2 && <p className="fd-hint">Escribe al menos 2 letras para buscar entre {getAllPlayers().length.toLocaleString()} cartas.</p>}
      <ul className="admin-list">
        {list.map(p => (
          <li key={p.id} role="button" onClick={() => onOpen({ tbl: 'cards', key: { id: p.id } })}>
            <InaCard player={p} size="xs" stats={false} />
            <span className="admin-list__text">
              <b>{p.name}</b>
              <small>{p.game} · {p.team} · {p.position} · {p.ovr}</small>
              <small className="admin-list__id">{p.id}</small>
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

function TeamList({ onOpen }: { onOpen: (o: Open) => void }) {
  const [q, setQ] = useState('')
  const teams = getTeamRows()
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of getAllPlayers()) m.set(p.team, (m.get(p.team) ?? 0) + 1)
    return m
  }, [])
  const k = norm(q.trim())
  const list = teams.filter(t => !k || norm(`${t.name} ${t.name_es ?? ''} ${t.name_fr ?? ''} ${t.name_it ?? ''}`).includes(k))
    .sort((a, b) => a.name.localeCompare(b.name))
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder={`Buscar entre ${teams.length} equipos…`}
        action={<button type="button" className="chip on" onClick={() => onOpen({ tbl: 'teams', key: null })}><Plus size={15} /> Nuevo</button>} />
      <ul className="admin-list">
        {list.map(t => (
          <li key={t.name} role="button" onClick={() => onOpen({ tbl: 'teams', key: { name: t.name } })}>
            <span className="admin-logo">{t.logo_url ? <img src={t.logo_url} alt="" loading="lazy" /> : '—'}</span>
            <span className="admin-list__text">
              <b>{t.name}</b>
              <small>{[t.name_es, t.name_fr, t.name_it].map(x => x ?? '—').join(' · ')}</small>
            </span>
            <span className="admin-tag admin-tag--muted">{counts.get(t.name) ?? 0}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function TechList({ onOpen }: { onOpen: (o: Open) => void }) {
  const [q, setQ] = useState('')
  const all = getAllTechniques()
  const k = norm(q.trim())
  const list = k.length < 2 ? [] : all.filter(t => norm(`${t.name} ${t.nameEs ?? ''} ${t.nameFr ?? ''} ${t.nameIt ?? ''} ${t.id}`).includes(k)).slice(0, 60)
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder={`Buscar entre ${all.length.toLocaleString()} técnicas…`}
        action={<button type="button" className="chip on" onClick={() => onOpen({ tbl: 'techniques', key: null })}><Plus size={15} /> Nueva</button>} />
      <ul className="admin-list">
        {list.map(t => (
          <li key={t.id} role="button" onClick={() => onOpen({ tbl: 'techniques', key: { id: t.id } })}>
            <span className="admin-list__text">
              <b>{t.name}</b>
              <small>{t.nameEs ?? '—'} · {t.type} · {t.element ?? '—'} · TP {t.tp ?? '—'}{t.traits?.length ? ` · ${t.traits.join(', ')}` : ''}</small>
              <small className="admin-list__id">{t.id}</small>
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

function StaffList({ onOpen }: { onOpen: (o: Open) => void }) {
  const [q, setQ] = useState('')
  const k = norm(q.trim())
  const list = getStaff().filter(s => !k || norm(`${s.name} ${s.team ?? ''}`).includes(k)).slice(0, 80)
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder="Buscar entrenador, gerente…" />
      <ul className="admin-list">
        {list.map(s => (
          <li key={s.zukanNo} role="button" onClick={() => onOpen({ tbl: 'staff', key: { zukan_no: s.zukanNo } })}>
            {s.image ? <img className="admin-avatar" src={s.image} alt="" loading="lazy" /> : <span className="admin-avatar" />}
            <span className="admin-list__text"><b>{s.name}</b><small>{s.role} · {s.team ?? '—'}</small></span>
          </li>
        ))}
      </ul>
    </>
  )
}

const TBL_LABEL: Record<AdminTable, string> = {
  cards: 'Carta', card_techniques: 'Técnicas de carta', characters: 'Personaje', techniques: 'Técnica', teams: 'Equipo', staff: 'Cuerpo técnico',
}

function HistoryList({ onOpen }: { onOpen: (o: Open) => void }) {
  const [list, setList] = useState<LogEntry[] | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { history(150).then(setList).catch(e => setErr((e as Error).message)) }, [])
  if (err) return <p className="admin-msg admin-msg--error">{err}</p>
  if (!list) return <p className="fd-hint">Cargando…</p>
  if (!list.length) return <p className="fd-hint">Todavía no hay cambios guardados desde aquí.</p>
  const openOf = (e: LogEntry): Open | null => {
    if (e.deleted) return null
    if (e.tbl === 'card_techniques') return { tbl: 'cards', key: { id: e.data.card_id } }
    if (e.tbl === 'cards' || e.tbl === 'techniques') return { tbl: e.tbl, key: { id: e.data.id } }
    if (e.tbl === 'teams') return { tbl: 'teams', key: { name: e.data.name } }
    if (e.tbl === 'staff') return { tbl: 'staff', key: { zukan_no: e.data.zukan_no } }
    return null
  }
  return (
    <ul className="admin-list">
      {list.map(e => {
        const o = openOf(e)
        const key = String(e.data.id ?? e.data.card_id ?? e.data.name ?? e.data.zukan_no ?? '')
        const fields = Object.keys(e.data).filter(f => !['id', 'card_id', 'name', 'zukan_no'].includes(f) || (f === 'name' && e.tbl !== 'teams'))
        return (
          <li key={e.id} role={o ? 'button' : undefined} onClick={o ? () => onOpen(o) : undefined}>
            <span className="admin-list__text">
              <b>{TBL_LABEL[e.tbl]} · {key}</b>
              <small>{e.deleted ? 'borrado' : fields.join(', ') || 'sin cambios'}</small>
              <small className="admin-list__id">{new Date(e.at).toLocaleString()}</small>
            </span>
            {e.deleted && <span className="admin-tag admin-tag--danger">borrado</span>}
          </li>
        )
      })}
    </ul>
  )
}

// ---------------------------------------------------------------- formularios

type Kind = 'text' | 'textarea' | 'number' | 'select' | 'bool' | 'json' | 'team'
interface Field { key: string; label: string; kind: Kind; options?: readonly string[]; wide?: boolean; readOnlyOnEdit?: boolean }
interface Section { title: string; fields: Field[] }

const CARD_SECTIONS: Section[] = [
  { title: 'Datos', fields: [
    { key: 'name', label: 'Nombre', kind: 'text', wide: true },
    { key: 'team', label: 'Equipo', kind: 'team', wide: true },
    { key: 'game', label: 'Juego', kind: 'select', options: GAMES },
    { key: 'position', label: 'Puesto', kind: 'select', options: POSITIONS },
    { key: 'element', label: 'Afinidad', kind: 'select', options: ELEMENTS },
    { key: 'ovr', label: 'Media', kind: 'number' },
    { key: 'category', label: 'Rareza', kind: 'select', options: CATEGORIES },
    { key: 'tier', label: 'Nivel', kind: 'select', options: ['S', 'A', 'B', 'C'] },
    { key: 'version', label: 'Versión', kind: 'text' },
    { key: 'no', label: 'Nº', kind: 'number' },
    { key: 'is_version', label: 'Versión extra', kind: 'bool' },
    { key: 'image_url', label: 'Foto (URL)', kind: 'text', wide: true },
  ] },
  { title: 'Estadísticas', fields: [
    { key: 'shooting', label: 'Tiro', kind: 'number' }, { key: 'control', label: 'Control', kind: 'number' },
    { key: 'physical', label: 'Físico', kind: 'number' }, { key: 'speed', label: 'Velocidad', kind: 'number' },
    { key: 'defense', label: 'Defensa', kind: 'number' }, { key: 'goalkeeping', label: 'Parada', kind: 'number' },
  ] },
  { title: 'Duelo (vacío = automático)', fields: [
    { key: 'duel_att', label: 'Ataque', kind: 'number' }, { key: 'duel_con', label: 'Control', kind: 'number' },
    { key: 'duel_def', label: 'Defensa', kind: 'number' },
  ] },
  { title: 'Textos', fields: [
    { key: 'description', label: 'Descripción (inglés)', kind: 'textarea', wide: true },
    { key: 'description_es', label: 'Descripción (castellano)', kind: 'textarea', wide: true },
  ] },
  { title: 'Avanzado', fields: [
    { key: 'character_id', label: 'Personaje (id)', kind: 'text', wide: true, readOnlyOnEdit: true },
    { key: 'specials', label: 'Espíritu, Mixi Max, tótem (JSON)', kind: 'json', wide: true },
    { key: 'extra_teams', label: 'Otros equipos (JSON)', kind: 'json', wide: true },
  ] },
]

const TEAM_SECTIONS: Section[] = [
  { title: 'Nombre', fields: [
    { key: 'name', label: 'Nombre en las cartas (inglés)', kind: 'text', wide: true, readOnlyOnEdit: true },
    { key: 'name_es', label: 'Castellano', kind: 'text', wide: true }, { key: 'name_fr', label: 'Francés', kind: 'text', wide: true },
    { key: 'name_it', label: 'Italiano', kind: 'text', wide: true },
  ] },
  { title: 'Escudo', fields: [
    { key: 'logo_url', label: 'Escudo (URL)', kind: 'text', wide: true },
    { key: 'logos', label: 'Escudos de otras épocas (JSON: {"GO": url, "ARES": url, "VR": url})', kind: 'json', wide: true },
  ] },
]

const TECH_SECTIONS: Section[] = [
  { title: 'Nombre', fields: [
    { key: 'id', label: 'Id', kind: 'text', wide: true, readOnlyOnEdit: true },
    { key: 'name', label: 'Inglés', kind: 'text', wide: true }, { key: 'name_es', label: 'Castellano', kind: 'text', wide: true },
    { key: 'name_fr', label: 'Francés', kind: 'text', wide: true }, { key: 'name_it', label: 'Italiano', kind: 'text', wide: true },
    { key: 'name_jp', label: 'Japonés', kind: 'text', wide: true },
  ] },
  { title: 'Juego', fields: [
    { key: 'type', label: 'Tipo', kind: 'select', options: ['Shoot', 'Dribble', 'Block', 'Catch'] },
    { key: 'element', label: 'Afinidad', kind: 'select', options: ELEMENTS },
    { key: 'balance_tp', label: 'TP (el que enseña la app)', kind: 'number' },
    { key: 'balance_power_min', label: 'Potencia mín.', kind: 'number' }, { key: 'balance_power_max', label: 'Potencia máx.', kind: 'number' },
    { key: 'cost', label: 'TP de los juegos', kind: 'number' }, { key: 'cost_game', label: 'Juego de ese TP', kind: 'text' },
    { key: 'vr_tp', label: 'TP de Victory Road', kind: 'number' },
    { key: 'traits', label: 'Rasgos (JSON: ["long", "block", "chain", "punch"])', kind: 'json', wide: true },
  ] },
  { title: 'Textos', fields: [
    { key: 'description', label: 'Descripción', kind: 'textarea', wide: true },
    { key: 'image_url', label: 'Imagen (URL)', kind: 'text', wide: true },
  ] },
]

const STAFF_SECTIONS: Section[] = [
  { title: 'Datos', fields: [
    { key: 'name', label: 'Nombre', kind: 'text', wide: true },
    { key: 'role', label: 'Cargo', kind: 'select', options: ['Manager', 'Coach', 'Coordinator'] },
    { key: 'element', label: 'Afinidad', kind: 'select', options: ELEMENTS },
    { key: 'team', label: 'Equipo', kind: 'team', wide: true }, { key: 'age', label: 'Edad', kind: 'text' },
    { key: 'image_url', label: 'Foto (URL)', kind: 'text', wide: true },
    { key: 'teams', label: 'Equipos (JSON)', kind: 'json', wide: true }, { key: 'games', label: 'Juegos (JSON)', kind: 'json', wide: true },
    { key: 'description', label: 'Descripción', kind: 'textarea', wide: true },
  ] },
]

const SECTIONS: Record<Open['tbl'], Section[]> = { cards: CARD_SECTIONS, teams: TEAM_SECTIONS, techniques: TECH_SECTIONS, staff: STAFF_SECTIONS }
const NEW_ROW: Record<Open['tbl'], Row> = {
  cards: { name: '', game: 'VR', version: 'base', team: null, position: 'MF', element: 'fire', ovr: 60, category: 'Common Player', tier: 'C',
    shooting: 50, control: 50, physical: 50, speed: 50, defense: 50, goalkeeping: 30, is_version: true, specials: [], extra_teams: [], techniques: [] },
  teams: { name: '', name_es: null, name_fr: null, name_it: null, logo_url: null, logos: null },
  techniques: { id: '', name: '', type: 'Shoot', element: 'fire', cost: null, balance_tp: null, traits: [] },
  staff: {},
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

function Editor({ open, onClose, onOpen }: { open: Open; onClose: () => void; onOpen: (o: Open) => void }) {
  const isNew = !open.key
  const [base, setBase] = useState<Row | null>(isNew ? { ...NEW_ROW[open.tbl] } : null)
  const [vals, setVals] = useState<Row>(isNew ? { ...NEW_ROW[open.tbl] } : {})
  const [json, setJson] = useState<Record<string, string>>({})
  const [state, setState] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; msg?: string }>({ kind: isNew ? 'idle' : 'saving', msg: 'Cargando…' })

  useEffect(() => {
    if (!open.key) return
    getRow(open.tbl, open.key).then(r => {
      if (!r) { setState({ kind: 'error', msg: 'No está en la base (¿borrado?)' }); return }
      setBase(r)
      setVals(r)
      setJson({})
      setState({ kind: 'idle' })
    }).catch(e => setState({ kind: 'error', msg: (e as Error).message }))
  }, [open])

  const sections = SECTIONS[open.tbl]
  const allFields = sections.flatMap(s => s.fields)
  const changed = base ? [...allFields.map(f => f.key), 'techniques'].filter(k => k in vals && !same(vals[k], base[k])) : []
  const jsonError = Object.entries(json).find(([, v]) => { try { JSON.parse(v || 'null'); return false } catch { return true } })?.[0]
  const set = (k: string, v: unknown) => { setVals(x => ({ ...x, [k]: v })); if (state.kind === 'saved') setState({ kind: 'idle' }) }

  async function save() {
    if (!base || jsonError) return
    setState({ kind: 'saving', msg: 'Guardando en la base…' })
    try {
      if (open.tbl === 'cards') await saveCard()
      else if (open.tbl === 'teams') {
        const name = String(vals.name ?? '').trim()
        if (!name) throw new Error('Falta el nombre')
        const row = await writeRow('teams', isNew ? { ...vals, name } : pick(['name', ...changed]))
        if (isNew) return onOpen({ tbl: 'teams', key: { name: row.name } })
      } else if (open.tbl === 'techniques') {
        const id = String(vals.id ?? '').trim() || slug(String(vals.name ?? ''))
        if (!vals.name) throw new Error('Falta el nombre')
        const row = await writeRow('techniques', isNew ? { ...vals, id } : pick(['id', ...changed]))
        if (isNew) return onOpen({ tbl: 'techniques', key: { id: row.id } })
      } else {
        await writeRow('staff', pick(['zukan_no', ...changed]))
      }
      setBase({ ...vals })
      setState({ kind: 'saved' })
    } catch (e) {
      setState({ kind: 'error', msg: (e as Error).message })
    }
  }

  const pick = (keys: string[]) => Object.fromEntries(keys.filter(k => k !== 'techniques').map(k => [k, vals[k] ?? null]))

  async function saveCard() {
    const game = vals.game as GameId
    if (isNew) {
      const name = String(vals.name ?? '').trim()
      if (!name) throw new Error('Falta el nombre')
      let id = `${slug(name)}--${game.toLowerCase()}--custom`
      for (let n = 2; getPlayer(id); n++) id = `${slug(name)}--${game.toLowerCase()}--custom${n}`
      const characterId = String(vals.character_id ?? '').trim() || id
      if (!getAllPlayers().some(p => p.characterId === characterId)) await writeRow('characters', { id: characterId, name })
      const { techniques, ...rest } = vals
      await writeRow('cards', { ...rest, id, name, character_id: characterId, saga: SAGA[game] })
      await writeRow('card_techniques', { card_id: id, techniques: techniques ?? [] })
      onOpen({ tbl: 'cards', key: { id } })
      return
    }
    const fields = changed.filter(k => k !== 'techniques')
    if (fields.length) await writeRow('cards', { ...pick(['id', ...fields]), ...(fields.includes('game') ? { saga: SAGA[game] } : {}) })
    if (changed.includes('techniques')) await writeRow('card_techniques', { card_id: vals.id, techniques: vals.techniques ?? [] })
  }

  async function remove() {
    if (!open.key) return
    if (!confirm('¿Borrar de la base? No se puede deshacer desde aquí.')) return
    setState({ kind: 'saving', msg: 'Borrando…' })
    try {
      await deleteRow(open.tbl, open.key)
      onClose()
    } catch (e) {
      setState({ kind: 'error', msg: (e as Error).message })
    }
  }

  const preview = open.tbl === 'cards' ? previewPlayer(vals) : null
  const auto = preview ? duelStats({ ...preview, duel: undefined }) : null
  const title = isNew ? `Nueva ${TBL_LABEL[open.tbl].toLowerCase()}` : String(vals.name ?? vals.id ?? '')

  return (
    <div className="admin-editor">
      <div className="admin-editor__head">
        <button type="button" className="hub-icon-btn" onClick={onClose} aria-label="Volver"><ArrowLeft size={18} /></button>
        <span className="admin-editor__title"><small>{TBL_LABEL[open.tbl]}</small><b>{title || '—'}</b></span>
      </div>
      {preview && <div className="admin-preview"><InaCard player={preview} size="md" stats /></div>}
      {open.tbl === 'teams' && typeof vals.logo_url === 'string' && vals.logo_url && <div className="admin-preview"><img className="admin-preview__logo" src={vals.logo_url} alt="" /></div>}
      {base && sections.map(s => (
        <details key={s.title} className="admin-section" open={s.title !== 'Avanzado' && s.title !== 'Textos'}>
          <summary>{s.title}</summary>
          <div className="admin-form">
            {s.fields.map(f => (
              <FieldInput key={f.key} f={f} value={vals[f.key]} readOnly={!!f.readOnlyOnEdit && !isNew} changed={changed.includes(f.key)}
                placeholder={auto && f.key.startsWith('duel_') ? `auto ${auto[f.key === 'duel_att' ? 'att' : f.key === 'duel_con' ? 'con' : 'def']}` : undefined}
                json={json[f.key]} onJson={v => setJson(j => ({ ...j, [f.key]: v }))} onChange={v => set(f.key, v)} />
            ))}
          </div>
        </details>
      ))}
      {base && open.tbl === 'cards' && (
        <details className="admin-section" open>
          <summary>Supertécnicas {changed.includes('techniques') && <i className="admin-dot" />}</summary>
          <TechEditor ids={(vals.techniques as string[]) ?? []} onChange={ids => set('techniques', ids)} />
        </details>
      )}

      <div className="admin-savebar">
        <span className={`admin-msg admin-msg--${state.kind}`}>
          {state.kind === 'saved' ? <><Check size={14} /> Guardado en la base</>
            : state.kind === 'error' ? state.msg
              : state.kind === 'saving' ? state.msg
                : jsonError ? `JSON mal escrito en «${jsonError}»`
                  : changed.length ? `${changed.length} cambio${changed.length > 1 ? 's' : ''} sin guardar` : 'Sin cambios'}
        </span>
        {!isNew && changed.length > 0 && (
          <button type="button" className="hub-icon-btn" onClick={() => { setVals(base ?? {}); setJson({}) }} aria-label="Deshacer"><Undo2 size={16} /></button>
        )}
        {!isNew && open.tbl !== 'staff' && (
          <button type="button" className="hub-icon-btn admin-danger" onClick={remove} aria-label="Borrar"><Trash2 size={16} /></button>
        )}
        <button type="button" className="sheet-cta" disabled={!base || state.kind === 'saving' || !!jsonError || (!isNew && !changed.length)} onClick={() => void save()}>
          {isNew ? 'CREAR' : 'GUARDAR'}
        </button>
      </div>
    </div>
  )
}

function FieldInput({ f, value, readOnly, changed, placeholder, json, onJson, onChange }: {
  f: Field; value: unknown; readOnly: boolean; changed: boolean; placeholder?: string
  json?: string; onJson: (v: string) => void; onChange: (v: unknown) => void
}) {
  const cls = `admin-field ${f.wide ? 'admin-form__wide' : ''} ${changed ? 'is-changed' : ''}`
  const label = <span>{f.label}</span>
  if (f.kind === 'bool') {
    return <label className={`${cls} admin-field--bool`}><input type="checkbox" checked={!!value} disabled={readOnly} onChange={e => onChange(e.target.checked)} />{label}</label>
  }
  let input: ReactNode
  if (f.kind === 'select') {
    input = (
      <select className="admin-input" value={String(value ?? '')} disabled={readOnly} onChange={e => onChange(e.target.value || null)}>
        {!f.options!.includes(String(value ?? '')) && <option value={String(value ?? '')}>{String(value ?? '—')}</option>}
        {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  } else if (f.kind === 'textarea') {
    input = <textarea className="admin-input" rows={3} value={String(value ?? '')} readOnly={readOnly} onChange={e => onChange(e.target.value || null)} />
  } else if (f.kind === 'json') {
    const text = json ?? (value == null ? '' : JSON.stringify(value))
    input = (
      <textarea className="admin-input admin-input--mono" rows={2} value={text} readOnly={readOnly} spellCheck={false}
        onChange={e => { onJson(e.target.value); try { onChange(JSON.parse(e.target.value || 'null')) } catch { /* se avisa abajo */ } }} />
    )
  } else if (f.kind === 'team') {
    input = (
      <>
        <input className="admin-input" list="admin-teams" value={String(value ?? '')} readOnly={readOnly} onChange={e => onChange(e.target.value || null)} />
        <TeamDatalist />
      </>
    )
  } else {
    input = (
      <input className="admin-input" type={f.kind === 'number' ? 'number' : 'text'} inputMode={f.kind === 'number' ? 'numeric' : undefined}
        value={value == null ? '' : String(value)} readOnly={readOnly} placeholder={placeholder}
        onChange={e => onChange(f.kind === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : (e.target.value || null))} />
    )
  }
  return <label className={cls}>{label}{input}</label>
}

let teamOptions: string[] | null = null
function TeamDatalist() {
  teamOptions ??= getTeamRows().map(t => t.name).sort()
  return <datalist id="admin-teams">{teamOptions.map(n => <option key={n} value={n} />)}</datalist>
}

function TechEditor({ ids, onChange }: { ids: string[]; onChange: (ids: string[]) => void }) {
  const [q, setQ] = useState('')
  const k = norm(q.trim())
  const matches = k.length < 2 ? [] : getAllTechniques().filter(t => !ids.includes(t.id) && norm(`${t.name} ${t.nameEs ?? ''} ${t.id}`).includes(k)).slice(0, 10)
  const move = (i: number, d: number) => { const l = [...ids]; [l[i], l[i + d]] = [l[i + d], l[i]]; onChange(l) }
  return (
    <div className="admin-techs">
      {ids.length === 0 && <p className="fd-hint">Sin supertécnicas.</p>}
      <ol>
        {ids.map((tid, i) => {
          const t = getTechnique(tid)
          return (
            <li key={tid}>
              <span className="admin-list__text"><b>{t?.nameEs ?? t?.name ?? tid}</b><small>{t ? `${t.type} · ${t.element ?? '—'} · TP ${t.tp ?? '—'}` : 'no existe'}</small></span>
              <button type="button" className="chip" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">↑</button>
              <button type="button" className="chip" disabled={i === ids.length - 1} onClick={() => move(i, 1)} aria-label="Bajar">↓</button>
              <button type="button" className="chip admin-danger" onClick={() => onChange(ids.filter(x => x !== tid))} aria-label="Quitar">✕</button>
            </li>
          )
        })}
      </ol>
      <label className="admin-search"><Plus size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Añadir supertécnica…" /></label>
      {matches.length > 0 && (
        <ul className="admin-list admin-list--compact">
          {matches.map(t => (
            <li key={t.id} role="button" onClick={() => { onChange([...ids, t.id]); setQ('') }}>
              <span className="admin-list__text"><b>{t.nameEs ?? t.name}</b><small>{t.name} · {t.type} · TP {t.tp ?? '—'}</small></span>
              <Plus size={16} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Carta a partir del formulario (para ver los cambios antes de guardar) */
function previewPlayer(v: Row): Player {
  const old = typeof v.id === 'string' ? getPlayer(v.id) : undefined
  const num = (k: string, d: number) => (typeof v[k] === 'number' ? v[k] as number : d)
  const duel = v.duel_att != null || v.duel_con != null || v.duel_def != null
    ? { att: (v.duel_att as number) ?? null, con: (v.duel_con as number) ?? null, def: (v.duel_def as number) ?? null } : undefined
  const techniques = ((v.techniques as string[]) ?? []).map(id => getTechnique(id)).filter(t => !!t)
  return {
    ...(old ?? { id: 'preview', characterId: 'preview', hissatsu: [], zukanNo: null, no: null, specials: [], extraTeams: [] }),
    name: String(v.name || '—'), game: (v.game as GameId) ?? 'VR', team: (v.team as string) || 'Unaffiliated', version: String(v.version ?? 'base'),
    element: (v.element as Player['element']) ?? 'fire', position: (v.position as Player['position']) ?? 'MF', ovr: num('ovr', 60),
    category: (v.category as Player['category']) ?? 'Common Player', tier: (v.tier as Player['tier']) ?? 'C', image: (v.image_url as string) ?? null,
    stats: { shooting: num('shooting', 50), control: num('control', 50), physical: num('physical', 50), speed: num('speed', 50), defense: num('defense', 50), goalkeeping: num('goalkeeping', 30) },
    techniques, isVersion: !!v.is_version, duel,
  } as Player
}

// ---------------------------------------------------------------- cambios antiguos (guardados solo en el móvil)

/** Antes el CRUD guardaba en el dispositivo y se exportaba un JSON: si quedan cambios así, se suben a la base */
function LegacyEdits() {
  const [n, setN] = useState(() => editCount(getEdits()))
  const [msg, setMsg] = useState('')
  if (!n) return null

  async function upload() {
    const e = getEdits()
    let done = 0
    try {
      for (const [id, card] of Object.entries(e.created)) {
        const game = (card.game ?? 'VR') as GameId
        const characterId = card.character_id ?? id
        await writeRow('characters', { id: characterId, name: card.name ?? id })
        const { techniques, ...rest } = card
        await writeRow('cards', { ...NEW_ROW.cards, ...rest, id, character_id: characterId, saga: SAGA[game], techniques: undefined })
        await writeRow('card_techniques', { card_id: id, techniques: techniques ?? [] })
        done++
      }
      for (const [id, patch] of Object.entries(e.cards)) {
        const { techniques, ...rest } = patch
        if (Object.keys(rest).length) await writeRow('cards', { id, ...rest, ...(rest.game ? { saga: SAGA[rest.game as GameId] } : {}) })
        if (techniques) await writeRow('card_techniques', { card_id: id, techniques })
        done++
      }
      for (const [id, patch] of Object.entries(e.techniques)) { await writeRow('techniques', { id, ...patch }); done++ }
      for (const id of e.deleted) { await deleteRow('cards', { id }); done++ }
      clearEdits()
      setN(0)
    } catch (err) {
      setMsg(`Subidos ${done}; error: ${(err as Error).message}`)
    }
  }

  return (
    <div className="admin-legacy">
      <span>Hay <b>{n}</b> cambios antiguos guardados solo en este dispositivo.</span>
      <button type="button" className="chip on" onClick={() => void upload()}>Subirlos a la base</button>
      <button type="button" className="chip" onClick={() => { if (confirm('¿Descartar esos cambios?')) { clearEdits(); setN(0) } }}>Descartar</button>
      {msg && <p className="admin-msg admin-msg--error">{msg}</p>}
      <small className="admin-list__id">Ya no se aplican encima del catálogo; súbelos o descártalos.</small>
    </div>
  )
}
