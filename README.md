# efs

标准化企业管理平台前端仓库。EFS 不再只是组件库，而是一个面向企业内部管理系统的前端应用平台：企业优先提供放在 `apps/<app-name>/schemas/app.schema.ts` 下的应用 schema；EFS 负责统一应用壳、认证壳、导航、资源页、报表页、服务接线与默认交互运行时。

目标：以后所有企业项目都必须优先接入 EFS 平台运行时，不允许随意手写列表页、表单页、详情页骨架，也不允许绕过统一的 app shell、theme / i18n / alerts / permission / org-context / auth session。

## 平台定位

- **不是普通组件库**：EFS 的核心产物是 `EfsApp`、资源运行时、认证与导航壳，而不是零散 UI 组件集合。
- **企业只提供 schema 目录**：主入口是 `apps/<app-name>/schemas/app.schema.ts`，其中描述应用信息、认证、服务、资源 fields 与 operations；EFS 负责把这些输入编译/装配成运行时。
- **平台内置入口与服务接线**：用户不再需要自己写根组件；平台入口会直接加载 schema，并基于 `services + operations` 自动接线。
- **controller-first 已降级**：旧的 controller tree 仍作为内部 runtime 兼容层保留，但不再是推荐的对外接入方式。

## 仓库内容

- `packages/presets`：标准页面 preset 定义与平台脚手架模板
- `packages/vue`：Vue 应用壳、资源运行时与共享前端平台能力
- `packages/cli`：平台接入用 lint / scaffold / governance 命令
- `apps/standard-demo`：可运行的 EfsApp 标准演示应用（schema-first 主路径，用于 build smoke test）
- `tests/`：组件、脚手架、AST lint、治理与打包测试

## 正式接入文档

- `docs/standards/schema-first-authoring.md`：schema-first 正式建模入口与示例
- `docs/standards/layout-foundation.md`：布局级标准能力
- `docs/standards/foundation-controls.md`：基础控件层标准能力
- `docs/standards/navigation-menu-contract.md`：动态菜单 contract、Sidebar 标准接法、icon-first 规则
- `docs/integration/agentos-adoption.md`：AgentOS 当前正式接法（schema-first）
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
- legacy runtime compatibility layer（仅通过 `@efs/vue/legacy` 暴露，供 adapter/迁移过渡使用）
- 基础控件与内部页面/交互壳
- 页面 scaffold 生成器
- regex lint + AST lint
- governance 检查（manifest/page 对应、例外白名单、到期检查）
- 可发布 package manifests / exports / dry-run pack 检查
- GitHub CI
