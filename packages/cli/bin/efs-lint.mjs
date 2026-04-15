#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.argv[2]
if (!root) {
 console.error('Usage: node packages/cli/bin/efs-lint.mjs <app-root>')
 process.exit(1)
}

const appRoot = path.resolve(root)
const userAppsDir = path.join(appRoot, 'user-apps')
const mainFile = path.join(appRoot, 'src', 'main.ts')
const vueRoot = path.join(appRoot, 'src')
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

const schemaFiles = walk(userAppsDir, (f) => f.endsWith(path.join('', 'app.schema.ts')))
const vueFiles = walk(vueRoot, (f) => f.endsWith('.vue'))
let failed = 0

if (schemaFiles.length === 0) {
 console.error('✗ no app.schema.ts found under user-apps/<app-name>/')
 failed += 1
}

for (const file of schemaFiles) {
 const source = fs.readFileSync(file, 'utf8')
 if (!/from '@efs\/schema'/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), file)} must import from @efs/schema`)
  failed += 1
 }
 if (!/defineAppSchema\(/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), file)} must call defineAppSchema(...)`)
  failed += 1
 }
}

if (!fs.existsSync(mainFile)) {
 console.error('✗ missing src/main.ts')
 failed += 1
} else {
 const source = fs.readFileSync(mainFile, 'utf8')
 if (!/createPlatformAppFromSchema/.test(source)) {
  console.error('✗ src/main.ts must use createPlatformAppFromSchema(...)')
  failed += 1
 }
 if (!/createApp\(EfsApp/.test(source)) {
  console.error('✗ src/main.ts must mount EfsApp directly')
  failed += 1
 }
 }

for (const file of vueFiles) {
 const source = fs.readFileSync(file, 'utf8')
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

if (failed > 0) {
 console.error(`\nLint failed with ${failed} violation(s).`)
 process.exit(1)
}
console.log(`Lint passed for schema platform app at ${appRoot}.`)
