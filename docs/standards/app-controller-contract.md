# App Controller Contract

> 状态：**legacy runtime contract**。当前 EFS 正式对外接入主线已经切到 schema-first：业务侧优先编写 `app.schema.ts`，通过 `defineAppSchema(...)` + `adaptAppSchemaToVueController(...)` 进入 `EfsApp`。本文保留给 runtime 兼容层、适配器实现和历史迁移参考，不再作为首选公开建模文档。正式入口见 `docs/standards/schema-first-authoring.md`。

本文定义 EFS 当前仍在运行时内部使用的 `useApp()` 控制器约定。

目标不是让使用方继续拼装 `EntityListView / ReportView` 的页面配置，而是说明 legacy controller tree 如何承接 schema-first 适配结果，以及历史 controller-first 项目仍需满足哪些基本结构约束：

- 应用入口
- 认证控制器
- 主框架控制器
- `domain/res` 资源控制器
- 资源字段语义

平台再基于这份约定去推导：

- menu
- url
- view identity
- query / list / form / detail 标准定义

> 当前阶段先稳定 **controller tree 与字段语义约定**，不提前固化 `controller -> 具体 view` 的最终映射规则。

---

## 1. 设计目标

EFS 运行时的最终使用目标是：

```ts
const app = useApp()
```

使用方不再直接写：

- `queryFields`
- `columns`
- `formSections`
- `detailFields`
- 页面壳装配逻辑
- route/menu/view 三套平行定义

而是只写控制器树。

---

## 2. 强约定

### 2.1 导航与资源身份统一使用 `domain/res`

这是整个运行时约定的第一原则：

- `domain` = 一级菜单
- `res` = 二级菜单
- 不允许更深层菜单
- `domain + res` 在应用内唯一

统一派生：

- menu key = `domain/res`
- url = `/domain/res`
- view identity = `domain/res`

推荐由平台统一使用辅助函数生成：

```ts
buildResPath('admin', 'user') // -> 'admin/user'
```

### 2.2 controller tree 固定结构

平台只解释下面这棵树：

```ts
useApp()
  -> auth
  -> main
      -> domains[]
          -> items[]
```

推荐的 composable 形态：

- `useApp()`
- `useAuth()`
- `useMain()`
- `useAdmin()` / `useSales()`
- `useUser()` / `useRole()` / `useOrder()`

不推荐：

- `useResView()`
- `useResourceController()`
- 运行时通过松散对象自由拼装 controller tree

### 2.3 资源控制器以资源为中心，不以 view 为中心

二级资源控制器必须表达“资源及其操作”，而不是“某个 view 的配置”。

因此推荐：

```ts
useUser()
useRole()
useOrder()
```

不推荐：

```ts
useUserView()
useResView()
```

---

## 3. 类型约束文件

EFS 约定把可静态约束的部分尽量落到 TypeScript 类型中。

当前参考类型文件：

- `packages/vue/src/controller/app-controller.ts`
- `packages/vue/src/controller/path-helpers.ts`
- `packages/vue/src/controller/field-inference.ts`
- `packages/vue/src/controller/runtime.ts`

其中定义了：

- `AppController`
- `AuthController`
- `MainController`
- `DomainController`
- `ResController`
- `ResField`
- `DomainResPath`
- `buildResPath()`
- `splitResPath()`
- `flattenAppMenuNodes()`
- `findResByPath()`
- `inferFieldUses()`
- `inferListColumns()`
- `inferQueryFields()`
- `inferFormFields()`
- `inferFormSections()`
- `inferDetailFields()`

---

## 4. 最小类型草案

### 4.1 顶层 app controller

```ts
export interface AppController {
  kind: 'app'
  auth: AuthController
  main: MainController
}
```

### 4.2 auth controller

