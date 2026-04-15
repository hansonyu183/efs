import test from 'node:test'
import assert from 'node:assert/strict'

import { inferResourceRuntime } from '../packages/schema/dist/inference/resource-runtime.js'

test('inferResourceRuntime infers crud mode and default operation actions from resource operations', () => {
 const runtime = inferResourceRuntime({
  key: 'customer',
  title: '客户管理',
  operations: {
   query: { path: '/api/customers', method: 'GET' },
   create: { path: '/api/customers', method: 'POST' },
   update: { path: '/api/customers/:id', method: 'PUT' },
   remove: { path: '/api/customers/:id', method: 'DELETE' },
   export: { path: '/api/customers/export', method: 'POST' },
  },
 })

 assert.equal(runtime.mode, 'crud')
 assert.deepEqual(runtime.actions.map((item) => ({ key: item.key, kind: item.kind, placement: item.placement })), [
  { key: 'create', kind: 'operation', placement: 'page' },
  { key: 'update', kind: 'operation', placement: 'row' },
  { key: 'remove', kind: 'operation', placement: 'row' },
  { key: 'export', kind: 'operation', placement: 'page' },
  { key: 'filter', kind: 'runtime', placement: 'page' },
  { key: 'refresh', kind: 'runtime', placement: 'page' },
 ])
})

test('inferResourceRuntime respects ui action overrides and report mode hints', () => {
 const runtime = inferResourceRuntime(
  {
   key: 'customer-report',
   title: '客户分析',
   operations: {
    query: { path: '/api/customer-report', method: 'GET' },
    export: { path: '/api/customer-report/export', method: 'POST' },
   },
  },
  {
   view: { mode: 'report' },
   actions: {
    export: { placement: 'page', label: '导出报表', api: 'export' },
    filter: { hidden: true, runtime: 'filter' },
    toggleColumns: { runtime: 'toggle-columns' },
   },
  },
 )

 assert.equal(runtime.mode, 'report')
 assert.deepEqual(runtime.actions.map((item) => ({ key: item.key, kind: item.kind, placement: item.placement, hidden: item.hidden, label: item.label })), [
  { key: 'export', kind: 'operation', placement: 'page', hidden: false, label: '导出报表' },
  { key: 'filter', kind: 'runtime', placement: 'page', hidden: true, label: undefined },
  { key: 'refresh', kind: 'runtime', placement: 'page', hidden: false, label: undefined },
  { key: 'toggleColumns', kind: 'runtime', placement: 'page', hidden: false, label: undefined },
 ])
})
