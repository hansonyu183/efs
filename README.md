# efs

标准化企业管理平台前端仓库。

EFS 当前**唯一正式对外契约**只有两项：

1. `@efs/schema` —— 业务侧唯一需要直接依赖的 authoring contract
2. `efs-lint` —— 用来检查 `apps/<app-name>/schemas/app.schema.ts` 的 schema 检查 CLI

除此之外：

- `packages/vue` 是**内部运行时实现**，不再作为外部包契约
- `packages/presets` 是**内部脚手架/模板实现**，不再作为外部包契约
- controller/shared 内部子路径都不再属于外部接入面

## 平台定位

- **不是普通组件库**：业务侧不应把 EFS 当作散装组件包消费
- **企业只维护 schema**：主入口是 `apps/<app-name>/schemas/app.schema.ts`
- **平台内部负责运行时装配**：应用壳、导航、资源页、报表页、认证壳等都由平台内部 runtime 接住
- **业务接入先看 schema，而不是 runtime 细节**

## 仓库内容

- `packages/schema`：唯一正式对外的 schema authoring contract
- `packages/cli`：唯一正式对外的 schema 检查 CLI（当前只保留 `efs-lint`）
- `packages/vue`：内部 Vue runtime
- `packages/presets`：内部 preset / scaffold 实现
- `apps/standard-demo`：schema-first 标准演示应用
- `tests/`：schema、runtime、打包与内部回归测试

## 正式接入文档

- `docs/standards/schema-first-authoring.md`：schema-first 正式建模入口
- `docs/integration/agentos-adoption.md`：AgentOS 当前接法
- `docs/migration/adopting-efs-in-existing-projects.md`：既有项目迁移规范

## 命令

```bash
npm install
npm run test
npm run lint:standard
npm run demo:build
npm run pack:check
npm run ci
```

## 当前已实现

- schema-first app authoring
- schema -> platform runtime adapter
- schema lint CLI
- 内部 Vue app shell / 资源页 / 报表页 runtime
- 内部 preset / scaffold 实现
- 打包与 CI 校验
