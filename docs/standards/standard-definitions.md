# 标准定义说明

本文用于统一 EFS 中关于“schema / 规范 / 实现”的口径，避免把同一能力拆成多份定义，造成不必要复杂度。

## 1. 当前统一原则

EFS 当前阶段采用：

> **标准定义 = schema = 规范 的统一表达。**

也就是说，在 EFS 里：
- 不刻意维护一份独立 schema
- 也不再刻意维护另一份平行 规范
- 而是尽量让一份标准定义同时承担两种职责

这份标准定义既回答：
1. **业务应该怎么声明功能**
2. **组件必须支持到什么程度**

---

## 2. 为什么这样更合适

对于当前 EFS 所处阶段，分开维护 schema 和 规范 往往会带来额外复杂度：

1. **重复描述**
 - 同一功能写两遍
2. **容易漂移**
 - 一边改了，另一边没改
3. **维护成本更高**
 - 多一层文档、多一层解释、多一层校验心智
4. **团队理解成本更高**
 - 大家需要先分辨“这到底算 schema 还是 规范”

因此，EFS 当前采用更实用的策略：

> **标准定义只保留一份，测试和实现去兑现它。**

---

## 3. 三层结构怎么理解

虽然不再强调 schema / 规范 双轨，但仍然保留三个清晰层次：

### 3.1 标准定义层
定义“页面和组件应该怎么表达能力”。

例如：
- `FilterField`
- `DataColumn`
- `ResourceAction`
- `FormSection`
- `DetailField`

### 3.2 实现层
负责真正把标准定义渲染出来、执行出来。

例如：
- `EntityListView`
- `EntityListTable`
- `DataTable`
- `ActionBar`

### 3.3 验证层
负责保证实现没有偏离标准定义。

例如：
- source tests
- demo dogfood
- CI

---

## 4. 推荐口径

以后在 EFS 中，尽量统一使用“标准定义”这个说法，而不是把同一件事反复拆成 schema 和 规范 两套概念。

### 推荐说法
- `queryFields` 是查询条件标准定义
- `columns` 是列表列标准定义
- `actions / batchActions / rowActions` 是动作标准定义
- `formSections` 是表单分段标准定义
- `detailFields` 是详情字段标准定义

### 不推荐说法
- 先说这是一套 schema，再额外再说它还有一套平行 规范
- 为同一功能维护两份描述文件，只是名字不同

---

## 5. 当前典型标准定义

### 查询
- `queryFields`
- `controller.state.queryValues`
- `ResourceCrudQueryField`
- `ResourceCrudQueryOption`

### 列表
- `columns`
- `ResourceCrudColumn`
- `controller.state.selectedRowKeys`

### 动作
- `ResourceCrudAction`
- `controller.actions.actions`
- `controller.actions.batchActions`
- `controller.actions.rowActions`

### 表单
- `formSections`
- `FormSection`
- `FormFieldDescriptor`

### 详情
- `detailFields`
- `DetailField`

### 状态
- `loading`
- `error`
- `empty`
- `LoadingState`
- `EmptyState`
- `ErrorState`

---

## 6. 什么时候再考虑拆分 schema / 规范

只有在下面这些情况明显成立时，才考虑把标准定义拆成两层：

1. 同一份定义要被多个完全不同实现消费
 - 例如多个渲染器 / 平台
2. 存在独立元数据平台
 - 一份给配置平台
 - 一份给组件库承诺
3. 下游消费者显著增多
 - 需要更强的独立稳定承诺管理

在那之前，EFS 默认坚持：

> **标准定义单一真相源。**

---

## 7. 最终建议

以后在评审、设计和文档中，优先使用下面这套说法：

- 这是**标准定义**
- 组件实现要支持这份标准定义
- 测试和 demo 用来验证这份标准定义被正确兑现

而不是：

- 这里一份 schema
- 那里一份 规范
- 再额外解释两者区别

这样更简洁，也更适合 EFS 当前阶段。