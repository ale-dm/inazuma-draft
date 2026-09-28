import { useMemo, useRef, useState } from 'react'
import type { Player } from '../../types'
import {
  CATEGORIES, ELEMENTS, GAMES, POSITIONS, getAllPlayers, getAllTechniques, getBaseCardRow, getBaseTechniqueRow, getPlayer,
  getTechnique, rebuildCatalog, type CardRow,
} from '../../data/catalog'
import {
  clearEdits, editCount, getEdits, replaceEdits, setCardEdit, setCreated, setDeleted, setTechniqueEdit, useEdits,
  type AdminEdits, type CardEdit, type TechniqueEdit,
} from '../../lib/admin-edits'
import { duelStats } from '../../lib/duel'
import DuelCard from '../DuelCard'
import InaCard from '../InaCard'
import Screen from '../club/Screen'

/**
 * CRUD oculto (#/admin, o 7 toques en el logo de la pantalla principal): cambiar cartas (datos, estadísticas,
 * números de duelo, técnicas), crear y borrar cartas y cambiar técnicas. Los cambios se guardan en este dispositivo
 * y se aplican al momento; "Exportar" da el JSON para data/card_edits.json (build.py lo aplica a la base para todos).
 * Solo en castellano: es una herramienta interna.
 */
export default function Admin() {
  const [tab, setTab] = useState<'cards' | 'techs' | 'changes'>('cards')
  const edits = useEdits()
  return (
    <Screen title="CRUD">
      <div className="chip-row">
        <button type="button" className={`chip ${tab === 'cards' ? 'on' : ''}`} onClick={() => setTab('cards')}>Cartas</button>
        <button type="button" className={`chip ${tab === 'techs' ? 'on' : ''}`} onClick={() => setTab('techs')}>Técnicas</button>
        <button type="button" className={`chip ${tab === 'changes' ? 'on' : ''}`} onClick={() => setTab('changes')}>Cambios ({editCount(edits)})</button>
      </div>
      {tab === 'cards' && <CardsTab />}
      {tab === 'techs' && <TechsTab />}
      {tab === 'changes' && <ChangesTab />}
    </Screen>
  )
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// ---------------------------------------------------------------- cartas

function CardsTab() {
  const edits = useEdits()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const results = useMemo(() => {
    const k = norm(q.trim())
    const all = getAllPlayers()
    const deleted = edits.deleted.map(id => getBaseCardRow(id)).filter((r): r is CardRow => !!r)
    if (!k) {
      const touched = new Set([...Object.keys(edits.cards), ...Object.keys(edits.created)])
      return { list: all.filter(p => touched.has(p.id)), deleted }
    }
    return { list: all.filter(p => norm(`${p.name} ${p.id} ${p.team} ${p.game}`).includes(k)).slice(0, 60), deleted }
  }, [q, edits])

  function create() {
    const id = `custom-${Date.now().toString(36)}`
    setCreated(id, {
      name: 'Nueva carta', character_id: id, game: 'VR', version: 'base', position: 'MF', element: 'fire',
      ovr: 60, category: 'Common Player', tier: 'C', shooting: 50, control: 50, physical: 50, speed: 50, defense: 50,
      goalkeeping: 30, is_version: true, techniques: [],
    })
    rebuildCatalog()
    setOpen(id)
  }

  if (open) return <CardEditor id={open} onClose={() => setOpen(null)} />

  return (
    <>
      <div className="admin-row">
        <input className="admin-input" placeholder="Buscar carta (nombre, id, equipo, juego)…" value={q} onChange={e => setQ(e.target.value)} />
        <button type="button" className="chip on" onClick={create}>+ Nueva</button>
      </div>
      {!q && <p className="fd-hint">Sin búsqueda: las cartas que ya has cambiado o creado.</p>}
      <ul className="admin-list">
        {results.list.map(p => (
          <li key={p.id} role="button" onClick={() => setOpen(p.id)}>
            <InaCard player={p} size="xs" />
            <span className="admin-list__text">
              <b>{p.name}</b>
              <small>{p.game} · {p.team} · {p.position} · {p.ovr}</small>
              <small className="admin-list__id">{p.id}</small>
            </span>
            {edits.created[p.id] && <span className="admin-tag admin-tag--new">nueva</span>}
            {edits.cards[p.id] && <span className="admin-tag">editada</span>}
          </li>
        ))}
      </ul>
      {results.deleted.length > 0 && (
        <>
          <h3 className="sheet-label">Borradas</h3>
          <ul className="admin-list">
            {results.deleted.map(r => (
              <li key={r.id}>
                <span className="admin-list__text"><b>{r.name}</b><small>{r.game} · {r.id}</small></span>
                <button type="button" className="chip" onClick={() => { setDeleted(r.id, false); rebuildCatalog() }}>Recuperar</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

type Field = { key: keyof CardEdit; label: string; kind: 'text' | 'number' | 'select' | 'duel' | 'bool'; options?: readonly string[] }
const CARD_FIELDS: Field[] = [
  { key: 'name', label: 'Nombre', kind: 'text' },
  { key: 'game', label: 'Juego', kind: 'select', options: GAMES },
  { key: 'version', label: 'Versión', kind: 'text' },
  { key: 'team', label: 'Equipo', kind: 'text' },
  { key: 'position', label: 'Puesto', kind: 'select', options: POSITIONS },
  { key: 'element', label: 'Afinidad', kind: 'select', options: ELEMENTS },
  { key: 'ovr', label: 'Media', kind: 'number' },
  { key: 'category', label: 'Rareza', kind: 'select', options: CATEGORIES },
  { key: 'tier', label: 'Nivel', kind: 'select', options: ['S', 'A', 'B', 'C'] },
  { key: 'shooting', label: 'Tiro', kind: 'number' },
  { key: 'control', label: 'Control', kind: 'number' },
  { key: 'physical', label: 'Físico', kind: 'number' },
  { key: 'speed', label: 'Velocidad', kind: 'number' },
  { key: 'defense', label: 'Defensa', kind: 'number' },
  { key: 'goalkeeping', label: 'Parada', kind: 'number' },
  { key: 'duel_att', label: 'Duelo: ataque', kind: 'duel' },
  { key: 'duel_con', label: 'Duelo: control', kind: 'duel' },
  { key: 'duel_def', label: 'Duelo: defensa', kind: 'duel' },
  { key: 'image_url', label: 'Foto (URL)', kind: 'text' },
  { key: 'no', label: 'Nº', kind: 'number' },
  { key: 'is_version', label: 'Versión extra', kind: 'bool' },
]

const DUEL_KEY = { duel_att: 'att', duel_con: 'con', duel_def: 'def' } as const

/** Valores actuales de la carta como CardEdit completo (fila de Supabase + cambios, o la carta nueva) */
function currentValues(id: string): CardEdit {
  const e = getEdits()
  if (e.created[id]) return { ...e.created[id] }
  const base = getBaseCardRow(id)
  if (!base) return {}
  const { card_techniques, ...rest } = base
  const vals: CardEdit = {
    ...(rest as unknown as CardEdit),
    techniques: [...card_techniques].sort((a, b) => a.slot - b.slot).map(ct => ct.technique_id),
  }
  return { ...vals, ...e.cards[id] }
}

/** Cambios respecto a la fila de Supabase: solo lo que es distinto */
function diffFromBase(id: string, vals: CardEdit): CardEdit {
  const base = getBaseCardRow(id)
  if (!base) return vals
  const out: Record<string, unknown> = {}
  const baseTechs = [...base.card_techniques].sort((a, b) => a.slot - b.slot).map(ct => ct.technique_id)
  const baseRec = base as unknown as Record<string, unknown>
  for (const [k, v] of Object.entries(vals)) {
    if (k === 'techniques') {
      if (JSON.stringify(v) !== JSON.stringify(baseTechs)) out.techniques = v
    } else if (JSON.stringify(v ?? null) !== JSON.stringify(baseRec[k] ?? null)) {
      out[k] = v
    }
  }
  return out as CardEdit
}

function CardEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const isNew = !!getEdits().created[id]
  const [vals, setVals] = useState<CardEdit>(() => currentValues(id))
  const [techQ, setTechQ] = useState('')
  const [saved, setSaved] = useState(false)
  useEdits()                                             // la vista previa se repinta al guardar
  const player: Player | undefined = getPlayer(id)

  const set = (k: keyof CardEdit, v: unknown) => { setVals(x => ({ ...x, [k]: v })); setSaved(false) }
  const techIds = vals.techniques ?? []
  const techMatches = useMemo(() => {
    const k = norm(techQ.trim())
    if (k.length < 2) return []
    return getAllTechniques().filter(t => norm(`${t.name} ${t.nameEs ?? ''} ${t.id}`).includes(k)).slice(0, 12)
  }, [techQ])

  function save() {
    if (isNew) setCreated(id, vals)
    else setCardEdit(id, diffFromBase(id, vals))
    rebuildCatalog()
    setSaved(true)
  }

  function reset() {
    setCardEdit(id, null)
    rebuildCatalog()
    setVals(currentValues(id))
    setSaved(true)
  }

  function remove() {
    if (!confirm(isNew ? '¿Borrar esta carta nueva?' : '¿Borrar (ocultar) esta carta? Se puede recuperar.')) return
    if (isNew) setCreated(id, null)
    else setDeleted(id, true)
    rebuildCatalog()
    onClose()
  }

  const auto = player ? duelStats({ ...player, duel: undefined }) : null
  return (
    <div className="admin-editor">
      <button type="button" className="chip self-start" onClick={onClose}>← Cartas</button>
      <p className="admin-list__id">{id}{isNew ? ' · nueva' : ''}</p>
      {player && <div className="flex justify-center"><DuelCard player={player} size="md" /></div>}
      <div className="admin-form">
        {CARD_FIELDS.map(f => (
          <label key={f.key} className={f.kind === 'text' ? 'admin-form__wide' : undefined}>
            <span>{f.label}</span>
            {f.kind === 'select' ? (
              <select className="admin-input" value={String(vals[f.key] ?? '')} onChange={e => set(f.key, e.target.value)}>
                {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.kind === 'bool' ? (
              <input type="checkbox" checked={!!vals[f.key]} onChange={e => set(f.key, e.target.checked)} />
            ) : (
              <input
                className="admin-input"
                type={f.kind === 'text' ? 'text' : 'number'}
                value={vals[f.key] == null ? '' : String(vals[f.key])}
                placeholder={f.kind === 'duel' && auto ? `auto: ${auto[DUEL_KEY[f.key as keyof typeof DUEL_KEY]]}` : undefined}
                onChange={e => {
                  const v = e.target.value
                  set(f.key, f.kind === 'text' ? (v || null) : v === '' ? null : Number(v))
                }}
              />
            )}
          </label>
        ))}
      </div>
      <p className="fd-hint">Duelo en blanco = se calcula de las estadísticas (tiro, control, defensa; porteros: media de defensa y parada).</p>

      <h3 className="sheet-label">Técnicas</h3>
      <ul className="admin-techs">
        {techIds.map((tid, i) => (
          <li key={`${tid}-${i}`}>
            <span>{i + 1}. {getTechnique(tid)?.name ?? tid}</span>
            <button type="button" className="chip" disabled={i === 0} onClick={() => {
              const l = [...techIds]
              ;[l[i - 1], l[i]] = [l[i], l[i - 1]]
              set('techniques', l)
            }}>↑</button>
            <button type="button" className="chip" onClick={() => set('techniques', techIds.filter((_, j) => j !== i))}>✕</button>
          </li>
        ))}
      </ul>
      <input className="admin-input" placeholder="Añadir técnica (buscar)…" value={techQ} onChange={e => setTechQ(e.target.value)} />
      <div className="chip-row">
        {techMatches.map(tch => (
          <button key={tch.id} type="button" className="chip" onClick={() => { set('techniques', [...techIds, tch.id]); setTechQ('') }}>
            + {tch.name} <small>({tch.type})</small>
          </button>
        ))}
      </div>

      <div className="admin-actions">
        <button type="button" className="sheet-cta" onClick={save}>{saved ? 'GUARDADO ✓' : 'GUARDAR'}</button>
        {!isNew && <button type="button" className="chip" onClick={reset}>Deshacer cambios</button>}
        <button type="button" className="chip admin-danger" onClick={remove}>Borrar</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- técnicas

const TRAITS = ['long', 'block', 'chain', 'punch']

function TechsTab() {
  const edits = useEdits()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const list = useMemo(() => {
    const k = norm(q.trim())
    const all = getAllTechniques()
    if (!k) return all.filter(tch => edits.techniques[tch.id])
    return all.filter(tch => norm(`${tch.name} ${tch.nameEs ?? ''} ${tch.id}`).includes(k)).slice(0, 60)
  }, [q, edits])

  if (open) return <TechEditor id={open} onClose={() => setOpen(null)} />
  return (
    <>
      <input className="admin-input" placeholder="Buscar técnica…" value={q} onChange={e => setQ(e.target.value)} />
      {!q && <p className="fd-hint">Sin búsqueda: las técnicas que ya has cambiado.</p>}
      <ul className="admin-list">
        {list.map(tch => (
          <li key={tch.id} role="button" onClick={() => setOpen(tch.id)}>
            <span className="admin-list__text">
              <b>{tch.name}</b>
              <small>{tch.nameEs ?? '—'} · {tch.type} · {tch.element ?? '—'} · TP {tch.cost ?? '—'}{tch.traits?.length ? ` · ${tch.traits.join(', ')}` : ''}</small>
              <small className="admin-list__id">{tch.id}</small>
            </span>
            {edits.techniques[tch.id] && <span className="admin-tag">editada</span>}
          </li>
        ))}
      </ul>
    </>
  )
}

function TechEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const base = getBaseTechniqueRow(id)
  const [vals, setVals] = useState<TechniqueEdit>(() => ({
    name: base?.name, name_es: base?.name_es ?? null, type: base?.type, element: base?.element ?? null, cost: base?.cost ?? null,
    traits: base?.traits ?? [], ...getEdits().techniques[id],
  }))
  const [saved, setSaved] = useState(false)
  const set = (k: keyof TechniqueEdit, v: unknown) => { setVals(x => ({ ...x, [k]: v })); setSaved(false) }

  function save() {
    const baseRec = (base ?? {}) as unknown as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(vals)) {
      const b = baseRec[k] ?? (k === 'traits' ? [] : null)
      if (JSON.stringify(v ?? null) !== JSON.stringify(b)) out[k] = v
    }
    setTechniqueEdit(id, out as TechniqueEdit)
    rebuildCatalog()
    setSaved(true)
  }

  return (
    <div className="admin-editor">
      <button type="button" className="chip self-start" onClick={onClose}>← Técnicas</button>
      <p className="admin-list__id">{id}</p>
      <div className="admin-form">
        <label className="admin-form__wide"><span>Nombre</span>
          <input className="admin-input" value={vals.name ?? ''} onChange={e => set('name', e.target.value)} /></label>
        <label className="admin-form__wide"><span>Nombre en castellano</span>
          <input className="admin-input" value={vals.name_es ?? ''} onChange={e => set('name_es', e.target.value || null)} /></label>
        <label><span>Tipo</span>
          <select className="admin-input" value={vals.type ?? ''} onChange={e => set('type', e.target.value)}>
            {['Shoot', 'Dribble', 'Block', 'Catch'].map(o => <option key={o}>{o}</option>)}
          </select></label>
        <label><span>Afinidad</span>
          <select className="admin-input" value={vals.element ?? ''} onChange={e => set('element', e.target.value || null)}>
            <option value="">—</option>
            {ELEMENTS.map(o => <option key={o}>{o}</option>)}
          </select></label>
        <label><span>TP</span>
          <input className="admin-input" type="number" value={vals.cost ?? ''} onChange={e => set('cost', e.target.value === '' ? null : Number(e.target.value))} /></label>
      </div>
      <div className="chip-row">
        {TRAITS.map(tr => (
          <label key={tr} className={`chip ${vals.traits?.includes(tr) ? 'on' : ''}`}>
            <input type="checkbox" className="sr-only" checked={!!vals.traits?.includes(tr)}
              onChange={e => set('traits', e.target.checked ? [...(vals.traits ?? []), tr] : (vals.traits ?? []).filter(x => x !== tr))} />
            {tr}
          </label>
        ))}
      </div>
      <div className="admin-actions">
        <button type="button" className="sheet-cta" onClick={save}>{saved ? 'GUARDADO ✓' : 'GUARDAR'}</button>
        <button type="button" className="chip" onClick={() => { setTechniqueEdit(id, null); rebuildCatalog(); onClose() }}>Deshacer cambios</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- exportar / importar

function ChangesTab() {
  const edits = useEdits()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const json = JSON.stringify(edits, null, 1)

  function download() {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    a.download = 'card_edits.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function load(f: File) {
    try {
      const data = JSON.parse(await f.text()) as AdminEdits
      if (typeof data !== 'object' || !data || typeof data.cards !== 'object') throw new Error('formato')
      replaceEdits(data)
      rebuildCatalog()
      setMsg(`Importados ${editCount(data)} cambios`)
    } catch {
      setMsg('No es un card_edits.json válido')
    }
  }

  return (
    <>
      <p className="fd-hint">
        Los cambios están solo en este dispositivo. Para que sean para todos: exporta, guarda el archivo como
        <code> data/card_edits.json</code> en el repo y ejecuta <code>python3 tools/db/build.py</code>; el workflow de carga
        los sube a Supabase.
      </p>
      <p className="fd-hint">
        {Object.keys(edits.cards).length} cartas cambiadas · {Object.keys(edits.created).length} nuevas ·{' '}
        {edits.deleted.length} borradas · {Object.keys(edits.techniques).length} técnicas
      </p>
      <div className="admin-actions">
        <button type="button" className="sheet-cta" onClick={download} disabled={!editCount(edits)}>EXPORTAR card_edits.json</button>
        <button type="button" className="chip" onClick={() => void navigator.clipboard?.writeText(json).then(() => setMsg('Copiado'))}>Copiar JSON</button>
        <button type="button" className="chip" onClick={() => file.current?.click()}>Importar…</button>
        <button type="button" className="chip admin-danger" onClick={() => { if (confirm('¿Borrar todos los cambios de este dispositivo?')) { clearEdits(); rebuildCatalog() } }}>Borrar todo</button>
      </div>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void load(f) }} />
      {msg && <p className="fd-hint">{msg}</p>}
      <pre className="admin-json">{json}</pre>
    </>
  )
}
