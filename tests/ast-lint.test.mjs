import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function runNode(args, cwd = repoRoot) {
 return execFileSync(process.execPath, args, { cwd, encoding: 'utf8' })
}

test('AST lint passes for legacy standard-app fixture', () => {
 const output = runNode(['packages/cli/bin/efs-lint-ast.mjs', 'standard-app'])
 assert.match(output, /AST lint passed/)
})

