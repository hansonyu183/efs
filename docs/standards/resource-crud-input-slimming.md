# EntityListView 输入配置瘦身设计

本文用于收敛 `EntityListView` 的输入项，减少把组件内部实现细节暴露给业务页面的情况。

核心原则：

> **只暴露业务必要输入，不暴露组件自己可以推导或内部决定的展示细节。**

补充原则：

> **列表默认应支持“对象数组即表格”；显式列配置只作为增强项存在，并优先内接应用侧 i18n 来解析字段标题。**

---

## 1. 判断规则

当一个输入项准备暴露给业务方时，先判断它属于哪一类：

### A. 必须保留
业务不传，组件就无法知道真实业务意图。

例如：
- 列配置
- 查询配置
- 动作配置
- 表单分段配置
- 详情字段内容
- 数据本身

### B. 应由组件推导
组件可以根据其它输入稳定推导，不需要业务额外告诉它。

例如：
- 是否显示详情区
- 是否显示空态
- 是否显示批量条

### C. 应内部决定
这是组件实现细节，不属于业务语义。

例如：
- 默认标题区怎么排版
- 默认 loading 卡片长什么样
- 详情容器什么时候采用 1/2 列布局规则

### D. 应拆成页面模式，而不是布尔开关
如果一个输入项本质上改变的是页面模式，不应继续使用一个松散布尔值来表达。

例如：
- 普通 CRUD 页
- 带详情侧栏 CRUD 页
- 只读详情页
- 主从页

---

## 2. 建议保留的输入配置

这些属于业务必要输入，应继续保留。

### 2.1 Controller 配置（推荐主入口）
- `rowKey`
- `controller.state.queryValues`
- `controller.state.page`
- `controller.state.pageSize`
- `controller.state.selectedRowKeys`
- `controller.state.activeItem`
- `controller.state.items`
- `controller.state.total`
- `controller.actions.actions`
- `controller.actions.batchActions`
- `controller.actions.rowActions`
- `controller.handlers.query`
- `controller.handlers.save`
- `controller.handlers.remove`
- `controller.handlers.create`
- `controller.handlers.edit`
- `controller.handlers.refresh`
- `controller.handlers.actions`

补充约束：
- `rowKey` 是资源列表的必填 规范，不再猜测/推断行身份
- `controller.actions.*` 只声明动作清单，不再直接承载 `onClick`
- `controller.actions.*` 也不再内联 `label`
- `variant` 优先由动作 `key` 自动推导；只有自定义视觉层级时才显式传入
- 标准动作优先分发到 `create/edit/remove/refresh` 等专用 handler
- 动作文案统一按 `key` 由应用 i18n 解析
- 非标准动作统一由 `controller.handlers.actions[key]` 承接
- `dirty` 由 `EntityListView` 在编辑弹窗内部统一维护，基于表单区域的 input/change 事件标记未保存修改

### 2.2 查询定义
- `queryFields`

补充约束：
- `queryFields` 只保留 `key/type/options` 等结构信息
- 不再内联 `label/title/placeholder/hint` 文案
- 展示文案统一经由应用 i18n 按 `key` 解析，不再额外传 `i18nKey`

### 2.3 列配置
- `columns`（增强项，不应是默认前置条件）

补充约束：
- `columns` 默认通过字段 `key` 解析列表头文案
- 不再直接传 `title`，由应用按 `key` 解析

### 2.4 表单配置
- `formSections`

补充约束：
- `formSections` / `fields` 只表达结构和控件类型
- 区块标题、字段标签、说明文案统一按 `key` 走 i18n

### 2.5 详情内容配置
- `detailFields`

补充约束：
- `detailFields` 只表达字段 key 和 value
- 标签、hint 文案统一按 `key` 走 i18n

说明：新的推荐路径不是把查询/分页/loading/error/busy/dirty 等流程状态拆成很多离散 props，也不再建议把这些流程状态暴露到 `controller.state`；组件内部默认接管这类流程状态，使用方只通过 `controller.state` 外接少量业务状态，通过 `controller.handlers` 提供行为能力。

---

## 3. 建议内收或推导的输入项

这些项不应长期作为 `EntityListView` 顶层输入存在，建议后续逐步内收。

说明：`columns` 不属于应删除项，但应明确降级为**增强配置**，不再作为默认列表模式的必填前置条件。

### 3.1 可直接推导的
#### `showDetail`
建议：**移除，改为推导**。

推导规则建议：
- 有 `detailFields`
- 或存在 `#detail` slot

则显示详情区；否则不显示。

