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
const manifestDir = path.join(appRoot, 'enterprise-pages')
const pagesDir = path.join(appRoot, 'src/pages')
const exceptionsPath = path.join(appRoot, 'governance', 'exceptions.json')
let failed = 0

function walk(dir, matcher) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(abs, matcher))
    else if (matcher(abs)) files.push(abs)
  }
  return files
}

const manifestFiles = walk(manifestDir, (f) => f.endsWith('.json'))
const pageFiles = walk(pagesDir, (f) => f.endsWith('.vue'))
const exceptions = fs.existsSync(exceptionsPath)
  ? JSON.parse(fs.readFileSync(exceptionsPath, 'utf8')).exceptions || []
  : []
const exceptionIds = new Set(exceptions.map((item) => item.id))

function pageBaseName(name) {
  return name.replace(/\.page\.json$/, '').replace(/-([a-z])/g, (_, s) => s.toUpperCase())
}

for (const manifestFile of manifestFiles) {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  const expectedName = `${pageBaseName(path.basename(manifestFile))}Page.vue`
  const exists = pageFiles.some((file) => path.basename(file) === expectedName)
  if (!exists) {
    console.error(`✗ ${path.relative(process.cwd(), manifestFile)} missing matching Vue page ${expectedName}`)
    failed += 1
  }

  if (manifest.exception) {
    if (!exceptionIds.has(manifest.id)) {
      console.error(`✗ ${manifest.id} declares exception but governance/exceptions.json does not whitelist it`)
      failed += 1
    }
  }
}

const today = new Date().toISOString().slice(0, 10)
for (const item of exceptions) {
  if (!item.id || !item.reason || !item.owner || !item.expiresAt) {
    console.error('✗ every governance exception must include id/reason/owner/expiresAt')
    failed += 1
    continue
  }
  if (item.expiresAt < today) {
    console.error(`✗ governance exception expired: ${item.id} -> ${item.expiresAt}`)
    failed += 1
  }
}

if (failed > 0) {
  console.error(`
Governance check failed with ${failed} violation(s).`)
  process.exit(1)
}

console.log(`Governance check passed for ${manifestFiles.length} manifest(s), ${pageFiles.length} page(s), ${exceptions.length} exception(s).`)
