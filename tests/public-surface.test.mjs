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
 const schemaSource = read('apps/standard-demo/schemas/standard-demo/app.schema.ts')
 const mainSource = read('apps/standard-demo/src/main.ts')

 assert.match(legacySource, /import type \{ LegacyAppController, LegacyDomainController, LegacyResController, ResRow, ResQueryParams \} from '@efs\/vue\/legacy'/)
 assert.match(schemaSource, /from '@efs\/schema'/)
 assert.match(schemaSource, /defineAppSchema\(/)
 assert.match(mainSource, /createPlatformAppFromSchema/)
 assert.match(mainSource, /createApp\(EfsApp/)
 assert.match(mainSource, /schemas\/standard-demo\/app\.schema/)
 assert.doesNotMatch(mainSource, /DemoRoot/)
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

test('vue root export is shell-only while user schema lives under schemas/<app-name>', () => {
 const readme = read('README.md')
 const vueIndex = read('packages/vue/src/index.ts')
 const scaffoldingDoc = read('docs/standards/scaffolding.md')

 assert.match(readme, /schemas\/<app-name>/)
 assert.match(vueIndex, /export \{ default as EfsApp \}/)
 assert.doesNotMatch(vueIndex, /LegacyAppController/)
 assert.match(scaffoldingDoc, /schemas\/<app-name>\/app\.schema\.ts/)
 assert.match(scaffoldingDoc, /不再需要用户自己写根组件/)
})
