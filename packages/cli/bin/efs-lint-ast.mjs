#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { parse as parseTemplate, NodeTypes } from '@vue/compiler-dom'
import { parse as parseScript } from '@babel/parser'
import { pageCatalog } from '../../contracts/src/index.mjs'

const root = process.argv[2]
if (!root) {
  console.error('Usage: node packages/cli/bin/efs-lint-ast.mjs <app-root>')
  process.exit(1)
}

const appRoot = path.resolve(root)
const srcPagesDir = path.join(appRoot, 'src/pages')
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

function visitJs(node, callback) {
  if (!node || typeof node !== 'object') return
  callback(node)
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => visitJs(item, callback))
    else if (value && typeof value === 'object') visitJs(value, callback)
  }
}

function extractPageType(scriptContent) {
  const ast = parseScript(scriptContent, { sourceType: 'module', plugins: ['typescript'] })
  let pageType = null
  visitJs(ast, (node) => {
    if (
      node.type === 'VariableDeclarator' &&
      node.id?.type === 'Identifier' &&
      node.id.name === 'pageType' &&
      node.init?.type === 'StringLiteral'
    ) {
      pageType = node.init.value
    }
  })
  return pageType
}

function walkTemplate(node, callback) {
  if (!node) return
  callback(node)
  if (Array.isArray(node.children)) node.children.forEach((child) => walkTemplate(child, callback))
  if (Array.isArray(node.branches)) node.branches.forEach((branch) => walkTemplate(branch, callback))
}

for (const file of walk(srcPagesDir)) {
  const source = fs.readFileSync(file, 'utf8')
  const { descriptor } = parseSfc(source)
  const scriptContent = `${descriptor.script?.content || ''}
${descriptor.scriptSetup?.content || ''}`
  const pageType = extractPageType(scriptContent)
  if (!pageType) {
    console.error(`✗ ${path.relative(process.cwd(), file)} AST: missing literal const pageType`) 
    failed += 1
    continue
  }
  if (!pageCatalog[pageType]) {
    console.error(`✗ ${path.relative(process.cwd(), file)} AST: unknown pageType=${pageType}`)
    failed += 1
  }

  const templateContent = descriptor.template?.content || ''
  const templateAst = parseTemplate(templateContent)
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
  console.error(`
AST lint failed with ${failed} violation(s).`)
  process.exit(1)
}

console.log('AST lint passed.')
