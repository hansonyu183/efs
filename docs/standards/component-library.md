# 标准组件库清单

## UI / Theme 基线

- 本标准组件库默认遵循 **Material Design 3（MD3）** 规范。
- 当前实现基座统一使用 **Vuetify 体系**。
- theme / style / responsive 等表现默认收敛到 MD3 企业后台实现口径，不单独自创另一套视觉体系。

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

### Foundation Controls / P0
- AppButton
- AppInput
- AppSelect
- AppField
- AppPanel

说明：
- 这五个组件属于布局与表单入口层的基础能力，不允许业务项目长期保留第二套通用实现。
- 登录页、布局工具栏、查询栏、轻表单、卡片面板应优先复用这一层。
- 如果业务项目需要额外能力，应先扩展 EFS，而不是在项目本地再造基础控件。

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
