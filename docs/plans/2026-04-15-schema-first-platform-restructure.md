# EFS Schema-First Platform Restructure Plan

> **For Hermes:** Use subagent-driven-development skill to execute this plan task-by-task after the structure is approved.

**Goal:** Reposition EFS from a controller-first frontend runtime into a schema-first enterprise management frontend platform where enterprises provide app/resource/api descriptions and EFS owns app shell, auth, routing, runtime generation, and local dev/service orchestration.

**Architecture:** Split the repo into clear platform layers: schema definitions, compiler/adapters, runtime shell, developer tooling, and examples. Replace current controller-first contracts with first-class app/resource/auth/service schemas, use `app.schema.ts` as the first external authoring format, and make the CLI the canonical entrypoint for scaffolding, validating, compiling, and running apps.

**Tech Stack:** TypeScript, Vue 3, Vite, JSON Schema / TS schema types, Node CLI, existing EFS runtime packages.

---

## 1. Why restructure now

Current repo structure still reflects a transitional shape:

- `packages/vue` mixes public platform runtime, internal runtime controller types, low-level controls, and shell implementation.
- `packages/presets` still assumes page preset scaffolding as a primary entrypoint.
- `packages/cli` is oriented around page manifests / lint / governance, not full platform app schemas.
- `docs/standards/app-controller-contract.md` and surrounding docs still describe a controller-first integration story.
- `standard-app` and `apps/standard-demo` are examples of using EFS, but not yet examples of an enterprise handing EFS a single app schema.

This makes the repo harder to evolve toward the stated target: enterprises should eventually provide one app schema (first as `app.schema.ts`, later optionally plus pure data formats or API descriptions), and EFS should handle app shell, auth, routing, runtime assembly, and service startup.

---

## 2. Target top-level repo structure

```text
efs/
├── apps/
│   ├── standard-demo/                 # demo app consumed by tests; migrates to schema-first example
│   └── playground/                    # optional future interactive schema playground
├── docs/
│   ├── architecture/
│   ├── migration/
│   ├── plans/
│   ├── schemas/                       # schema docs and examples
│   └── standards/
├── packages/
│   ├── schema/                        # NEW: source-of-truth app/resource/auth/service schema types + JSON schemas
│   ├── compiler/                      # NEW: schema -> runtime descriptors/controller adapters
│   ├── runtime/                       # NEW: app shell, auth shell, navigation, res runtimes, internal orchestration
│   ├── vue/                           # thin public Vue entry (thin wrapper over runtime)
│   ├── cli/                           # schema validate/scaffold/dev/run/govern commands
│   └── presets/                       # optional scaffold templates; reduced role over time
├── standard-app/                      # existing fixture to migrate or retire during schema-first transition
├── tests/
│   ├── schemas/
│   ├── compiler/
│   ├── runtime/
│   ├── cli/
│   └── integration/
└── tools/ or scripts/                 # optional internal repo automation
```

### Layer responsibilities

#### `packages/schema`
Public contract layer.
Contains:
- app schema types
- auth schema types
- resource schema types
- navigation/menu schema
- service/port/dev schema
- JSON schema exports for validation

This package should become the main “what enterprises provide” contract. In v1, `app.schema.ts` compiles into these schema types.

#### `packages/compiler`
Compilation / normalization layer.
Contains:
- schema normalizers
- schema -> runtime descriptor transformers
- migration adapters used only during repo restructuring
- API description -> resource schema synthesis (later)

This package turns user input into something the runtime can consume.

#### `packages/runtime`
Platform runtime layer.
Contains:
- `EfsApp` shell
- auth/session runtime
- navigation runtime
- resource runtime resolution
- schema-driven page/render orchestration
- internal view/controller state

This is where EFS actually runs the platform.

#### `packages/vue`
Thin Vue-facing public entry.
Contains:
- minimal public exports for Vue consumers
- minimal Vue-facing re-exports only
- ideally little or no business logic

Long term this is a façade, not the center of the system.

#### `packages/cli`
Platform operator / developer workflow layer.
Contains:
- schema validation
- scaffold from schema
- compile schema
- run dev platform
- service boot / orchestration
- governance checks

#### `packages/presets`
Optional acceleration layer.
Contains:
- preset templates
- schema-oriented starter templates where helpful

Long term this should become secondary to schema-driven generation.

---

## 3. Target schema model

The new platform should revolve around a single app schema root.

## 3.1 App schema root

Proposed conceptual shape:

```ts
interface EfsAppSchema {
  schemaVersion: string
  app: {
    id: string
    name: string
    title?: string
    brandIcon?: string
    locale?: string
    theme?: 'light' | 'dark'
  }
  auth: EfsAuthSchema
  services?: Record<string, EfsServiceSchema>
  navigation?: EfsNavigationSchema
  resources: EfsResourceSchema[]
}
```

