# 既有项目接入 EFS 迁移规范

本文用于指导已有企业项目从“本地自定义布局 / 本地自定义 Page”迁移到 EFS 标准库。

## 迁移目标

1. Page 统一迁入 EFS
2. Page 级能力统一迁入 EFS
3. 项目本地只保留业务特有逻辑，不再长期维护第二套共享 Page / View / Panel

## 推荐迁移顺序

### 第一步：先接入 Page 级能力

优先迁移：
- `AuthPage`
- `MainPage`
- 
- `AppButton`
- `AppInput`
- `AppSelect`
- `AppField`
- `AppPanel`

原因：
- layout 是页面统一感的上游能力
- 不先统一 Page 基座，后续 View / Panel 迁移会反复返工

### 第二步：再迁移 Page / View / Panel

优先迁移：
- `PagePanel`
- `EntityListTable`
- `SimpleTablePanel`
- `CrudDialog`
- `DashboardCardPanel`

### 第三步：再补治理

- lint / AST lint / governance 检查

## 业务项目本地允许保留的内容

- 业务资源字段与 metadata
- 菜单装配逻辑
- 权限数据来源
- 组织上下文来源
- 会话、接口、业务规则实现

## 不应长期保留的内容

- 第二套 AuthPage / MainPage
- 第二套通用 PagePanel / ListTable
- 第二套全局 alerts 表达方式

## 迁移判定标准

一个页面迁移到 EFS 成功，至少满足：

1. 使用 EFS 的 Page 基座组件
2. 使用 EFS 的标准 Page / View / Panel
3. 不再依赖本地重复页面骨架
4. lint / governance / 规范 可通过

## 破坏性变更处理

如果 EFS 的 Page 级 API（如 `MainPage` / `AuthPage`）发生变动，必须同步提供：

- 变更说明
- 旧写法 / 新写法对照
- 受影响项目清单
- 升级步骤
