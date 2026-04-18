# efs

标准化企业管理平台前端服务仓库。

EFS 当前按**源码优先（source-first）**方式运行：

1. 仓库内统一通过 `@efs -> /src` alias 维护 schema authoring

除此之外：

- `@efs/schema/index.ts` 是当前唯一稳定 authoring 入口
- `src/vue` 与 `@efs/vue/*` 属于平台内部运行时实现，不作为业务 schema 的稳定契约
- `apps/<app-name>/src/main.ts` 这类启动文件可以引用内部 runtime，但它们由平台维护，不属于业务 authoring surface
- `dist` 只允许作为本地临时构建产物存在，不是仓库真源
- controller/shared 内部子路径都不属于稳定接入面

## 平台定位

- **不是普通组件库**：业务侧不应把 EFS 当作散装组件包消费
- **企业只维护 schema**：主入口是 `apps/<app-name>/schemas/app.schema.ts`，由 baseline + patch 合成
- **平台内部负责运行时装配**：应用壳、导航、资源页、报表页、认证壳等都由平台内部 runtime 接住
- **业务不要把 runtime import 当作 authoring contract**：即使某些平台入口文件当前会 import `@efs/vue/*`，那也是平台 bootstrap，不是业务侧稳定 API
- **业务接入先看 schema，而不是 runtime 细节**

## 仓库内容

- `src/vue`：内部 Vue runtime 源码
- `apps/agentos`：当前活动应用
- `tests/`：schema、runtime 与内部回归测试

## 正式接入文档

- `docs/standards/schema-first-authoring.md`：schema-first 正式建模入口
- `docs/integration/agentos-adoption.md`：AgentOS 当前接法
- `docs/migration/adopting-efs-in-existing-projects.md`：既有项目迁移规范

## 模块边界速记

### 稳定 authoring surface

- `apps/<app-name>/schemas/app.schema.ts`
- `apps/<app-name>/schemas/patch.ts`
- `@efs/schema/index.ts`

### 平台内部实现

- `@efs/vue/*`
- `src/vue/*`
- `src/model/resource/*`
- `src/model/page/*`
- controller/helper/shared/runtime 子路径

## 命令

```bash
npm install
npm run check:authoring
npm run test
npm run build
npm run ci
```

## 当前已实现

- schema-first app authoring
- baseline + patch -> app schema
- 内部 Vue app shell / 资源页 / 报表页 runtime
- 源码优先的构建与 CI 校验
