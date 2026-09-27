#!/usr/bin/env node
/**
 * Associe chaque joueur (src/data/players.ts) à sa fiche zukan et génère
 * src/data/player-images.ts indexé par id joueur (et non plus par nom).
 *
 * Un même nom peut avoir plusieurs fiches zukan (version IE1 / Dark Emperors,
 * enfant / adulte GO…) : on choisit celle qui correspond au jeu, à l'équipe,
 * à l'élément et au poste du joueur.
 *
 * Usage : node tools/zukan-images.mjs [--refresh]
 *   --refresh  re-télécharge la liste zukan (sinon cache tools/.cache/)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = join(ROOT, 'tools/.cache/zukan-chara.json')
const PLAYERS_FILE = join(ROOT, 'src/data/players.ts')
const OUT_FILE = join(ROOT, 'src/data/player-images.ts')
const LIST_URL = 'https://zukan.inazuma.jp/en/chara_list/?page='
const GAMES = ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3', 'ARES', 'ORION', 'VR']
const ELEMENT = { Mountain: 'earth', Fire: 'fire', Wind: 'air', Forest: 'wood' }

const decode = s =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim()
const text = s => decode(s.replace(/<br\s*\/?>/g, ' / ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' '))

async function fetchPage(page) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(LIST_URL + page, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (res.ok) return await res.text()
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
  }
  throw new Error(`zukan page ${page} unreachable`)
}

async function loadZukan(refresh) {
  if (!refresh && existsSync(CACHE)) return JSON.parse(readFileSync(CACHE, 'utf8'))
  const first = await fetchPage(1)
  const last = Math.max(...[...first.matchAll(/chara_list\/\?page=(\d+)/g)].map(m => Number(m[1])))
  const rows = []
  for (let page = 1; page <= last; page++) {
    const html = page === 1 ? first : await fetchPage(page)
    for (const block of html.split('<tbody>').slice(1)) {
      const m = block.match(/data-chara-id="([^"]+)"\s*data-chara-name="([^"]*)"/)
      if (!m) continue
      const cells = [...block.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c => text(c[1]))
      const marks = cells.slice(-9)
      rows.push({
        id: m[1],
        name: decode(m[2]),
        element: ELEMENT[cells[6]] ?? null,
        position: cells[7],
        teams: cells[11].split(' / ').map(t => t.trim()),
        games: GAMES.filter((_, i) => marks[i] === '○'),
      })
    }
    process.stdout.write(`\rzukan ${page}/${last}`)
    await new Promise(r => setTimeout(r, 300))
  }
  process.stdout.write('\n')
  mkdirSync(dirname(CACHE), { recursive: true })
  writeFileSync(CACHE, JSON.stringify(rows))
  return rows
}

/** Même id que p() dans src/data/players.ts */
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const playerId = (name, game, team) => `${game.toLowerCase()}-${slug(team)}-${slug(name)}`.replace(/-+$/, '')

function loadPlayers() {
  const src = readFileSync(PLAYERS_FILE, 'utf8')
  const re = /^\s*p\("((?:[^"\\]|\\.)*)", "(\w+)", "((?:[^"\\]|\\.)*)", "(\w+)", "(\w+)"/gm
  return [...src.matchAll(re)].map(m => ({ name: m[1], game: m[2], team: m[3], element: m[4], position: m[5] }))
}

function score(z, p) {
  return (z.games.includes(p.game) ? 8 : 0) +
    (z.teams.includes(p.team) ? 4 : 0) +
    (z.element === p.element ? 2 : 0) +
    (z.position === p.position ? 1 : 0)
}

const zukan = await loadZukan(process.argv.includes('--refresh'))
const byName = new Map()
for (const z of zukan) {
  if (!byName.has(z.name)) byName.set(z.name, [])
  byName.get(z.name).push(z)
}

const ids = {}
const unmatched = []
let ambiguous = 0
for (const p of loadPlayers()) {
  const id = playerId(p.name, p.game, p.team)
  if (ids[id]) continue
  const cands = byName.get(p.name) ?? []
  if (cands.length === 0) { unmatched.push(`${p.name} (${p.team} ${p.game})`); continue }
  const ranked = cands.map(z => [score(z, p), z]).sort((a, b) => b[0] - a[0])
  if (cands.length > 1) ambiguous++
  ids[id] = ranked[0][1].id
}

const body = Object.entries(ids)
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join('\n')
writeFileSync(OUT_FILE, `import type { Player } from '../types'

/**
 * Généré par tools/zukan-images.mjs — ne pas éditer à la main.
 * id joueur → id fiche zukan (= chemin de l'image). Indexé par id et non par
 * nom : un même nom peut avoir plusieurs versions (IE1 / Dark Emperors,
 * enfant / adulte GO…) avec des portraits différents.
 */
const ZUKAN_IMG = 'https://dxi4wb638ujep.cloudfront.net/1/'

export const PLAYER_ZUKAN_IDS: Record<string, string> = {
${body}
}

export function getPlayerImage(player: Pick<Player, 'id'>): string | undefined {
  const zukanId = PLAYER_ZUKAN_IDS[player.id]
  return zukanId ? \`\${ZUKAN_IMG}\${zukanId}.png\` : undefined
}
`)

console.log(`${Object.keys(ids).length} joueurs avec portrait (${ambiguous} départagés entre plusieurs fiches)`)
if (unmatched.length) console.log(`Sans fiche zukan (${unmatched.length}) : ${unmatched.join(', ')}`)
