#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { parse as parseTemplate, NodeTypes } from '@vue/compiler-dom'

const root = process.argv[2]
if (!root) {
 console.error('Usage: node packages/cli/bin/efs-lint-ast.mjs <app-root>')
 process.exit(1)
}

const appRoot = path.resolve(root)
const schemaFile = path.join(appRoot, 'app.schema.ts')
const runtimeFile = path.join(appRoot, 'src', 'app-from-schema.ts')
const srcDir = path.join(appRoot, 'src')
let failed = 0

function walk(dir) {
 if (!fs.existsSync(dir)) return []
 const entries = fs.readdirSync(dir, { withFileTypes: true })
 const found = []
 for (const entry of entries) {
  const abs = path.join(dir, entry.name)
  if (entry.isDirectory()) found.push(...walk(abs))
  else if (entry.isFile() && abs.endsWith('.vue')) found.push(abs)
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
 console.error('✗ AST: missing app.schema.ts')
 failed += 1
} else {
 const source = fs.readFileSync(schemaFile, 'utf8')
 if (!/defineAppSchema\(/.test(source)) {
  console.error('✗ AST: app.schema.ts missing defineAppSchema(...)')
  failed += 1
 }
}

if (!fs.existsSync(runtimeFile)) {
 console.error('✗ AST: missing src/app-from-schema.ts')
 failed += 1
} else {
 const source = fs.readFileSync(runtimeFile, 'utf8')
 if (!/adaptAppSchemaToVueController/.test(source)) {
  console.error('✗ AST: src/app-from-schema.ts missing adaptAppSchemaToVueController(...)')
  failed += 1
 }
}

for (const file of walk(srcDir)) {
 const source = fs.readFileSync(file, 'utf8')
 const { descriptor } = parseSfc(source)
 const templateAst = parseTemplate(descriptor.template?.content || '')
 walkTemplate(templateAst, (node) => {
  if (node.type === NodeTypes.ELEMENT && ['table', 'input', 'select'].includes(node.tag)) {
   console.error(`✗ ${path.relative(process.cwd(), file)} AST: forbidden raw tag <${node.tag}>`)
   failed += 1
  }
  if (node.type === NodeTypes.ELEMENT && node.tag === 'button') {
   const hasAllowance = Array.isArray(node.props) && node.props.some((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === 'data-efs-allow-raw-button')
   if (!hasAllowance) {
    console.error(`✗ ${path.relative(process.cwd(), file)} AST: forbidden raw <button> without data-efs-allow-raw-button`)
    failed += 1
   }
  }
 })
}

if (failed > 0) {
 console.error(`\nAST lint failed with ${failed} violation(s).`)
 process.exit(1)
}
console.log('AST lint passed.')
