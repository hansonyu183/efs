# Reactive Data-Driven Refactor Plan

> **Status:** completed and verified against the current schema-first runtime structure.

**Goal:** Reduce command-style state syncing in EFS runtime flows, starting with CRUD editing and permission management.

**Architecture:** Treat runtime/controller payloads as source-of-truth reactive state. UI drafts should be derived from source rows and dialog mode instead of being assembled ad hoc in event handlers. Keep imperative code only at I/O boundaries (fetch/save/remove).

**Tech Stack:** Vue 3 refs/computed/watch, schema-first runtime adapter, internal runtime contracts, node:test.

---

## Completion summary

### Batch 1 — Completed

**Focus**
- `packages/vue/src/views/EntityListView.vue`
- `packages/schema/src/adapter/platform-runtime.ts`
- `packages/vue/src/runtime/crud-view-types.ts`

**Delivered**
1. Added CRUD `edit -> detail` hydration in the schema adapter.
2. Changed `EntityListView.openEdit()` to hydrate first, then open.
3. Introduced `editingSourceRow` as the dialog source row.
4. Rebuilt `editingDraft` from `watch([dialogOpen, dialogMode, editingSourceRow])`.
5. Removed scattered `editingDraft = ...` / `editingItem = ...` sync points.

---

### Batch 2 — Completed

**Focus**
- `packages/vue/src/views/EntityListView.vue`
- `packages/vue/src/shared/use-controller-state-sync.ts`
- `packages/vue/src/shared/use-view-session-state.ts`
- `packages/vue/src/shared/controller-state-sync.ts`
- `packages/vue/src/shared/session-state.ts`

**Delivered**
1. CRUD page table/query/pagination state now flows through grouped reactive state instead of scattered `local*` refs.
2. Controller sync was reduced to a narrow bridge: `watch(viewState, ...)` → `syncViewStateToController()`.
3. Session persistence was moved behind `hydrateSessionState()` / `persistSessionState()` helpers.
4. Repeated per-handler `setControllerState(...)` style writes were removed from `EntityListView.vue`.

---

### Batch 3 — Completed

**Focus**
- `packages/vue/src/views/EntityListView.vue`
- `tests/components-source.test.mjs`

**Delivered**
1. Permission dialog selection is derived from normalized draft state via computed values.
2. Selected permission domains auto-expand through derived collapse state.
3. Dialog teardown is consolidated through a single `resetPermissionDialogState()` helper instead of scattered close/reset assignments.

---

### Batch 4 — Completed in the final cleanup

**Focus**
- `packages/schema/src/adapter/platform-runtime.ts`
- `tests/agentos-schema-platform.test.mjs`
- `tests/schema-vue-controller-adapter.test.mjs`

**Delivered**
1. Introduced a resource bridge object inside `createRuntimeFromSchema()` so runtime/controller wiring stays closer to the source resource adapters.
2. Centralized query normalization through `normalizeQueryResult()` so array-style adapter returns also become stable runtime list metadata.
3. Collapsed CRUD/report action wiring into one `buildActionState()` path to reduce compatibility-layer imperative branching and redundant action copying.

---

## Guardrails preserved
- Schema-first integration remains the only external contract.
- Explicit empty row-action arrays still stay empty; no fallback reintroduced.
- Side effects remain at the boundaries: fetch, save, delete, local/session storage.
- CRUD editing still prefers one source row plus derived draft over mutable mirrors.

---

## Verification
```bash
node --test tests/agentos-schema-platform.test.mjs tests/components-source.test.mjs tests/schema-vue-controller-adapter.test.mjs
npm run build
```
