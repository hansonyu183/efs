# EFS Repo Instructions

## Scope
These instructions apply to this repository.

## Runtime and naming conventions
- The primary runtime integration target is schema-first `apps/<app-name>/schemas/app.schema.ts` -> `createPlatformAppFromSchema(...)` -> `EfsApp`; `useApp()`/controller tree remains a legacy compatibility shape.
- Resource structure uses two levels: `domain/res`.
- Do not add a `Resource` suffix to resource names.

## Frontend conventions
- Topbar title should reflect the current page.
- Agent entry lives in the bottom bar and right panel.
- `More` excludes session management.
- CRUD stays key-only for i18n.
- Use explicit `rowKey` values.
- Components manage their own `dirty` state.
- Mobile input controls (`input/select/textarea`) must keep effective font-size at or above `16px` to avoid iPhone auto-zoom.
- Page/layout shells should prefer `100dvh` with `100vh` fallback; do not rely on `100vh` alone for mobile keyboard scenarios.
- App entry HTML should include `viewport-fit=cover, interactive-widget=resizes-content` in the viewport meta unless a stronger app-specific reason overrides it.
- On small screens, large auxiliary panels should default to hidden and be entered via `More` or explicit toggles instead of staying permanently expanded.

## Public surface
- Root entry exports only `EfsApp`.
- Legacy compatibility types/helpers live under the deliberate `@efs/vue/legacy` subpath.
- Do not expose raw component subpaths as package API.
