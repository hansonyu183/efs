import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function read(relativePath) {
 return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

test('standard demo keeps controller demo isolated and adds schema-first authoring entry', () => {
 const controllerSource = read('apps/standard-demo/src/demo-app.ts')
 const schemaSource = read('apps/standard-demo/app.schema.ts')

 assert.match(controllerSource, /import type \{ AppController \} from '@efs\/vue'/)
 assert.match(controllerSource, /import type \{ DomainController, ResController, ResRow, ResQueryParams \} from '@efs\/vue\/controller'/)
 assert.doesNotMatch(controllerSource, /import type \{ AppController, .*\} from '@efs\/vue'/)

 assert.match(schemaSource, /from '@efs\/schema'/)
 assert.match(schemaSource, /defineAppSchema\(/)
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