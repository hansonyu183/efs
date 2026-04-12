import test from 'node:test'
import assert from 'node:assert/strict'
import { componentCatalog, pageCatalog } from '../packages/contracts/src/index.mjs'

test('P0 foundation shell components exist', () => {
  for (const name of ['AppShell', 'AuthLayout', 'MainLayout', 'AppAlerts', 'PermissionGuard']) {
    assert.ok(componentCatalog[name], `missing component ${name}`)
  }
})

test('P0 page types exist', () => {
  for (const pageType of ['login', 'workbench', 'query-list', 'paginated-list']) {
    assert.ok(pageCatalog[pageType], `missing page type ${pageType}`)
  }
})

test('runtime metadata page requires runtime renderers', () => {
  const spec = pageCatalog['runtime-metadata-page']
  assert.deepEqual(
    spec.requiredComponents.filter((name) => name.includes('Renderer')).sort(),
    ['ActionRenderer', 'DynamicPageRenderer', 'MetadataFormRenderer', 'MetadataTableRenderer'].sort()
  )
})
