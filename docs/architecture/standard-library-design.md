# 企业前端标准组件库与标准页面库设计

## 1. 设计目标

目标不是再做一个“可选 UI 组件集合”，而是建立一套 **企业项目强约束前端标准体系**：

1. 所有企业项目必须优先复用标准组件库与标准页面库。
2. 页面开发默认走“标准页面模式 + 标准组件装配”，而不是手写页面骨架。
3. 主题、国际化、权限、组织上下文、全局告警、会话引导必须统一接入，不允许业务绕过。
4. 业务开发重点应从“搭页面”转向“填元数据 / 配动作 / 配字段 / 配资源模式”。
5. 平台内部持续吸收成熟模式，沉淀为可复用资产，并通过 lint / 规范 / CI 防止漂移。

本次设计以两个项目为基础：
- CompanyOS：`/mnt/d/code/CompanyOS`
- AgentOS：`/home/hanson/AgentOS`

---

## 2. 两项目分析结论

### 2.1 CompanyOS 分析结论

#### 2.1.1 已有共享组件

CompanyOS 已经形成一批可复用度较高的 Page / View / Panel 组件，主要集中在 `apps/tenant-console-web/src/components/`：

- `EntityListTable`
 - 用途：标准查询列表页/分页列表页。
 - 已实现能力：
  - 桌面表格 + 移动端卡片切换
  - 分页、页大小控制
  - 列显隐配置
  - 后端默认列 + 本地个性化列设置
  - 权限感知的全局默认列设置
- `SimpleTablePanel`
 - 用途：非分页表格、明细表、报表结果表。
 - 已实现能力：
  - 桌面表格 + 移动端卡片切换
  - 列显隐能力
- `QueryToolbar`
 - 用途：查询区 / 筛选区 / 操作条结构组件。
 - 已实现能力：统一卡片结构、Enter 提交。
- `CrudDialog`
 - 用途：新增 / 编辑弹窗统一结构组件。
- 
 - 用途：全局错误反馈统一渲染。
- `OrderManagementPage`
 - 用途：更高一层的业务页模板，封装订单类页面的列表、状态、动作、编辑流。

对应证据：
- `apps/tenant-console-web/src/components/EntityListTable.vue`
- `apps/tenant-console-web/src/components/SimpleTablePanel.vue`
- `apps/tenant-console-web/src/components/QueryToolbar.vue`
- `apps/tenant-console-web/src/components/CrudDialog.vue`
- `apps/tenant-console-web/src/components/.vue`
- `apps/tenant-console-web/src/components/OrderManagementPage.vue`

#### 2.1.2 已有标准页面模式

CompanyOS 实际上已经跑通了多种标准页面模式：

1. **查询 + 列表 + 分页 + 弹窗编辑**
  - 典型页面：MDM、用户、角色、库存、会计科目、会计期间等。
2. **工作流列表页 / 状态驱动页**
  - 典型页面：生产工单、质检、安全事件、采购验收等。
3. **基础资料页（统一基座页 + 资源差异字段）**
  - `MdmManageBaseView.vue` 已体现“同一页模式 + 不同资源差异字段”的思路。
4. **报表/对账/台账页**
  - 以 `SimpleTablePanel`、查询区、报表结果区为基础。
5. **工作台页**
  - 权限感知的快捷入口 + 指标概览。

对应证据：
- `apps/tenant-console-web/src/views/MdmManageBaseView.vue`
- `apps/tenant-console-web/src/views/UserManageView.vue`
- `apps/tenant-console-web/src/views/RbacRoleView.vue`
- `apps/tenant-console-web/src/views/InventoryItemView.vue`
- `apps/tenant-console-web/src/views/ProductionWorkOrderView.vue`
- `apps/tenant-console-web/src/views/QualityInspectionView.vue`
- `apps/tenant-console-web/src/views/SafetyIncidentView.vue`
- `apps/tenant-console-web/src/views/WorkbenchView.vue`
- `apps/tenant-console-web/src/views/reports/ReportCenterView.vue`

#### 2.1.3 前端/UI 规范

CompanyOS 规范比较成熟，且已经文档化：

- 技术栈：Vue 3 + Vuetify + MDI
- UI / 主题基线：统一遵循 Material Design 3（MD3），当前实现基座为 Vuetify
- 主题：只支持 `light / dark`
- 布局：`AuthPage` / `MainPage`
- 默认落地页：`/workbench`
- 响应式：移动端卡片、桌面端表格，要求由共享结构组件承担
- 组件优先级明确：
 - 列表优先 `EntityListTable`
 - 非分页表优先 `SimpleTablePanel`
 - 查询区优先 `QueryToolbar`
 - 新增编辑优先 `CrudDialog`
- 交互原则：
 - “No news is good news”
 - 成功默认不打全局成功提示
 - 错误统一走 
- i18n：`zh-CN / en-US`
- 状态展示：`v-chip` + 语义色 + 文字
- 页面组织：以 `v-card` 为统一 section 容器

对应证据：
- `docs/standards/ui-and-frontend.md`
- `docs/standards/ui-style.md`
- `apps/tenant-console-web/src/vuetify.ts`
- `apps/tenant-console-web/src/layouts/AuthPage.vue`
- `apps/tenant-console-web/src/layouts/MainPage.vue`

