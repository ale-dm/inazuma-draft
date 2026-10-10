// Mide el equilibrio del Fatal (duelo clásico y Sim) jugando miles de partidos sin pantalla con el código real de la app.
//   npm run balance                 → catálogo de build/players.json (sin red), 1500 partidos por escenario
//   npm run balance -- --live       → catálogo de Supabase
//   npm run balance -- --n 4000     → más partidos por escenario
// Escribe docs/balance-report.md y sale con error si algún indicador se sale de su rango (ver tools/balance/harness.ts).
import { build } from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'node_modules/.cache/balance-harness.mjs')
await build({
  entryPoints: [path.join(root, 'tools/balance/harness.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error',
  define: { 'import.meta.env': '{"BASE_URL":"/"}' }, banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
})
const args = process.argv.slice(2)
const di = args.indexOf('--difficulty')
globalThis.__BALANCE_ARGS__ = { live: args.includes('--live'), n: Number(args[args.indexOf('--n') + 1]) || 1500, root, difficulty: di >= 0 ? args[di + 1] : 'normal' }
await import(pathToFileURL(out).href)
