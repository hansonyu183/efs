import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function read(relativePath) {
 return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

test('standard demo is schema-first while legacy controller fixture remains isolated', () => {
 const legacySource = read('apps/standard-demo/src/legacy-controller-app.ts')
 const schemaSource = read('apps/standard-demo/app.schema.ts')
 const schemaRuntimeSource = read('apps/standard-demo/src/app-from-schema.ts')
 const demoRootSource = read('apps/standard-demo/src/DemoRoot.vue')

 assert.doesNotMatch(legacySource, /from '@efs\/vue'/)
 assert.match(legacySource, /import type \{ LegacyAppController, LegacyDomainController, LegacyResController, ResRow, ResQueryParams \} from '@efs\/vue\/legacy'/)
 assert.doesNotMatch(legacySource, /import type \{ LegacyAppController, .*\} from '@efs\/vue'/)

 assert.match(schemaSource, /from '@efs\/schema'/)
 assert.match(schemaSource, /defineAppSchema\(/)
 assert.match(schemaRuntimeSource, /adaptAppSchemaToVueController/)
 assert.match(demoRootSource, /\.\/app-from-schema/)
})

test('docs avoid raw component package imports and use lowercase navigation-menu helper path', () => {
 const integrationDoc = read('docs/integration/agentos-adoption.md')
 const navDoc = read('docs/standards/navigation-menu-contract.md')
 const packageJson = JSON.parse(read('packages/vue/package.json'))

 assert.doesNotMatch(integrationDoc, /@efs\/vue\/components\//)
 assert.match(navDoc, /@efs\/vue\/shared\/navigation-menu/)
 assert.doesNotMatch(navDoc, /@efs\/vue\/shared\/NavigationMenu/)
 assert.deepEqual(Object.keys(packageJson.exports).sort(), ['.', './legacy', './shared/navigation-menu'])
})

test('vue root export is shell-only while legacy types live under the legacy subpath', () => {
 const readme = read('README.md')
 const vueIndex = read('packages/vue/src/index.ts')
 const scaffoldingDoc = read('docs/standards/scaffolding.md')

 assert.doesNotMatch(readme, /standard-app/)
 assert.match(vueIndex, /export \{ default as EfsApp \}/)
 assert.doesNotMatch(vueIndex, /LegacyAppController/)
 assert.match(scaffoldingDoc, /schema-first app fixture/i)
 assert.match(scaffoldingDoc, /不再生成 `\.page\.json` manifest/)
})
