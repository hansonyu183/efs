# 既有项目接入 EFS 迁移规范

本文用于指导已有企业项目从“本地自定义布局/页面壳”迁移到 EFS 标准库。

## 迁移目标

1. 页面壳统一迁入 EFS
2. 布局级能力统一迁入 EFS
3. 项目本地只保留业务特有逻辑，不再长期维护第二套共享壳

## 推荐迁移顺序

### 第一步：先接入布局级能力

优先迁移：
- `AuthLayout`
- `MainLayout`
- `AppAlerts`
- `AppButton`
- `AppInput`
- `AppSelect`
- `AppField`
- `AppPanel`

原因：
- layout 是页面统一感的上游能力
- 不先统一 layout，后续 shell 迁移会反复返工

### 第二步：再迁移页面壳

优先迁移：
- `PageSection`
- `QueryToolbarShell`
- `EntityListTable`
- `SimpleTableShell`
- `CrudDialogShell`
- `DashboardCardShell`

### 第三步：再迁移 runtime 和治理

- `DynamicPageRenderer`
- `MetadataFormRenderer`
- `MetadataTableRenderer`
- `ActionRenderer`
- lint / AST lint / governance 检查

## 业务项目本地允许保留的内容

- 业务资源字段与 metadata
- 菜单装配逻辑
- 权限数据来源
- 组织上下文来源
- 会话、接口、业务规则实现

## 不应长期保留的内容

- 第二套 AuthLayout / MainLayout
- 第二套通用 PageSection / QueryToolbarShell / ListTable
- 第二套全局 alerts 表达方式

## 迁移判定标准

一个页面迁移到 EFS 成功，至少满足：

1. 使用 EFS 的布局组件
2. 使用 EFS 的标准 shell
3. 不再依赖本地重复页面骨架
4. lint / governance / contract 可通过

## 破坏性变更处理

如果 EFS 的布局级 API（如 `MainLayout` / `AuthLayout`）发生变动，必须同步提供：

- 变更说明
- 旧写法 / 新写法对照
- 受影响项目清单
- 升级步骤
