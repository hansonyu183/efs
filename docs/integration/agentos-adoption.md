# AgentOS 接入 EFS 规范

本文定义 AgentOS 当前采用 EFS 的正式接入方式。

结论先说：**外部接入只面向 schema contract，不面向 runtime package contract。**

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

### 2. 公开 alias 只指向 `@efs/schema`

标准写法：

```ts
alias: {
  '@efs/schema': path.resolve(__dirname, '../../third_party/efs/packages/schema/src/index.ts'),
}
```

`packages/vue`、internal、shared helper 等路径都属于平台内部实现，不再作为业务侧公开 alias contract。

### 3. 业务模块优先维护 `apps/<app-name>/schemas/app.schema.ts`

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

### 4. 用 `efs-lint` 检查 schema 应用目录

```bash
efs-lint apps/agentos
```

### 5. runtime 入口由平台内部维护

`src/main.ts`、运行时壳、页面装配、导航 helper 等仍可能存在，
但它们都属于平台内部 wiring，不再视为业务侧公开 contract。

## 为什么当前采用这种接法

- schema-first 让业务侧只维护应用/资源/operations 描述
- EFS 可以基于 schema 自动推导 view mode、默认 actions 与基础字段展示规则
- 平台内部 runtime 可以继续演进，而不把业务方锁死在 runtime 目录和 helper 子路径上
- submodule 可以固定版本，降低标准库漂移风险

## 当前阶段的版本建议

- 业务仓库锁定 EFS submodule commit
- 升级 EFS 时显式更新 submodule 指针
- 业务侧只承诺 schema 与 schema lint 能持续兼容
