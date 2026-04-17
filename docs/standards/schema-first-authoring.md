# Schema-First Authoring

本文定义 EFS 当前**源码优先**的标准接入主线。

结论先说：

- 业务侧只需要维护 `apps/<app-name>/schemas/app.schema.ts`
- 仓库内统一 alias 入口是 `@efs/schema`
- 对 schema 的标准检查入口只有 `efs-lint`
- 运行时壳、页面实现、导航/helper、controller 结构都属于平台内部源码，不属于稳定发布契约

---

## 1. 标准入口

当前唯一推荐使用的 schema 入口：

- `@efs/schema`
  - `defineAppSchema(...)`
  - `createAppFromSchema(...)`
  - `createAppPropsFromSchema(...)`
  - `inferResourceRuntime(...)`

当前唯一推荐使用的 CLI：

- `efs-lint <app-root>`

不再属于稳定契约的内容：

- `@efs/vue`
- `@efs/vue` 内部 runtime 路径
- `@efs/vue/shared/*`
- `@efs/presets`
- controller / runtime helper 子路径

---

## 2. 标准文件形态

标准接入主路径：

```text
apps/<app-name>/schemas/app.schema.ts
  -> defineAppSchema(...)
  -> createAppFromSchema(...)
  -> internal platform runtime
```

参考文件：

- `apps/agentos/schemas/app.schema.ts`

`src/main.ts` 之类的 runtime 入口文件仍然存在，但它们由平台内部维护，不作为业务侧公开 authoring contract。

---

## 3. business schema 该写什么

业务 schema 主要描述：

- `app`：应用 id、标题、默认入口等
- `auth`：登录/登出/组织切换等认证契约
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

## 4. UI schema 只做最小 override

`ui` 层不重新定义业务，不发明第二套页面 DSL。

当前建议只放：

- `view.mode`
- `fields.<field>.hidden / label`
- `actions.<action>.hidden / placement / label / api / runtime`

其中：

- `api`：把一个 UI action 绑定到 `operations.<name>`
- `runtime`：绑定到平台内建前端动作，比如 `filter`、`refresh`

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

## 6. 对旧 controller/internal 的定位

旧 controller tree、runtime shape、shared helper 路径仍可能存在于仓库内部，
但它们都只是**平台内部实现细节**：

- 不作为业务侧公开建模入口
- 不作为正式发布 package contract
- 不作为对外文档推荐 import path

以后如果文档需要提到它们，必须明确标注为 **internal-only**。

---

## 7. 最小接入清单

一个新项目至少要有：

1. `apps/<app-name>/schemas/app.schema.ts`
2. 对应 API/service 配置
3. `efs-lint` 校验流程
4. 少量必要的 `ui` override（如确实推导不够）

如果某个页面必须写很多 query/form/detail 布局细节，优先先反问：

- 这是不是平台推导还不够？
- 这是不是应该补进 EFS runtime，而不是回退成业务页手写配置？
