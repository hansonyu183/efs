import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const packageFiles = [
  '/home/hanson/enterprise-frontend-standards/packages/contracts/package.json',
  '/home/hanson/enterprise-frontend-standards/packages/presets/package.json',
  '/home/hanson/enterprise-frontend-standards/packages/vue/package.json',
  '/home/hanson/enterprise-frontend-standards/packages/cli/package.json'
]

test('publishable package manifests expose name and exports/bin', () => {
  for (const file of packageFiles) {
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))
    assert.ok(pkg.name)
    assert.ok(pkg.exports || pkg.bin)
  }
})