#### 2.1.4 平台 Page / View / Panel 能力

CompanyOS 的 Page / View / Panel 能力较成熟，已不仅是 UI 组件，而是完整前端平台能力：

- `AuthPage` / `MainPage`
- 动态菜单
- 权限感知的入口隐藏
- 工作台快捷入口
- theme / locale 切换
- 全局告警区域
- 路由鉴权
- report route registry（`/report/{reportKey}`）
- 统一会话/鉴权/HTTP 封装
- `useListPagination`
- `useKeyboardSubmit`
- 领域模型模式（BaseModel + state/rules/actions/api）

对应证据：
- `apps/tenant-console-web/src/router/index.ts`
- `apps/tenant-console-web/src/api/httpClient.ts`
- `apps/tenant-console-web/src/api/sessionStore.ts`
- `apps/tenant-console-web/src/composables/useListPagination.ts`
- `apps/tenant-console-web/src/composables/useKeyboardSubmit.ts`
- `apps/tenant-console-web/src/domains/base-model.ts`
- `apps/tenant-console-web/src/domains/main-layout-model.ts`
- `apps/tenant-console-web/src/report/reportRegistry.ts`

#### 2.1.5 适合沉淀为长期标准资产的能力

最值得直接吸收的有：

- MainPage / AuthPage 页面模式
- QueryToolbar / EntityListTable / SimpleTablePanel / CrudDialog
- - useListPagination
- report route registry 思路
- 基础资料统一页模式
- 工作流页中的状态动作模式
- selector/options API + debounce + cache 的下拉候选能力

但以下内容应先二次抽象：

- `OrderManagementPage`：业务味较重，应抽象成通用 `WorkflowPageShell`
- 列设置逻辑：目前分散在表格结构组件内部，建议上收为统一 `ColumnSettings` 能力
- BaseModel 模式：是优秀工程模式，但是否进入“所有企业项目必须采用”的前端标准，需要谨慎，不宜与 UI 标准强绑定

---

### 2.2 AgentOS 分析结论

#### 2.2.1 已有共享组件

AgentOS 当前共享组件数量不多，但平台化方向更清晰，集中在 `frontend/web-app/src/components/`：

- App 层：
 - 
- View / Panel 层：
 - `PagePanel`
 - `QueryToolbar`
 - `EntityListTable`
 - `SimpleTablePanel`
 - `CrudDialog`
 - `DashboardCardPanel`

对应证据：
- `frontend/web-app/src/components/app/.vue`
- `frontend/web-app/src/components/shell/PagePanel.vue`
- `frontend/web-app/src/components/shell/QueryToolbar.vue`
- `frontend/web-app/src/components/shell/EntityListTable.vue`
- `frontend/web-app/src/components/shell/SimpleTablePanel.vue`
- `frontend/web-app/src/components/shell/CrudDialog.vue`
- `frontend/web-app/src/components/shell/DashboardCardPanel.vue`

#### 2.2.2 已有标准页面模式

AgentOS 的“已实现页面模式”不如 CompanyOS 丰富，但“标准化意图”更强：

1. **统一 App Page 页面模式**
  - `AuthPage` + `MainPage`
2. **工作台 / Dashboard 模式**
  - `WorkbenchView.vue`
  - `AdminDashboardView.vue`
3. **运行时列表页模式**
  - `GenericEntityListView.vue`
4. **运行时详情页模式**
  - `GenericEntityDetailView.vue`
5. **动态运行时页面模式**
  - `DynamicPageView.vue`
6. **错误页模式**
  - 403 / 404

对应证据：
- `frontend/web-app/src/app/layouts/AuthPage.vue`
- `frontend/web-app/src/app/layouts/MainPage.vue`
- `frontend/web-app/src/modules/workbench/WorkbenchView.vue`
- `frontend/web-app/src/modules/admin/dashboard/AdminDashboardView.vue`
- `frontend/web-app/src/modules/runtime/GenericEntityListView.vue`
- `frontend/web-app/src/modules/runtime/GenericEntityDetailView.vue`
- `frontend/web-app/src/modules/runtime/DynamicPageView.vue`
- `frontend/web-app/src/views/errors/ForbiddenView.vue`
- `frontend/web-app/src/views/errors/NotFoundView.vue`

#### 2.2.3 前端/UI 规范

AgentOS 的规范文档非常明确，并且带有强约束表达：

- 统一 Vue App，不拆 admin 前端
- 共享 Page / View / Panel 是强制 first-choice primitive
- 运行时元数据页也必须复用同一套 Page / View / Panel 结构
- route shape：
 - `/login`
 - `/workbench`
 - `/admin/*`
 - `/<domain>/*`
- 统一 theme / locale / org-context / permission / app shell
- 业务应尽量少写前端，平台负责 Page / View / Panel 与运行时元数据页面

对应证据：
- `docs/standards/ui-and-frontend.md`
- `docs/architecture/platform-page-shells.md`
- `docs/architecture/frontend-layering.md`
- `docs/architecture/frontend-metadata-pages.md`
- `frontend/web-app/README.md`

#### 2.2.4 平台 Page / View / Panel 能力

