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

test('efs-scaffold generates vue and manifest files', () => {
 const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'efs-'))
 runNode(['packages/cli/bin/efs-scaffold.mjs', '--preset', 'workbench', '--name', 'WorkbenchPage', '--out', tmp])
 assert.ok(fs.existsSync(path.join(tmp, 'WorkbenchPage.vue')))
 assert.ok(fs.existsSync(path.join(tmp, 'WorkbenchPage.page.json')))
})

test('efs-lint passes for standard app', () => {
 const output = runNode(['packages/cli/bin/efs-lint.mjs', 'standard-app'])
 assert.match(output, /Lint passed/)
})
