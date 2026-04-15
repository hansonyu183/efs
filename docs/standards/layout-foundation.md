# Page Foundation Standard

EFS 必须承载统一的 Page 级能力，而不是只提供页面片段组件。

## 当前 Page 级标准能力

### `AuthPage`
用途：登录、忘记密码、初始化入口、未认证场景页面。

最低要求：
- 提供统一未认证背景与认证 Page，不再只是普通居中容器
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

### `MainPage`
用途：已认证主应用页面。

最低要求：
- 提供 left sidebar / topbar / content / alerts / bottom agent bar / right session panel 结构
- Topbar 固定为：菜单显隐、当前页标题优先、More 按钮
- More 菜单不放 Agent 会话管理；会话管理由底部 Agent + 右侧会话面板负责
- MainPage 的 locale / theme 全局动作也应优先复用标准 `LocaleSwitcher` / `ThemeSwitcher`
- 支持 brand slot、sidebar slot、toolbar slot、header-title slot、agent-output slot、agent-sessions slot
- 支持标题、副标题、组织信息展示
- 支持响应式布局折叠为单列
- 允许业务应用将权限菜单、组织切换、主题切换、全局告警等接入同一布局骨架
- Page 交互遵循 icon-first，尽量不用长文本操作

## 移动端输入与视口经验

这部分是 EFS 在移动端调试后沉淀出的硬约束，适用于登录页、主布局、筛选区、表单区和抽屉类页面。

### 1. 可输入控件实际字号不得小于 `16px`

适用对象：

- `input`
- `select`
- `textarea`

经验规则：

```css
font-size: 16px;
line-height: 1.5;
```

原因：iPhone / Safari 在输入控件字号小于 `16px` 时会自动放大页面；失焦后常常不能完全恢复，用户会感觉 UI 被放大后卡住。

### 2. Page shell 不要只依赖 `100vh`

以下容器必须优先使用动态视口高度：

- 页面根容器
- 登录页容器
- 主应用布局
- 固定侧栏 / 抽屉 / 右侧会话面板

推荐写法：

```css
min-height: 100vh;
min-height: 100dvh;
```

或：

```css
height: 100vh;
height: 100dvh;
```

原因：移动端软键盘弹出/收起时，纯 `100vh` 容器经常无法正确恢复高度，导致页面变矮、底部空白、sticky 区域错位。

### 3. 页面入口要声明移动端视口行为

`apps/*/index.html` 推荐统一使用：

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content"
/>
```

说明：

- `viewport-fit=cover` 用于安全区适配
- `interactive-widget=resizes-content` 让支持的浏览器在软键盘弹出时按内容重排处理

### 4. 移动端问题优先从壳层排查，不要只盯单个表单组件

推荐排查顺序：

1. 输入控件字号是否达到 `16px`
2. 根容器 / 页面壳是否使用 `100dvh`
3. 是否存在 `fixed` / `sticky` 底栏或侧栏抢高度
4. `viewport` meta 是否完整
5. 最后再看具体业务组件逻辑

### 5. 小屏辅助能力默认收纳到 `More`

移动端屏幕高度和软键盘空间都很紧，辅助面板不应默认长期展开。

经验规则：

- 主任务区优先保留
- 大块辅助 UI 默认收起
- 通过 `More` 菜单或显隐按钮进入

本仓库中的典型案例是：移动端默认隐藏 agent 对话栏，通过 `More` 菜单切换显示/隐藏。

## 约束

1. 项目本地不应长期保留独立于 EFS 的第二套主布局骨架。
2. 业务项目可以在 EFS 布局上通过 slot 注入菜单、工具栏和告警，但不应重新定义总体结构。
3. Page 级能力的演进优先沉淀进 EFS，再由业务项目消费。
4. AuthPage / MainPage 的变更必须视为高影响变更，修改时要同步更新迁移文档。