AgentOS 最大价值不在“现成业务页面多”，而在“已经把平台职责说清楚”：

- 统一 App Page 基座
- 统一 session bootstrap
- route guard
- org switcher
- theme / locale 统一切换
- ui store + global alerts
- sdk/http/biz 统一封装
- `use-list-pagination`
- `use-column-visibility`
- 运行时元数据页面
- 动态页渲染入口
- 文档 + 校验脚本双约束

对应证据：
- `frontend/web-app/src/main.ts`
- `frontend/web-app/src/app/bootstrap/session.ts`
- `frontend/web-app/src/app/guards/auth.ts`
- `frontend/web-app/src/app/store/ui.ts`
- `frontend/web-app/src/sdk/http.ts`
- `frontend/web-app/src/sdk/biz.ts`
- `frontend/web-app/src/composables/use-list-pagination.ts`
- `frontend/web-app/src/composables/use-column-visibility.ts`
- `frontend/web-app/src/modules/runtime/DynamicPageView.vue`
- `scripts/check-frontend-standard.sh`

#### 2.2.5 适合沉淀为长期标准资产的能力

AgentOS 更适合作为“标准前端底座”的原因是：

- 明确了Page / View / Panel 与业务的边界
- 明确了资源模式与元数据模型方向
- 明确要求运行时页与手写页共用 Page / View / Panel
- 明确通过 规范/lint/CI 做防漂移
- 已将“少写页面代码，多写 metadata/resource config”作为方向

最适合沉淀为底座的资产：

- `App/Foundation` 层能力
- 统一 Page / View / Panel set
- renderer 方向
- composables（分页、列配置）
- anti-drift 校验机制

---

## 3. 提炼原则

### 3.1 CompanyOS 哪些能力更成熟、值得吸收

CompanyOS 更成熟的点在于：

1. **页面模式已经被业务真实验证**
  - 查询列表、基础资料、工作流、报表、工作台都已落地。
2. **共享结构组件更贴近业务实际**
  - 尤其是 `EntityListTable`、`SimpleTablePanel`、`QueryToolbar`、`CrudDialog`。
3. **交互细节更完整**
  - 移动端/桌面端切换、列设置、权限驱动菜单、全局错误反馈。
4. **业务页模板雏形已经出现**
  - 如 `OrderManagementPage`、基础资料统一页。

结论：**CompanyOS 更适合作为“模式样本库”和“成熟交互来源”。**

### 3.2 AgentOS 哪些能力更平台化、适合作为底座

AgentOS 更平台化的点在于：

1. **从一开始就强调统一 App，而不是多个前端系统**
2. **明确 shared shell 是 mandatory first-choice**
3. **明确 metadata/runtime page 是平台能力，不是旁路实现**
4. **明确 anti-drift 要用脚本和 CI enforce**
5. **明确资源模式驱动页面生成的方向**

结论：**AgentOS 更适合作为“标准前端底座仓库”和“未来平台规范中心”。**

### 3.3 哪些组件应进入标准组件库

应纳入标准组件库的核心组件：

- App/Foundation：
  - AuthPage
 - MainPage
 -  - ThemeSwitcher
 - LocaleSwitcher
 -  - PermissionGuard
 - - View / Panel：
 - PagePanel
 - QueryToolbar
 - EntityListTable
 - SimpleTablePanel
 - CrudDialog
 - FormPanel
 - DetailPanel
 - MasterDetailPanel
 - DashboardCardPanel
 - ReportPanel
- Interaction：
 - StatusChip
 - ActionBar
 - Pagination
 - ColumnSettings
 - EmptyState
 - ErrorState
 - PermissionAwareAction
- Runtime：
 - 
 - 
 - 
 - 

### 3.4 哪些页面模式应进入标准页面库

应纳入标准页面库：

- 登录页
- 工作台页
- 查询列表页
- 列表+分页页
- 列表+详情页
- 主从页
- 新增/编辑弹窗页
- 标准表单页
- 只读详情页
- 报表页
- 审批任务页
- 基础资料页
- 角色/用户/权限页
- 组织管理页
- 系统配置页
- 运行时元数据页

### 3.5 哪些内容不适合纳入标准库

不适合直接纳入标准库的内容：

- 强业务语义组件
 - 如订单特有的业务卡片、票据行编辑器、财务专属录入表格
- 资源特定字段布局
 - 某个业务单据独有字段组，不应固化为通用标准组件
- 过深绑定某领域名词的页面模板
 - 如“采购订单页组件”“安全事故页组件”直接入库不合适
- 视图模型实现范式本身
 - BaseModel 是工程实现方式，不应与 UI 标准库强绑定为强制规则

### 3.6 哪些内容需要二次抽象后再纳入

需要抽象后再纳入：

- `OrderManagementPage` → `WorkflowPageShell`
- 基础资料基座页 → `BaseDataPageShell`
- 报表中心 → `ReportPanel + ReportResultRenderer`
- 列设置逻辑 → 独立 `ColumnSettings`
- 权限按钮控制 → `PermissionAwareAction`
- 动态资源页 → ` + metadata renderers`

---

## 4. 标准组件库设计

以下组件按四层设计。

