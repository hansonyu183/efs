# Schema-First 脚手架规则

当前 EFS 的脚手架主线已经切到 **schema-first**。

## 命令

```bash
node packages/cli/bin/efs-scaffold.mjs --preset crud --name StandardCrudApp --out ./generated/schema-app
```

可用 preset：
- `crud`
- `report`
- `workbench`

## 输出内容

每次 scaffold 至少生成：

- `app.schema.ts`
- `src/app-from-schema.ts`
- `src/DemoRoot.vue`

## 约束

1. `app.schema.ts` 必须通过 `defineAppSchema(...)` 导出。
2. `src/app-from-schema.ts` 必须通过 `adaptAppSchemaToVueController(...)` 连接当前 Vue runtime。
3. `src/DemoRoot.vue` 必须通过 `EfsApp` 挂载运行时。
4. 新脚手架不再生成 `.page.json` manifest。

一句话：

> **脚手架现在生成 schema-first app fixture，而不是 page-manifest fixture。**
