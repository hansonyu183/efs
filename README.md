# enterprise-frontend-standards

企业前端标准组件库与标准页面库仓库。

目标：以后所有企业项目都必须优先从标准组件库和标准页面库中选择，不允许随意手写列表页、表单页、详情页骨架，也不允许绕过统一的 theme / i18n / alerts / permission / org-context。

## 仓库内容

- `docs/`：设计文档、治理规范、页面/组件标准
- `packages/contracts`：标准组件、标准页面、强约束校验规则
- `packages/presets`：标准页面 preset 定义与脚手架模板
- `packages/vue`：Vue 组件与 runtime renderer 骨架
- `packages/cli`：contract / lint / scaffold 命令
- `examples/sample-app`：示例 manifest 与页面实现
- `tests/`：标准库、校验器、脚手架测试

## 命令

```bash
npm run test
npm run check:sample
npm run lint:sample
npm run ci
```

## 当前已实现

- 标准组件 registry
- 标准页面 preset registry
- 页面 manifest contract 校验器
- Vue 组件与 runtime renderer 骨架
- 页面 scaffold 生成器
- 示例页面 lint 校验器
- GitHub CI
