import test from 'node:test'
import assert from 'node:assert/strict'

import { createRuntimeFromSchema } from '../packages/schema/dist/adapter/platform-runtime.js'

const schema = {
 schemaVersion: 'v1',
 app: {
  id: 'demo',
  name: 'demo',
  title: 'Demo',
  defaultDomain: 'crm',
  defaultRes: 'customer',
 },
 domains: [
  {
   key: 'crm',
   title: '客户中心',
   resources: [
    {
     key: 'customer',
     title: '客户管理',
     fields: [
      { key: 'id', title: '客户编号', type: 'string', identity: 'id', readonly: true },
      { key: 'name', title: '客户名称', type: 'string', identity: 'title', required: true },
      { key: 'status', title: '状态', type: 'enum', options: [{ key: 'active', value: 'active' }] },
     ],
     operations: {
      list: { path: '/api/customers', method: 'GET' },
      create: { path: '/api/customers', method: 'POST' },
      update: { path: '/api/customers/:id', method: 'PUT' },
      remove: { path: '/api/customers/:id', method: 'DELETE' },
      export: { path: '/api/customers/export', method: 'POST' },
     },
    },
   ],
  },
  {
   key: 'bi',
   title: '经营分析',
   resources: [
    {
     key: 'customer-report',
     title: '客户分析',
     fields: [
      { key: 'month', title: '月份', type: 'string' },
      { key: 'revenue', title: '营收', type: 'number' },
     ],
     operations: {
      query: { path: '/api/reports/customers', method: 'GET' },
      export: { path: '/api/reports/customers/export', method: 'POST' },
     },
    },
   ],
  },
 ],
 ui: {
  domains: {
   crm: {
    resources: {
     customer: {
      actions: {
       export: { api: 'export', placement: 'page', label: '导出客户' },
      },
     },
    },
   },
   bi: {
    resources: {
     'customer-report': {
      actions: {
       export: { api: 'export', placement: 'page', label: '导出报表' },
      },
     },
    },
   },
  },
 }
}

test('createRuntimeFromSchema builds controller tree and delegates CRUD/report handlers', async () => {
 const calls = []
 const app = createRuntimeFromSchema({
  schema,
  auth: {
   async login(input) {
    calls.push(['login', input])
    return { accessToken: 'demo-token', expiresAt: '2099-01-01T00:00:00.000Z' }
   },
   async logout() {
    calls.push(['logout'])
   },
   async getOrgs() {
    return [{ key: 'demo', value: 'demo', title: 'Demo' }]
   },
   getCurrentOrgCode() {
    return 'demo'
   },
  },
  resources: {
   'crm/customer': {
    async list(params) {
     calls.push(['list', params])
     return { items: [{ id: 'C-001', name: '杭州云启', status: 'active' }], total: 1, activeItem: { id: 'C-001' } }
    },
    async create(params) {
     calls.push(['create', params])
     return { refresh: true, close: true }
    },
    async update(params) {
     calls.push(['update', params])
     return { refresh: true }
    },
    async remove(params) {
     calls.push(['remove', params])
     return { refresh: true }
    },
    async export(params) {
     calls.push(['export', params])
    },
   },
   'bi/customer-report': {
    async query(params) {
     calls.push(['query', params])
     return { items: [{ month: '2026-01', revenue: 100 }], total: 1, summary: [{ key: 'revenue', value: '100' }] }
    },
    async export(params) {
     calls.push(['report-export', params])
    },
   },
  },
 })

 assert.equal(app.kind, 'app')
 assert.equal(app.main.defaultPath, 'crm/customer')
 assert.equal(app.main.domains.length, 2)

 const customer = app.main.domains[0].items[0]
 assert.equal(customer.runtimeKind, 'crud')
 assert.equal(customer.fields[0].identity, 'primary')
 assert.deepEqual(customer.actions.page.map((item) => item.key), ['create', 'export', 'refresh'])
 assert.deepEqual(customer.actions.row.map((item) => item.key), ['update', 'remove'])

 const listResult = await customer.query({ queryValues: {}, page: 1, pageSize: 10 })
 assert.equal(listResult.total, 1)
 await customer.save({ mode: 'create', item: { name: '新客户' }, queryValues: {}, page: 1, pageSize: 10 })
 await customer.save({ mode: 'edit', item: { id: 'C-001', name: '杭州云启' }, queryValues: {}, page: 1, pageSize: 10 })
 await customer.remove({ id: 'C-001' })
 await customer.actions.custom.export({ key: 'export', scope: 'page', selectedRowKeys: [], selectedCount: 0, queryValues: {}, activeItem: null })

 const report = app.main.domains[1].items[0]
 assert.equal(report.runtimeKind, 'report')
 assert.deepEqual(report.actions.report.map((item) => item.key), [])
 await report.query({ queryValues: {}, page: 1, pageSize: 10 })
 await report.export({ queryValues: {}, page: 1, pageSize: 10, items: [], total: 0, summary: [] })

 await app.auth.login({ name: 'demo', pwd: 'demo', orgCode: 'demo' })

 assert.deepEqual(calls.map((entry) => entry[0]), ['list', 'create', 'update', 'remove', 'export', 'query', 'report-export', 'login'])
})

