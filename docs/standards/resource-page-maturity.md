# 资源页组件成熟度评估

本文用于说明 EFS 当前资源页相关组件的成熟度、适用范围、是否可以直接作为标准资产使用，以及下一阶段应优先补厚哪些能力。

## 总结结论

当前 EFS 已具备一套**资源页标准壳组件体系**，可以统一：

- 查询列表页
- 分页列表页
- 标准 CRUD 资源页（查询 + 列表 + 详情 + 弹窗表单）
- 列表 + 详情页
- 表单页
- 只读详情页
- 主从页
- 弹窗新增/编辑页
- 报表页

但当前成熟度并不完全一致：

- **列表相关组件最成熟**
- **表单 / 详情 / 主从 Panel 已进入可用阶段，但仍需继续加厚**

## 成熟度分级说明

- **P0 / 已可直接作为标准资产**：可以优先要求业务项目使用
- **P1 / 已有标准壳，但建议继续加厚**：适合先纳入标准库，再持续演进
- **P2 / 已有方向，但目前更像占位或轻骨架**：先保留接口，不宜宣称为厚成品

## 组件成熟度表

| 组件 | 当前成熟度 | 现状判断 | 是否适合作为标准资产 | 下一步重点 |
|---|---|---|---|---|
| 查询区 | P0 | 已具备标准查询头部和扩展位 | 是 | 继续补查询字段组合标准写法 |
| EntityListTable | P0 | 已具备列设置、分页、移动端卡片 fallback、tableKey 等能力 | 是 | 继续补真实资源列表用例 |
| EntityListView | P0 | 已把 EntityListTable / DetailPanel / CrudDialog 收敛成标准 CRUD View，支持过滤、分页、详情侧栏、create/edit 弹窗、默认表单，并结合 `ActionBar + LoadingState + EmptyState + ErrorState` 提供 `pageActions / toolbarActions / batchActions` 等动作标准定义；列表默认支持对象数组零配置输入，显式 `columns` 退为增强项 | 是 | 继续补移动端批量交互与更细的操作权限语义 |
| SimpleTablePanel | P0 | 适合作为轻量标准表格壳 | 是 | 继续补 empty/error/loading 约束 |
| FormPanel | P1 | 已具备表单页标题、分段、摘要、保存/取消底部动作 | 是 | 继续补校验、只读态、aside 区 |
| DetailPanel | P1 | 已具备详情字段网格、描述区、空态、页脚扩展 | 是 | 继续补字段 renderer 与分组详情 |
| MasterDetailPanel | P1 | 已具备双栏主从结构、splitRatio、detail 空态 | 是 | 继续补 selection 状态与移动端交互 |
| CrudDialog | P1 | 已具备标题、副标题、summary、大小模式、底部动作、关闭策略 | 是 | 继续补表单校验/confirm/loading 细节 |
| ReportPanel | P1 | 已具备 query/result 分区、导出动作、header/result 扩展位 | 是 | 继续补图表/多结果区和异步状态 |

## 推荐口径

### 已可对外宣称“标准资源页组件”的能力
- 查询区
- EntityListTable
- EntityListView
- SimpleTablePanel
- FormPanel
- DetailPanel
- MasterDetailPanel
- CrudDialog
- ReportPanel

## 近期优先级建议

### P0
1. 用真实标准页继续 dogfood `FormPanel / DetailPanel / MasterDetailPanel`
2. 用真实标准页持续 dogfood `EntityListView`
3. 明确这些组件的 规范 测试与文档口径
4. 让业务项目优先从这些资源 View / Panel 里选型

### P1
1. 为 CrudDialog / ReportPanel 增加真实标准页落地
2. 继续补图表、confirm、loading、异步状态语义

### P2
1. 为登录页、列表页、详情页、主从页补更完整 preset
2. 把资源页从“可拼装 Panel”进一步升级为“更厚的标准成品 View 模式”

## 当前建议

以后对外说明时建议使用这个口径：

> EFS 已具备企业资源页标准 Page / View / Panel 组件库，列表页能力最成熟；表单、详情、主从页已进入可用标准化阶段；弹窗、报表页正在继续补厚。
