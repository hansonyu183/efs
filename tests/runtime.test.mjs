import test from 'node:test'
import assert from 'node:assert/strict'
import { renderDynamicPage } from '../packages/vue/src/runtime/DynamicPageRenderer.mjs'
import { MetadataFormRenderer } from '../packages/vue/src/runtime/MetadataFormRenderer.mjs'
import { MetadataTableRenderer } from '../packages/vue/src/runtime/MetadataTableRenderer.mjs'
import { ActionRenderer } from '../packages/vue/src/runtime/ActionRenderer.mjs'
import { buildSidebarMenuTree } from '../packages/vue/src/runtime/NavigationMenu.mjs'
import { resolveSemanticIcon, semanticIconMap } from '../packages/vue/src/runtime/SemanticIcons.mjs'

test('renderDynamicPage builds standard shell plan for runtime metadata page', () => {
  const rendered = renderDynamicPage(
    { pageType: 'runtime-metadata-page' },
    {
      table: { columns: [{ key: 'code', label: '编码' }] },
      form: { fields: [{ key: 'code', label: '编码', required: true }] },
      actions: [{ id: 'query', label: '查询' }]
    }
  )

  assert.equal(rendered.pageType, 'runtime-metadata-page')
  assert.ok(rendered.shellPlan.includes('DynamicPageRenderer'))
  assert.equal(rendered.table.schema.columns[0].key, 'code')
  assert.equal(rendered.form.schema.fields[0].required, true)
  assert.equal(rendered.actions.actions[0].id, 'query')
})

test('metadata renderers normalize fields and columns', () => {
  const form = MetadataFormRenderer({ fields: [{ key: 'name' }] })
  const table = MetadataTableRenderer({ columns: [{ key: 'name' }] })
  const actions = ActionRenderer([{ label: '保存' }])

  assert.equal(form.schema.fields[0].widget, 'text')
  assert.equal(table.schema.columns[0].formatter, 'text')
  assert.equal(actions.actions[0].label, '保存')
})

test('buildSidebarMenuTree sorts by order, groups children, and removes empty groups', () => {
  const tree = buildSidebarMenuTree([
    { key: 'customer', title: '客户', path: '/crm/customers', icon: 'users', order: 220, parentKey: 'crm', type: 'item' },
    { key: 'workbench', title: '工作台', path: '/workbench', icon: 'home', order: 10, parentKey: null, type: 'item' },
    { key: 'crm', title: '客户管理', icon: 'users', order: 20, parentKey: null, type: 'group' },
    { key: 'hidden-group', title: '隐藏', icon: 'folder', order: 30, parentKey: null, type: 'group', visible: false },
    { key: 'disabled-item', title: '禁用', path: '/disabled', icon: 'ban', order: 230, parentKey: 'crm', type: 'item', disabled: true },
  ])

  assert.equal(tree[0].key, 'workbench')
  assert.equal(tree[1].key, 'crm')
  assert.equal(tree[1].children[0].key, 'customer')
  assert.equal(tree[1].children[1].key, 'disabled-item')
  assert.equal(tree.some((item) => item.key === 'hidden-group'), false)
})

test('buildSidebarMenuTree drops invalid items and orphan nodes', () => {
  const tree = buildSidebarMenuTree([
    { key: '', title: '坏节点', path: '/bad', order: 10, parentKey: null, type: 'item' },
    { key: 'missing-order', title: '坏节点2', path: '/bad2', parentKey: null, type: 'item' },
    { key: 'orphan-child', title: '孤儿', path: '/orphan', order: 20, parentKey: 'missing-parent', type: 'item' },
    { key: 'valid', title: '正常', path: '/ok', order: 30, parentKey: null, type: 'item' },
  ])

  assert.deepEqual(tree.map((item) => item.key), ['valid'])
})

test('semanticIconMap exposes stable semantic keys and resolver fallback', () => {
  assert.equal(semanticIconMap.home, '⌂')
  assert.equal(semanticIconMap.users, '◪')
  assert.equal(semanticIconMap.menu, '☰')
  assert.equal(semanticIconMap.send, '➜')
  assert.equal(resolveSemanticIcon('unknown-key'), '•')
})