### Why this matters
This gives enterprises a single entrypoint instead of making them compose app/main/auth/domain/res controller trees manually.

## 3.1.1 First authoring format

V1 should start with:

```text
app.schema.ts
```

Reasons:

- deep nested structures are easier to evolve in TypeScript while the model is still moving
- strongest IDE/type feedback during the first platform rewrite
- lowest migration friction for runtime/compiler work
- easy to constrain later into TOML/YAML once the schema stabilizes

Constraint: `app.schema.ts` is still declarative platform input, not arbitrary app code. It should export a typed object (for example through `defineAppSchema(...)`).

## 3.2 Auth schema

```ts
interface EfsAuthSchema {
  mode: 'token'
  loginEndpoint?: string
  logoutEndpoint?: string
  orgsEndpoint?: string
  token?: {
    storage?: 'localStorage'
    accessTokenField?: string
    refreshTokenField?: string
    expiresAtField?: string
    tokenTypeField?: string
  }
}
```

The runtime owns auth state. Enterprises only describe capabilities/endpoints/payload mapping.

## 3.3 Service schema

```ts
interface EfsServiceSchema {
  kind: 'http' | 'mock' | 'gateway'
  baseUrl?: string
  port?: number
  healthPath?: string
  devCommand?: string
  env?: Record<string, string>
}
```

This is the first place to put the new “port config” and service startup responsibility you requested.

## 3.4 Resource schema

```ts
interface EfsResourceSchema {
  key: string
  domain: string
  title?: string
  icon?: string
  runtime: 'crud' | 'report'
  datasource: {
    service: string
    query?: EndpointSpec
    save?: EndpointSpec
    remove?: EndpointSpec
    export?: EndpointSpec
  }
  fields: EfsFieldSchema[]
  actions?: EfsActionSchema[]
}
```

This becomes the long-term replacement for hand-authored `ResController` objects.

---

## 4. Migration design principle

Do the restructure in clear stages, but target a direct schema-first architecture rather than maintaining a long-lived compatibility layer.

### Phase A — Introduce schema packages and app schema root
- Add `packages/schema`
- Add `packages/compiler`
- Establish schema-first source-of-truth contracts
- Use migration adapters only internally while files are being moved

### Phase B — Make runtime consume schema input as the primary path
- `EfsApp` accepts schema-derived runtime input
- controller-first code is rewritten or deleted instead of preserved as a public mode

### Phase C — CLI and demo become schema-first
- `apps/standard-demo` driven by `app.schema.ts`
- new CLI commands use app schema as canonical input

### Phase D — remove controller-first public surface
- public docs become schema-first only
- controller contracts are removed from the supported public architecture

---

## 5. Proposed directory structure in detail

## 5.1 `packages/schema`

```text
packages/schema/
├── src/
│   ├── app/
│   │   ├── app-schema.ts
│   │   ├── auth-schema.ts
│   │   ├── navigation-schema.ts
│   │   └── service-schema.ts
│   ├── resource/
│   │   ├── resource-schema.ts
│   │   ├── field-schema.ts
│   │   └── action-schema.ts
│   ├── authoring/
│   │   ├── define-app-schema.ts
│   │   └── schema-helpers.ts
│   └── index.ts
└── package.json
```

## 5.2 `packages/compiler`

```text
packages/compiler/
├── src/
│   ├── normalize/
│   │   ├── normalize-app-schema.ts
│   │   ├── normalize-auth-schema.ts
│   │   └── normalize-resource-schema.ts
│   ├── adapters/
│   │   ├── schema-to-app-runtime.ts
│   │   ├── schema-to-controller-compat.ts
│   │   └── api-to-resource-schema.ts      # later
│   ├── validate/
│   │   └── validate-app-schema.ts
│   └── index.ts
└── package.json
```

## 5.3 `packages/runtime`

```text
packages/runtime/
├── src/
│   ├── app/
│   │   ├── EfsApp.vue
│   │   ├── app-runtime.ts
│   │   └── app-context.ts
│   ├── auth/
│   │   ├── auth-session.ts
│   │   ├── auth-runtime.ts
│   │   └── auth-storage.ts
│   ├── navigation/
│   │   ├── menu-runtime.ts
│   │   └── route-runtime.ts
│   ├── resources/
│   │   ├── resolve-resource-runtime.ts
│   │   ├── crud-runtime.ts
│   │   ├── report-runtime.ts
│   │   └── resource-runtime-types.ts
│   ├── shell/
│   │   ├── AuthPage.vue
│   │   ├── MainPage.vue
│   │   └── ResolvedResPage.vue
│   ├── controls/
│   ├── interaction/
│   ├── panels/
│   ├── views/
│   ├── shared/
│   └── index.ts
└── package.json
```

