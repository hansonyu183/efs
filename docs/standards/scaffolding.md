# 标准页面脚手架规则

## 命令

```bash
node packages/cli/bin/efs-scaffold.mjs --preset paginated-list --name CustomerListPage --out ./generated/customer-list
```

## 输出内容

每次 scaffold 至少生成：

- `PageName.vue`
- `PageName.page.json`

## 约束

1. 页面 manifest 必须落地。
2. 页面 `.vue` 文件必须包含 `pageType` 常量。
3. 页面必须引用标准组件名作为注释或 import 占位，便于 lint 校验。
4. 如果是 runtime 页，必须带 renderer 占位。
