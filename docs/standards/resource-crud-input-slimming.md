# 资源 CRUD 输入瘦身设计

> 状态：本文已按 **schema-first** 口径更新。当前 EFS 不再把 `EntityListView` 当成业务侧主要 authoring 面；业务侧优先维护 `app.schema.ts`，由 runtime inference + adapter 生成当前 CRUD view 所需输入。旧的 `queryFields / columns / formSections / detailFields / controller.handlers.*` 只作为 legacy/runtime 兼容层讨论对象。

本文用于收敛 CRUD 资源页输入项，减少把运行时内部实现细节重新暴露给业务页面的情况。

核心原则：

> **业务只声明资源语义；页面结构、默认动作、基础展示规则优先由平台推导。**

---

## 1. schema-first 下，业务真正应该提供什么

当前业务侧主输入应集中在 `app.schema.ts`：

### 1.1 business schema
- `fields`
- `operations`
- 少量 app/auth/services 信息

资源层当前核心约束：
- `list`：CRUD 列表读取
- `get/create/update/remove`：标准资源操作
- 扩展后端动作也直接进入 `operations`

### 1.2 最小 UI override
只在推导不够时补：
- `view.mode`
- `fields.<field>.hidden / label`
- `actions.<action>.hidden / placement / label / api / runtime`

### 1.3 adapter handler 接口
当 schema 接到现有 Vue runtime 时，业务只需要补真实 handler：
- `list`
- `create`
- `update`
- `remove`
- 以及必要的扩展 operation handler（如 `export`）

也就是说：

> **业务现在主要提供 schema + operation handlers，而不是手拼一整套 CRUD view 配置。**

---

## 2. 哪些能力应该由平台推导

以下能力原则上不应再成为 business authoring 主输入：

### 2.1 页面 mode
优先由 operations 推导：
- 有 `list/create/update/remove` → `crud`
- 有 `query` → `report`
- 必要时才用 `ui.view.mode` 覆盖

### 2.2 默认动作入口
优先由 operations + runtime 规则推导：
- `create` → 默认页面级入口
- `update` → 默认行级入口
- `remove` → 默认行级入口
- `export` → 默认页面级入口
- `filter` / `refresh` → 默认 runtime action

### 2.3 基础字段展示规则
优先由 field schema 推导：
- identity / readonly / required
- 基础 widget / render 倾向
- 列表、查询、表单、详情的默认参与方式

### 2.4 流程状态
优先由 runtime 内部接管：
- loading
- error
- empty
- dirty
- dialog open/close
- pagination 过程状态

---

## 3. 哪些旧输入应视为 legacy compat

下面这些能力不是“永远不能存在”，但已经不应作为对外推荐的主 authoring 面：

### 3.1 view 标准定义类
- `queryFields`
- `columns`
- `formSections`
- `detailFields`

口径：
- 在 legacy runtime/controller 层仍然存在
- 但它们应越来越多地由 schema inference + adapter 生成
- 新文档不再把它们当成业务首要输入

### 3.2 controller 状态类
- `controller.state.queryValues`
- `controller.state.page`
- `controller.state.pageSize`
- `controller.state.selectedRowKeys`
- `controller.state.activeItem`
- `controller.state.items`
- `controller.state.total`

口径：
- 这是 runtime/controller 层状态，不是业务 schema 主体
- 业务侧只在 adapter handler 边界感知必要参数

### 3.3 controller handler 类
- `controller.handlers.query`
- `controller.handlers.save`
- `controller.handlers.remove`
- `controller.handlers.actions`

口径：
- 对外推荐已经切到 operation handlers：`list/create/update/remove/...`
- `query/save/remove` 等组合型 handler 是当前兼容旧 runtime 的桥接形态

---

## 4. 应继续内收的实现细节

下面这些即使在 legacy runtime 层，也应优先视为内部实现细节，而不是业务建模入口：

### 4.1 文案覆盖项
例如：
- `queryTitle`
- `tableTitle`
- `detailTitle`
- `rowsLabel`
- `actionsLabel`
- `requiredHint`

建议：
- 由平台给稳定默认值
- 业务只在特殊品牌/术语场景覆盖

### 4.2 状态文案项
例如：
- `loadingTitle`
- `loadingText`
- `errorTitle`
- `errorMessage`
- `emptyTitle`
- `emptyDescription`

建议：
- 归入统一状态组件默认实现
- 不当作业务核心输入

### 4.3 松散布尔开关
例如：
- `showDetail`
- `showPagination`
- `clickableRows`
- `selectableRows`
- `showCreateAction`
- `showRefreshAction`

建议：
- 能从 mode 推导的就推导
- 能从 actions 推导的就推导
- 不把成品 View 重新退化为装配器

---

## 5. 推荐分层

当前推荐把 CRUD 资源页理解成下面三层：

### 5.1 business schema 层
回答：
- 资源是什么
- 有哪些字段
- 有哪些后端 operations

### 5.2 UI override 层
回答：
- 哪些字段隐藏/改名
- 哪些 action 显示、隐藏、放在哪
- 哪些 action 绑定 operation，哪些绑定 runtime action

### 5.3 runtime / adapter 层
回答：
- 如何把 schema 接到现有 Vue controller/runtime
- 如何生成实际 view 所需的 query/list/form/detail/action 输入

---

## 6. 最终建议

以后评审 CRUD 资源页输入时，优先按下面顺序追问：

1. 这是不是资源 schema 本身就能表达？
2. 这是不是 `ui` 最小 override 就能表达？
3. 这是不是 adapter/runtime 应该自动推导？
4. 如果还需要显式输入，它是否只是 legacy compat，而不是新的公开 authoring 面？

一句话：

> **EFS 当前要做的不是继续扩大 CRUD view 配置面，而是把业务输入收回 schema，把页面细节收回 runtime。**
