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
const schemaFile = path.join(appRoot, 'app.schema.ts')
const runtimeFile = path.join(appRoot, 'src', 'app-from-schema.ts')
const vueRoot = path.join(appRoot, 'src')
const forbiddenTagPatterns = [/<table[\s>]/i, /<input[\s>]/i, /<select[\s>]/i]
const allowedButtonPattern = /<button[^>]*data-efs-allow-raw-button/i

function walkVue(dir) {
 if (!fs.existsSync(dir)) return []
 const entries = fs.readdirSync(dir, { withFileTypes: true })
 const found = []
 for (const entry of entries) {
  const abs = path.join(dir, entry.name)
  if (entry.isDirectory()) found.push(...walkVue(abs))
  else if (entry.isFile() && abs.endsWith('.vue')) found.push(abs)
 }
 return found
}

let failed = 0
if (!fs.existsSync(schemaFile)) {
 console.error('✗ missing app.schema.ts')
 failed += 1
} else {
 const source = fs.readFileSync(schemaFile, 'utf8')
 if (!/from '@efs\/schema'/.test(source)) {
  console.error('✗ app.schema.ts must import from @efs/schema')
  failed += 1
 }
 if (!/defineAppSchema\(/.test(source)) {
  console.error('✗ app.schema.ts must call defineAppSchema(...)')
  failed += 1
 }
}

if (!fs.existsSync(runtimeFile)) {
 console.error('✗ missing src/app-from-schema.ts')
 failed += 1
} else {
 const source = fs.readFileSync(runtimeFile, 'utf8')
 if (!/adaptAppSchemaToVueController/.test(source)) {
  console.error('✗ src/app-from-schema.ts must use adaptAppSchemaToVueController(...)')
  failed += 1
 }
}

const vueFiles = walkVue(vueRoot)
if (vueFiles.length === 0) {
 console.error('✗ no Vue files found under src/')
 failed += 1
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
console.log(`Lint passed for schema app at ${appRoot}.`)
