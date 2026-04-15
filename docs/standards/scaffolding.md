# Schema-First 脚手架规则

当前 EFS 的脚手架主线已经切到 **schema-first 服务平台**。

## 命令

```bash
node packages/cli/bin/efs-scaffold.mjs --preset crud --name CustomerApp --out ./generated/schema-app
```

可用 preset：
- `crud`
- `report`
- `workbench`

## 输出内容

每次 scaffold 至少生成：

- `schemas/<app-name>/app.schema.ts`
- `src/main.ts`

## 约束

1. 用户 schema 固定放在 `schemas/<app-name>/app.schema.ts`。
2. 子目录名必须与 `app.name` 一致。
3. `src/main.ts` 由平台入口直接 `createPlatformAppFromSchema(...)` + `EfsApp` 挂载。
4. 不再需要用户自己写根组件。

一句话：

> **用户写 app schema 目录，平台写入口与服务接线。**
