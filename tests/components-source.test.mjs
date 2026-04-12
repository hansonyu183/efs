import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)

function read(path) {
  return fs.readFileSync(path, 'utf8')
}

test('EntityListTable exposes typed props contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/EntityListTable.vue'))
  assert.match(source, /interface EntityListTableProps/)
  assert.match(source, /columns\?: any\[\]/)
  assert.match(source, /items\?: any\[\]/)
})

test('PermissionGuard exposes granted prop', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/PermissionGuard.vue'))
  assert.match(source, /granted\?: boolean/)
  assert.match(source, /slot name="fallback"/)
})

test('MainLayout exposes layout-level props and slots contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/MainLayout.vue'))
  assert.match(source, /interface MainLayoutProps/)
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /brandTitle\?: string/)
  assert.match(source, /showSidebar\?: boolean/)
  assert.match(source, /slot name="sidebar"/)
  assert.match(source, /slot name="toolbar"/)
  assert.match(source, /slot name="alerts"/)
})

test('AuthLayout exposes auth-shell props and slots contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/AuthLayout.vue'))
  assert.match(source, /interface AuthLayoutProps/)
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /maxWidth\?: string/)
  assert.match(source, /slot name="header"/)
  assert.match(source, /slot name="alerts"/)
})

test('AppButton exposes foundational action props and slots contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/AppButton.vue'))
  assert.match(source, /interface AppButtonProps/)
  assert.match(source, /size\?: 'sm' \| 'md' \| 'lg'/)
  assert.match(source, /loading\?: boolean/)
  assert.match(source, /block\?: boolean/)
  assert.match(source, /slot name="leading"/)
  assert.match(source, /slot name="trailing"/)
})

test('AppInput exposes foundational form-control props and slots contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/AppInput.vue'))
  assert.match(source, /interface AppInputProps/)
  assert.match(source, /disabled\?: boolean/)
  assert.match(source, /readonly\?: boolean/)
  assert.match(source, /invalid\?: boolean/)
  assert.match(source, /slot name="leading"/)
  assert.match(source, /slot name="trailing"/)
})

test('AppSelect exposes foundational select props contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/AppSelect.vue'))
  assert.match(source, /interface AppSelectProps/)
  assert.match(source, /placeholder\?: string/)
  assert.match(source, /disabled\?: boolean/)
  assert.match(source, /optionLabelKey\?: string/)
  assert.match(source, /optionValueKey\?: string/)
  assert.match(source, /optionDisabledKey\?: string/)
})

test('AppField exposes foundational label-help-error contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/AppField.vue'))
  assert.match(source, /interface AppFieldProps/)
  assert.match(source, /hint\?: string/)
  assert.match(source, /error\?: string/)
  assert.match(source, /required\?: boolean/)
})

test('AppPanel exposes foundational panel header actions contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/AppPanel.vue'))
  assert.match(source, /interface AppPanelProps/)
  assert.match(source, /padded\?: boolean/)
  assert.match(source, /borderless\?: boolean/)
  assert.match(source, /slot name="actions"/)
})