### 4.1 App / Foundation 层

#### 4.1.2 AuthPage / MainPage
- 职责：统一未登录 AuthPage与登录后 MainPage。
- 场景：登录页、所有认证后页面。
- 是否必须优先使用：**必须**。
- 是否允许绕过：仅错误页/嵌入式特殊页可受控绕过。
- 扩展点：顶部栏插槽、侧边菜单插槽、页头动作区。
- 关系：布局层必须承载 theme/i18n/alerts/org switch/permission-aware menu。

#### 4.1.3 - 职责：全局告警、错误反馈、阻断提醒。
- 场景：HTTP 错误、权限阻断、需要用户干预的全局事件。
- 是否必须优先使用：**必须**。
- 是否允许绕过：成功提示可本地静默；错误不可绕过统一通道。
- 扩展点：toast / alert / inline hybrid strategy。
- 关系：消息文案必须 i18n；显示内容受权限和 org 上下文影响。

#### 4.1.4 ThemeSwitcher / LocaleSwitcher / - 职责：统一主题、语言、组织切换。
- 场景：MainPage 顶栏、用户设置区。
- 是否必须优先使用：**必须**。
- 是否允许绕过：**不允许自定义第二套机制**。
- 扩展点：可扩展主题 token、locale pack、组织切换策略。
- 关系：是 theme/i18n/org 的标准入口。

#### 4.1.5 PermissionGuard
- 职责：统一页面级、区块级、动作级权限守卫。
- 场景：页面路由、按钮、菜单、局部内容块。
- 是否必须优先使用：**必须**。
- 是否允许绕过：后端仍是权限真源，但前端不可跳过 UX 层守卫。
- 扩展点：hide / disable / readonly 三态策略。
- 关系：权限必须结合 org-context 生效。

#### 4.1.6 - 职责：启动恢复 token、locale、theme、org、用户会话、菜单权限。
- 场景：应用启动、刷新恢复、登录后初始化。
- 是否必须优先使用：**必须**。
- 是否允许绕过：**不允许**。
- 扩展点：preload 策略、session 容错策略。
- 关系：是 permission/theme/i18n/org 的初始化源头。

### 4.2 View / Panel 层

#### 4.2.1 PagePanel
- 职责：统一页面 section 卡片容器。
- 场景：任意业务页一级块。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：仅在全屏图表/特种可视化时受控绕过。
- 扩展点：title、subtitle、actions、density。
- 关系：标题文案必须 i18n；内容受权限控制。

#### 4.2.2 QueryToolbar
- 职责：统一查询区、筛选区、操作区。
- 场景：所有列表、报表、任务页查询区。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：禁止手写重复查询卡片。
- 扩展点：filters slot、actions slot、quick-filters、Enter submit。
- 关系：字段文案走 i18n；查询条件可能含 org-aware 默认值。

#### 4.2.3 EntityListTable
- 职责：统一实体列表、分页、移动端卡片/桌面表格适配。
- 场景：所有标准查询列表页。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：仅复杂树表/多层表头/超大虚拟表单独申请。
- 扩展点：columns、row-actions、row-click、selection、summary、mobile-card。
- 关系：列/动作必须支持权限裁剪；文案 i18n；数据默认 org-scope。

#### 4.2.4 SimpleTablePanel
- 职责：统一非分页表、明细表、报表结果表。
- 场景：只读详情、报表结果、附属清单。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：复杂交叉表/透视表可受控绕过。
- 扩展点：columns、summary、compact mode。
- 关系：列展示支持权限与 i18n。

#### 4.2.5 CrudDialog
- 职责：统一新增/编辑/查看弹窗。
- 场景：中小复杂度新增编辑流。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：超复杂多步骤向导允许升级为 `FormPanel` 独立页。
- 扩展点：title、subtitle、footer-actions、width、submit hooks。
- 关系：提交动作必须经过权限校验；文案统一 i18n。

#### 4.2.6 FormPanel
- 职责：统一整页表单容器。
- 场景：复杂创建页、编辑页、配置页。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：禁止裸写页面表单骨架。
- 扩展点：section schema、footer actions、readonly mode。
- 关系：字段 label/help/error 走 i18n；字段启用受 permission/org 控制。

#### 4.2.7 DetailPanel
- 职责：统一只读详情容器。
- 场景：单据详情、实体详情、配置详情。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：复杂图文可扩展，不应重写详情框架。
- 扩展点：field groups、summary block、attachments、timeline slot。
- 关系：字段级权限、org-aware 数据过滤。

#### 4.2.8 MasterDetailPanel
- 职责：统一主从布局。
- 场景：左侧列表右侧详情、主记录+子记录。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：仅复杂设计器类页面可绕过。
- 扩展点：master slot、detail slot、selection sync、split ratio。
- 关系：主列表和从详情都需权限裁剪与 org 绑定。

#### 4.2.9 DashboardCardPanel
- 职责：统一工作台/仪表板卡片。
- 场景：工作台、管理驾驶舱、首页指标块。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：复杂 BI 大屏可另走可视化 Page / View / Panel。
- 扩展点：icon、metric、trend、actions、footer。
- 关系：卡片显隐受权限控制；数值文案需 locale-aware。

