# 标准组件库清单

## App / Foundation

### 必须优先使用
- AppShell
- AuthLayout
- MainLayout
- AppAlerts
- ThemeSwitcher
- LocaleSwitcher
- OrgSwitcher
- PermissionGuard
- SessionBootstrap

## Shell

### P0
- PageSection
- QueryToolbarShell
- EntityListTable
- SimpleTableShell
- CrudDialogShell
- DashboardCardShell

### P1
- FormShell
- DetailShell
- MasterDetailShell
- ReportShell

## Interaction

### P0
- StatusChip
- ActionBar
- Pagination
- EmptyState
- ErrorState

### P1
- ColumnSettings
- PermissionAwareAction

## Runtime

### P1
- DynamicPageRenderer
- MetadataFormRenderer
- MetadataTableRenderer
- ActionRenderer

## 组件纳入标准库的原则

1. 必须跨多个项目/领域重复出现。
2. 必须能够承载权限、theme、i18n、org-context 中至少一项平台能力。
3. 必须优先解决“页面骨架重复”而不是单一业务字段展示。
4. 强业务语义组件不直接纳入，先抽象后纳入。