```ts
export interface AuthLoginInput {
  name: string
  pwd: string
  orgCode?: string
}

export interface AuthLoginResult {
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  tokenType?: string
}

export interface AuthController {
  kind: 'auth'
  login: (input: AuthLoginInput) => AuthLoginResult | Promise<AuthLoginResult>
  logout?: () => void | Promise<void>
  getOrgs?: () => readonly AuthOption[] | Promise<readonly AuthOption[]>
  getCurrentOrgCode?: () => string | undefined
  setCurrentOrgCode?: (orgCode: string) => void | Promise<void>
}
```

### 4.3 main controller

```ts
export interface MainController {
  kind: 'main'
  domains: readonly DomainController[]
  defaultPath?: DomainResPath | ''
}
```

### 4.4 domain controller

```ts
export interface DomainController<D extends string = string> {
  kind: 'domain'
  domain: D
  title?: string
  icon?: string
  order?: number
  items: readonly ResController<D, string>[]
}
```

### 4.5 res controller

```ts
export interface ResController<D extends string = string, R extends string = string> {
  kind: 'res'
  domain: D
  res: R
  title?: string
  icon?: string
  order?: number
  fields?: readonly ResField[]
  query?: (params: ResQueryParams) => Promise<ResQueryResult>
  save?: (params: ResSaveParams) => Promise<ResSaveResult | void>
  remove?: (item: ResRow) => Promise<ResRemoveResult | void>
  create?: () => void | Promise<void>
  edit?: (row: ResRow) => void | Promise<void>
  actions?: {
    page?: readonly ResAction[]
    batch?: readonly ResAction[]
    row?: readonly ResRowAction[]
    custom?: Record<string, (payload: ResActionHandlerPayload) => void | Promise<void>>
  }
  state?: {
    queryValues?: Ref<Record<string, string>>
    page?: Ref<number>
    pageSize?: Ref<number>
    selectedRowKeys?: Ref<string[]>
    activeItem?: Ref<Record<string, unknown> | null>
  }
}
```

---

## 5. 字段语义约定

为了更好地自动推断，平台不直接要求使用方写 `columns / queryFields / formSections / detailFields`，而要求使用方写统一的 `fields`。

### 5.1 最小字段模型

```ts
type ResField = {
  key: string
  kind?: 'text' | 'number' | 'bool' | 'date' | 'datetime' | 'enum' | 'ref' | 'tags' | 'json'
  use?: readonly ('query' | 'list' | 'form' | 'detail')[]
  required?: boolean
  readonly?: boolean
  order?: number
  identity?: 'primary' | 'title' | 'code'
  title?: string
  queryType?: 'text' | 'search' | 'date' | 'number' | 'select'
  widget?: 'text' | 'number' | 'switch' | 'date' | 'select' | 'tags' | 'json'
  render?: 'text' | 'status' | 'tags'
  summary?: boolean
}
```

其中：

- `identity` 用于默认推断字段优先级与默认 use
- `order` 用于稳定 list/query/detail/form 的默认顺序
- `title` 是资源字段自身的人类语义名，不是页面级 copy 拼装入口；平台仍应优先走 key-first i18n
- `queryType / widget / render` 是**字段语义上的推断覆盖项**，用于修正平台默认推断，而不是让业务页重新写 view schema
- `summary` 表示该字段适合作为摘要/概览候选，供后续 report/card/runtime 扩展使用

### 5.2 enum / ref 的区分约定

为了让平台更稳定地自动推断，`enum` 和 `ref` 不再只靠同一套弱约定混用，而是显式区分：

#### `enum`
表示资源内部枚举/字典值。

必须至少提供一种：

- `dict`
- `options`

```ts
{ key: 'status', kind: 'enum', dict: 'user-status' }
{ key: 'state', kind: 'enum', options: [...] }
```

#### `ref`
表示指向另一个资源/实体的引用。

必须提供：

- `ref`

可选再补：

- `dict`
- `options`

```ts
{ key: 'roleId', kind: 'ref', ref: 'admin/role' }
{ key: 'orgId', kind: 'ref', ref: 'admin/org', dict: 'org' }
```

对应类型在 `app-controller.ts` / `shared-types.ts` 中被拆成：

- `ResValueField`
- `ResEnumField`
- `ResRefField`
- `ResSelectField`

