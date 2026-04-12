# efs

企业前端标准组件库与标准页面库仓库。

目标：以后所有企业项目都必须优先从标准组件库和标准页面库中选择，不允许随意手写列表页、表单页、详情页骨架，也不允许绕过统一的 theme / i18n / alerts / permission / org-context。

## 仓库内容

- `packages/contracts`：标准组件、标准页面、强约束校验规则
- `packages/presets`：标准页面 preset 定义与脚手架模板
- `packages/vue`：Vue 组件与 runtime renderer/API
- `packages/cli`：contract / lint / scaffold / governance / runtime demo 命令
- `apps/demo-app`：可运行的 Vite + Vue 标准示例应用
- `examples/sample-app`：标准手写页面示例
- `examples/runtime-demo`：运行时 metadata 页面示例
- `tests/`：标准库、校验器、脚手架、runtime、AST lint、治理测试

## 正式接入文档

- `docs/standards/layout-foundation.md`：布局级标准能力
- `docs/standards/foundation-controls.md`：基础控件层标准能力
- `docs/standards/navigation-menu-contract.md`：动态菜单 contract 与 icon-first 规则
- `docs/integration/agentos-adoption.md`：AgentOS 当前正式接法
- `docs/migration/adopting-efs-in-existing-projects.md`：既有项目迁移规范

## 命令

```bash
npm install
npm run test
npm run check:sample
npm run lint:sample
npm run lint:sample:ast
npm run govern:sample
npm run runtime:demo
npm run demo:build
npm run pack:check
npm run ci
```

## UI 基线

- 统一视觉与交互规范：**Material Design 3（MD3）**
- 当前实现基座：**Vuetify 体系**
- 规范说明：`docs/standards/ui-baseline.md`

## 当前已实现

- 标准组件 registry
- 标准页面 preset registry
- 页面 manifest contract 校验器
- Vue 组件 API 骨架
- runtime renderer / metadata renderers
- 页面 scaffold 生成器
- regex lint + AST lint
- governance 检查（manifest/page 对应、例外白名单、到期检查）
- 可运行 demo app
- 可发布 package manifests / exports / dry-run pack 检查
- 运行时页面 demo
- GitHub CI
