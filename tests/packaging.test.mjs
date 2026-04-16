import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function readPackage(relativePath) {
 return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'))
}

test('public package manifests are limited to schema plus schema lint CLI', () => {
 const schemaPkg = readPackage('packages/schema/package.json')
 const cliPkg = readPackage('packages/cli/package.json')
 const vuePkg = readPackage('packages/vue/package.json')
 const presetsPkg = readPackage('packages/presets/package.json')

 assert.equal(schemaPkg.private, false)
 assert.equal(schemaPkg.exports['.'].default, './dist/index.js')
 assert.equal(schemaPkg.exports['.'].types, './dist/index.d.ts')
 assert.deepEqual(schemaPkg.files, ['dist'])

 assert.equal(cliPkg.private, false)
 assert.deepEqual(Object.keys(cliPkg.bin).sort(), ['efs-lint'])
 assert.deepEqual(cliPkg.files, ['bin/efs-lint.mjs'])
 assert.ok(!('@efs/vue' in (cliPkg.dependencies || {})))
 assert.ok(!('@efs/presets' in (cliPkg.dependencies || {})))

 assert.equal(vuePkg.private, true)
 assert.ok(!('exports' in vuePkg))
 assert.deepEqual(vuePkg.files, ['dist'])

 assert.equal(presetsPkg.private, true)
 assert.equal(presetsPkg.exports['.'].default, './dist/index.js')
 assert.equal(presetsPkg.exports['.'].types, './dist/index.d.ts')
})

test('source packages do not keep duplicate runtime .mjs copies beside ts source', () => {
 const duplicateRuntimeSources = [
  'packages/presets/src/index.mjs',
  'packages/vue/src/index.mjs',
  'packages/vue/src/shared/SemanticIcons.mjs',
  'packages/vue/src/shared/NavigationMenu.mjs',
 ]

 for (const relativePath of duplicateRuntimeSources) {
  assert.equal(fs.existsSync(path.join(repoRoot, relativePath)), false, `${relativePath} should not exist once ts source is canonical`)
 }
})
