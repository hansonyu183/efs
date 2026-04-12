import test from 'node:test'
import assert from 'node:assert/strict'
import { renderDynamicPage, DynamicPageRenderer } from '../packages/vue/src/runtime/DynamicPageRenderer.mjs'
import { MetadataFormRenderer } from '../packages/vue/src/runtime/MetadataFormRenderer.mjs'
import { MetadataTableRenderer } from '../packages/vue/src/runtime/MetadataTableRenderer.mjs'
import { ActionRenderer } from '../packages/vue/src/runtime/ActionRenderer.mjs'
import { buildSidebarMenuTree } from '../packages/vue/src/runtime/NavigationMenu.mjs'
import { resolveSemanticIcon, semanticIconMap } from '../packages/vue/src/runtime/SemanticIcons.mjs'

test('renderDynamicPage builds standard shell plan for runtime metadata page', () => {
  const rendered = renderDynamicPage(
    { pageType: 'runtime-metadata-page', domain: 'sales', resource: 'order' },
    {
      table: { columns: [{ key: 'code', label: '编码' }] },
      form: { fields: [{ key: 'code', label: '编码', required: true }] },
      actions: [{ id: 'query', label: '查询' }],
      permissions: ['sales.order.query'],
      theme: 'dark',
      locale: 'zh-CN',
      orgId: 'org-001'
    }
  )

  assert.equal(rendered.pageType, 'runtime-metadata-page')
  assert.equal(rendered.layoutPlan.root, 'MainLayout')
  assert.ok(rendered.shellPlan.includes('DynamicPageRenderer'))
  assert.equal(rendered.shell.component, 'DynamicPageRenderer')
  assert.equal(rendered.table.schema.columns[0].key, 'code')
  assert.equal(rendered.form.schema.fields[0].required, true)
  assert.equal(rendered.actions.actions[0].id, 'query')
  assert.equal(rendered.permissions[0], 'sales.order.query')
  assert.equal(rendered.runtimeContext.theme, 'dark')
  assert.equal(rendered.pageKey, 'sales/order/runtime-metadata-page')
})

test('renderDynamicPage resolves shorthand list/form/detail/report page types to standard shells', () => {
  const listPage = renderDynamicPage(
    { pageType: 'list', name: '客户列表', domain: 'crm', resource: 'customer' },
    {
      query: { fields: [{ key: 'keyword', label: '关键词' }] },
      table: { title: '客户', columns: [{ key: 'name', label: '名称' }], total: 12, pageCount: 3 }
    }
  )
  const formPage = renderDynamicPage(
    { pageType: 'form', name: '客户编辑', domain: 'crm', resource: 'customer' },
    {
      form: { fields: [{ key: 'name', label: '名称', required: true }] },
      actions: [{ id: 'save', label: '保存' }]
    }
  )
  const detailPage = renderDynamicPage(
    { pageType: 'detail', name: '客户详情', domain: 'crm', resource: 'customer' },
    {
      detail: { fields: [{ key: 'name', label: '名称', value: 'ACME' }] },
      actions: [{ id: 'edit', label: '编辑' }]
    }
  )
  const reportPage = renderDynamicPage(
    { pageType: 'report', name: '客户报表', domain: 'crm', resource: 'customer' },
    {
      report: { title: '客户报表', exportable: true, resultCountText: '12 rows' },
      query: { fields: [{ key: 'month', label: '月份' }] },
      table: { columns: [{ key: 'amount', label: '金额' }] }
    }
  )

  assert.equal(listPage.pageType, 'query-list')
  assert.equal(listPage.shell.component, 'EntityListTable')
  assert.equal(listPage.shell.toolbarComponent, 'QueryToolbarShell')
  assert.equal(listPage.table.schema.columns[0].label, '名称')

  assert.equal(formPage.pageType, 'form-page')
  assert.equal(formPage.shell.component, 'FormShell')
  assert.equal(formPage.form.schema.fields[0].required, true)
  assert.equal(formPage.actions.actions[0].id, 'save')

  assert.equal(detailPage.pageType, 'readonly-detail')
  assert.equal(detailPage.shell.component, 'DetailShell')
  assert.equal(detailPage.detail.fields[0].value, 'ACME')

  assert.equal(reportPage.pageType, 'report-page')
  assert.equal(reportPage.shell.component, 'ReportShell')
  assert.equal(reportPage.resultTable.schema.columns[0].key, 'amount')
  assert.equal(reportPage.shell.props.exportable, true)
})

test('DynamicPageRenderer wraps renderDynamicPage with standard runtime strategy', () => {
  const rendered = DynamicPageRenderer('form', {
    name: '客户编辑',
    pageType: 'form',
    domain: 'crm',
    resource: 'customer'
  }, {
    form: { fields: [{ key: 'name', label: '名称' }] }
  })

  assert.equal(rendered.strategy, 'standard-shell-runtime-renderer')
  assert.equal(rendered.rendered.pageType, 'form-page')
  assert.equal(rendered.rendered.shell.component, 'FormShell')
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
