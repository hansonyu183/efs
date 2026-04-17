## Goal

Fix workspace/editor module resolution so repository code no longer reports missing `vue` and `@efs/schema` during normal TypeScript authoring.

## Acceptance

- App source files can resolve `vue` from the workspace install.
- App/schema source files can resolve `@efs/schema` from repository source during authoring.
- Current internal app entry imports remain type-checkable under repo-level TypeScript settings.

## Phase Gates

- S2: Add repo-level authoring config and minimal app-entry adjustments without changing public package contracts.
- S3: Verify targeted TypeScript commands and package/app builds still pass.
- S4: Audit changed files for regression risk.
- S5: Independent task audit reaches `Score >= 85` and evidence credibility `>= 15`.

## Rollback Conditions

- Revert repo-level TypeScript config if it breaks existing package builds or changes import semantics outside authoring.
- Revert app-entry typing adjustments if they alter runtime behavior.
