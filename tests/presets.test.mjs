import test from 'node:test'
import assert from 'node:assert/strict'
import { listPresets, scaffoldPreset } from '@efs/presets'

test('presets list includes core schema-first app types', () => {
 const presets = listPresets()
 assert.deepEqual(presets, ['crud', 'report', 'workbench'])
})

test('scaffoldPreset returns schema directory and platform bootstrap content', () => {
 const generated = scaffoldPreset('crud', 'Customer App')
 assert.equal(generated.appDirName, 'customer-app')
 assert.match(generated.appSchema, /defineAppSchema\(/)
 assert.match(generated.mainEntry, /createPlatformAppFromSchema/)
 assert.match(generated.mainEntry, /user-apps\/customer-app\/app\.schema/)
})
