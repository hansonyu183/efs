# EFS Repo Instructions

## Scope
These instructions apply to this repository.

## Runtime and naming conventions
- The runtime integration target is `useApp()`.
- Resource structure uses two levels: `domain/res`.
- Do not add a `Resource` suffix to resource names.

## Frontend conventions
- Topbar title should reflect the current page.
- Agent entry lives in the bottom bar and right panel.
- `More` excludes session management.
- CRUD stays key-only for i18n.
- Use explicit `rowKey` values.
- Components manage their own `dirty` state.

## Public surface
- Expose `AppController` and `EfsApp` only.