#### 4.2.10 ReportPanel
- 职责：统一报表页布局：查询区 + 报表区 + 动作区。
- 场景：对账、台账、统计报表、报表导出。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：仅复杂 BI 可视分析页受控绕过。
- 扩展点：query slot、result slot、summary slot、export actions。
- 关系：导出动作受权限控制；数字/日期格式 locale-aware；数据 org-scope。

### 4.3 Interaction 层

#### 4.3.1 StatusChip
- 职责：统一状态展示。
- 场景：单据状态、启停状态、审核状态。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：禁止页面自行发明状态色体系。
- 扩展点：status map、icon、tooltip。
- 关系：文案 i18n；状态可按权限决定是否可点击。

#### 4.3.2 ActionBar
- 职责：统一页面级/区块级动作区。
- 场景：查询区动作、列表批量操作、详情操作。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：禁止每页自定义一套按钮排列规则。
- 扩展点：primary/secondary/danger grouping、overflow menu。
- 关系：动作可见性/可用性必须接入权限。

#### 4.3.3 Pagination
- 职责：统一分页交互。
- 场景：所有分页列表。
- 是否必须优先使用：**必须**。
- 是否允许绕过：禁止业务自行维护分页状态模型。
- 扩展点：page-size options、compact mode。
- 关系：页大小/页码状态可进入 query sync。

#### 4.3.4 ColumnSettings
- 职责：统一列显隐、顺序、默认列设置。
- 场景：列表页、报表结果页、明细表。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：禁止各表独立重复实现列设置。
- 扩展点：per-user / org-default / global-default。
- 关系：某些列受权限决定是否可显示。

#### 4.3.5 EmptyState
- 职责：统一空态。
- 场景：列表无数据、权限无可见数据、未配置元数据。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：禁止业务页面自定义随机空态风格。
- 扩展点：illustration、cta、reason。
- 关系：空态原因文案需 i18n；权限无数据与真无数据需可区分。

#### 4.3.6 ErrorState
- 职责：统一局部错误态。
- 场景：局部块失败、详情加载失败、报表失败。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：不可手写随意错误块。
- 扩展点：retry、diagnostic code、support info。
- 关系：错误文案 i18n；可含 org-aware 上下文。

#### 4.3.7 PermissionAwareAction
- 职责：统一权限感知按钮/菜单项。
- 场景：所有可执行动作。
- 是否必须优先使用：**必须**。
- 是否允许绕过：不允许业务直接散落 `if permission` 逻辑到处写。
- 扩展点：hide / disable / tooltip。
- 关系：直接绑定 permission + org-context。

### 4.4 Runtime 层

#### 4.4.1 
- 职责：按 page/resource metadata 选择并渲染标准页面模式。
- 场景：运行时元数据页、低代码页、平台生成页。
- 是否必须优先使用：对于 runtime 页面 **必须**。
- 是否允许绕过：业务运行时页不得绕开标准渲染器。
- 扩展点：page type registry、override hooks。
- 关系：运行时页也必须走统一 permission/theme/i18n/org。

#### 4.4.2 / 
- 职责：按 metadata 渲染表单/表格。
- 场景：资源模式自动装配、基础资料、配置页、运行时 CRUD。
- 是否必须优先使用：metadata 页面必须优先。
- 是否允许绕过：仅高度定制页可以手写，但仍需嵌入标准 Page 基座。
- 扩展点：field widget registry、validation hooks、formatter registry。
- 关系：字段可见性、只读、校验规则需接 permission/org/i18n。

#### 4.4.3 
- 职责：按 action metadata 渲染标准动作。
- 场景：列表操作、详情操作、报表导出、工作流动作。
- 是否必须优先使用：**必须优先**。
- 是否允许绕过：禁止业务页面手拼一套独立动作权限策略。
- 扩展点：action types、confirm strategy、async feedback。
- 关系：动作与 permission 直接绑定；文案 i18n；提交上下文含 org。

---

## 5. 标准页面库设计

### 5.1 登录页
- 结构：`AuthPage + FormPanel(简化版)`
- 必须使用的标准组件：AuthPage、- 适用场景：统一登录入口
- 必须统一的交互：回车提交、错误统一反馈、登录中状态
- 权限要求：访客可达，登录后禁止重复进入
- 可扩展点：租户标识、SSO 入口
- 禁止发散点：禁止各项目自己设计第二套登录骨架

### 5.2 工作台页
- 结构：`MainPage + PagePanel + DashboardCardPanel`
- 必须组件：PagePanel、DashboardCardPanel、PermissionGuard
- 场景：登录后首页、分角色首页
- 必须统一交互：卡片排序、快捷入口、权限过滤
- 权限要求：卡片与入口必须按权限显隐
- 可扩展点：指标卡、待办卡、快捷入口卡
- 禁止发散点：禁止随意拼接杂乱首页模块

### 5.3 查询列表页
- 结构：`PagePanel + QueryToolbar + EntityListTable`
- 必须组件：QueryToolbar、EntityListTable、ActionBar、Pagination
- 场景：通用资源查询
- 必须统一交互：Enter 搜索、刷新、分页、列设置、空态/错误态
- 权限要求：页面访问、查询动作、导出动作、行操作均需权限控制
- 可扩展点：高级筛选、批量操作
- 禁止发散点：禁止手写原生表格和散落查询区

