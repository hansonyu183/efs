# standard-app

> 状态：**legacy fixture**。该目录主要保留给 CLI / lint / AST lint / governance 回归测试使用，不再代表 EFS 当前首选接入方式。

当前 EFS 的正式主线是：

```text
app.schema.ts
  -> defineAppSchema(...)
  -> adaptAppSchemaToVueController(...)
  -> EfsApp
```

而 `standard-app/` 仍保留的是较早期的：

- `enterprise-pages/*.page.json`
- 页面级 `.vue` 样板
- 治理 / 脚手架 / AST lint 测试输入

## 这个目录现在的用途

- 给 `packages/cli` 的现有命令提供稳定 fixture
- 验证 page-manifest / governance 相关能力没有回归
- 作为 legacy migration/reference 样本保留

## 不应再把它当成什么

- 不应再把它当成“唯一标准接法”
- 不应再把它当成 schema-first 的替代品
- 不应在新业务项目里继续复制这套 page-manifest authoring 方式

## 当前推荐

- 新项目优先参考 `apps/standard-demo/`
- 业务 authoring 优先参考 `docs/standards/schema-first-authoring.md`
- 既有项目迁移参考 `docs/migration/adopting-efs-in-existing-projects.md`
