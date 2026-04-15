# App Controller Contract

> 状态：**legacy runtime contract**。当前 EFS 正式对外接入主线已经切到 schema-first：业务侧优先编写 `apps/<app-name>/schemas/app.schema.ts`，通过 `defineAppSchema(...)` + `createPlatformAppFromSchema(...)` 进入 `EfsApp`。本文只保留给 runtime 兼容层、适配器实现和历史迁移参考，不再作为首选公开建模文档。正式入口见 `docs/standards/schema-first-authoring.md`。

## 1. 当前定位

这份文档现在只回答三件事：

1. legacy controller tree 的最小结构是什么
2. schema adapter 当前会产出什么形状
3. 历史 controller-first 项目如果暂时未迁移，最低限度要满足哪些约束

一句话：

> **controller tree 现在是 runtime 兼容层输入，不是业务首选 authoring 面。**

---

## 2. 推荐主路径（非本文）

当前正式主路径是：

```text
apps/<app-name>/schemas/app.schema.ts
  -> defineAppSchema(...)
  -> inferResourceRuntime(...)
  -> createPlatformAppFromSchema(...)
  -> EfsApp
```

业务侧优先维护：
- `fields`
- `operations`
- 最小 `ui` override
- 对应 operation handlers

而不是直接手写：
- `queryFields`
- `columns`
- `formSections`
- `detailFields`
- 大量 controller tree 细节

---

## 3. legacy controller tree 最小结构

当前 legacy tree 仍然采用：

```text
app
  -> auth
  -> main
    -> domains[]
      -> items[]
```

对应最小类型关系：

```ts
interface LegacyAppController {
  kind: 'app'
  auth: LegacyAuthController
  main: LegacyMainController
}

interface LegacyAuthController {
  kind: 'auth'
  login: (input: AuthLoginInput) => AuthLoginResult | Promise<AuthLoginResult>
  logout?: () => void | Promise<void>
  getOrgs?: () => readonly AuthOption[] | Promise<readonly AuthOption[]>
  getCurrentOrgCode?: () => string | undefined
  setCurrentOrgCode?: (orgCode: string) => void | Promise<void>
}

interface LegacyMainController {
  kind: 'main'
  domains: readonly LegacyDomainController[]
  defaultPath?: string
}

interface LegacyDomainController {
  kind: 'domain'
  domain: string
  title?: string
  icon?: string
  order?: number
  items: readonly LegacyResController[]
}

interface LegacyResController {
  kind: 'res'
  domain: string
  res: string
  title?: string
  icon?: string
  order?: number
  runtimeKind?: 'crud' | 'report'
  fields?: readonly ResField[]
  query?: (params: ResQueryParams) => Promise<ResQueryResult>
  save?: (context: ResSaveContext) => Promise<ResSaveResult | void>
  remove?: (item: ResRow) => Promise<ResRemoveResult | void>
  export?: (context: ResExportContext) => Promise<void>
  actions?: Record<string, unknown>
}
```

说明：
- `domain/res` 仍是统一资源身份
- `runtimeKind` 当前最小支持 `crud` / `report`
- 这套结构主要给 adapter 输出和旧 runtime 消费

---

## 4. adapter 与 legacy contract 的关系

`createPlatformAppFromSchema(...)` 当前会把 schema-first 输入桥接成这套结构。

桥接口径大致如下：

### 4.1 资源身份
- `domain.key` -> `LegacyDomainController.domain`
- `resource.key` -> `LegacyResController.res`
- 路径统一为 `domain/res`

### 4.2 runtime kind
- 有 `list/create/update/remove` 时通常推导为 `crud`
- 有 `query` 时通常推导为 `report`
- `ui.view.mode` 可覆盖

### 4.3 handlers
schema adapter 当前会优先桥接：
- `list/query` -> `res.query`
- `create/update` -> `res.save`
- `remove` -> `res.remove`
- `export` -> `res.export`（report 场景优先）

### 4.4 fields
adapter 会基于：
- `fields`
- identity / readonly / required
- `ui.fields`
- runtime 推导规则

生成 legacy runtime 还可消费的字段定义。

也就是说：

> **legacy controller 并不是第一作者写出来的业务模型，而是 schema-first 输入当前被桥接后的运行时形状。**

---

## 5. 历史项目最低约束

如果某个历史项目暂时还没有切到 schema-first，当前至少应满足下面约束：

### 5.1 资源身份统一
- 继续使用 `domain/res`
- 不要增加更深层级资源身份
- 不要给资源名附加 `Resource` 后缀

### 5.2 资源控制器仍以资源为中心
推荐：
- `useUser()`
- `useOrder()`
- `useCustomer()`

不推荐：
- `useUserView()`
- `useResView()`

### 5.3 不要继续扩大 legacy 输入面
不要再新增面向业务的：
- 松散布尔开关
- 大量文案 props
- 新的一套手写 `queryFields / columns / formSections / detailFields` 变体
- 更多 controller-specific action DSL

如果发现还需要新增这类输入，优先反问：
- 这是不是应该进入 schema？
- 这是不是应该由 runtime 推导？
- 这是不是只该作为 adapter/compat 内部细节？

---

## 6. `EfsApp` 的当前角色

`EfsApp` 现在仍是公共入口，但其推荐接线方式已经改变。

### 6.1 推荐接法

```ts
import { adaptAppSchemaToVueController } from '@efs/schema'
import { EfsApp } from '@efs/vue'
import { appSchema } from './app.schema'

export const app = adaptAppSchemaToVueController({
  schema: appSchema,
  auth: { async login() { return { accessToken: 'token' } } },
  resources: {
    'crm/customer': {
      async list() { return { items: [], total: 0 } },
      async create() { return { refresh: true, close: true } },
      async update() { return { refresh: true, close: true } },
      async remove() { return { refresh: true, activeItem: null } },
    },
  },
})
```

```vue
<EfsApp :app="app" />
```

### 6.2 不再推荐的说法
- “业务方最小只需要写 `useApp()`”
- “legacy controller 类型是首选公开建模入口”

现在更准确的说法应该是：
- 业务方最小需要写 `apps/<app-name>/schemas/app.schema.ts`
- `LegacyAppController` 是当前 runtime 兼容层输入

---

## 7. 公开入口边界

当前文档口径：
- `@efs/vue` 根入口只保留 `EfsApp`
- legacy 类型/工具从 `@efs/vue/legacy` 导入
- `@efs/schema` 提供正式 schema-first authoring / inference / adapter 入口
- 其他 runtime helper 只从文档约定子路径引入

---

## 8. 迁移建议

如果你正在维护 controller-first 项目，推荐迁移顺序：

1. 先补 `apps/<app-name>/schemas/app.schema.ts`
2. 把资源 fields 和 operations 收回 schema
3. 用 `createPlatformAppFromSchema(...)` 接住现有 runtime
4. 逐步删除业务侧手写 controller tree 细节
5. 只把 legacy controller 保留在 adapter 输出边界

---

## 9. 最终建议

以后提到这份文档时，建议统一用下面这句话：

> **这是 EFS 当前 legacy runtime contract，不是新的业务 authoring 标准。新的业务 authoring 标准是 schema-first。**
