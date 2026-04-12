import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePageDefinition } from '../packages/contracts/src/index.mjs'

test('valid paginated-list manifest passes', () => {
  const result = validatePageDefinition({
    id: 'crm-customer-list',
    name: '客户列表',
    pageType: 'paginated-list',
    standardComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'Pagination', 'PermissionGuard', 'AppAlerts'],
    runtimeCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context'],
    exception: null
  })

  assert.equal(result.valid, true)
})

test('missing pageType fails', () => {
  const result = validatePageDefinition({
    id: 'x',
    name: 'bad',
    standardComponents: ['MainLayout'],
    runtimeCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  })

  assert.equal(result.valid, false)
  assert.ok(result.errors.some((e) => e.includes('pageType')))
})

test('exception requires reason owner and expiresAt', () => {
  const result = validatePageDefinition({
    id: 'x',
    name: 'bad',
    pageType: 'query-list',
    standardComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'PermissionGuard', 'AppAlerts'],
    runtimeCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context'],
    exception: { reason: 'temporary' }
  })

  assert.equal(result.valid, false)
  assert.ok(result.errors.some((e) => e.includes('owner')))
  assert.ok(result.errors.some((e) => e.includes('expiresAt')))
})
