import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

import { createPlatformAppFromSchema, createPlatformEfsAppPropsFromSchema } from '../packages/schema/dist/index.js'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const appSchema = loadSchema('apps/agentos/schemas/app.schema.ts')

test('agentos demo fixture exists and keeps schema under apps/<app-name>/schemas/app.schema.ts', () => {
  const schemaPath = path.join(repoRoot, 'apps/agentos/schemas/app.schema.ts')
  const mainPath = path.join(repoRoot, 'apps/agentos/src/main.ts')
  assert.ok(fs.existsSync(schemaPath))
  assert.ok(fs.existsSync(mainPath))
  assert.equal(appSchema.app.name, 'agentos')
})

test('schema i18n is formalized and platform shell props expose it for EfsApp bootstrap', () => {
  assert.equal(appSchema.i18n.fallbackLocale, 'zh-CN')
  assert.equal(appSchema.i18n.messages['zh-CN'].efs.auth.title, '登录到 AgentOS')
  assert.equal(appSchema.i18n.messages['en-US'].efs.auth.title, 'Sign in to AgentOS')

  const shellProps = createPlatformEfsAppPropsFromSchema(appSchema, {
    fetcher: async () => json({ code: 'OK', data: { token: 'noop-token', principal: { orgCode: 'demo' } } }),
  })

  assert.equal(shellProps.appName, 'AgentOS')
  assert.equal(shellProps.theme, 'light')
  assert.equal(shellProps.i18n.locale, 'zh-CN')
  assert.equal(shellProps.i18n.fallbackLocale, 'zh-CN')
  assert.equal(shellProps.i18n.messages['zh-CN'].efs.auth.title, '登录到 AgentOS')
  assert.equal(shellProps.i18n.messages['en-US'].efs.auth.title, 'Sign in to AgentOS')
  assert.equal(shellProps.app.main.defaultPath, 'admin/user')
  assert.deepEqual(
    Array.from(shellProps.app.main.domains.find((domain) => domain.domain === 'admin').items, (item) => item.res),
    ['user', 'role', 'organization', 'membership', 'permission'],
  )
})

