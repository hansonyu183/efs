import test from 'node:test'
import assert from 'node:assert/strict'
import { listPresets, scaffoldPreset } from '@efs/presets'

test('presets list includes core schema-first app types', () => {
 const presets = listPresets()
 assert.deepEqual(presets, ['crud', 'report', 'workbench'])
})

test('scaffoldPreset returns schema file and platform bootstrap content', () => {
 const generated = scaffoldPreset('crud', 'Customer App')
 assert.match(generated.appSchema, /defineAppSchema\(/)
 assert.match(generated.appSchema, /name: 'customer-app'/)
 assert.match(generated.mainEntry, /createPlatformEfsAppPropsFromSchema/)
 assert.match(generated.mainEntry, /schemas\/app\.schema/)
})