### 5.4 列表 + 分页页
- 结构：同上，但强调分页语义
- 必须组件：EntityListTable、Pagination、ColumnSettings
- 场景：标准 CRUD 列表
- 必须统一交互：page/pageSize 统一、切页不丢查询条件
- 权限要求：行级操作统一走 PermissionAwareAction
- 可扩展点：多选批量操作
- 禁止发散点：禁止自己实现分页状态

### 5.5 列表 + 详情页
- 结构：`MasterDetailPanel` 或 `EntityListTable + DetailPanel`
- 必须组件：EntityListTable、DetailPanel 或 MasterDetailPanel
- 场景：列表选中查看详情
- 必须统一交互：选中同步、详情刷新、空选中态
- 权限要求：详情块也要二次权限保护
- 可扩展点：右侧详情 tabs
- 禁止发散点：禁止各项目自行定义左右布局规则

### 5.6 主从页
- 结构：`MasterDetailPanel`
- 必须组件：MasterDetailPanel、SimpleTablePanel / DetailPanel
- 场景：主记录 + 子记录、组织树 + 成员、单据头 + 行
- 必须统一交互：主变从刷新、选中保持、局部 loading
- 权限要求：主从动作分别受控
- 可扩展点：树形主区、子表分页
- 禁止发散点：禁止手写 split-pane 框架

### 5.7 新增/编辑弹窗页
- 结构：`CrudDialog + /FormPanel`
- 必须组件：CrudDialog、
- 场景：中等复杂度创建/编辑
- 必须统一交互：打开/关闭、提交、校验、脏数据确认
- 权限要求：create/update 权限分离
- 可扩展点：宽度、footer actions、分区表单
- 禁止发散点：禁止页面内直接散落自定义对话框骨架

### 5.8 表单页
- 结构：`PagePanel + FormPanel`
- 必须组件：FormPanel、ActionBar、PermissionGuard
- 场景：复杂配置、长表单、向导之外的大表单
- 必须统一交互：分组、校验、保存/取消、错误定位
- 权限要求：字段级 readonly / hidden 支持
- 可扩展点：steps、sticky action bar
- 禁止发散点：禁止原始 div + input 组合手写骨架

### 5.9 只读详情页
- 结构：`PagePanel + DetailPanel + SimpleTablePanel`
- 必须组件：DetailPanel、SimpleTablePanel、StatusChip
- 场景：实体详情、配置详情、报表说明页
- 必须统一交互：字段分组、状态展示、附件区位置一致
- 权限要求：字段级显隐
- 可扩展点：时间线、附件、审计信息
- 禁止发散点：禁止自创详情展示样式体系

### 5.10 报表页
- 结构：`PagePanel + ReportPanel`
- 必须组件：QueryToolbar、ReportPanel、SimpleTablePanel / 
- 场景：统计报表、台账、对账、导出页
- 必须统一交互：查询、刷新、导出、空态、错误态
- 权限要求：查看与导出权限分离
- 可扩展点：图表块、汇总块、钻取
- 禁止发散点：禁止报表页自定义第二套 query/result 布局

### 5.11 审批任务页
- 结构：`PagePanel + QueryToolbar + EntityListTable + DetailPanel/TaskPanel`
- 必须组件：QueryToolbar、EntityListTable、StatusChip
- 场景：待办、已办、审批处理
- 必须统一交互：状态流转按钮、历史/时间线、处理意见
- 权限要求：任务操作权限必须标准化
- 可扩展点：timeline、comment panel
- 禁止发散点：禁止把工作流动作写成每页一套非标准按钮群

### 5.12 基础资料页
- 结构：`BaseDataPageShell = QueryToolbar + EntityListTable + CrudDialog`
- 必须组件：QueryToolbar、EntityListTable、CrudDialog
- 场景：客户、供应商、员工、物料等
- 必须统一交互：搜索、分页、状态、启停、弹窗编辑
- 权限要求：create/update/disable/export 分离
- 可扩展点：字段集通过 metadata 注入
- 禁止发散点：禁止每个基础资料资源单独手写骨架

### 5.13 角色用户权限页
- 结构：`MasterDetailPanel` 或 `List + Detail + Assignment`
- 必须组件：EntityListTable、DetailPanel、PermissionAwareAction、FormPanel
- 场景：角色、用户、角色授权、用户角色分配
- 必须统一交互：分配弹窗、授权树/清单、只读与可编辑状态切换
- 权限要求：页面本身属于高敏权限域
- 可扩展点：角色复制、批量授权
- 禁止发散点：禁止绕过统一权限点定义

### 5.14 组织管理页
- 结构：`MasterDetailPanel + FormPanel`
- 必须组件：、MasterDetailPanel、FormPanel
- 场景：组织树、组织详情、组织配置
- 必须统一交互：切组织即刷新上下文、树与详情联动
- 权限要求：组织级权限与平台级权限分离
- 可扩展点：组织层级视图、成员清单
- 禁止发散点：禁止各系统自定义 org-context 机制

