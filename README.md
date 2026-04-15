# efs

标准化企业管理平台前端仓库。EFS 不再只是组件库，而是一个面向企业内部管理系统的前端应用平台：企业优先提供业务能力声明（当前是 controller，后续可演进为 API / schema 描述），EFS 负责统一应用壳、认证壳、导航、资源页、报表页与默认交互运行时。

目标：以后所有企业项目都必须优先接入 EFS 平台运行时，不允许随意手写列表页、表单页、详情页骨架，也不允许绕过统一的 app shell、theme / i18n / alerts / permission / org-context / auth session。

## 平台定位

- **不是普通组件库**：EFS 的核心产物是 `EfsApp`、资源运行时、认证与导航壳，而不是零散 UI 组件集合。
- **企业只提供业务能力**：当前主要提供基本信息、认证能力、业务 controller；EFS 内部管理表单态、auth session、路由态、默认交互与页面壳。
- **后续可继续上收**：controller-first 只是中间态，后续可以继续演进为 API / schema / 元数据驱动的企业前端平台。

## 仓库内容

- `packages/presets`：标准页面 preset 定义与平台脚手架模板
- `packages/vue`：Vue 应用壳、资源运行时与共享前端平台能力
- `packages/cli`：平台接入用 lint / scaffold / governance 命令
- `standard-app`：唯一标准接法落地工程
- `apps/standard-demo`：可运行的 EfsApp 标准演示应用（schema-first 主路径，用于 build smoke test）
- `tests/`：组件、脚手架、AST lint、治理与打包测试

## 正式接入文档

- `docs/standards/layout-foundation.md`：布局级标准能力
- `docs/standards/foundation-controls.md`：基础控件层标准能力
- `docs/standards/navigation-menu-contract.md`：动态菜单 contract、Sidebar 标准接法、icon-first 规则
- `docs/integration/agentos-adoption.md`：AgentOS 当前正式接法
- `docs/migration/adopting-efs-in-existing-projects.md`：既有项目迁移规范

## 命令

```bash
npm install
npm run test
npm run lint:standard
npm run lint:standard:ast
npm run govern:standard
npm run demo:build
npm run pack:check
npm run ci
```

## UI 基线

- 统一视觉与交互规范：**Material Design 3（MD3）**
- 当前实现基座：**Vuetify 体系**
- 规范说明：`docs/standards/ui-baseline.md`

## 当前已实现

- 标准页面 preset registry
- `EfsApp` 应用壳与认证/导航运行时
- schema-first app authoring + schema -> controller adapter
- controller-first 的 CRUD / Report 资源运行时（逐步降级为 legacy/runtime 兼容层）
- 基础控件与内部页面/交互壳
- 页面 scaffold 生成器
- regex lint + AST lint
- governance 检查（manifest/page 对应、例外白名单、到期检查）
- 可发布 package manifests / exports / dry-run pack 检查
- GitHub CI
