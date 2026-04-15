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
const schemaFile = path.join(appRoot, 'app.schema.ts')
const runtimeFile = path.join(appRoot, 'src', 'app-from-schema.ts')
const demoRootFile = path.join(appRoot, 'src', 'DemoRoot.vue')
let failed = 0

if (!fs.existsSync(schemaFile)) {
 console.error('✗ missing app.schema.ts')
 failed += 1
}
if (!fs.existsSync(runtimeFile)) {
 console.error('✗ missing src/app-from-schema.ts')
 failed += 1
}
if (!fs.existsSync(demoRootFile)) {
 console.error('✗ missing src/DemoRoot.vue')
 failed += 1
}

if (fs.existsSync(schemaFile)) {
 const source = fs.readFileSync(schemaFile, 'utf8')
 if (!/schemaVersion:\s*['"]v1['"]/.test(source)) {
  console.error('✗ app.schema.ts must declare schemaVersion: "v1"')
  failed += 1
 }
 if (!/domains:\s*\[/.test(source)) {
  console.error('✗ app.schema.ts must declare domains')
  failed += 1
 }
 if (!/resources:\s*\[/.test(source)) {
  console.error('✗ app.schema.ts must declare resources')
  failed += 1
 }
 if (!/operations:\s*\{/.test(source)) {
  console.error('✗ app.schema.ts must declare resource operations')
  failed += 1
 }
}

if (fs.existsSync(runtimeFile)) {
 const source = fs.readFileSync(runtimeFile, 'utf8')
 if (!/adaptAppSchemaToVueController/.test(source)) {
  console.error('✗ src/app-from-schema.ts must adapt schema into runtime input')
  failed += 1
 }
 if (/from '@efs\/vue\/controller'/.test(source)) {
  console.error('✗ src/app-from-schema.ts must not import from @efs/vue/controller')
  failed += 1
 }
}

if (fs.existsSync(demoRootFile)) {
 const source = fs.readFileSync(demoRootFile, 'utf8')
 if (!/\.\/app-from-schema/.test(source)) {
  console.error('✗ src/DemoRoot.vue must load ./app-from-schema')
  failed += 1
 }
}

if (failed > 0) {
 console.error(`\nGovernance check failed with ${failed} violation(s).`)
 process.exit(1)
}

console.log('Governance check passed for schema-first app fixture.')
