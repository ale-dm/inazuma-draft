import { useMemo, useState } from 'react'
import type { Category, Element, GameId, Player, Position, Staff, StaffRole } from '../types'
import { CATEGORIES, ELEMENTS, GAMES, POSITIONS, cardTeamLabel, getAllPlayers, getStaff, teamName } from '../data/catalog'
import { GAME_LABEL } from '../data/games'
import { useAppSettings } from '../context/AppSettings'
import InaCard from './InaCard'
import { SlidersHorizontal } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar'
import PlayerDetail from './PlayerDetail'
import { CATEGORY_CLASS } from '../lib/categories'

const PAGE = 60
const SCOUT_TEAMS = new Set(['Unaffiliated', 'Sub Character'])
const SCOUTS = '__scouts__'
const POS_ORDER: Record<Position, number> = { GK: 0, DF: 1, MF: 2, FW: 3 }
const MAIN_ORDER = (p: Player) => GAMES.indexOf(p.game)
const STAFF_ROLES: StaffRole[] = ['Manager', 'Coach', 'Coordinator']

type Tab = 'search' | 'games' | 'staff'
type Sort = 'ovr' | 'name' | 'no'

export default function PlayersExplorer() {
  const { t, locale } = useAppSettings()
  const all = getAllPlayers()
  const [tab, setTab] = useState<Tab>('search')
  const [detail, setDetail] = useState<Player | null>(null)

  return (
    <div className="px-3 pb-6 sm:px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        <div className="store-tabs">
          {(['search', 'games', 'staff'] as const).map(k => (
            <button key={k} type="button" onClick={() => setTab(k)} className={tab === k ? 'on' : ''}>
              {t(`players.tab.${k}`)}{k === 'search' && <em className="explorer-count">{all.length}</em>}
            </button>
          ))}
        </div>

        {tab === 'search' && <SearchView players={all} onOpen={setDetail} />}
        {tab === 'games' && <GamesView players={all} onOpen={setDetail} />}
        {tab === 'staff' && <StaffView />}
      </div>
      {detail && <PlayerDetail player={detail} onClose={() => setDetail(null)} onOpen={setDetail} />}
    </div>
  )
}

function SearchView({ players, onOpen }: { players: Player[]; onOpen: (p: Player) => void }) {
  const { t, locale } = useAppSettings()
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<Position | ''>('')
  const [cat, setCat] = useState<Category | ''>('')
  const [game, setGame] = useState<GameId | ''>('')
  const [element, setElement] = useState<Element | ''>('')
  const [team, setTeam] = useState('')
  const [minOvr, setMinOvr] = useState(40)
  const [sort, setSort] = useState<Sort>('ovr')
  const [limit, setLimit] = useState(PAGE)

  const teams = useMemo(() => {
    const set = new Set(players.filter(p => !game || p.game === game).flatMap(p => [p.team, ...p.extraTeams]))
    return [...set].sort((a, b) => teamName(a, locale).localeCompare(teamName(b, locale)))
  }, [players, game, locale])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = players.filter(p =>
      (!q || p.name.toLowerCase().includes(q) || String(p.no) === q || String(p.zukanNo) === q || p.team.toLowerCase().includes(q) || teamName(p.team, locale).toLowerCase().includes(q)) &&
      (!pos || p.position === pos) && (!cat || p.category === cat) && (!game || p.game === game) &&
      (!element || p.element === element) && (!team || p.team === team || p.extraTeams.includes(team)) && p.ovr >= minOvr)
    if (sort === 'no') return list.sort((a, b) => (a.no ?? Infinity) - (b.no ?? Infinity) || MAIN_ORDER(a) - MAIN_ORDER(b))
    return sort === 'ovr'
      ? list.sort((a, b) => b.ovr - a.ovr || a.name.localeCompare(b.name))
      : list.sort((a, b) => a.name.localeCompare(b.name) || b.ovr - a.ovr)
  }, [players, query, pos, cat, game, element, team, minOvr, sort])

  const reset = () => {
    setQuery(''); setPos(''); setCat(''); setGame(''); setElement(''); setTeam(''); setMinOvr(40); setSort('ovr'); setLimit(PAGE)
  }
  const onFilter = <T,>(set: (v: T) => void) => (v: T) => { set(v); setLimit(PAGE) }
  const [showFilters, setShowFilters] = useState(false)
  const active = [pos, cat, game, element, team].filter(Boolean).length + (minOvr > 40 ? 1 : 0)

  return (
    <>
      <div className="explorer-search">
        <input className="iz-field" value={query} placeholder={t('players.search')} onChange={e => onFilter(setQuery)(e.target.value)} />
        <button type="button" className={`chip ${showFilters || active ? 'on' : ''}`} onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters}>
          <SlidersHorizontal size={15} />{active > 0 && <b>{active}</b>}
        </button>
      </div>
      {showFilters && (
        <div className="explorer-filters">
          <Select label={t('players.filter.position')} value={pos} onChange={onFilter(setPos)}
            options={POSITIONS.map(p => [p, p])} />
          <Select label={t('players.filter.category')} value={cat} onChange={onFilter(setCat)}
            options={CATEGORIES.map(c => [c, c.replace(' Player', '')])} />
          <Select label={t('players.filter.game')} value={game} onChange={v => { onFilter(setGame)(v); setTeam('') }}
            options={GAMES.map(g => [g, `${g} · ${GAME_LABEL[g]}`])} />
          <Select label={t('players.filter.element')} value={element} onChange={onFilter(setElement)}
            options={ELEMENTS.map(e => [e, t(`element.${e}`)])} />
          <Select label={t('players.filter.team')} value={team} onChange={onFilter(setTeam)}
            options={teams.map(tm => [tm, teamName(tm, locale)])} />
          <label>
            <span className="iz-label">{t('players.filter.minOvr')} · <strong className="tabular-nums">{minOvr}</strong></span>
            <input type="range" min={40} max={94} value={minOvr} className="w-full accent-[var(--hub-neon)]"
              onChange={e => onFilter(setMinOvr)(Number(e.target.value))} />
          </label>
        </div>
      )}
      <div className="explorer-bar">
        <span>{t('players.results', { n: results.length })}</span>
        <div className="seg-group">
          {(['ovr', 'name', 'no'] as const).map(s => (
            <button key={s} type="button" onClick={() => setSort(s)}
              className={`seg-btn seg-btn--sm ${sort === s ? 'seg-btn--on' : 'seg-btn--off'}`}>
              {t(`players.sort.${s}`)}
            </button>
          ))}
        </div>
        {active > 0 && <button type="button" onClick={reset} className="chip">{t('players.reset')}</button>}
      </div>

      {results.length === 0 ? (
        <p className="text-center text-iz-muted py-10">{t('players.empty')}</p>
      ) : (
        <PlayerGrid players={results.slice(0, limit)} onOpen={onOpen} />
      )}
      {results.length > limit && (
        <div className="text-center mt-5">
          <button type="button" onClick={() => setLimit(l => l + PAGE)} className="btn-primary">
            {t('players.more')} ({results.length - limit})
          </button>
        </div>
      )}
    </>
  )
}

