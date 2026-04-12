import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

function read(path) {
  return fs.readFileSync(path, 'utf8')
}

test('EntityListTable exposes typed props contract', () => {
  const source = read('/home/hanson/enterprise-frontend-standards/packages/vue/src/components/shell/EntityListTable.vue')
  assert.match(source, /interface EntityListTableProps/)
  assert.match(source, /columns\?: any\[\]/)
  assert.match(source, /items\?: any\[\]/)
})

test('PermissionGuard exposes granted prop', () => {
  const source = read('/home/hanson/enterprise-frontend-standards/packages/vue/src/components/foundation/PermissionGuard.vue')
  assert.match(source, /granted\?: boolean/)
  assert.match(source, /slot name="fallback"/)
})
