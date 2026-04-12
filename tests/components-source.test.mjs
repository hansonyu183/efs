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
  assert.match(source, /columns\?: InputColumn\[\]/)
  assert.match(source, /items\?: Record<string, unknown>\[\]/)
})

test('PermissionGuard exposes granted prop', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/PermissionGuard.vue'))
  assert.match(source, /granted\?: boolean/)
  assert.match(source, /slot name="fallback"/)
})

test('MainLayout exposes concrete shell and global agent contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/MainLayout.vue'))
  assert.match(source, /interface MainLayoutProps/)
  assert.match(source, /moreLabel\?: string/)
  assert.match(source, /agentPlaceholder\?: string/)
  assert.match(source, /agentSessionsOpen\?: boolean/)
  assert.match(source, /slot name="sidebar"/)
  assert.match(source, /slot name="toolbar"/)
  assert.match(source, /slot name="alerts"/)
  assert.match(source, /slot name="agent-sessions"/)
  assert.match(source, /slot name="agent-output"/)
  assert.match(source, /submit-agent/)
  assert.match(source, /update:agentSessionsOpen/)
  assert.match(source, /import LocaleSwitcher from '\.\/LocaleSwitcher\.vue'/)
  assert.match(source, /import ThemeSwitcher from '\.\/ThemeSwitcher\.vue'/)
  assert.match(source, /<LocaleSwitcher/)
  assert.match(source, /<ThemeSwitcher/)
  assert.match(source, /import SemanticIcon from '\.\/SemanticIcon\.vue'/)
  assert.match(source, /<SemanticIcon name="menu"/)
  assert.match(source, /<SemanticIcon name="more"/)
  assert.match(source, /<SemanticIcon name="send"/)
})

test('SemanticIcon exposes unified semantic token contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/SemanticIcon.vue'))
  assert.match(source, /interface SemanticIconProps/)
  assert.match(source, /name\?: string/)
  assert.match(source, /fallback\?: string/)
  assert.match(source, /label\?: string/)
  assert.match(source, /size\?: 'sm' \| 'md' \| 'lg'/)
  assert.match(source, /resolveSemanticIcon/)
})

test('DemoSidebarNav wires sidebar rendering to runtime menu builder and semantic icons', () => {
  const source = read(path.join(repoRoot, 'apps/demo-app/src/components/DemoSidebarNav.vue'))
  assert.match(source, /buildSidebarMenuTree/)
  assert.match(source, /SemanticIcon/)
  assert.match(source, /RouterLink/)
  assert.match(source, /defineOptions\(\{ name: 'DemoSidebarNav' \}\)/)
})

test('AuthLayout exposes stronger auth-shell props and slots contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/foundation/AuthLayout.vue'))
  assert.match(source, /interface AuthLayoutProps/)
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /maxWidth\?: string/)
  assert.match(source, /layout\?: 'centered' \| 'split'/)
  assert.match(source, /panelWidth\?: string/)
  assert.match(source, /heroTitle\?: string/)
  assert.match(source, /heroSubtitle\?: string/)
  assert.match(source, /showLocaleSwitcher\?: boolean/)
  assert.match(source, /showThemeSwitcher\?: boolean/)
  assert.match(source, /locale\?: string/)
  assert.match(source, /theme\?: string/)
  assert.match(source, /localeOptions\?: LayoutOption\[\]/)
  assert.match(source, /themeOptions\?: LayoutOption\[\]/)
  assert.match(source, /footerText\?: string/)
  assert.match(source, /supportText\?: string/)
  assert.match(source, /backgroundVariant\?: 'soft' \| 'strong' \| 'plain'/)
  assert.match(source, /slot name="brand"/)
  assert.match(source, /slot name="hero"/)
  assert.match(source, /slot name="header"/)
  assert.match(source, /slot name="alerts"/)
  assert.match(source, /slot name="actions"/)
  assert.match(source, /slot name="locale-action"/)
  assert.match(source, /slot name="theme-action"/)
  assert.match(source, /slot name="footer"/)
  assert.match(source, /import LocaleSwitcher from '\.\/LocaleSwitcher\.vue'/)
  assert.match(source, /import ThemeSwitcher from '\.\/ThemeSwitcher\.vue'/)
  assert.match(source, /update:locale/)
  assert.match(source, /update:theme/)
})

test('LocaleSwitcher and ThemeSwitcher expose standard switch contracts', () => {
  const localeSource = read(path.join(repoRoot, 'packages/vue/src/components/foundation/LocaleSwitcher.vue'))
  const themeSource = read(path.join(repoRoot, 'packages/vue/src/components/foundation/ThemeSwitcher.vue'))
  assert.match(localeSource, /interface LocaleSwitcherProps/)
  assert.match(localeSource, /modelValue\?: string/)
  assert.match(localeSource, /options\?: LocaleOption\[\]/)
  assert.match(localeSource, /update:modelValue/)
  assert.match(localeSource, /SemanticIcon/)
  assert.match(themeSource, /interface ThemeSwitcherProps/)
  assert.match(themeSource, /modelValue\?: string/)
  assert.match(themeSource, /options\?: ThemeOption\[\]/)
  assert.match(themeSource, /update:modelValue/)
  assert.match(themeSource, /SemanticIcon/)
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

test('PageSection exposes header actions slot contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/PageSection.vue'))
  assert.match(source, /interface PageSectionProps/)
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /slot name="actions"/)
})