### 5.15 系统配置页
- 结构：`PagePanel + FormPanel / SimpleTablePanel`
- 必须组件：PagePanel、FormPanel、PermissionGuard
- 场景：字典配置、参数配置、功能开关
- 必须统一交互：保存前校验、差异提示、变更记录入口
- 权限要求：高权限控制
- 可扩展点：配置分组、只读审计模式
- 禁止发散点：禁止配置页使用业务自定义 Page / View / Panel

### 5.16 运行时元数据页面
- 结构：` + 标准 Page 基座`
- 必须组件：
- 场景：平台生成页、资源模式页、低代码页
- 必须统一交互：生成页与手写页视觉/交互一致
- 权限要求：页面、字段、动作全部 metadata + permission 驱动
- 可扩展点：resource mode override、page preset
- 禁止发散点：禁止 runtime 页面绕过统一 Page / View / Panel直接渲染裸结构

---

## 6. 强约束规范

以后所有企业项目必须遵守：

1. **必须优先选用标准组件/标准页面。**
2. **不允许随意手写列表页、表单页、详情页骨架。**
3. **不允许绕过统一 theme / i18n / alerts / permission / org-context。**
4. **新页面必须声明属于哪一种标准页面类型。**
5. **新组件必须说明为什么标准库无法满足。**
6. **如果某页面类型反复出现 3 次以上，应先沉淀为标准页/标准壳，再继续开发。**
7. **运行时元数据页不是例外，必须走同一套标准 Page / View / Panel。**
8. **页面 PR 必须标注：页面类型、所用标准组件、是否有 override、是否有例外申请。**
9. **例外只能受控存在，且必须有到期回收计划。**
10. **任何改动标准体系的提交，必须同步更新文档、模板、lint/规范/CI。**

---

## 7. 工程组织建议

### 7.1 仓库/包组织

建议以 AgentOS 为标准底座中心，拆出前端标准包：

```text
frontend/
 packages/
  enterprise-app-foundation/
  enterprise-shells/
  enterprise-interactions/
  enterprise-runtime/
  enterprise-page-presets/
  enterprise-eslint-config/
  enterprise-style-tokens/
 web-app/
  src/
   app/
   modules/
   pages/
   runtime/
   presets/
   adapters/
```

或在 monorepo 下进一步抽象为：

```text
packages/
 app-foundation
 ui-shells
 ui-interactions
 runtime-renderer
 page-presets
 style-tokens
 eslint-config-enterprise
apps/
 agentos-web
 companyos-web
```

### 7.2 目录结构建议

```text
src/
 app/
  bootstrap/
  guards/
  layouts/
  router/
  store/
 components/
  app/
  shell/
  interaction/
  runtime/
 page-presets/
  login/
  workbench/
  entity-list/
  entity-detail/
  crud-dialog/
  report/
  workflow-task/
  base-data/
  org-admin/
  system-config/
 runtime/
  renderers/
  registries/
  schemas/
 modules/
  admin/
  crm/
  finance/
  workflow/
```

### 7.3 版本策略

- 标准组件库：语义化版本 `major.minor.patch`
- 标准页面 preset：与组件库同主版本
- Runtime metadata schema：单独版本号，避免前后端 schema 漂移
- 重大 breaking change：必须带迁移文档和 codemod/替换指南

### 7.4 文档策略

必须同时维护：

- 标准组件目录手册
- 标准页面模式手册
- 禁止事项手册
- 例外申请手册
- 迁移指南
- 设计 token 手册
- 权限 / org / i18n 接入手册

建议文档目录：

```text
docs/frontend-standards/
 components/
 page-patterns/
 runtime/
 governance/
 migration/
```

### 7.5 模板策略

必须提供模板而不是只写文档：

- `pnpm create enterprise-page --type entity-list`
- `pnpm create enterprise-page --type report`
- `pnpm create enterprise-page --type base-data`
- `pnpm create enterprise-component --reason <why-standard-lib-not-enough>`

模板输出默认已接好：
- PagePanel
- QueryToolbar
- - PermissionGuard
- i18n key 占位
- org-context 接入

### 7.6 接入方式

企业项目接入时：

1. 安装 foundation + shells + runtime 包
2. 使用统一 + MainPage/AuthPage 初始化
3. 在 router 中声明页面 preset type
4. 页面只填 metadata / resource mode / actions / fields
5. 运行 `lint + 规范 + preset check`

---

## 8. 防偏移机制

必须将规范变成自动校验。

### 8.1 Lint 规则

增加 ESLint/AST 规则：

- 禁止模块页直接写原生 `<table>` `<input>` `<select>` `<button>` 骨架
- 禁止模块页直接自定义分页状态
- 禁止模块页绕过 `PermissionAwareAction`
- 禁止模块页直接使用自定义 alerts 流
- 新页面必须导出 `pageType`
- 新页面必须使用标准页面模板入口

### 8.2 Contract 规则

新增前端 规范 检查：

- 必需 shell 文件是否存在
- 页面是否声明类型
- runtime page 是否走 renderer
- 是否接入 theme/locale/org/session keys
- 是否存在未注册 page preset

### 8.3 CI 规则

在 CI 中至少执行：