## 5.4 `packages/vue`

```text
packages/vue/
├── src/
│   ├── index.ts                # thin public façade over runtime/schema products
│   └── vue-shim.d.ts
└── package.json
```

The current contents of `packages/vue/src/controller`, `pages`, `views`, `panels`, `interaction`, `shared` should gradually move into `packages/runtime` or `packages/compiler` depending on whether they are runtime orchestration or schema translation.

## 5.5 `packages/cli`

```text
packages/cli/
├── bin/
│   ├── efs-schema-validate.mjs
│   ├── efs-schema-compile.mjs
│   ├── efs-dev.mjs
│   ├── efs-run-services.mjs
│   ├── efs-scaffold.mjs        # retained, but schema-aware
│   └── efs-governance.mjs
└── package.json
```

---

## 6. Migration mapping from current repo

### Current → Future mapping

- `packages/vue/src/controller/*`
  - public contract types → `packages/schema`
  - internal runtime builders → `packages/compiler` / `packages/runtime/resources`

- `packages/vue/src/pages/*`
  - move to `packages/runtime/src/shell/*`

- `packages/vue/src/views/*`
  - move to `packages/runtime/src/views/*`

- `packages/vue/src/shared/auth-session.ts`
  - move to `packages/runtime/src/auth/auth-session.ts`

- `packages/presets/src/index.ts`
  - reduced role; later become schema template helpers

- `standard-app/enterprise-pages/*.json`
  - eventually replaced by app/resource schemas

---

## 7. Recommended execution order

### Stage 0 — Planning and naming freeze
**Objective:** Lock the target structure and terminology before moving files.

**Files:**
- Create: `docs/plans/2026-04-15-schema-first-platform-restructure.md`
- Modify later: `README.md`, `docs/standards/*`

**Deliverables:**
- approved target structure
- package naming decisions
- direct schema-first migration policy

### Stage 1 — Create `packages/schema`
**Objective:** Establish the new source-of-truth contract layer.

**Tasks:**
1. Add package scaffold
1. Add TS schema types
2. Add `defineAppSchema()` authoring entry
3. Add exports and package tests

### Stage 2 — Create `packages/compiler`
**Objective:** Decouple normalization/translation from runtime shell.

**Tasks:**
1. Add package scaffold
2. Move/duplicate runtime-building logic behind compiler adapters
3. Build schema -> current runtime adapter
4. Add tests for normalization and validation

### Stage 3 — Extract `packages/runtime`
**Objective:** Make app shell and resource runtimes a dedicated runtime package.

**Tasks:**
1. Move `EfsApp`, shell pages, views, panels, interactions, shared runtime helpers
2. Keep `packages/vue` as façade
3. Update package build + exports
4. Fix all tests

### Stage 4 — Schema-first demo
**Objective:** Make `apps/standard-demo` the first app-schema-driven example.

**Tasks:**
1. Add `apps/standard-demo/app.schema.ts`
2. Compile schema to runtime input
3. Stop hand-authoring app controller tree in demo
4. Update public-surface tests

### Stage 5 — Service boot integration
**Objective:** Let EFS start and manage services from app schema.

**Tasks:**
1. Add service schema types
2. Add CLI command for service orchestration
3. Add port validation / process startup rules
4. Add smoke tests for dev startup plan generation

### Stage 6 — Controller-first removal
**Objective:** Finish the shift to schema-first and delete old controller-first public entrypoints.

**Tasks:**
1. Remove controller-first public exports and docs
2. Replace remaining demos/tests with schema-first fixtures
3. Delete migration-only adapter code once runtime is fully schema-driven

---

## 8. Constraints and non-goals

### Constraints
- Existing tests must stay green after each stage.
- Public root entry should remain minimal.
- Demo must remain buildable throughout migration.
- Do not mix public schema contracts with internal runtime state again.

### Non-goals for the first restructure pass
- Full API-spec ingestion from OpenAPI on day one
- Rewriting every panel/control to schema-driven immediately
- Keeping a long-lived public compatibility layer

---

## 9. Approval checklist

Approve this structure before implementation if you agree with all of the following:

- [ ] EFS should center around an **app schema root**
- [ ] `packages/schema` should become the main public contract package
- [ ] `packages/compiler` should own schema/controller translation
- [ ] `packages/runtime` should own app shell + resource runtime
- [ ] `packages/vue` should become a thin façade
- [ ] service startup / port config belongs in app schema
- [ ] controller-first should be removed rather than preserved as a supported path

---

## 10. Recommended immediate next step

Once approved, the first concrete implementation step should be:

**Create `packages/schema` and define `EfsAppSchema`, `EfsAuthSchema`, `EfsServiceSchema`, and `EfsResourceSchema` before moving runtime files.**

That gives the whole repo a stable target to migrate toward.
