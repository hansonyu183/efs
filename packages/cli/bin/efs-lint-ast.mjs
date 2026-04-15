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
 console.error('✗ AST: missing schemas/app.schema.ts')
 failed += 1
} else {
 const source = fs.readFileSync(schemaFile, 'utf8')
 if (!/defineAppSchema\(/.test(source)) {
  console.error(`✗ AST: ${path.relative(process.cwd(), schemaFile)} missing defineAppSchema(...)`)
  failed += 1
 }
}

if (!fs.existsSync(mainFile)) {
 console.error('✗ AST: missing src/main.ts')
 failed += 1
} else {
 const source = fs.readFileSync(mainFile, 'utf8')
 if (!/createPlatformEfsAppPropsFromSchema/.test(source)) {
  console.error('✗ AST: src/main.ts missing createPlatformEfsAppPropsFromSchema(...)')
  failed += 1
 }
}

for (const file of walk(vueRoot, (f) => f.endsWith('.vue'))) {
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
