import { useMemo, useState } from 'react'
import type { Category, Element, GameId, Player, Position } from '../types'
import { CATEGORIES, ELEMENTS, GAMES, POSITIONS, getAllPlayers, teamName } from '../data/catalog'
import { GAME_LABEL } from '../data/games'
import { useAppSettings } from '../context/AppSettings'
import PlayerCard from './PlayerCard'
import PlayerAvatar from './PlayerAvatar'
import PlayerDetail from './PlayerDetail'
import { CATEGORY_CLASS } from '../lib/categories'

const PAGE = 60
const SCOUT_TEAMS = new Set(['Unaffiliated', 'Sub Character'])
const SCOUTS = '__scouts__'
const POS_ORDER: Record<Position, number> = { GK: 0, DF: 1, MF: 2, FW: 3 }

type Tab = 'search' | 'games'
type Sort = 'ovr' | 'name'

export default function PlayersExplorer() {
  const { t, locale } = useAppSettings()
  const all = getAllPlayers()
  const [tab, setTab] = useState<Tab>('search')
  const [detail, setDetail] = useState<Player | null>(null)

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="iz-panel mb-4">
          <div className="iz-panel-head flex flex-wrap items-center justify-between gap-2">
            <span>{t('players.title')} <span className="opacity-70 font-normal normal-case tracking-normal">· {all.length}</span></span>
            <div className="seg-group">
              {(['search', 'games'] as const).map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`seg-btn seg-btn--sm min-h-[2rem] px-3 ${tab === k ? 'seg-btn--on' : 'seg-btn--off'}`}
                >
                  {t(k === 'search' ? 'players.tab.search' : 'players.tab.games')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === 'search' ? <SearchView players={all} onOpen={setDetail} /> : <GamesView players={all} onOpen={setDetail} />}
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
    const set = new Set(players.filter(p => !game || p.game === game).map(p => p.team))
    return [...set].sort((a, b) => teamName(a, locale).localeCompare(teamName(b, locale)))
  }, [players, game, locale])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = players.filter(p =>
      (!q || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || teamName(p.team, locale).toLowerCase().includes(q)) &&
      (!pos || p.position === pos) && (!cat || p.category === cat) && (!game || p.game === game) &&
      (!element || p.element === element) && (!team || p.team === team) && p.ovr >= minOvr)
    return sort === 'ovr'
      ? list.sort((a, b) => b.ovr - a.ovr || a.name.localeCompare(b.name))
      : list.sort((a, b) => a.name.localeCompare(b.name) || b.ovr - a.ovr)
  }, [players, query, pos, cat, game, element, team, minOvr, sort])

  const reset = () => {
    setQuery(''); setPos(''); setCat(''); setGame(''); setElement(''); setTeam(''); setMinOvr(40); setSort('ovr'); setLimit(PAGE)
  }
  const onFilter = <T,>(set: (v: T) => void) => (v: T) => { set(v); setLimit(PAGE) }

  return (
    <>
      <div className="iz-panel mb-4">
        <div className="iz-panel-body grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 items-end">
          <label className="col-span-2 sm:col-span-4 lg:col-span-2">
            <span className="iz-label">{t('players.tab.search')}</span>
            <input className="iz-field" value={query} placeholder={t('players.search')} onChange={e => onFilter(setQuery)(e.target.value)} />
          </label>
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
            <input type="range" min={40} max={94} value={minOvr} className="w-full accent-[var(--iz-orange)]"
              onChange={e => onFilter(setMinOvr)(Number(e.target.value))} />
          </label>
        </div>
        <div className="px-4 pb-3 flex flex-wrap items-center gap-2 text-xs text-iz-muted">
          <span className="font-bold text-iz-text">{t('players.results', { n: results.length })}</span>
          <span className="ml-auto">{t('players.sort')}:</span>
          <div className="seg-group">
            {(['ovr', 'name'] as const).map(s => (
              <button key={s} type="button" onClick={() => setSort(s)}
                className={`seg-btn seg-btn--sm min-h-[1.75rem] px-2 ${sort === s ? 'seg-btn--on' : 'seg-btn--off'}`}>
                {t(s === 'ovr' ? 'players.sort.ovr' : 'players.sort.name')}
              </button>
            ))}
          </div>
          <button type="button" onClick={reset} className="btn-secondary text-[0.65rem] py-1 px-2">{t('players.reset')}</button>
        </div>
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
      const key = SCOUT_TEAMS.has(p.team) ? SCOUTS : p.team
      const list = m.get(key)
      if (list) list.push(p)
      else m.set(key, [p])
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
  const { locale } = useAppSettings()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
      {players.map(p => (
        <div key={p.id} className="relative">
          <PlayerCard player={p} mode="classic" onClick={() => onOpen(p)}
            teamLabel={`${teamName(p.team, locale)}${p.version !== 'base' && p.version !== p.team ? ` · ${teamName(p.version, locale)}` : ''} · ${p.game}`} />
          <span className={`cat-pill ${CATEGORY_CLASS[p.category]} absolute bottom-2 right-2`}>{p.category.replace(' Player', '')}</span>
        </div>
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
