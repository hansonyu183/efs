import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function read(relativePath) {
 return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

test('external contract is limited to schema package plus schema lint CLI', () => {
 const readme = read('README.md')
 const schemaDoc = read('docs/standards/schema-first-authoring.md')
 const agentosDoc = read('docs/integration/agentos-adoption.md')
 const cliPkg = JSON.parse(read('packages/cli/package.json'))
 const schemaPkg = JSON.parse(read('packages/schema/package.json'))
 const vuePkg = JSON.parse(read('packages/vue/package.json'))
 const presetsPkg = JSON.parse(read('packages/presets/package.json'))

 assert.match(readme, /@efs\/schema/)
 assert.match(readme, /efs-lint/)
 assert.match(readme, /唯一正式对外契约/)

 assert.match(schemaDoc, /唯一正式对外/)
 assert.match(schemaDoc, /@efs\/schema/)
 assert.match(schemaDoc, /efs-lint/)

 assert.match(agentosDoc, /外部接入只面向 schema contract/)
 assert.match(agentosDoc, /@efs\/schema/)

 assert.deepEqual(Object.keys(cliPkg.bin).sort(), ['efs-lint'])
 assert.deepEqual(Object.keys(schemaPkg.exports).sort(), ['.'])
 assert.equal(vuePkg.private, true)
 assert.equal(presetsPkg.private, true)
})

test('demo apps stay schema-first and use only internal runtime wiring for Vue shell', () => {
 const standardMain = read('apps/standard-demo/src/main.ts')
 const agentosMain = read('apps/agentos/src/main.ts')
 const standardSchema = read('apps/standard-demo/schemas/app.schema.ts')

 assert.match(standardSchema, /from '@efs\/schema'/)
 assert.match(standardSchema, /defineAppSchema\(/)

 for (const source of [standardMain, agentosMain]) {
  assert.match(source, /createAppPropsFromSchema/)
  assert.match(source, /packages\/vue\/src\/index\.ts/)
  assert.doesNotMatch(source, /@efs\/vue/)
 }
})
