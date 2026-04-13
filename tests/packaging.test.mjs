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

test('publishable package manifests expose name and exports/bin', () => {
 for (const file of packageFiles) {
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))
  assert.ok(pkg.name)
  assert.ok(pkg.exports || pkg.bin)
 }
})
