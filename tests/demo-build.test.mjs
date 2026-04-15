import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

test('standard demo app builds successfully', () => {
  const output = execFileSync('npm', ['run', 'demo:build'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
  })

  assert.match(output, /vite build/)
  assert.match(output, /built in/)
})
