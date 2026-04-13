import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

test('demo app builds successfully', () => {
 const output = execFileSync('npm', ['run', 'demo:build'], { cwd: repoRoot, encoding: 'utf8' })
 assert.match(output, /vite build/)
})
