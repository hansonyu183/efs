# Schema-First Authoring

本文定义 EFS 当前**正式对外**的接入主线。

结论先说：

- 业务侧优先维护 `user-apps/<app-name>/app.schema.ts`
- business schema 只描述应用、认证、服务、资源 fields 与 operations
- 页面 mode、默认 actions、基础字段展示规则优先由 EFS runtime 推导
- 如需少量前端覆盖，只在 `ui` 层写最小 override
- 当前 Vue runtime 仍通过 adapter 落到 legacy controller 结构，但那已经是**内部兼容层**，不是推荐的业务建模入口

---

## 1. 公开入口

当前推荐使用的公开入口：

- `@efs/schema`
  - `defineAppSchema(...)`
  - `createPlatformAppFromSchema(...)`
  - `inferResourceRuntime(...)`
- `@efs/vue`
  - `EfsApp`

`@efs/vue/legacy`、`@efs/vue/shared/*` 仅在确有 runtime/helper 需求时按文档约定使用，不作为首选业务建模入口。

---

## 2. 标准文件形态

标准 demo 已切到下面这条主路径：

```text
user-apps/<app-name>/app.schema.ts
  -> defineAppSchema(...)
  -> createPlatformAppFromSchema(...)
  -> EfsApp
```

参考文件：

- `apps/standard-demo/user-apps/standard-demo/app.schema.ts`
- `apps/standard-demo/src/main.ts`

---

## 3. business schema 该写什么

业务 schema 主要描述：

- `app`：应用 id、标题、默认入口等
- `auth`：登录/登出/组织切换等认证契约
- `services`：本地 dev 服务与 API 服务信息
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

## 4. UI schema 只做最小 override

`ui` 层不重新定义业务，不发明第二套页面 DSL。

当前建议只放：

- `view.mode`
- `fields.<field>.hidden / label`
- `actions.<action>.hidden / placement / label / api / runtime`

其中：

- `api`：把一个 UI action 绑定到 `operations.<name>`
- `runtime`：绑定到平台内建前端动作，比如 `filter`、`refresh`

示意：

```ts
ui: {
  domains: {
    crm: {
      resources: {
        customer: {
          view: { mode: 'crud' },
          fields: {
            createdAt: { hidden: true },
          },
          actions: {
            export: { api: 'export', placement: 'page' },
            filter: { runtime: 'filter' },
          },
        },
      },
    },
  },
}
```

原则是：**平台优先推导，业务只在必要处覆盖。**

---

## 5. runtime 推导规则（当前版本）

`inferResourceRuntime(...)` 当前会基于 resource schema + ui override 推导：

- view mode
- 默认 actions
- 基础 field 行为

当前主要规则：

- 有 `list/create/update/remove` 时默认推导为 `crud`
- 有 `query` 时默认推导为 `report`
- 表格型资源默认具备 `filter` / `refresh` 一类 runtime action
- `create/update/remove/export` 等 operation 可自动生成默认 action 展示位

如果推导不够，再由 `ui` 层做最小 override。

---

## 6. 如何接到平台 runtime

当前做法不是让业务手写 controller tree，也不再要求业务自己写根组件，而是由平台固定入口直接加载 schema：

```ts
import { createApp } from 'vue'
import { createPlatformAppFromSchema } from '@efs/schema'
import { EfsApp } from '@efs/vue'
import { appSchema } from '../user-apps/demo-app/app.schema'

const app = createPlatformAppFromSchema(appSchema)
const appName = appSchema.app.title || appSchema.app.name

createApp(EfsApp, {
  app,
  appName,
}).mount('#app')
```

平台会根据 schema 中声明的 `services + operations` 自动生成默认 HTTP 接线；业务主 authoring 面就是 schema 目录本身。

---

## 7. 对 controller-first 的定位

当前 controller-first 仍然存在，但定位已经改变：

- 可作为 runtime 内部兼容层
- 可作为 adapter 输出形状
- 可用于历史项目迁移过渡
- **不再作为 EFS 对外主文档与首选接入方式**

因此：

- 新文档优先讲 schema-first
- 新 demo 优先走 schema-first
- controller contract 文档保留，但应明确标注 legacy

---

## 8. 最小接入清单

一个新项目至少要有：

1. `user-apps/<app-name>/app.schema.ts`
2. schema -> runtime adapter 文件（如 `app-from-schema.ts`）
3. 平台直接挂载 `EfsApp`
4. 对应 API/service 配置
5. 少量必要的 `ui` override（如确实推导不够）

如果某个页面必须写很多 query/form/detail 布局细节，优先先反问：

- 这是不是平台推导还不够？
- 这是不是应该补进 EFS runtime，而不是回退成业务页手写配置？
