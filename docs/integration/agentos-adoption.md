# AgentOS 接入 EFS 规范

本文定义 AgentOS 当前采用 EFS 的源码优先接入方式。

结论先说：**仓库内接入统一面向 schema 源码 contract，不面向 committed dist 或 runtime package contract。**

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

### 2. 公开 alias 只指向 `@efs -> /src`

标准写法：

```ts
alias: {
  '@efs': path.resolve(__dirname, '../../third_party/efs/src'),
}
```

`src/vue`、internal、shared helper 等路径都属于平台内部源码实现，不再作为业务侧公开 alias contract。

### 3. 业务模块优先维护 `apps/<app-name>/schemas/app.schema.ts`

标准写法：

```ts
import { baselineSchema, composeAppSchema } from '@efs/schema/index.ts'
import { appPatch } from './patch'

export const appSchema = composeAppSchema(baselineSchema, appPatch)
```

### 4. runtime 入口由平台内部维护

`src/main.ts`、运行时壳、页面装配、导航 helper 等仍可能存在，
但它们都属于平台内部 wiring，不再视为业务侧公开 contract。

当前仓库不提交 `dist` 作为真源；服务运行和验证均直接围绕源码进行。

## 为什么当前采用这种接法

- schema-first 让业务侧只维护应用 patch 与资源结构描述
- 平台以通用 baseline 提供骨架，业务侧只补实例化信息
- 平台内部 runtime 可以继续演进，而不把业务方锁死在 runtime 目录和 helper 子路径上
- submodule 可以固定版本，降低标准库漂移风险

## 当前阶段的版本建议

- 业务仓库锁定 EFS submodule commit
- 升级 EFS 时显式更新 submodule 指针
- 业务侧只承诺 schema 与 schema lint 能持续兼容
