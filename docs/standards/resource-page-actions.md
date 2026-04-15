# 资源页 Action 设计规范

> 状态：本文已按 **schema-first** 口径更新。当前资源页 action 的正式来源不再是业务侧手写 `pageActions / toolbarActions / batchActions / rowActions`，而是：**resource `operations` + `ui.actions` + runtime inference**。

本文定义 EFS 标准资源页中的 action 分层、放置位置、优先级、重复约束，以及危险操作的处理规则。

---

## 1. 当前主模型

当前 action 设计分三层理解：

### 1.1 operation
业务 schema 中所有会调用后端的动作，统一定义在：
- `resource.operations`

包括：
- `list`
- `query`
- `get`
- `create`
- `update`
- `remove`
- `export`
- `approve`
- 其他扩展 operation

### 1.2 UI action
UI 层只回答“如何展示和触发动作入口”：
- `hidden`
- `placement`
- `label`
- `api`
- `runtime`

其中：
- `api: 'export'` 表示绑定到 `operations.export`
- `runtime: 'filter'` 表示绑定到平台内建前端动作

### 1.3 runtime inference
平台会根据：
- resource mode
- operations
- ui overrides

自动推出默认 action 清单与放置位置。

也就是说：

> **operation 是业务能力本体，action 是 UI 入口。**

---

## 2. placement 标准层级

当前标准 placement 从大到小：

1. `page` — 页面级
2. `batch` — 选中集合级
3. `row` — 单行级
4. `detail` — 详情级

说明：
- 旧文档里的 `toolbarActions` 语义，现在优先归入 runtime action（如 `filter` / `refresh`）或放到页面级 action 区处理
- 是否显示独立查询条、筛选栏按钮、摘要条入口，属于 runtime/view 实现细节，不再要求业务侧手写一套 toolbar action DSL

---

## 3. placement 判断规则

遇到一个动作时，按下面顺序判断：

1. **只依赖当前 row 吗？**
   - 是：优先 `row`
2. **只在多选集合上成立吗？**
   - 是：优先 `batch`
3. **主要是页面/当前资源整体入口吗？**
   - 是：优先 `page`
4. **只在详情面板上下文中成立吗？**
   - 是：放 `detail`

---

## 4. 默认推导规则

当前 runtime 默认会做这些推导：

### 4.1 operation → 默认 action
- `create` → `page`
- `update` → `row`
- `remove` → `row`
- `export` → `page`

### 4.2 runtime action
表格型资源默认具备：
- `filter`
- `refresh`

这意味着：
- 业务一般不需要手动声明“查询/刷新/筛选按钮全家桶”
- 如需改隐藏、位置、标签，再在 `ui.actions` 做最小 override

---

## 5. 常见动作放置建议

### 5.1 页面级 `page`
适合放：
- 新建
- 导入
- 导出模板
- 全量导出
- 页面模式切换
- 低频但不依赖 row / batch 的业务动作

判断标准：
- 没有当前 row、没有选中项，这个动作依然成立

### 5.2 批量级 `batch`
适合放：
- 批量删除
- 批量启用/停用
- 批量导出选中项
- 批量分配负责人

判断标准：
- 没有选中项就不成立

### 5.3 行级 `row`
适合放：
- 编辑
- 删除
- 审批
- 启用/停用
- 单条导出
- 详情入口

判断标准：
- 拿到当前 row 就能执行

### 5.4 详情级 `detail`
适合放：
- 审计日志
- 附件预览
- 详情态补充操作
- 从详情面板触发的二次业务动作

判断标准：
- 这个动作主要属于详情阅读/详情编辑上下文

---

## 6. 禁止重复摆放规则

### 6.1 不要把同一作用范围的同一动作重复摆放
例如：
- 同一个“编辑”不要同时出现在 `page` 和 `row`
- 同一个“批量删除”不要同时在两个 batch 入口重复出现

### 6.2 允许重复的只有两种情况

#### 情况 A：同名但作用范围不同
例如：
- 全量导出 → `page`
- 导出选中项 → `batch`
- 导出当前行 → `row`

这是 scope 不同，不算重复。

#### 情况 B：主入口 + 兼容入口
例如：
- 桌面端主入口在 `row`
- 移动端在详情面板内保留 `detail` 入口

这类重复应由 runtime 适配层少量控制，不宜让业务侧长期手写两份。

---

## 7. 危险操作规则

### 7.1 默认放置
- 单条删除 → `row`
- 批量删除 → `batch`
- 页面级“清空/全量删除” → 原则上禁止；必须极慎重并加二次确认

### 7.2 视觉与交互要求
- 必须使用危险态视觉
- 必须有 confirm
- 批量危险动作必须明确显示作用范围
- 不允许把危险动作伪装成普通默认按钮

### 7.3 默认顺序
行级危险动作不应抢第一入口，推荐：
- 查看 / 编辑 / 更多 / 删除

---

## 8. 与当前 runtime 的关系

### 8.1 schema-first 推荐写法
示意：

```ts
ui: {
  domains: {
    crm: {
      resources: {
        customer: {
          actions: {
            export: { api: 'export', placement: 'page' },
            approve: { api: 'approve', placement: 'row' },
            filter: { runtime: 'filter' },
            refresh: { runtime: 'refresh' },
          },
        },
      },
    },
  },
}
```

### 8.2 legacy runtime 兼容层
当前 adapter 仍会把这些 action 继续桥接到旧 runtime 可消费的位置，但那已经是实现细节，不是业务首选 authoring 面。

---

## 9. 最终建议

以后讨论资源页 action 时，优先用下面这套话：

- `operations` 定义后端业务能力
- `ui.actions` 定义动作入口如何展示
- runtime 自动推导默认动作与 placement
- 只有推导不够时，业务才补最小 override

一句话：

> **不要再把资源页 action 设计成一大坨手写按钮配置；要把它收敛成 operation 驱动、UI 最小覆盖、runtime 自动分发。**
