# AgentOS 接入 EFS 规范

本文定义 AgentOS 当前采用 EFS 的正式接入方式，后续项目默认参考同一模式。

## 当前推荐接法

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

示例：

```ts
alias: {
 '@efs/vue/components': path.resolve(__dirname, '../../third_party/efs/packages/vue/src/components'),
}
```

如果后续消费 runtime / 规范s / presets，也应增加对应 alias，而不是在业务项目内复制实现。

### 3. 业务模块通过统一别名直接 import

示例：

```ts
import MainPage from '@efs/vue/components/pages/MainPage.vue'
import AuthPage from '@efs/vue/components/pages/AuthPage.vue'
import 查询区 from '@efs/vue/components/panels/查询区.vue'
import EntityListTable from '@efs/vue/components/panels/EntityListTable.vue'
```

## 为什么当前采用这种接法

- 适合内部试用阶段快速迭代
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