test('createPlatformAppFromSchema maps AgentOS auth, CRUD, and workflow operations onto the platform runtime', async () => {
  const requests = []
  const fetcher = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.toString()
    const bodyText = typeof init.body === 'string' ? init.body : undefined
    const body = bodyText ? JSON.parse(bodyText) : undefined
    requests.push({ url, method: init.method || 'GET', body, headers: init.headers || {} })

    if (url.endsWith('/session/login')) {
      return json({ code: 'OK', data: { token: 'agentos-token', principal: { orgCode: 'demo' }, organizations: [{ code: 'demo', name: '演示组织' }] } })
    }
    if (url.endsWith('/session/orgs')) {
      return json({ code: 'OK', data: [{ code: 'demo', name: '演示组织' }] })
    }
    if (url.includes('/admin/user/query')) {
      return json({ code: 'OK', data: { items: [{ id: 1, username: 'admin', displayName: '管理员' }], total: 1 } })
    }
    if (url.endsWith('/admin/user/create')) {
      return json({ code: 'OK', data: { id: 2 } })
    }
    if (url.endsWith('/admin/user/update')) {
      return json({ code: 'OK', data: { updated: true } })
    }
    if (url.endsWith('/admin/user/reset-password')) {
      return json({ code: 'OK', data: { updated: true } })
    }
    if (url.endsWith('/admin/user/delete')) {
      return json({ code: 'OK', data: { deleted: true } })
    }
    if (url.includes('/admin/permission/query')) {
      return json({ code: 'OK', data: { items: [{ domain: 'admin', resource: 'user', operation: 'query', method: 'POST', path: '/admin/user/query', permission: 'admin.user.query', handlerName: 'Query' }], total: 1 } })
    }
    if (url.includes('/workflow/process/query')) {
      return json({ code: 'OK', data: { items: [{ id: 10, title: '审批流程', status: 'pending', currentStep: 'manager', assigneeName: 'Alice' }], total: 1 } })
    }
    if (url.endsWith('/workflow/process/start')) {
      return json({ code: 'OK', data: { id: 11 } })
    }
    throw new Error(`Unexpected request: ${init.method || 'GET'} ${url}`)
  }

  const app = createPlatformAppFromSchema(appSchema, { fetcher })
  assert.equal(app.main.defaultPath, 'admin/user')
  assert.deepEqual(Array.from(app.main.domains, (domain) => domain.domain), ['admin', 'crm', 'workflow'])

  const userRes = app.main.domains.find((domain) => domain.domain === 'admin').items.find((item) => item.res === 'user')
  assert.equal(userRes.runtimeKind, 'crud')
  assert.deepEqual(userRes.actions.page.map((item) => item.key), ['create', 'refresh'])
  assert.deepEqual(userRes.actions.row.map((item) => item.key), ['update', 'resetPassword', 'delete'])

  const permissionRes = app.main.domains.find((domain) => domain.domain === 'admin').items.find((item) => item.res === 'permission')
  assert.equal(permissionRes.runtimeKind, 'crud')
  assert.deepEqual(permissionRes.actions.page.map((item) => item.key), ['refresh'])
  assert.deepEqual(permissionRes.actions.row, [])

  await app.auth.login({ name: 'admin', pwd: 'secret', orgCode: 'demo' })
  const orgs = await app.auth.getOrgs()
  assert.deepEqual(orgs.map((item) => item.value), ['demo'])

  const queryResult = await userRes.query({ queryValues: { keyword: 'adm' }, page: 2, pageSize: 20 })
  assert.equal(queryResult.total, 1)
  await userRes.save({ mode: 'create', item: { username: 'ops', displayName: '运维' }, queryValues: {}, page: 1, pageSize: 10 })
  await userRes.save({ mode: 'edit', item: { id: 1, displayName: '平台管理员' }, queryValues: {}, page: 1, pageSize: 10 })
  await userRes.actions.custom.resetPassword({ item: { id: 1, password: 'new-secret' } })
  await userRes.actions.custom.delete({ item: { id: 1 } })
  const permissionResult = await permissionRes.query({ queryValues: { domain: 'admin' }, page: 1, pageSize: 10 })
  assert.equal(permissionResult.total, 1)

  const processRes = app.main.domains.find((domain) => domain.domain === 'workflow').items.find((item) => item.res === 'process')
  assert.equal(processRes.runtimeKind, 'report')
  assert.deepEqual(processRes.actions.report.map((item) => item.key), ['start', 'approve', 'cancel', 'complete'])
  await processRes.query({ queryValues: { status: 'pending' }, page: 1, pageSize: 10 })
  await processRes.actions.custom.start({ item: { definitionCode: 'leave', title: '请假审批' } })

  assert.deepEqual(
    requests.map((entry) => [entry.method, entry.url.replace('http://127.0.0.1', ''), entry.body, entry.headers.Authorization || entry.headers.authorization || null]),
    [
      ['POST', '/agentos-api/session/login', { data: { name: 'admin', pwd: 'secret', orgCode: 'demo', username: 'admin', password: 'secret' } }, null],
      ['GET', '/agentos-api/session/orgs', undefined, 'Bearer agentos-token'],
      ['POST', '/agentos-api/admin/user/query', { data: { queryValues: { keyword: 'adm' }, page: 2, pageSize: 20 } }, 'Bearer agentos-token'],
      ['POST', '/agentos-api/admin/user/create', { data: { username: 'ops', displayName: '运维' } }, 'Bearer agentos-token'],
      ['POST', '/agentos-api/admin/user/update', { data: { id: 1, displayName: '平台管理员' } }, 'Bearer agentos-token'],
      ['POST', '/agentos-api/admin/user/reset-password', { data: { id: 1, password: 'new-secret' } }, 'Bearer agentos-token'],
      ['POST', '/agentos-api/admin/user/delete', { data: { id: 1 } }, 'Bearer agentos-token'],
      ['POST', '/agentos-api/admin/permission/query', { data: { queryValues: { domain: 'admin' }, page: 1, pageSize: 10 } }, 'Bearer agentos-token'],
      ['POST', '/agentos-api/workflow/process/query', { data: { queryValues: { status: 'pending' }, page: 1, pageSize: 10 } }, 'Bearer agentos-token'],
      ['POST', '/agentos-api/workflow/process/start', { data: { definitionCode: 'leave', title: '请假审批' } }, 'Bearer agentos-token'],
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
