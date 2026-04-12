# enterprise-frontend-standards

企业前端标准组件库与标准页面库仓库。

目标：以后所有企业项目都必须优先从标准组件库和标准页面库中选择，不允许随意手写列表页、表单页、详情页骨架，也不允许绕过统一的 theme / i18n / alerts / permission / org-context。

## 仓库内容

- `docs/`：设计文档、治理规范、页面/组件标准
- `packages/contracts`：标准组件、标准页面、强约束校验规则
- `packages/cli`：本地与 CI 可执行检查器
- `examples/sample-app`：示例页面清单
- `tests/`：标准库与校验器测试

## 快速使用

```bash
node packages/cli/bin/efs-check.mjs examples/sample-app/enterprise-pages
node --test
```

## 当前阶段

- P0：建立标准组件库/标准页面库/治理校验基线
- P1：补齐更多 page preset、runtime renderer、模板生成器
- P2：抽象 workflow/base-data/report 高阶模式