也就是说：
> 详情区是否显示，应该由“有没有详情内容/详情能力”决定，而不是让业务单独传一个布尔开关。

---

### 3.2 应内收到默认实现的文案类
这些项不是不能存在，但优先级应该降低，避免成为顶层必配输入。

例如：
- `queryTitle`
- `querySubtitle`
- `tableTitle`
- `tableSubtitle`
- `detailTitle`
- `detailSubtitle`
- `detailDescription`
- `detailFieldsLabel`
- `pageSummaryLabel`
- `rowsLabel`
- `actionsLabel`
- `requiredHint`

建议：
- 组件给出稳定默认值
- 业务页面只在确有必要时覆盖
- 不把这类文案视为核心输入配置

---

### 3.3 应内收到状态组件默认实现的
例如：
- `loadingTitle`
- `loadingText`
- `errorTitle`
- `errorMessage`
- `emptyTitle`
- `emptyDescription`
- `dialogCloseLabel`
- `clearSelectionLabel`

建议：
- 保留 override 能力
- 但在设计口径上把它们视为“文案覆盖项”，不是核心业务输入

---

### 3.4 应内收到组件默认行为的开关
例如：
- `showPagination`
- `clickableRows`
- `selectableRows`
- `showCreateAction`
- `showRefreshAction`
- `showDeleteAction`
- `showDialogClose`
- `showDialogFooterActions`
- `closeOnBackdrop`

这些开关的问题是：
- 语义弱
- 数量一多就把成品 View 重新变回装配器

建议：
- 能从动作配置推导的，尽量推导
- 能从页面模式推导的，尽量推导
- 只保留少数真正高价值的模式开关

---

## 4. 建议改为“模式”而非零散布尔

### 4.1 详情区
不要再靠：
- `showDetail`

建议改成以下任一方式：

#### 方案 A：内容驱动
- 有 `detailFields` / `detail` slot / `activeItem` 就显示 detail

#### 方案 B：页面模式驱动
增加明确模式，例如：
- `mode: 'crud' | 'crud-with-detail'`

如果后续真的需要扩展，这个比 `showDetail` 更清晰。

---

### 4.2 行为入口
不要同时暴露：
- `showCreateAction`
- `createLabel`
- `pageActions`
- `toolbarActions`

建议：
- 入口存在与否，优先由 `pageActions / toolbarActions` 决定
- `showCreateAction` 这类兼容项后续应逐步弱化或去除

---

## 5. 推荐的输入配置分层

后续建议把 `EntityListView` 的输入只按下面 6 类理解：

### 5.1 数据配置
- `items`
- `activeItem`
- `page/pageSize/pageCount/total`
- `selectedRowKeys`

### 5.2 查询配置
- `filters`
- `filterValues`

### 5.3 列配置
- `columns`（增强）

### 5.4 动作配置
- `actions`
- `batchActions`
- `rowActions`

### 5.5 编辑配置
- `formSections`

### 5.6 状态配置
- `loading`
- `error`
- `busy`
- `dirty`

除此之外的大量标题/显隐/按钮开关，原则上都不应作为核心输入类别长期增长。

---

## 6. 对当前 props 的收敛建议

### 应保留
- `items`
- `columns`（增强）
- `filters`
- `filterValues`
- `actions`
- `batchActions`
- `rowActions`
- `formSections`
- `detailFields`
- `activeItem`
- `selectedRowKeys`
- `loading`
- `error`
- `busy`
- `dirty`
- `page/pageSize/pageCount/total`

### 应弱化为覆盖项
- 各种 `*Title`
- 各种 `*Subtitle`
- 各种 `*Label`
- 各种 `*Description`
- 各种状态文案 props

### 应逐步内收 / 去除
- `showDetail`
- `showCreateAction`
- `showRefreshAction`
- `showDeleteAction`
- `showPagination`（若分页能力始终是该模式默认组成）
- `showDialogClose`
- `showDialogFooterActions`
- `closeOnBackdrop`

### 应降级为增强项，而不是默认基础输入
- `columns`

---

## 7. 最终建议

以后评审 `EntityListView` 时，优先问这三个问题：

1. 这个输入项是业务必须表达的吗？
2. 这个输入项能不能由组件根据已有输入推导？
3. 这个输入项其实是不是页面模式，而不是一个普通布尔开关？

如果第 2 个答案是“能推导”，就不要暴露。 
如果第 3 个答案是“是模式”，就不要继续塞布尔开关。

最终目标是：

> **让 `EntityListView` 更像标准成品 View，而不是把所有展示细节都外抛的装配器。**
