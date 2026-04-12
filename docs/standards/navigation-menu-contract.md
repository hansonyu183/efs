# Navigation Menu Contract

EFS 的左侧动态菜单采用**运行时加载 + 顺序码排序**模式，不要求前端维护全量静态菜单树。

## 核心原则

1. 菜单由运行时权限/菜单接口返回。
2. 每个菜单节点**必须带 `order` 顺序码**。
3. 前端按**同级 `order` 从小到大**排序后再组树。
4. `MainLayout` / Sidebar 只负责展示，不负责业务排序决策。
5. 壳层与导航交互遵循 **icon-first**，避免堆积文本操作。

## 扁平菜单输入 Contract

```ts
type MenuNode = {
  key: string
  title: string
  path?: string
  icon?: string
  order: number
  parentKey?: string | null
  type: 'group' | 'item'
  visible?: boolean
  disabled?: boolean
}
```

## 字段要求

### 必填
- `key`：全局唯一、稳定不变
- `title`：菜单展示名称
- `order`：排序码
- `type`：`group` 或 `item`

### `item` 必填
- `path`

### 推荐必填
- `icon`

### 可选
- `parentKey`
- `visible`
- `disabled`

## 排序规则

### 同级排序
- 同一 `parentKey` 下按 `order asc` 排序

### 顺序码要求
- 必须留间隔，不要紧密使用 `1,2,3`
- 推荐顶级：`10,20,30,40...`
- 推荐子级：`101,102,103` 或 `110,120,130`

### 唯一性
- 同级 `order` 应唯一
- 如重复，前端可以继续按 `title/key` 兜底，但应记录告警

## 前端处理流程

1. 过滤 `visible === false` 节点
2. 校验必填字段
3. 按同级 `order asc` 排序
4. 根据 `parentKey` 组装树
5. 清理空的 `group`
6. 输出 Sidebar 可消费的树结构

## 非法数据处理

### 缺 `key`
- 直接丢弃并告警

### 缺 `order`
- 直接丢弃并告警

### `type=item` 但缺 `path`
- 直接丢弃并告警

### `parentKey` 找不到
- 建议直接丢弃并告警，避免脏数据乱挂

## Sidebar 输入结构

```ts
type SidebarMenuTreeNode = {
  key: string
  title: string
  path?: string
  icon?: string
  type: 'group' | 'item'
  order: number
  children?: SidebarMenuTreeNode[]
  disabled?: boolean
}
```

## 与 MainLayout 的边界

### MainLayout / Sidebar 负责
- 展示排好序的菜单树
- 展示激活态/折叠态/响应式行为

### 菜单构造层负责
- 过滤权限
- 排序
- 组树
- 清理空节点

## Icon-first 规则

导航和壳层交互尽量使用语义 icon，而不是大段文本：

### 推荐 icon-first 的区域
- Topbar 操作
- More 菜单
- Sidebar 菜单图标
- Agent 入口/会话入口
- 表格行操作

### 仍需明确文本的区域
- 菜单标题
- 表单字段标签
- 错误信息
- 空状态说明
- 资源页标题

### `icon` 字段建议
不要直接绑具体图标库名，建议传语义 key：

```ts
icon: 'home'
icon: 'users'
icon: 'settings'
icon: 'report'
```

由前端统一映射到具体图标组件。EFS 已提供基础运行时工具：

- `buildSidebarMenuTree()`
- `semanticIconMap`
- `resolveSemanticIcon()`

## 与 Agent 的关系

- Agent 会话管理位于 **底部 Agent 对话栏 + 右侧会话面板**
- `More` 菜单**不再放会话管理入口**
- 顶部壳层与 Agent 遵循 icon-first
