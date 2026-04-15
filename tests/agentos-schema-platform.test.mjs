import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

import { createPlatformAppFromSchema } from '../packages/schema/dist/index.js'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const appSchema = loadSchema('apps/agentos-demo/schemas/agentos/app.schema.ts')

test('agentos demo fixture exists and keeps schema under schemas/<app-name>', () => {
  const schemaPath = path.join(repoRoot, 'apps/agentos-demo/schemas/agentos/app.schema.ts')
  const mainPath = path.join(repoRoot, 'apps/agentos-demo/src/main.ts')
  assert.ok(fs.existsSync(schemaPath))
  assert.ok(fs.existsSync(mainPath))
  assert.equal(appSchema.app.name, 'agentos')
})

test('createPlatformAppFromSchema maps AgentOS auth, CRUD, and workflow operations onto the platform runtime', async () => {
  const requests = []
  const fetcher = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.toString()
    const bodyText = typeof init.body === 'string' ? init.body : undefined
    const body = bodyText ? JSON.parse(bodyText) : undefined
    requests.push({ url, method: init.method || 'GET', body })

    if (url.endsWith('/session/login')) {
      return json({ accessToken: 'agentos-token', orgCode: 'demo' })
    }
    if (url.endsWith('/session/orgs')) {
      return json({ items: [{ code: 'demo', name: '演示组织' }] })
    }
    if (url.includes('/admin/user/query')) {
      return json({ items: [{ id: 1, username: 'admin', displayName: '管理员' }], total: 1 })
    }
    if (url.endsWith('/admin/user/create')) {
      return json({ id: 2 })
    }
    if (url.endsWith('/admin/user/update')) {
      return json({ updated: true })
    }
    if (url.endsWith('/admin/user/delete')) {
      return json({ deleted: true })
    }
    if (url.includes('/workflow/process/query')) {
      return json({ items: [{ id: 10, title: '审批流程', status: 'pending', currentStep: 'manager', assigneeName: 'Alice' }], total: 1 })
    }
    if (url.endsWith('/workflow/process/start')) {
      return json({ id: 11 })
    }
    throw new Error(`Unexpected request: ${init.method || 'GET'} ${url}`)
  }

  const app = createPlatformAppFromSchema(appSchema, { fetcher })
  assert.equal(app.main.defaultPath, 'admin/user')
  assert.deepEqual(Array.from(app.main.domains, (domain) => domain.domain), ['admin', 'crm', 'workflow'])

  const userRes = app.main.domains.find((domain) => domain.domain === 'admin').items.find((item) => item.res === 'user')
  assert.equal(userRes.runtimeKind, 'crud')
  assert.deepEqual(userRes.actions.page.map((item) => item.key), ['create', 'refresh'])
  assert.deepEqual(userRes.actions.row.map((item) => item.key), ['update', 'delete'])

  await app.auth.login({ name: 'admin', pwd: 'secret', orgCode: 'demo' })
  const orgs = await app.auth.getOrgs()
  assert.deepEqual(orgs.map((item) => item.value), ['demo'])

  const queryResult = await userRes.query({ queryValues: { keyword: 'adm' }, page: 2, pageSize: 20 })
  assert.equal(queryResult.total, 1)
  await userRes.save({ mode: 'create', item: { username: 'ops', displayName: '运维' }, queryValues: {}, page: 1, pageSize: 10 })
  await userRes.save({ mode: 'edit', item: { id: 1, displayName: '平台管理员' }, queryValues: {}, page: 1, pageSize: 10 })
  await userRes.actions.custom.delete({ item: { id: 1 } })

  const processRes = app.main.domains.find((domain) => domain.domain === 'workflow').items.find((item) => item.res === 'process')
  assert.equal(processRes.runtimeKind, 'report')
  assert.deepEqual(processRes.actions.report.map((item) => item.key), ['start', 'approve', 'cancel', 'complete'])
  await processRes.query({ queryValues: { status: 'pending' }, page: 1, pageSize: 10 })
  await processRes.actions.custom.start({ item: { definitionCode: 'leave', title: '请假审批' } })

  assert.deepEqual(
    requests.map((entry) => [entry.method, entry.url.replace('http://127.0.0.1:8002', ''), entry.body]),
    [
      ['POST', '/session/login', { name: 'admin', pwd: 'secret', orgCode: 'demo' }],
      ['GET', '/session/orgs', undefined],
      ['POST', '/admin/user/query', { queryValues: { keyword: 'adm' }, page: 2, pageSize: 20 }],
      ['POST', '/admin/user/create', { username: 'ops', displayName: '运维' }],
      ['POST', '/admin/user/update', { id: 1, displayName: '平台管理员' }],
      ['POST', '/admin/user/delete', { id: 1 }],
      ['POST', '/workflow/process/query', { queryValues: { status: 'pending' }, page: 1, pageSize: 10 }],
      ['POST', '/workflow/process/start', { definitionCode: 'leave', title: '请假审批' }],
    ],
  )
})

function loadSchema(relativePath) {
  const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
  const transformed = source
    .replace("import { defineAppSchema } from '@efs/schema'", 'const defineAppSchema = (schema) => schema')
    .replace('export const appSchema =', 'const appSchema =')
    .concat('\nappSchema;')

  return vm.runInNewContext(transformed, {}, { filename: relativePath })
}

function json(data) {
  return {
    async text() {
      return JSON.stringify(data)
    },
  }
}
