// Empaqueta las pruebas de los minijuegos con esbuild y las ejecuta con node.
import { build } from 'esbuild'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'node_modules/.cache/minigames-test.mjs')
await build({ entryPoints: [path.join(root, 'tools/minigames/test.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error' })
execFileSync('node', [out], { stdio: 'inherit' })
