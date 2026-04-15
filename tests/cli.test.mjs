import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function runNode(args, cwd = repoRoot) {
 return execFileSync(process.execPath, args, { cwd, encoding: 'utf8' })
}

test('efs-scaffold generates schema-first app files', () => {
 const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'efs-'))
 runNode(['packages/cli/bin/efs-scaffold.mjs', '--preset', 'workbench', '--name', 'WorkbenchApp', '--out', tmp])
 assert.ok(fs.existsSync(path.join(tmp, 'schemas', 'app.schema.ts')))
 assert.ok(fs.existsSync(path.join(tmp, 'src', 'main.ts')))
})

test('efs-lint passes for schema-first standard demo fixture', () => {
 const output = runNode(['packages/cli/bin/efs-lint.mjs', 'apps/standard-demo'])
 assert.match(output, /Lint passed/)
})
