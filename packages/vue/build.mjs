#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(packageRoot, 'src')
const distDir = path.join(packageRoot, 'dist')

function copyVueFiles(fromDir, toDir) {
 for (const entry of fs.readdirSync(fromDir, { withFileTypes: true })) {
  const srcPath = path.join(fromDir, entry.name)
  const destPath = path.join(toDir, entry.name)
  if (entry.isDirectory()) {
   fs.mkdirSync(destPath, { recursive: true })
   copyVueFiles(srcPath, destPath)
   continue
  }
  if (entry.isFile() && entry.name.endsWith('.vue')) {
   fs.mkdirSync(path.dirname(destPath), { recursive: true })
   fs.copyFileSync(srcPath, destPath)
  }
 }
}

fs.rmSync(distDir, { recursive: true, force: true })
fs.mkdirSync(distDir, { recursive: true })
copyVueFiles(srcDir, distDir)

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
