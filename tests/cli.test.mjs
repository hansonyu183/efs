import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function runNode(args, cwd = repoRoot) {
 return execFileSync(process.execPath, args, { cwd, encoding: 'utf8' })
}

test('efs-lint passes for schema-first standard demo fixture', () => {
 const output = runNode(['packages/cli/bin/efs-lint.mjs', 'apps/standard-demo'])
 assert.match(output, /Lint passed/)
})

test('efs-lint subsumes schema governance and AST checks', () => {
 const output = runNode(['packages/cli/bin/efs-lint.mjs', 'apps/standard-demo'])
 assert.doesNotMatch(output, /AST lint passed/)
 assert.doesNotMatch(output, /Governance check passed/)
})
