import test from 'node:test'
import assert from 'node:assert/strict'
import { listPresets, scaffoldPreset } from '../packages/presets/src/index.mjs'

test('presets list includes core page types', () => {
 const presets = listPresets()
 assert.ok(presets.includes('paginated-list'))
})

test('scaffoldPreset returns manifest and vue content', () => {
 const generated = scaffoldPreset('paginated-list', 'CustomerListPage')
 assert.equal(generated.manifest.pageType, 'paginated-list')
 assert.match(generated.vue, /const pageType = 'paginated-list'/)
 assert.match(generated.vue, /standard-components:/)
})
