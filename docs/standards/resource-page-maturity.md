# 资源页组件成熟度评估

本文用于说明 EFS 当前资源页相关组件的成熟度、适用范围、是否可以直接作为标准资产使用，以及下一阶段应优先补厚哪些能力。

## 总结结论

当前 EFS 已具备一套**资源页标准壳组件体系**，可以统一：

- 查询列表页
- 分页列表页
- 列表 + 详情页
- 表单页
- 只读详情页
- 主从页
- 弹窗新增/编辑页
- 报表页
- 运行时元数据页

但当前成熟度并不完全一致：

- **列表相关组件最成熟**
- **表单 / 详情 / 主从壳已进入可用阶段，但仍需继续加厚**
- **运行时资源页 renderer 已开通路，但还偏薄**

## 成熟度分级说明

- **P0 / 已可直接作为标准资产**：可以优先要求业务项目使用
- **P1 / 已有标准壳，但建议继续加厚**：适合先纳入标准库，再持续演进
- **P2 / 已有方向，但目前更像占位或轻骨架**：先保留接口，不宜宣称为厚成品

## 组件成熟度表

| 组件 | 当前成熟度 | 现状判断 | 是否适合作为标准资产 | 下一步重点 |
|---|---|---|---|---|
| QueryToolbarShell | P0 | 已具备标准查询头部和扩展位 | 是 | 继续补查询字段组合示例 |
| EntityListTable | P0 | 已具备列设置、分页、移动端卡片 fallback、tableKey 等能力 | 是 | 继续补真实资源列表用例 |
| SimpleTableShell | P0 | 适合作为轻量标准表格壳 | 是 | 继续补 empty/error/loading 约束 |
| FormShell | P1 | 已具备表单页标题、分段、摘要、保存/取消底部动作 | 是 | 继续补校验、只读态、aside 区 |
| DetailShell | P1 | 已具备详情字段网格、描述区、空态、页脚扩展 | 是 | 继续补字段 renderer 与分组详情 |
| MasterDetailShell | P1 | 已具备双栏主从结构、splitRatio、detail 空态 | 是 | 继续补 selection 状态与移动端交互 |
| CrudDialogShell | P2 | 仍偏轻，更多是弹窗容器 | 暂时作为轻壳使用 | 补表单状态、提交区、大小/模式 |
| ReportShell | P2 | 仍偏轻，更多是报表区块容器 | 暂时作为轻壳使用 | 补 query/result/export/header actions |
| DynamicPageRenderer | P2 | 已有 runtime 通路，但还不是真正完整资源页渲染器 | 方向可纳入，能力仍需演进 | 继续补 runtime 资源页组装能力 |
| MetadataFormRenderer | P1 | 对 runtime 表单 schema 有基础处理能力 | 是 | 继续补 widget / validation / layout |
| MetadataTableRenderer | P1 | 对 runtime 表格 schema 有基础处理能力 | 是 | 继续补 formatter / action / status |
| ActionRenderer | P1 | 对 runtime action schema 有基础处理能力 | 是 | 继续补权限 / loading / confirm |

## 推荐口径

### 已可对外宣称“标准资源页组件”的能力
- QueryToolbarShell
- EntityListTable
- SimpleTableShell
- FormShell
- DetailShell
- MasterDetailShell

### 已有方向但暂不宜宣称“厚成品”的能力
- CrudDialogShell
- ReportShell
- DynamicPageRenderer

## 近期优先级建议

### P0
1. 用真实示例页继续 dogfood `FormShell / DetailShell / MasterDetailShell`
2. 明确这些组件的 contract 测试与文档口径
3. 让业务项目先优先从这些资源页壳里选型

### P1
1. 补厚 `CrudDialogShell`
2. 补厚 `ReportShell`
3. 增强 runtime renderer 与 metadata renderer

### P2
1. 为登录页、列表页、详情页、主从页、运行时页补更完整 preset
2. 把资源页从“可拼装壳”进一步升级为“更厚的标准成品页模式”

## 当前建议

以后对外说明时建议使用这个口径：

> EFS 已具备企业资源页标准壳组件库，列表页能力最成熟；表单、详情、主从页已进入可用标准化阶段；弹窗、报表、运行时资源页正在继续补厚。
