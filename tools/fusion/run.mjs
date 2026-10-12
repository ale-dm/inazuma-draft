// Empaqueta las pruebas de el fusión con esbuild y las ejecuta con node.
import { build } from 'esbuild'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'node_modules/.cache/fusion-test.mjs')
await build({ entryPoints: [path.join(root, 'tools/fusion/test.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error', define: { 'import.meta.env': '{}' } })
execFileSync('node', [out], { stdio: 'inherit' })
