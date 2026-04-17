## Goal

Convert the repository to a source-first internal service model by removing tracked `dist` artifacts, deleting remaining `apps/standard-demo` references, and updating scripts/tests/docs to consume source paths instead of committed build output.

## Acceptance

- `git ls-files` no longer includes `packages/*/dist/**` or `apps/*/dist/**`.
- Root scripts no longer reference `apps/standard-demo`, `pack:check`, or package-export validation flows.
- Tests no longer import `packages/*/dist/...` and no longer reference `apps/standard-demo`.
- Windows test execution no longer relies on `path.resolve(new URL(...).pathname)` or `execFileSync('npm', ...)`.
- Docs describe `apps/agentos` as the active app and `dist` as non-source temporary output.

## Phase Gates

- S2: Update manifests, scripts, tests, and docs for source-first behavior.
- S3: Remove tracked `dist` artifacts and run targeted checks.
- S4: Audit the cleanup for regressions and missed references.
- S5: Independent task audit reaches `Score >=85` and evidence credibility `>=15`.

## Rollback Conditions

- Revert script/test changes that make current source-based verification fail.
- Revert manifest simplification if it breaks workspace resolution or local tooling.