test('createRuntimeFromSchema maps delete operation aliases onto CRUD remove handler', async () => {
 const calls = []
 const deleteSchema = {
  schemaVersion: 'v1',
  app: { key: 'demo', title: 'Demo' },
  auth: { login: { path: '/login', method: 'POST' } },
  domains: [
   {
    key: 'admin',
    title: 'Admin',
    resources: [
     {
      key: 'user',
      title: '用户',
      fields: [{ key: 'id', title: 'ID', type: 'number', identity: 'id' }],
      operations: {
       query: { path: '/admin/user/query', method: 'POST' },
       delete: { path: '/admin/user/delete', method: 'POST' },
      },
     },
    ],
   },
  ],
  ui: {
   defaultPath: 'admin/user',
   domains: {
    admin: {
     resources: {
      user: {
       view: { mode: 'crud' },
       actions: {
        delete: { api: 'delete', placement: 'row', label: '删除' },
       },
      },
     },
    },
   },
  },
 }

 const app = createRuntimeFromSchema({
  schema: deleteSchema,
  auth: { async login() { return { accessToken: 'demo' } } },
  resources: {
   'admin/user': {
    async query() {
     return { items: [{ id: 1 }], total: 1 }
    },
    async delete(params) {
      calls.push(['delete', params])
      return { refresh: true }
    },
   },
  },
 })

 const user = app.main.domains[0].items[0]
 assert.deepEqual(user.actions.row.map((item) => item.key), ['remove'])
 await user.remove({ id: 1 })
 assert.deepEqual(calls.map((entry) => entry[0]), ['delete'])
})

test('createRuntimeFromSchema normalizes array query results into list metadata', async () => {
 const app = createRuntimeFromSchema({
  schema: {
   schemaVersion: 'v1',
   app: { key: 'demo', name: 'demo', title: 'Demo' },
   auth: { login: { path: '/login', method: 'POST' } },
   domains: [{
    key: 'crm',
    title: 'CRM',
    resources: [{
     key: 'customer',
     title: '客户',
     fields: [{ key: 'id', title: 'ID', type: 'string', identity: 'id' }],
     operations: { list: { path: '/customers', method: 'GET' } },
    }],
   }],
  },
  auth: { async login() { return { accessToken: 'demo' } } },
  resources: {
   'crm/customer': {
    async list() {
     return [{ id: 'C-001' }, { id: 'C-002' }]
    },
   },
  },
 })

 const customer = app.main.domains[0].items[0]
 const result = await customer.query({ queryValues: {}, page: 1, pageSize: 10 })
 assert.deepEqual(result.items, [{ id: 'C-001' }, { id: 'C-002' }])
 assert.equal(result.total, 2)
 assert.equal(result.activeItem, undefined)
})
