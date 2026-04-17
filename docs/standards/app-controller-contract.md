# App Controller Contract

> 状态：**internal-only runtime reference**。
>
> 本文不再是 EFS 对外契约文档。
> EFS 当前唯一正式对外接入主线是：
>
> - `apps/<app-name>/schemas/app.schema.ts`

旧 controller tree、runtime shape、shared helper、兼容层适配结构，
都只作为平台内部运行时参考，不再作为业务侧公开 authoring contract。

如果你正在做外部接入，请不要从本文寻找 import path 或 package contract，
而应直接参考：

- `docs/standards/schema-first-authoring.md`
- `docs/integration/agentos-adoption.md`
