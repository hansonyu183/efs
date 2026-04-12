#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pageCatalog } from '../../contracts/src/index.mjs'

const root = process.argv[2]
if (!root) {
  console.error('Usage: node packages/cli/bin/efs-lint.mjs <app-root>')
  process.exit(1)
}

const appRoot = path.resolve(root)
const manifestDir = path.join(appRoot, 'enterprise-pages')
const srcPagesDir = path.join(appRoot, 'src/pages')
const forbiddenTagPatterns = [/<table[\s>]/i, /<input[\s>]/i, /<select[\s>]/i]
const allowedButtonPattern = /<button[^>]*data-efs-allow-raw-button/i

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

const manifestFiles = walk(manifestDir, (f) => f.endsWith('.json'))
const vueFiles = walk(srcPagesDir, (f) => f.endsWith('.vue'))
let failed = 0

for (const file of vueFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const pageTypeMatch = source.match(/const\s+pageType\s*=\s*['"]([^'"]+)['"]/)
  if (!pageTypeMatch) {
    console.error(`✗ ${path.relative(process.cwd(), file)} missing const pageType = '...'`)
    failed += 1
    continue
  }

  const pageType = pageTypeMatch[1]
  const spec = pageCatalog[pageType]
  if (!spec) {
    console.error(`✗ ${path.relative(process.cwd(), file)} unknown pageType=${pageType}`)
    failed += 1
    continue
  }

  const componentComment = source.match(/standard-components:\s*([^\n]+)/i)
  const components = componentComment
    ? componentComment[1]
        .replace(/-->.*/, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  for (const required of spec.requiredComponents) {
    if (!components.includes(required)) {
      console.error(`✗ ${path.relative(process.cwd(), file)} missing required standard component marker: ${required}`)
      failed += 1
    }
  }

  for (const pattern of forbiddenTagPatterns) {
    if (pattern.test(source)) {
      console.error(`✗ ${path.relative(process.cwd(), file)} contains forbidden raw primitive matching ${pattern}`)
      failed += 1
    }
  }

  if (/<button[\s>]/i.test(source) && !allowedButtonPattern.test(source)) {
    console.error(`✗ ${path.relative(process.cwd(), file)} contains raw <button>; use standard action components`)
    failed += 1
  }
}

if (manifestFiles.length === 0) {
  console.error('✗ no manifest files found under enterprise-pages/')
  failed += 1
}

if (vueFiles.length === 0) {
  console.error('✗ no Vue page files found under src/pages/')
  failed += 1
}

if (failed > 0) {
  console.error(`\nLint failed with ${failed} violation(s).`)
  process.exit(1)
}

console.log(`Lint passed for ${manifestFiles.length} manifest(s) and ${vueFiles.length} vue page(s).`)
