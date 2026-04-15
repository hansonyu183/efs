import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

const packageFiles = [
 path.join(repoRoot, 'packages/presets/package.json'),
 path.join(repoRoot, 'packages/vue/package.json'),
 path.join(repoRoot, 'packages/cli/package.json')
]

function readPackage(relativePath) {
 return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'))
}

test('publishable package manifests expose name and exports/bin', () => {
 for (const file of packageFiles) {
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))
  assert.ok(pkg.name)
  assert.ok(pkg.exports || pkg.bin)
 }
})

test('publishable package manifests export built dist entries instead of src entries', () => {
 const presetsPkg = readPackage('packages/presets/package.json')
 assert.equal(presetsPkg.exports['.'].default, './dist/index.js')
 assert.equal(presetsPkg.exports['.'].types, './dist/index.d.ts')
 assert.deepEqual(presetsPkg.files, ['dist'])

 const vuePkg = readPackage('packages/vue/package.json')
 assert.equal(vuePkg.exports['.'].default, './dist/index.js')
 assert.equal(vuePkg.exports['.'].types, './dist/index.d.ts')
 assert.ok(!('./types' in vuePkg.exports))
 assert.ok(!('./components/*' in vuePkg.exports))
 assert.equal(vuePkg.exports['./controller'].default, './dist/controller/index.js')
 assert.equal(vuePkg.exports['./controller'].types, './dist/controller/index.d.ts')
 assert.ok(!('./controller/*' in vuePkg.exports))
 assert.ok(!('./shared/*' in vuePkg.exports))
 assert.equal(vuePkg.exports['./shared/navigation-menu'].default, './dist/shared/navigation-menu.js')
 assert.equal(vuePkg.exports['./shared/navigation-menu'].types, './dist/shared/navigation-menu.d.ts')
 assert.equal(vuePkg.peerDependencies.vue, '^3.5.13')
 assert.equal(vuePkg.peerDependencies['vue-router'], '^4.5.1')
 assert.deepEqual(vuePkg.files, ['dist'])
})

test('cli package consumes publishable package entrypoints instead of sibling src paths', () => {
 const cliFiles = [
  'packages/cli/bin/efs-lint.mjs',
  'packages/cli/bin/efs-lint-ast.mjs',
  'packages/cli/bin/efs-scaffold.mjs',
 ]

 for (const relativePath of cliFiles) {
  const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
  assert.match(source, /from '@efs\/presets'/)
  assert.doesNotMatch(source, /\.\.\/\.\.\/presets\/src\/index\.mjs/)
 }
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