这样可以通过类型系统约束：

```ts
{ key: 'status', kind: 'enum' } // 不合法
{ key: 'status', kind: 'enum', dict: 'user-status' } // 合法
{ key: 'roleId', kind: 'ref' } // 不合法
{ key: 'roleId', kind: 'ref', ref: 'admin/role' } // 合法
```

### 5.3 `use` 的含义

`use` 表示字段出现的业务区域，而不是具体组件实现细节：

- `query`
- `list`
- `form`
- `detail`

例如：

```ts
fields: [
  { key: 'name', identity: 'title', use: ['query', 'list', 'form', 'detail'] },
  { key: 'status', kind: 'enum', dict: 'user-status', use: ['query', 'list', 'detail'] },
  { key: 'createdAt', kind: 'datetime', use: ['list', 'detail'] },
]
```

---

## 6. 平台自动推断规则

### 6.1 可高度自动推断的部分

#### list columns
平台应优先自动推断列表列：

- `use` 包含 `list` -> 默认进入 columns
- `kind=enum` 且 key 命名接近 `status/state/tier` -> 默认 `status` render
- `kind=tags` 或数组值 -> 默认 `tags` render
- 其他 -> 默认 `text`

#### detail fields
平台可直接根据：

- `use` 包含 `detail`
- `identity`
- `order`

生成详情字段顺序。

### 6.2 可部分自动推断的部分

#### query fields
平台可以自动推断基础类型：

- `enum/ref` -> `select`
- `date/datetime` -> `date`
- `text/code/name` -> `search/text`

并允许通过 `queryType` 做字段级覆盖。

但“是否应出现在默认查询区”仍优先依赖 `use`。

#### form fields
平台可以自动推断基础 widget：

- `text` -> text input
- `number` -> number input
- `bool` -> switch/checkbox
- `date/datetime` -> date input
- `enum/ref` -> select

并允许通过 `widget` 做字段级覆盖。

#### list columns
平台可以自动推断默认 render：

- `status/state/tier` -> `status`
- `tags` -> `tags`
- 其他 -> `text`

并允许通过 `render` 做字段级覆盖。

但表单分组、复杂联动、条件显示不属于本版最小自动推断范围。

---

## 7. 默认推断优先级

为了减少使用方标注量，平台可以使用下面的默认规则。

### 7.1 `identity`

- `primary`
  - 默认进入 `detail`
  - 通常不进入 `form`
- `title`
  - 默认进入 `query/list/form/detail`
- `code`
  - 默认进入 `query/list/detail`

### 7.2 `kind`

- `enum`
  - 默认进入 `query/list/form/detail`
- `ref`
  - 默认进入 `query/list/form/detail`
- `datetime`
  - 默认进入 `list/detail`
- `date`
  - 默认进入 `query/list/detail`
- `text/number/bool`
  - 默认进入 `list/form/detail`

### 7.3 key 命名启发式

平台可使用 key 命名提高默认推断质量：

- `name` / `title` -> 主文本字段
- `code` -> 编码字段
- `status` / `state` -> status-like 字段
- `tags` -> tags-like 字段
- `createdAt` / `updatedAt` -> 时间字段
- `xxxId` -> ref 候选
- `isXxx` / `enabled` -> bool 候选

命名启发式只能作为默认兜底，不能替代显式 `kind`。

---

## 8. 运行时辅助能力

在当前阶段，平台至少应提供下面这批 helper，而不是要求业务方自己重复做路由/menu/schema 推导：

### 8.1 路径与定位

- `buildResPath(domain, res)`
- `splitResPath(path)`
- `findResByPath(app, path)`
- `listAllResControllers(app)`

### 8.2 菜单推导

- `flattenAppMenuNodes(app)`

它直接把：

```ts
app.main.domains -> domain.items
```

推成可交给 `buildSidebarMenuTree()` 的扁平菜单节点数组。

### 8.3 字段推导

