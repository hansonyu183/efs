#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.argv[2]
if (!root) {
 console.error('Usage: node packages/cli/bin/efs-governance.mjs <app-root>')
 process.exit(1)
}

const appRoot = path.resolve(root)
const userAppsDir = path.join(appRoot, 'schemas')
const mainFile = path.join(appRoot, 'src', 'main.ts')
let failed = 0

function walk(dir, matcher) {
 if (!fs.existsSync(dir)) return []
 const entries = fs.readdirSync(dir, { withFileTypes: true })
 const found = []
 for (const entry of entries) {
  const abs = path.join(dir, entry.name)
  if (entry.isDirectory()) found.push(...walk(abs, matcher))
  else if (matcher(abs)) found.push(abs)
 }
 return found
}

const schemaFiles = walk(userAppsDir, (f) => f.endsWith(path.join('', 'app.schema.ts')))
if (schemaFiles.length === 0) {
 console.error('✗ missing schemas/<app-name>/app.schema.ts')
 failed += 1
}

for (const file of schemaFiles) {
 const source = fs.readFileSync(file, 'utf8')
 const appDirName = path.basename(path.dirname(file))
 const appNameMatch = source.match(/name:\s*['"]([^'"]+)['"]/) || source.match(/name:\s*`([^`]+)`/)
 const schemaVersionMatch = source.match(/schemaVersion:\s*['"]v1['"]/) 
 if (!schemaVersionMatch) {
  console.error(`✗ ${path.relative(process.cwd(), file)} must declare schemaVersion: 'v1'`)
  failed += 1
 }
 if (!/services:\s*\{/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), file)} must declare services`) 
  failed += 1
 }
 if (!/operations:\s*\{/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), file)} must declare resource operations`)
  failed += 1
 }
 if (!appNameMatch || appNameMatch[1] !== appDirName) {
  console.error(`✗ ${path.relative(process.cwd(), file)} must live under schemas/<app-name>/ where dir name matches app.name`)
  failed += 1
 }
}

if (!fs.existsSync(mainFile)) {
 console.error('✗ missing src/main.ts')
 failed += 1
} else {
 const source = fs.readFileSync(mainFile, 'utf8')
 if (!/createPlatformAppFromSchema/.test(source)) {
  console.error('✗ src/main.ts must build the platform app from schema')
  failed += 1
 }
 if (!/createApp\(EfsApp/.test(source)) {
  console.error('✗ src/main.ts must mount EfsApp directly without a user-authored root component')
  failed += 1
 }
}

if (failed > 0) {
 console.error(`\nGovernance check failed with ${failed} violation(s).`)
 process.exit(1)
}

console.log('Governance check passed for schema-first service-platform app fixture.')
