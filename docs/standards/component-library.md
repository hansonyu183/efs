# 标准组件库清单

## UI / Theme 基线

- 本标准组件库默认遵循 **Material Design 3（MD3）** 规范。
- 当前实现基座统一使用 **Vuetify 体系**。
- theme / style / responsive 等表现默认收敛到 MD3 企业后台实现口径，不单独自创另一套视觉体系。

## App / Foundation

### 必须优先使用
- AuthPage
- MainPage
- - ThemeSwitcher
- LocaleSwitcher
- - PermissionGuard
- 
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
- Page / View / Panel、导航层、全局操作层遵循 icon-first，优先使用语义 icon 与 tooltip，而不是堆积长文本按钮。

## Page / View / Panel

### Page
- AuthPage
- MainPage

### View / Panel / 结构组件
- PagePanel
- 查询区
- EntityListTable
- EntityListView
- SimpleTablePanel
- DashboardCardPanel
- FormPanel
- DetailPanel
- MasterDetailPanel
- CrudDialog
- ReportPanel

### P1（运行时分发已可用，待继续补厚）
- 

补充说明：
- EFS 当前采用“标准定义单一真相源”口径，见 `docs/standards/standard-definitions.md`
- 资源页组件成熟度评估见 `docs/standards/resource-page-maturity.md`
- 资源页 action 分层与摆放规则见 `docs/standards/resource-page-actions.md`
- `EntityListView` 输入项瘦身方向见 `docs/standards/resource-crud-input-slimming.md`
- 当前列表页相关能力最成熟；`EntityListView` 已把查询、列表、详情、弹窗表单组合成一体化标准 CRUD View，并继续向“成品 View”收敛：**正式对外入口已经切到 schema-first**，业务侧优先在 `apps/<app-name>/schemas/app.schema.ts` 中声明 resource `fields`、`operations` 与最小 `ui` override，再由 `@efs/schema` 的 runtime inference + adapter 生成当前可运行的 view/controller 输入。现有 `query/save/remove` 一类 controller handler 仍存在，但定位已降为 runtime 兼容层；列表默认支持“对象数组即表格”的零配置输入（显式 `columns` 仅作增强配置），标题默认内接应用侧 `$t`，查询/loading/error/分页/弹窗等流程状态优先由组件内部维护，页头默认只保留主标题，详情区仅依据 `detailFields` 决定是否显示，行操作默认提供编辑/删除；表单 / 详情 / 主从 / 弹窗 / 报表 Panel 已进入可用阶段

## Interaction

### P0
- StatusChip
- ActionBar
- LoadingState
- Pagination
- EmptyState
- ErrorState

### P1
- ColumnSettings
- PermissionAwareAction

## 组件纳入标准库的原则

1. 必须跨多个项目/领域重复出现。
2. 必须能够承载权限、theme、i18n、org-context 中至少一项平台能力。
3. 必须优先解决“页面骨架重复”而不是单一业务字段展示。
4. 强业务语义组件不直接纳入，先抽象后纳入。
