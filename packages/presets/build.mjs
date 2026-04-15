#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(packageRoot, 'dist')

fs.rmSync(distDir, { recursive: true, force: true })
fs.mkdirSync(distDir, { recursive: true })

const tsc = spawnSync(
 process.execPath,
 [
  path.join(packageRoot, '..', '..', 'node_modules', 'typescript', 'bin', 'tsc'),
  '--project',
  path.join(packageRoot, 'tsconfig.build.json'),
 ],
 { cwd: packageRoot, stdio: 'inherit' },
)

if (tsc.status !== 0) {
 process.exit(tsc.status ?? 1)
}
