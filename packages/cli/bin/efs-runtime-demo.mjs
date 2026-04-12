#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { renderDynamicPage } from '../../vue/src/runtime/DynamicPageRenderer.mjs'

const manifestPath = process.argv[2]
if (!manifestPath) {
  console.error('Usage: node packages/cli/bin/efs-runtime-demo.mjs <manifest.json>')
  process.exit(1)
}

const resolved = path.resolve(manifestPath)
const manifest = JSON.parse(fs.readFileSync(resolved, 'utf8'))
const metadata = {
  table: {
    title: 'Runtime Table',
    columns: [
      { key: 'code', label: '编码' },
      { key: 'name', label: '名称' }
    ]
  },
  form: {
    title: 'Runtime Form',
    fields: [
      { key: 'code', label: '编码', required: true },
      { key: 'name', label: '名称' }
    ]
  },
  actions: [
    { id: 'query', label: '查询', tone: 'primary' },
    { id: 'export', label: '导出', tone: 'secondary' }
  ]
}
const rendered = renderDynamicPage(manifest, metadata)
console.log(JSON.stringify(rendered, null, 2))
