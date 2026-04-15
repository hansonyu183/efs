# AgentOS 接入 EFS 规范

本文定义 AgentOS 当前采用 EFS 的正式接入方式，后续项目默认参考同一模式。**主线是 schema-first**：业务仓库优先维护 `schemas/<app-name>/app.schema.ts`，平台固定入口直接加载，不再要求业务自己写根组件。

## 当前正式接法

### 1. 以 git submodule 引入 EFS

在业务仓库中放置：

```text
third_party/efs
```

对应 `.gitmodules`：

```ini
[submodule "third_party/efs"]
	path = third_party/efs
	url = https://github.com/hansonyu183/efs.git
```

这使业务项目能够锁定 EFS 的具体 commit，而不是漂移地跟随最新主分支。

### 2. 通过 Vite alias 指向 EFS 源码入口

标准写法：

```ts
alias: {
  '@efs/vue': path.resolve(__dirname, '../../third_party/efs/packages/vue/src/index.ts'),
  '@efs/vue/legacy': path.resolve(__dirname, '../../third_party/efs/packages/vue/src/legacy/index.ts'),
  '@efs/vue/shared': path.resolve(__dirname, '../../third_party/efs/packages/vue/src/shared'),
  '@efs/schema': path.resolve(__dirname, '../../third_party/efs/packages/schema/src/index.ts'),
}
```

如果后续消费 runtime / 规范 / presets，也应增加对应 alias，而不是在业务项目内复制实现。

### 3. 业务模块优先维护 `schemas/<app-name>/app.schema.ts`

标准写法：

```ts
import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: { id: 'agentos', name: 'agentos', title: 'AgentOS' },
  domains: [
    {
      key: 'crm',
      title: '客户中心',
      resources: [
        {
          key: 'customer',
          title: '客户管理',
          fields: [
            { key: 'id', title: '编号', type: 'string', identity: 'id', readonly: true },
            { key: 'name', title: '名称', type: 'string', identity: 'title' },
          ],
          operations: {
            list: { path: '/api/crm/customers', method: 'GET' },
            get: { path: '/api/crm/customers/:id', method: 'GET' },
            create: { path: '/api/crm/customers', method: 'POST' },
            update: { path: '/api/crm/customers/:id', method: 'PUT' },
            remove: { path: '/api/crm/customers/:id', method: 'DELETE' },
            export: { path: '/api/crm/customers/export', method: 'POST' },
          },
        },
      ],
    },
  ],
})
```

### 4. 用平台入口直接挂到现有 Vue runtime

标准写法：

```ts
import { createApp } from 'vue'
import { createPlatformAppFromSchema } from '@efs/schema'
import { EfsApp } from '@efs/vue'
import { appSchema } from '../schemas/agentos/app.schema'

const app = createPlatformAppFromSchema(appSchema)

createApp(EfsApp, {
  app,
  appName: appSchema.app.title || appSchema.app.name,
}).mount('#app')
```

业务侧应优先消费稳定入口：根入口只用于 `EfsApp`；schema authoring / adapter 从 `@efs/schema` 引入；运行时 helper 仅在确有需要时从文档约定的 `controller`、`shared` 子路径导入；不要直接依赖 `pages/*`、`panels/*`、`controls/*` 这类原始源码路径。

## 为什么当前采用这种接法

- schema-first 让业务侧只维护应用/资源/operations 描述，而不是手写整棵 controller tree
- EFS 可以基于 schema 自动推导 view mode、默认 actions 与基础字段展示规则
- EFS 仍在高频调整，暂不要求先正式发布 registry 包
- submodule 可以固定版本，降低标准库漂移风险
- alias 可直接消费最新源码，便于联调

## 当前阶段的版本建议

- 业务仓库锁定 EFS submodule commit
- 升级 EFS 时显式更新 submodule 指针
- 不建议直接让业务项目跟随 EFS `main` 漂移

## 后续演进方向

当 EFS 经过多轮真实项目验证后，再逐步演进到：

- package / workspace 级引用
- 私有 registry 或 GitHub Packages
- 版本化升级与 changelog 驱动接入