- typecheck
- build
- standard-lint
- page-preset-规范-check
- screenshot/regression（关键标准页）
- component API compatibility check

### 8.4 PR 模板规则

PR 必填：

- 页面类型
- 所用标准组件
- 是否新增标准能力
- 如果绕过，原因是什么
- 是否已更新文档/模板/规范

### 8.5 代码审查规则

Code Review 时，不讨论“能不能这样写”，而讨论：

- 这个页面属于哪种标准页类型？
- 为什么没复用标准组件？
- 为什么不能通过扩展点解决？
- 为什么例外值得存在？

AgentOS 当前的 `scripts/check-frontend-standard.sh` 已是正确方向，应继续增强，而不是停留在文档层。

---

## 9. 分阶段路线

### P0：立即建立强约束底座

目标：先把“必须统一”的底座锁住。

- 固化 App/Foundation：
  - AuthPage
 - MainPage
 -  - ThemeSwitcher
 - LocaleSwitcher
 -  - PermissionGuard
 - - 固化基础 Page 基座：
 - PagePanel
 - QueryToolbar
 - EntityListTable
 - SimpleTablePanel
 - CrudDialog
 - DashboardCardPanel
- 固化 Interaction：
 - StatusChip
 - ActionBar
 - Pagination
 - EmptyState
 - ErrorState
- 统一 page type 声明
- 建立 lint/规范/CI 基线
- 统一模板命令

### P1：沉淀标准页面库与运行时页

目标：让业务默认选“页面类型”，不是自己拼页面。

- 登录页 preset
- 工作台页 preset
- 查询列表页 preset
- 列表+分页页 preset
- 列表+详情页 preset
- 主从页 preset
- 新增/编辑弹窗页 preset
- 表单页 preset
- 只读详情页 preset
- 报表页 preset
- 基础资料页 preset
- 角色/用户/权限页 preset
- 组织管理页 preset
- 系统配置页 preset
- 
- / 
- 

### P2：二次抽象高级模式

目标：把 CompanyOS 中已验证但仍偏业务的模式上收为平台标准。

- WorkflowPageShell（从订单页、审批任务页抽象）
- BaseDataPageShell（从 MDM 统一页抽象）
- ColumnSettings 完整平台化
- ReportPanel + drilldown/export 规范
- 更强的 resource mode override 能力
- runtime preset registry
- 设计 token 与企业主题品牌化扩展

---

## 10. 最终建议

### 总体判断

- **CompanyOS 适合作为成熟能力来源。**
 - 它的优势是：已经有大量真实业务页，很多模式经过实际验证。
- **AgentOS 适合作为企业前端标准底座。**
 - 它的优势是：平台化边界清晰、规范意识强、元数据方向明确、适合承载统一标准。

### 最终落地建议

1. **以 AgentOS 作为标准前端底座仓库。**
2. **从 CompanyOS 吸收成熟页面模式与交互细节。**
3. **先做 Page / View / Panel 标准化，再做 Page Preset 标准化，再做治理标准化。**
4. **以后业务开发默认选择 ResourceMode / PagePreset，不再从零搭页面。**
5. **例外不是禁止，但必须受控、可审计、可回收。**
6. **标准体系必须靠代码检查和模板约束落地，而不是靠口头规范。**

---

## 结尾清单（按优先级）

### P0 必须进入标准组件库的组件

- AuthPage
- MainPage
- - ThemeSwitcher
- LocaleSwitcher
- - PermissionGuard
- - PagePanel
- QueryToolbar
- EntityListTable
- SimpleTablePanel
- CrudDialog
- DashboardCardPanel
- StatusChip
- ActionBar
- Pagination
- EmptyState
- ErrorState

### P1 必须进入标准组件库的组件

- FormPanel
- DetailPanel
- MasterDetailPanel
- ReportPanel
- ColumnSettings
- PermissionAwareAction
- 
- 
- 
- 

### P2 后续演进后再纳入标准组件库的组件

- WorkflowPageShell
- BaseDataPageShell
- TimelineShell
- AdvancedReportResultRenderer
- ResourceModeOverridePanel

### P0 必须进入标准页面库的页面模式

- 登录页
- 工作台页
- 查询列表页
- 列表+分页页
- 新增/编辑弹窗页
- 表单页
- 只读详情页

### P1 必须进入标准页面库的页面模式

- 列表+详情页
- 主从页
- 报表页
- 基础资料页
- 角色用户权限页
- 组织管理页
- 系统配置页
- 运行时元数据页

### P2 后续演进后再纳入标准页面库的页面模式

- 审批任务页
- 工作流处理页
- 多步骤向导页
- 复杂分析页（非 BI 大屏）

### 暂不纳入标准库的内容

- 订单专属页面组件
- 财务凭证专属录入器
- 强业务语义表格/卡片
- 单资源专有字段布局
- 与 특정业务名词深度绑定的页面模板
- BaseModel 这类工程实现范式本身

### 后续演进后再纳入的内容

- 从 `OrderManagementPage` 抽象出的通用 WorkflowPageShell
- 从基础资料页抽象出的 BaseDataPageShell
- 完整列设置平台能力
- 报表钻取/导出/汇总一体化能力
- 更成熟的 runtime resource mode preset 体系
