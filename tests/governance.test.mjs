import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function runNode(args, cwd = repoRoot) {
 return execFileSync(process.execPath, args, { cwd, encoding: 'utf8' })
}

test('governance passes for sample app', () => {
 const output = runNode(['packages/cli/bin/efs-governance.mjs', 'examples/sample-app'])
 assert.match(output, /Governance check passed/)
})

