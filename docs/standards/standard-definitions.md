# 标准定义说明

本文用于统一 EFS 中关于“business schema / UI override / runtime 实现”的口径，避免把同一能力拆成多份定义、又让概念混在一起。

## 1. 当前统一原则

EFS 当前阶段采用：

> **business schema 是单一业务真相源；UI override 是最小前端补充；runtime/adapter 负责把它们兑现成可运行页面。**

也就是说，在 EFS 里：
- 不再让业务优先手写一整套 controller/view 标准定义
- 不再为同一能力维护“业务 schema 一份、页面配置一份、文档规范一份”三套平行入口
- 而是优先收敛到一条主链路：

```text
apps/<app-name>/schemas/app.schema.ts
  -> business schema
  -> ui overrides
  -> runtime inference / adapter
  -> actual page runtime
```

---

## 2. 三层结构怎么理解

### 2.1 business schema 层
定义“业务到底提供什么”。

例如：
- `app`
- `auth`
- `services`
- `domains[].resources[]`
- `fields`
- `operations`

这是企业侧主要 authoring 面。

### 2.2 UI override 层
定义“前端展示上哪些地方需要少量覆盖”。

例如：
- `view.mode`
- `fields.<field>.hidden / label`
- `actions.<action>.hidden / placement / label / api / runtime`

这层不是第二套业务建模语言，而是最小 override。

### 2.3 runtime / adapter 层
负责真正把 schema 推导和渲染出来。

例如：
- `inferResourceRuntime(...)`
- `createPlatformAppFromSchema(...)`
- `EfsApp`
- 各类内部 CRUD / Report runtime

这层回答：
- 页面 mode 是什么
- 默认 actions 是什么
- 字段如何参与 list/query/form/detail
- 如何接到现有 Vue controller/runtime

---

## 3. 为什么这样更合适

对于当前 EFS 阶段，最容易失控的是：

1. **重复描述**
   - 同一资源既写 operations，又手写一套 controller actions/view config
2. **语义漂移**
   - business contract 说一套，demo/文档/运行时又吃另一套
3. **维护成本高**
   - 多一层页面 DSL、多一层解释、多一层兼容心智
4. **外部契约不收敛**
   - 业务方误把内部 runtime 输入当成稳定公开 API

因此，EFS 现在采用更收敛的策略：

> **业务只写 schema，页面尽量靠 runtime 推导。**

---

## 4. 当前推荐说法

以后在 EFS 里，尽量统一使用下面这套表达：

### 推荐说法
- `fields` 是资源字段业务定义
- `operations` 是资源后端能力定义
- `ui.actions` 是动作入口 UI override
- `inferResourceRuntime(...)` 负责 runtime 推导
- `createPlatformAppFromSchema(...)` 负责接到当前 Vue runtime

### 不推荐说法
- 先写一套 business schema，再默认还要手写一套完整 controller tree
- 把 `queryFields / columns / formSections / detailFields` 当成新的主 authoring 面
- 为同一能力同时维护 schema、controller 配置、平行规范三份主入口

---

## 5. 当前典型定义

### 5.1 资源 business schema
- `fields`
- `operations.list`
- `operations.query`
- `operations.get`
- `operations.create`
- `operations.update`
- `operations.remove`
- 其他扩展 operations

### 5.2 资源 UI override
- `view.mode`
- `fields.<field>.hidden / label`
- `actions.<action>.placement / api / runtime / hidden / label`

### 5.3 runtime 推导结果
- CRUD / Report mode
- 默认 `create/update/remove/export/filter/refresh` 行为
- 字段在列表/查询/表单/详情中的默认参与方式

### 5.4 legacy compat 定义
下面这些仍可能存在于兼容层，但不再是公开主入口：
- `LegacyAppController`
- `LegacyResController`
- `queryFields`
- `columns`
- `formSections`
- `detailFields`
- `controller.handlers.query/save/remove`

---

## 6. 什么时候再考虑拆更细

只有在下面情况明显成立时，才考虑把 schema、UI contract、runtime contract 拆成更重的独立层：

1. 同一份 business schema 要被多个完全不同前端 runtime 消费
2. 存在独立元数据平台/低代码平台
3. 需要对外提供更强的版本化稳定承诺
4. adapter 已不再只是过渡层，而成为长期独立产品边界

在那之前，EFS 默认坚持：

> **business schema 单一真相源，UI override 最小化，runtime 负责兑现。**

---

## 7. 最终建议

以后在评审、设计和文档中，优先用下面这套话：

- 这是 business schema 还是 UI override？
- 这件事是否应该由 runtime 自动推导？
- 这是不是只是 legacy compat，而不该继续扩大成公开 authoring 面？

一句话：

> **EFS 当前的“标准定义”不再是手写一大套页面配置，而是 schema-first 输入加 runtime 推导规则。**
