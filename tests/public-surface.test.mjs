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

 assert.match(legacySource, /import type \{ AppController \} from '@efs\/vue'/)
 assert.match(legacySource, /import type \{ DomainController, ResController, ResRow, ResQueryParams \} from '@efs\/vue\/controller'/)
 assert.doesNotMatch(legacySource, /import type \{ AppController, .*\} from '@efs\/vue'/)

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
 assert.deepEqual(Object.keys(packageJson.exports).sort(), ['.', './controller', './shared/navigation-menu'])
})

test('standard-app is documented as a legacy fixture while standard-demo remains schema-first', () => {
 const readme = read('README.md')
 const standardAppReadme = read('standard-app/README.md')
 const scaffoldingDoc = read('docs/standards/scaffolding.md')

 assert.match(readme, /standard-app.*legacy page-manifest fixture/)
 assert.match(standardAppReadme, /legacy fixture/i)
 assert.match(standardAppReadme, /app\.schema\.ts/)
 assert.match(scaffoldingDoc, /legacy page-manifest fixture/i)
 assert.match(scaffoldingDoc, /schema-first `app\.schema\.ts`/)
})