test('QueryToolbarShell exposes enriched header and enter-submit contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/QueryToolbarShell.vue'))
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /slot name="headerActions"/)
  assert.match(source, /slot name="after"/)
  assert.match(source, /'enter-submit'/)
})

test('EntityListTable exposes column settings and pagination contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/EntityListTable.vue'))
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /tableKey\?: string/)
  assert.match(source, /columnSettingsLabel\?: string/)
  assert.match(source, /showPagination\?: boolean/)
  assert.match(source, /update:page/)
  assert.match(source, /update:pageSize/)
  assert.match(source, /name="mobile"/)
})

test('SimpleTableShell exposes subtitle rowsLabel and actions slot contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/SimpleTableShell.vue'))
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /rowsLabel\?: string/)
  assert.match(source, /slot name="actions"/)
})

test('FormShell exposes sectioned form, summary, and footer action contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/FormShell.vue'))
  assert.match(source, /interface FormShellProps/)
  assert.match(source, /sections\?: FormSection\[\]/)
  assert.match(source, /summary\?: string/)
  assert.match(source, /requiredHint\?: string/)
  assert.match(source, /dirty\?: boolean/)
  assert.match(source, /showFooterActions\?: boolean/)
  assert.match(source, /slot name="summary"/)
  assert.match(source, /slot name="actions"/)
  assert.match(source, /slot name="footer"/)
  assert.match(source, /'save'/)
  assert.match(source, /'cancel'/)
})

test('DashboardCardShell exposes eyebrow contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/DashboardCardShell.vue'))
  assert.match(source, /eyebrow\?: string/)
  assert.match(source, /dashboardcardshell__value/)
})

test('DetailShell exposes richer detail grid contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/DetailShell.vue'))
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /description\?: string/)
  assert.match(source, /fieldsLabel\?: string/)
  assert.match(source, /columns\?: 1 \| 2 \| 3/)
  assert.match(source, /emptyText\?: string/)
  assert.match(source, /slot name="actions"/)
  assert.match(source, /slot name="footer"/)
})

test('MasterDetailShell exposes split panel, header action, and detail empty-state contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/MasterDetailShell.vue'))
  assert.match(source, /interface MasterDetailShellProps/)
  assert.match(source, /splitRatio\?: string/)
  assert.match(source, /masterTitle\?: string/)
  assert.match(source, /detailTitle\?: string/)
  assert.match(source, /detailEmptyTitle\?: string/)
  assert.match(source, /detailEmptyDescription\?: string/)
  assert.match(source, /slot name="header-actions"/)
  assert.match(source, /slot name="master"/)
  assert.match(source, /name="detail"/)
})

test('CrudDialogShell exposes dialog mode, footer action, and close contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/CrudDialogShell.vue'))
  assert.match(source, /interface CrudDialogShellProps/)
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /summary\?: string/)
  assert.match(source, /size\?: 'sm' \| 'md' \| 'lg'/)
  assert.match(source, /closeOnBackdrop\?: boolean/)
  assert.match(source, /showFooterActions\?: boolean/)
  assert.match(source, /'update:modelValue'/)
  assert.match(source, /'submit'/)
  assert.match(source, /'cancel'/)
  assert.match(source, /'close'/)
  assert.match(source, /slot name="header-actions"/)
  assert.match(source, /slot name="summary"/)
  assert.match(source, /slot name="footer"/)
})

test('ReportShell exposes query/result/export contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/shell/ReportShell.vue'))
  assert.match(source, /interface ReportShellProps/)
  assert.match(source, /subtitle\?: string/)
  assert.match(source, /description\?: string/)
  assert.match(source, /queryTitle\?: string/)
  assert.match(source, /resultTitle\?: string/)
  assert.match(source, /resultCountText\?: string/)
  assert.match(source, /exportable\?: boolean/)
  assert.match(source, /'export'/)
  assert.match(source, /slot name="query"/)
  assert.match(source, /slot name="result"/)
  assert.match(source, /slot name="header-actions"/)
  assert.match(source, /slot name="result-actions"/)
})

test('ColumnSettings exposes visibleKeys showAll and reset contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/interaction/ColumnSettings.vue'))
  assert.match(source, /visibleKeys\?: string\[\]/)
  assert.match(source, /showAllLabel\?: string/)
  assert.match(source, /'update:visibleKeys'/)
  assert.match(source, /'showAll'/)
  assert.match(source, /'reset'/)
})

test('Pagination exposes pageCount pageSizeOptions and update emits contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/interaction/Pagination.vue'))
  assert.match(source, /pageCount\?: number/)
  assert.match(source, /pageSizeOptions\?: number\[\]/)
  assert.match(source, /'update:page'/)
  assert.match(source, /'update:pageSize'/)
})

test('StatusChip constrains tone variants', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/interaction/StatusChip.vue'))
  assert.match(source, /new Set\(\['neutral', 'success', 'warning', 'danger', 'info'\]\)/)
})

test('DataTable exposes renderers visible columns and row actions contract', () => {
  const source = read(path.join(repoRoot, 'packages/vue/src/components/interaction/DataTable.vue'))
  assert.match(source, /type CellRenderer = 'text' \| 'status' \| 'tags'/)
  assert.match(source, /visibleColumnKeys\?: string\[\]/)
  assert.match(source, /actionsLabel\?: string/)
  assert.match(source, /rowActions\?: RowAction\[\]/)
  assert.match(source, /StatusChip/)
  assert.match(source, /AppTag/)
})