- `inferFieldUses(field)`
- `inferFieldOrder(field)`
- `inferListColumns(res)`
- `inferQueryFields(res)`
- `inferFormFields(res)`
- `inferFormSections(res)`
- `inferDetailFields(res)`

也就是说，当前阶段先把：

> `controller tree -> menu/path/标准定义默认值`

这条链路做起来。

### 8.4 共享运行时桥接 helper

当前这条 bridge 仍然是共享 helper，但它更偏内部运行时装配：

- `resolveResRuntime(app, path, options)`
- `buildResCrudRuntime(app, path, options)`

其中建议的对外中性入口是：

- `resolveResRuntime(app, path, options)`

当前它内部仍然先委托给：

- `buildResCrudRuntime(app, path, options)`

也就是说现在先把解释入口抽象出来，但不在此时把未来所有 view mapping 规则定死。

它会负责：

- `path -> res controller` 定位
- 根据资源当前声明选择运行时 kind（当前最小支持 `crud` / `report`）
- `fields -> query/list/form/detail` 默认推导
- 把 `ResController` 桥接成当前 view 可消费的内部 runtime controller（不再作为推荐公开契约）
- 生成 detail 字段的默认值格式化逻辑

对应内部运行时类型：

- `ResCrudRuntimeOptions`
- `ResCrudRuntime`

当前 bridge 已继续上收了几项运行时页面默认值：

- `pageSizeOptions`
- `selectableRows`
- `title`
- `rowKey`

同时，共享层现在已经补上两层页面壳：

- `ResolvedResPage`
- `EfsApp`

其中：

- `ResolvedResPage` 负责消费 `ResRuntime`，并按 `runtime.kind` 分发到当前已接入的共享 view（内部实现）
- `EfsApp` 负责再往上收一层，把 `MainPage` / sidebar / 内部 auth session / route.path / `resolveResRuntime()` 一起包起来（公共入口）

`ResolvedResPage` 当前职责：

- `kind='crud'` -> `EntityListView`
- `kind='report'` -> `ReportView`
- 其他 kind -> 显式未接入提示
- runtime 不存在 -> 统一的资源不存在提示

`EfsApp` 当前职责：

- 接收 `app: AppController`
- 从 browser history 自动读取当前 `route.path`
- 内部调用 `flattenAppMenuNodes(app)` 生成 sidebar
- 内部调用 `resolveResRuntime(app, route.path, options)` 解析资源运行时
- 用 `MainPage + ResolvedResPage` 组合成默认应用壳

这样业务方已经可以直接写成：

```vue
<EfsApp :app="useApp()" />
```

如果是工作台这类自定义内容页，也可以写成：

```vue
<EfsApp :app="useApp()" app-name="统一工作台">
  <!-- workbench/dashboard content -->
</EfsApp>
```

其中 `AppController` 只保留运行时 controller 结构；像 `appName`、`brandIcon` 这类壳层品牌输入改由 `EfsApp` 自身接收。`EfsApp` 默认主题为 `dark`。对使用方来说，公开建模入口应区分为：`AppController` 负责业务运行时，`EfsApp` 负责应用壳品牌与入口装配。

当前默认应用壳还额外做了四项收口：

- 语言 / 主题切换从 more 菜单移到 topbar，仅保留 icon 入口
- 资源列表默认去掉 `资源列表` 标题以及重复的总数/当前行数文案
- 工作台等非 `domain/res` 页面也可以通过 `EfsApp` 的默认 slot 复用同一套 app shell
- 手机端查询入口改成“摘要条 + 底部抽屉”，不再在列表头右侧放一个弱提示式 `筛选` 按钮

如果要补品牌/组织等额外壳配置，再按需传额外 props；资源定义本身只需要 `useApp()`。

### 8.5 `EfsApp` 运行时最小接线

当前共享层已经通过 `EfsApp` 证明：

- 业务方资源入口最小可以只传 `useApp()`
- 共享 app 壳统一处理 sidebar / route / runtime / view 分发
- 当前最小已接通 `kind='crud'` 与 `kind='report'`
- 其余 kind 先落到显式未接入提示，而不是静默失败

