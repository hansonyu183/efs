# efs

标准化企业管理平台前端服务仓库。

EFS 当前按**源码优先（source-first）**方式运行：

1. 仓库内统一通过 `@efs/schema` alias 维护 schema authoring
2. `efs-lint` 用来检查 `apps/<app-name>/schemas/app.schema.ts`

除此之外：

- `packages/vue` 是内部运行时源码，不作为发布包契约
- `packages/presets` 是内部脚手架源码，不作为发布包契约
- `dist` 只允许作为本地临时构建产物存在，不是仓库真源
- controller/shared 内部子路径都不属于稳定接入面

## 平台定位

- **不是普通组件库**：业务侧不应把 EFS 当作散装组件包消费
- **企业只维护 schema**：主入口是 `apps/<app-name>/schemas/app.schema.ts`
- **平台内部负责运行时装配**：应用壳、导航、资源页、报表页、认证壳等都由平台内部 runtime 接住
- **业务接入先看 schema，而不是 runtime 细节**

## 仓库内容

- `packages/schema`：内部 schema authoring 源码
- `packages/cli`：本地 schema 检查 CLI（当前只保留 `efs-lint`）
- `packages/vue`：内部 Vue runtime 源码
- `packages/presets`：内部 preset / scaffold 源码
- `apps/agentos`：当前活动应用
- `tests/`：schema、runtime 与内部回归测试

## 正式接入文档

- `docs/standards/schema-first-authoring.md`：schema-first 正式建模入口
- `docs/integration/agentos-adoption.md`：AgentOS 当前接法
- `docs/migration/adopting-efs-in-existing-projects.md`：既有项目迁移规范

## 命令

```bash
npm install
npm run lint:schema
npm run check:authoring
npm run test
npm run build
npm run ci
```

## 当前已实现

- schema-first app authoring
- schema -> platform runtime adapter
- schema lint CLI
- 内部 Vue app shell / 资源页 / 报表页 runtime
- 内部 preset / scaffold 实现
- 源码优先的构建与 CI 校验
