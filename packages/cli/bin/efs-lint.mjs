#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { parse as parseTemplate, NodeTypes } from '@vue/compiler-dom'

const root = process.argv[2]
if (!root) {
 console.error('Usage: node packages/cli/bin/efs-lint.mjs <app-root>')
 process.exit(1)
}

const appRoot = path.resolve(root)
const appDirName = path.basename(appRoot)
const schemasDir = path.join(appRoot, 'schemas')
const schemaFile = path.join(schemasDir, 'app.schema.ts')
const mainFile = path.join(appRoot, 'src', 'main.ts')
const vueRoot = path.join(appRoot, 'src')
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

function walkTemplate(node, callback) {
 if (!node) return
 callback(node)
 if (Array.isArray(node.children)) node.children.forEach((child) => walkTemplate(child, callback))
 if (Array.isArray(node.branches)) node.branches.forEach((branch) => walkTemplate(branch, callback))
}

if (!fs.existsSync(schemaFile)) {
 console.error('✗ missing schemas/app.schema.ts')
 failed += 1
} else {
 const source = fs.readFileSync(schemaFile, 'utf8')
 const appNameMatch = source.match(/name:\s*['"]([^'"]+)['"]/) || source.match(/name:\s*`([^`]+)`/)
 if (!/from '@efs\/schema'/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), schemaFile)} must import from @efs/schema`)
  failed += 1
 }
 if (!/defineAppSchema\(/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), schemaFile)} must call defineAppSchema(...)`)
  failed += 1
 }
 if (!/schemaVersion:\s*['"]v1['"]/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), schemaFile)} must declare schemaVersion: 'v1'`)
  failed += 1
 }
 if (!/services:\s*\{/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), schemaFile)} must declare services`)
  failed += 1
 }
 if (!/operations:\s*\{/.test(source)) {
  console.error(`✗ ${path.relative(process.cwd(), schemaFile)} must declare resource operations`)
  failed += 1
 }
 if (!appNameMatch || appNameMatch[1] !== appDirName) {
  console.error(`✗ ${path.relative(process.cwd(), schemaFile)} must live under apps/<app-name>/schemas/ where app.name matches the app directory name`)
  failed += 1
 }
}

if (!fs.existsSync(mainFile)) {
 console.error('✗ missing src/main.ts')
 failed += 1
} else {
 const source = fs.readFileSync(mainFile, 'utf8')
 if (!/createAppPropsFromSchema/.test(source)) {
  console.error('✗ src/main.ts must derive EfsApp props from schema via createAppPropsFromSchema(...)')
  failed += 1
 }
 if (!/createApp\(EfsApp/.test(source)) {
  console.error('✗ src/main.ts must mount EfsApp directly without a user-authored root component')
  failed += 1
 }
}

for (const file of walk(vueRoot, (f) => f.endsWith('.vue'))) {
 const source = fs.readFileSync(file, 'utf8')
 const { descriptor } = parseSfc(source)
 const templateAst = parseTemplate(descriptor.template?.content || '')
 walkTemplate(templateAst, (node) => {
  if (node.type === NodeTypes.ELEMENT && ['table', 'input', 'select'].includes(node.tag)) {
   console.error(`✗ ${path.relative(process.cwd(), file)} contains forbidden raw tag <${node.tag}>`)
   failed += 1
  }
  if (node.type === NodeTypes.ELEMENT && node.tag === 'button') {
   const hasAllowance = Array.isArray(node.props) && node.props.some((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === 'data-efs-allow-raw-button')
   if (!hasAllowance) {
    console.error(`✗ ${path.relative(process.cwd(), file)} contains forbidden raw <button> without data-efs-allow-raw-button`)
    failed += 1
   }
  }
 })
}

if (failed > 0) {
 console.error(`\nLint failed with ${failed} violation(s).`)
 process.exit(1)
}

console.log(`Lint passed for schema platform app at ${appRoot}.`)
