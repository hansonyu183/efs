# Layout Foundation Standard

EFS 必须承载统一的布局级能力，而不是只提供页面片段组件。

## 当前布局级标准能力

### `AuthLayout`
用途：登录、忘记密码、初始化入口、未认证场景页面。

最低要求：
- 提供统一未认证背景与认证页壳层，不再只是普通居中容器
- 支持 `centered / split` 两种标准模式
- 支持品牌区、hero 区、header slot、alerts slot、footer slot
- 支持内容宽度与表单面板宽度控制
- 支持登录前 theme / locale 动作区接入，并优先复用标准 `ThemeSwitcher` / `LocaleSwitcher`
- 小屏下 split 自动收敛为单列，保持可读与可操作

标准区域：
- `brand`
- `hero`
- `header`
- `alerts`
- `default`
- `footer`
- `actions`
- `locale-action`
- `theme-action`

### `MainLayout`
用途：已认证主应用页面。

最低要求：
- 提供 left sidebar / topbar / content / alerts / bottom agent bar / right session panel 结构
- Topbar 固定为：菜单显隐、当前页标题优先、More 按钮
- More 菜单不放 Agent 会话管理；会话管理由底部 Agent + 右侧会话面板负责
- 支持 brand slot、sidebar slot、toolbar slot、header-title slot、agent-output slot、agent-sessions slot
- 支持标题、副标题、组织信息展示
- 支持响应式布局折叠为单列
- 允许业务应用将权限菜单、组织切换、主题切换、全局告警等接入同一布局骨架
- 壳层交互遵循 icon-first，尽量不用长文本操作

## 约束

1. 项目本地不应长期保留独立于 EFS 的第二套主布局骨架。
2. 业务项目可以在 EFS 布局上通过 slot 注入菜单、工具栏和告警，但不应重新定义总体结构。
3. 布局级能力的演进优先沉淀进 EFS，再由业务项目消费。
4. AuthLayout / MainLayout 的变更必须视为高影响变更，修改时要同步更新迁移文档。
