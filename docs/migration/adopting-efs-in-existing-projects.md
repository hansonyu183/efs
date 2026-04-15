# 既有项目接入 EFS 迁移规范

本文用于指导已有企业项目从“本地自定义布局 / 本地自定义 Page”迁移到 EFS。当前迁移主线已经切到 **schema-first**：业务仓库优先维护 `user-apps/<app-name>/app.schema.ts`，再由平台固定入口直接加载并接到运行时。

## 迁移目标

1. 应用入口统一迁入 EFS 的 schema-first 主链路
2. Page / View / Panel / App Shell 能力统一迁入 EFS
3. 项目本地只保留业务特有 schema、真实接口实现与少量必要 override
4. 不再长期维护第二套共享 Page / View / Panel，也不继续扩大 controller-first 兼容层

---

## 推荐迁移顺序

### 第一步：先建立 schema-first 根入口

优先补齐：
- `user-apps/<app-name>/app.schema.ts`
- `defineAppSchema(...)`
- `createPlatformAppFromSchema(...)`
- `EfsApp`

最小目标：
- 应用、认证、服务、domain/resource 信息进入 schema
- 项目先跑通 `user-apps/<app-name>/app.schema.ts -> platform entry -> EfsApp`

原因：
- 先统一入口，后续页面与组件迁移才不会反复返工
- 如果还停留在手写 controller tree，上层 Page / View / Panel 收敛很容易半途变形

### 第二步：把资源 fields / operations 收回 schema

优先迁移：
- 资源字段定义
- CRUD / report / export 等后端 operations
- 少量 `ui` override

迁移目标：
- `fields` 成为资源单一业务真相源
- 所有调用后端的资源动作统一进入 `operations`
- `ui` 只保留最小展示覆盖，不再发明第二套页面 DSL

### 第三步：再接现有 runtime handlers

通过 adapter 为每个资源补真实 handler，例如：
- `list`
- `query`
- `create`
- `update`
- `remove`
- 扩展 operation（如 `export` / `approve`）

迁移目标：
- 让项目不再手写整棵 controller tree
- 只在 adapter 边界补接口实现

### 第四步：再迁移 Page / View / Panel 到 EFS 标准实现

优先迁移：
- `AuthPage`
- `MainPage`
- `PagePanel`
- `EntityListTable`
- `EntityListView`
- `SimpleTablePanel`
- `CrudDialog`
- `DashboardCardPanel`

口径：
- 页面壳、标准表格、CRUD / report 页面优先使用 EFS
- 本地自定义 Page / View / Panel 逐步删除

### 第五步：最后补治理

- lint / AST lint / governance 检查
- public surface / packaging 检查
- schema-first demo / 用例校验

---

## 业务项目本地允许保留的内容

### 应保留
- `user-apps/<app-name>/app.schema.ts` 及相关 schema authoring 文件
- 业务资源字段、业务 operations、服务配置
- 真实 API / session / 权限 / 组织上下文实现
- adapter 里与后端交互的真实 handlers
- 少量必要的 `ui` override

### 不应长期保留
- 第二套 `AuthPage` / `MainPage`
- 第二套通用 `PagePanel` / `ListTable` / CRUD 页面骨架
- 第二套全局 alerts / app shell 表达方式
- 大量手写 `queryFields / columns / formSections / detailFields`
- 继续扩张的 controller-first 业务 authoring 层

---

## 迁移判定标准

一个项目迁移到 EFS 成功，至少满足：

1. 入口已经切到 `user-apps/<app-name>/app.schema.ts`
2. 资源业务能力主要通过 `fields + operations` 表达
3. 页面通过 EFS 的标准 Page / View / Panel / App Shell 运行
4. 用户不再自己写根组件与 controller 入口，legacy controller 只留在平台 compat 边界
5. lint / governance / 规范检查可通过

---

## 推荐迁移口径

### 旧口径
- 业务自己拼 controller tree
- 业务自己组织大量页面配置
- 业务长期保留本地共享 Page / View / Panel

### 新口径
- 业务优先维护 `user-apps/<app-name>/app.schema.ts`
- business schema 只描述 app/auth/services/resources/operations
- `ui` 只做最小 override
- runtime inference + adapter 负责接到当前页面运行时

---

## 破坏性变更处理

如果 EFS 的公开接入方式发生变动，必须同步提供：

- 变更说明
- 旧写法 / 新写法对照
- 受影响项目清单
- 升级步骤

如果变更发生在 legacy controller 兼容层，也要明确说明：
- 这是不是兼容层调整
- schema-first 主路径是否受影响
- 历史项目如何平滑过渡

---

## 最终建议

以后迁移既有项目时，优先用下面这句判断路线是否正确：

> **是不是在把业务输入收回 schema，把页面能力收回 EFS runtime，而不是继续在业务仓库里维护一套变相的 controller-first 平台。**
