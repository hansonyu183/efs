import test from 'node:test'
import assert from 'node:assert/strict'
import { listPresets, scaffoldPreset } from '@efs/presets'

test('presets list includes core schema-first app types', () => {
 const presets = listPresets()
 assert.deepEqual(presets, ['crud', 'report', 'workbench'])
})

test('scaffoldPreset returns schema-first app fixture content', () => {
 const generated = scaffoldPreset('crud', 'CustomerApp')
 assert.match(generated.appSchema, /defineAppSchema\(/)
 assert.match(generated.appSchema, /operations:\s*\{/)
 assert.match(generated.runtimeEntry, /adaptAppSchemaToVueController/)
 assert.match(generated.rootVue, /<EfsApp/)
})