```ts
const app = useApp()
```

至少已经可以驱动：

- sidebar menu
- `/:domain/:res` route
- path -> res controller lookup
- `fields -> query/list/form/detail` 默认推导
- 现有 `EntityListView` 渲染

参考文件：

- `packages/vue/src/controller/app-controller.ts`
- `packages/vue/src/controller/path-helpers.ts`
- `packages/vue/src/controller/runtime.ts`
- `packages/vue/src/pages/ResolvedResPage.vue`（内部）
- `packages/vue/src/pages/EfsApp.vue`（公共入口）

说明：`@efs/vue` 根入口当前只保留 `AppController` 与 `EfsApp`；`buildResPath()`、`splitResPath()`、`flattenAppMenuNodes()`、`findResByPath()`、`resolveResRuntime()` 等 helper 应从对应 controller 子路径导入。

## 9. 当前不提前定型的部分

为了避免过早把平台做死，下面这些先不作为强约定：

- `ResController -> EntityListView / ReportView / WorkflowView` 的固定映射
- 多级菜单
- breadcrumb 规则
- 表单 section/group 细分约定
- 复杂联动/依赖显示
- query range 的通用建模
- report/workflow 的最终 controller 形态

当前阶段先定住：

- app tree
- `domain/res` 身份规则
- res controller 最小能力
- `fields` 语义约定

---

## 10. 标准接法参考

```ts
import type { AppController } from '@efs/vue'
import type { AuthController, DomainController, MainController, ResController } from '@efs/vue/controller'

export function useAuth(): AuthController {
  return {
    kind: 'auth',
    async login({ name, pwd, orgCode }) {
      return {
        accessToken: `${name}:${pwd}:${orgCode || 'default'}`,
        expiresAt: '2099-01-01T00:00:00.000Z',
      }
    },
    async getOrgs() {
      return [{ key: 'default', value: 'default', title: '默认组织' }]
    },
    getCurrentOrgCode() {
      return 'default'
    },
  }
}

export function useUser(): ResController<'admin', 'user'> {
  async function query({ queryValues, page, pageSize }) {
    return { items: [], total: 0 }
  }

  async function save() {
    return { refresh: true, close: true }
  }

  async function remove() {
    return { refresh: true }
  }

  return {
    kind: 'res',
    domain: 'admin',
    res: 'user',
    title: 'user',
    fields: [
      { key: 'id', identity: 'primary', readonly: true, use: ['detail'] },
      { key: 'name', identity: 'title', queryType: 'search' },
      { key: 'status', kind: 'enum', dict: 'user-status', use: ['query', 'list', 'detail'], render: 'status' },
      { key: 'roleId', kind: 'ref', ref: 'admin/role', use: ['query', 'form', 'detail'] },
      { key: 'createdAt', kind: 'datetime', use: ['list', 'detail'] },
    ],
    query,
    save,
    remove,
  }
}

export function useAdmin(): DomainController<'admin'> {
  return {
    kind: 'domain',
    domain: 'admin',
    items: [useUser()],
  }
}

export function useMain(): MainController {
  return {
    kind: 'main',
    domains: [useAdmin()],
  }
}

export function useApp() {
  return {
    kind: 'app',
    auth: useAuth(),
    main: useMain(),
  } satisfies AppController
}
```

如果业务侧是声明式 app tree，优先推荐 `const app = { ... } satisfies AppController`：既保留对象字面量推断，又能在定义处校验 `auth/main/domains/items` 整棵树是否满足 `AppController` 约束。

---

## 11. 最终建议

EFS 下一阶段要解决的，不是“如何继续让使用方写更复杂的 view controller”，而是：

> **如何让使用方只写 `useApp()` 及其资源控制器树，平台再从统一的 `domain/res + fields` 约定自动推出标准页面能力。**

因此应优先推进：

1. 固化 `App/Main/Domain/Res/Auth` 类型
2. 固化 `domain/res` 身份规则
3. 固化 `fields` 的语义约定
4. 再在此基础上演进自动推断与 view runtime
