# 标准页面脚手架规则

> 状态：当前脚手架规则主要覆盖 **legacy page-manifest fixture**（如 `standard-app`）的生成与校验，不是 EFS 的首选业务 authoring 主线。新的正式主线是 schema-first `app.schema.ts`；这里保留给 CLI/page-manifest 兼容场景与现有治理测试使用。

## 当前用途

这套脚手架当前主要用于：

- 生成 page-manifest fixture
- 支撑 `standard-app` 这类 legacy 样板
- 给 lint / AST lint / governance 提供稳定回归输入

不应把它理解成：

- 新业务项目的首选接入方式
- schema-first app authoring 的替代品

---

## 命令

```bash
node packages/cli/bin/efs-scaffold.mjs --preset paginated-list --name CustomerListPage --out ./generated/customer-list
```

---

## 输出内容

每次 scaffold 至少生成：

- `PageName.vue`
- `PageName.page.json`

说明：
- 这里生成的是 page 级 fixture 文件
- 它适合 legacy page-manifest / page governance 场景
- 不等于新的 app/resource schema 主入口

---

## 约束

1. 页面 manifest 必须落地。
2. 页面 `.vue` 文件必须包含 `pageType` 常量。
3. 页面必须引用标准组件名作为注释或 import 占位，便于 lint 校验。
4. 如果是 runtime 页，必须带 renderer 占位。

---

## 与 schema-first 的关系

当前推荐关系是：

- 新业务项目：优先写 `app.schema.ts`
- legacy page fixture / CLI 治理测试：继续使用 `.page.json` 脚手架

一句话：

> **page scaffold 现在更像兼容层样板生成器，而不是 EFS 的首选公开建模入口。**
