#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { validatePageDefinition } from '../../contracts/src/index.mjs'

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const resolved = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(resolved))
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(resolved)
  }
  return files
}

const target = process.argv[2]
if (!target) {
  console.error('Usage: node packages/cli/bin/efs-check.mjs <page-manifest-dir>')
  process.exit(1)
}

const files = walk(path.resolve(target))
if (files.length === 0) {
  console.error('No page manifest JSON files found.')
  process.exit(1)
}

let failed = 0
for (const file of files) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  const result = validatePageDefinition(json)
  if (!result.valid) {
    failed += 1
    console.error(`\n✗ ${path.relative(process.cwd(), file)}`)
    for (const error of result.errors) console.error(`  - ${error}`)
  } else {
    console.log(`✓ ${path.relative(process.cwd(), file)}`)
  }
}

if (failed > 0) {
  console.error(`\nContract check failed: ${failed} file(s) invalid.`)
  process.exit(1)
}

console.log(`\nContract check passed: ${files.length} page manifest(s) valid.`)
