# Schema-First Authoring

本文定义 EFS 当前**源码优先**的标准接入主线。

结论先说：

- 业务侧只需要维护 `apps/<app-name>/schemas/app.schema.ts`
- 仓库内统一源码入口是 `@efs -> /src`
- 运行时壳、页面实现、导航/helper、controller 结构都属于平台内部源码，不属于稳定发布契约

---

## 1. 标准入口

当前唯一推荐使用的 schema 入口：

- `@efs/schema/index.ts`
  - `baselineSchema`
  - `composeAppSchema(...)`
  - `EfsAppSchemaPatch` / `EfsAppSchema`

不再属于稳定契约的内容：

- `@efs/vue`
- `@efs/vue/*` 内部 runtime 路径
- `@efs/vue/shared/*`
- controller / runtime helper 子路径

补充说明：

- `apps/<app-name>/src/main.ts` 这类平台 bootstrap 文件当前可能会 import `@efs/vue/*`
- 这类 import 仅代表平台内部装配需要，不代表业务 authoring contract 对外扩张到 runtime 路径
- 业务建模和迁移文档仍应优先围绕 schema 入口表述

---

## 2. 标准文件形态

标准接入主路径：

```text
apps/<app-name>/schemas/app.schema.ts
  -> composeAppSchema(...)
  -> app schema
  -> internal platform runtime
```

参考文件：

- `apps/agentos/schemas/app.schema.ts`

`src/main.ts` 之类的 runtime 入口文件仍然存在，但它们由平台内部维护，不作为业务侧公开 authoring contract。

换句话说，业务项目可以运行平台提供的 bootstrap，但不应该把 bootstrap 依赖的 `@efs/vue/*` import 反向视作自己的稳定接入面。

---

## 3. business schema 该写什么

业务 schema 主要描述：

- `app`：应用 id、标题、默认入口等
- `auth`：登录/登出等认证契约
- `services`：本地 dev 服务与 API 服务信息
- `i18n`：schema 级 locale / fallbackLocale / messages
- `domains[].resources[]`：资源 fields 与 operations

资源层当前核心结构：

```ts
interface EfsResourceSchema {
  key: string
  title: string
  fields?: EfsFieldSchema[]
  operations?: EfsResourceOperationsSchema
}

interface EfsResourceOperationsSchema {
  list?: EfsEndpointSchema
  query?: EfsEndpointSchema
  get?: EfsEndpointSchema
  create?: EfsEndpointSchema
  update?: EfsEndpointSchema
  remove?: EfsEndpointSchema
  [operation: string]: EfsEndpointSchema | undefined
}
```

约束口径：

- `list`：CRUD 资源的表格/列表读取
- `query`：report/search 型资源查询
- `get/create/update/remove`：标准资源操作
- `export/approve/...`：扩展后端 operation，也直接放在 `operations` 同层

也就是说：**所有调用后端的资源操作统一进 `operations`。**

---

## 4. schema 直接承载页面结构
资源页面结构直接写在 schema 内：

- `view`
- `queryFields`
- `columns`
- `formSections`
- `detailFields`
- `summary`
- `actions`

同时，当前 schema authoring 采用：

- `src/schema/baseline.ts`：通用骨架
- `apps/<app-name>/schemas/patch.ts`：应用实例 patch
- `apps/<app-name>/schemas/app.schema.ts`：`composeAppSchema(...)` 合成最终 schema

---

## 5. 对旧 controller/internal 的定位

旧 controller tree、runtime shape、shared helper 路径仍可能存在于仓库内部，
但它们都只是**平台内部实现细节**：

- 不作为业务侧公开建模入口
- 不作为正式发布 package contract
- 不作为对外文档推荐 import path
- 即使当前被平台 bootstrap 使用，也仍然按 internal-only 处理

以后如果文档需要提到它们，必须明确标注为 **internal-only**。

---

## 6. 最小接入清单

一个新项目至少要有：

1. `apps/<app-name>/schemas/app.schema.ts`
2. 对应 API/service 配置
3. 必要的 baseline / patch 组合

如果某个页面必须写很多 query/form/detail 布局细节，优先先反问：

- 这是不是可以直接稳定成 schema 结构？
- 这是不是应该补进 EFS runtime，而不是回退成业务页手写逻辑？