function GamesView({ players, onOpen }: { players: Player[]; onOpen: (p: Player) => void }) {
  const { t, locale } = useAppSettings()
  const [game, setGame] = useState<GameId | null>(null)
  const [team, setTeam] = useState<string | null>(null)

  const byGame = useMemo(() => {
    const m = new Map<GameId, Player[]>()
    for (const g of GAMES) m.set(g, [])
    for (const p of players) m.get(p.game)?.push(p)
    return m
  }, [players])

  const teams = useMemo(() => {
    if (!game) return []
    const m = new Map<string, Player[]>()
    for (const p of byGame.get(game) ?? []) {
      for (const tm of [p.team, ...p.extraTeams]) {
        const key = SCOUT_TEAMS.has(tm) ? SCOUTS : tm
        const list = m.get(key)
        if (list) list.push(p)
        else m.set(key, [p])
      }
    }
    return [...m.entries()]
      .map(([name, list]) => ({
        name, list,
        avg: Math.round(list.reduce((s, p) => s + p.ovr, 0) / list.length),
        best: list.reduce((a, b) => (b.ovr > a.ovr ? b : a)),
      }))
      .sort((a, b) => Number(a.name === SCOUTS) - Number(b.name === SCOUTS) || b.avg - a.avg)
  }, [game, byGame])

  const roster = useMemo(() => {
    const entry = teams.find(x => x.name === team)
    return entry ? [...entry.list].sort((a, b) => POS_ORDER[a.position] - POS_ORDER[b.position] || b.ovr - a.ovr) : []
  }, [teams, team])

  const teamTitle = (name: string) => (name === SCOUTS ? t('players.scouts') : teamName(name, locale))

  return (
    <>
      <nav className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <button type="button" className={`font-heading font-bold ${game ? 'text-iz-blue hover:underline' : 'text-iz-heading'}`}
          onClick={() => { setGame(null); setTeam(null) }}>
          {t('players.tab.games')}
        </button>
        {game && <>
          <span className="text-iz-muted">›</span>
          <button type="button" className={`font-heading font-bold ${team ? 'text-iz-blue hover:underline' : 'text-iz-heading'}`}
            onClick={() => setTeam(null)}>
            {game} · {GAME_LABEL[game]}
          </button>
        </>}
        {team && <>
          <span className="text-iz-muted">›</span>
          <span className="font-heading font-bold text-iz-heading">{teamTitle(team)}</span>
        </>}
      </nav>

      {!game && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GAMES.map(g => {
            const list = byGame.get(g) ?? []
            const nTeams = new Set(list.filter(p => !SCOUT_TEAMS.has(p.team)).map(p => p.team)).size
            return (
              <button key={g} type="button" className="team-tile" onClick={() => setGame(g)}>
                <div className="font-heading font-black text-2xl text-accent">{g}</div>
                <div className="font-heading font-bold text-iz-heading">{GAME_LABEL[g]}</div>
                <div className="text-xs text-iz-muted mt-1">
                  {t('players.results', { n: list.length })} · {t('players.teams', { n: nTeams })}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {game && !team && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {teams.map(tm => (
            <button key={tm.name} type="button" className="team-tile flex items-center gap-3" onClick={() => setTeam(tm.name)}>
              <PlayerAvatar player={tm.best} size="sm" variant="zukan" />
              <div className="min-w-0 flex-1">
                <div className="font-heading font-bold text-iz-heading truncate">{teamTitle(tm.name)}</div>
                <div className="text-[0.7rem] text-iz-muted">
                  {t('players.results', { n: tm.list.length })} · {t('players.avgOvr')} <strong className="tabular-nums text-iz-text">{tm.avg}</strong>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {game && team && (
        POSITIONS.map(pos => {
          const list = roster.filter(p => p.position === pos)
          if (!list.length) return null
          return (
            <section key={pos} className="mb-5">
              <h3 className="iz-pos-section__label mb-2"><span>{pos}</span> <span className="text-iz-muted font-normal">({list.length})</span></h3>
              <PlayerGrid players={list} onOpen={onOpen} />
            </section>
          )
        })
      )}
    </>
  )
}

function PlayerGrid({ players, onOpen }: { players: Player[]; onOpen: (p: Player) => void }) {
  return (
    <div className="card-grid">
      {players.map(p => (
        <span key={p.id} className="card-grid__item">
          <InaCard player={p} size="sm" onClick={() => onOpen(p)} />
        </span>
      ))}
    </div>
  )
}

function Select<T extends string>({ label, value, onChange, options }: {
  label: string; value: T | ''; onChange: (v: T | '') => void; options: [T, string][]
}) {
  const { t, locale } = useAppSettings()
  return (
    <label>
      <span className="iz-label">{label}</span>
      <select className="iz-field" value={value} onChange={e => onChange(e.target.value as T | '')}>
        <option value="">{t('players.all')}</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

/** Cuerpo técnico de zukan: entrenadores, segundos entrenadores y gerentes (sin stats por ahora) */
function StaffView() {
  const { t, locale } = useAppSettings()
  const all = getStaff()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<StaffRole | ''>('')
  const [open, setOpen] = useState<number | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(s => (!role || s.role === role) && (!q || s.name.toLowerCase().includes(q) || String(s.zukanNo) === q
      || s.teams.some(tm => tm.toLowerCase().includes(q) || teamName(tm, locale).toLowerCase().includes(q))))
  }, [all, query, role, locale])

  return (
    <>
      <div className="iz-panel mb-4">
        <div className="iz-panel-body grid gap-3 sm:grid-cols-[1fr_auto] items-end">
          <label>
            <span className="iz-label">{t('players.tab.search')}</span>
            <input className="iz-field" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('staff.placeholder')} />
          </label>
          <div className="seg-group">
            {(['', ...STAFF_ROLES] as const).map(r => (
              <button key={r || 'all'} type="button" onClick={() => setRole(r)}
                className={`seg-btn seg-btn--sm min-h-[2rem] px-2 ${role === r ? 'seg-btn--on' : 'seg-btn--off'}`}>
                {r ? t(`staff.role.${r}`) : t('players.all')}
              </button>
            ))}
          </div>
        </div>
        <p className="px-4 pb-3 text-xs text-iz-muted">{t('staff.note', { n: list.length })}</p>
      </div>
      {list.length === 0 ? (
        <p className="text-center text-iz-muted py-10">{t('players.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {list.map(s => <StaffTile key={s.zukanNo} staff={s} open={open === s.zukanNo} onToggle={() => setOpen(o => (o === s.zukanNo ? null : s.zukanNo))} />)}
        </div>
      )}
    </>
  )
}

function StaffTile({ staff: s, open, onToggle }: { staff: Staff; open: boolean; onToggle: () => void }) {
  const { t, locale } = useAppSettings()
  const [failed, setFailed] = useState(false)
  return (
    <button type="button" onClick={onToggle} className="team-tile flex items-start gap-3 text-left">
      <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-iz-card grid place-items-center font-heading font-bold">
        {s.image && !failed
          ? <img src={s.image} alt="" loading="lazy" className="w-full h-full object-cover" onError={() => setFailed(true)} />
          : s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-heading font-bold text-iz-heading truncate">{s.name}</span>
          <span className="ml-auto text-[0.6rem] tabular-nums text-iz-muted font-heading">Nº {s.zukanNo}</span>
        </div>
        <div className="text-xs text-accent font-heading">{t(`staff.role.${s.role}`)}</div>
        <div className="text-xs text-iz-text truncate">{s.teams.map(tm => teamName(tm, locale)).join(' · ')}</div>
        <div className="text-[0.65rem] text-iz-muted">{s.games.join(' · ')}</div>
        {s.description && (
          <p className={`text-xs text-iz-text italic mt-1 ${open ? '' : 'line-clamp-2'}`} lang="en">“{s.description}”</p>
        )}
      </div>
    </button>
  )
}
