import type { ResCrudRuntime, ResCrudRuntimeOptions, ResReportRuntime, ResReportRuntimeOptions, ResRuntime } from './shared-types';
import type { LegacyAppController } from './app-controller';
/**
 * Resolve a resource runtime from the legacy controller contract.
 *
 * Public app authoring should prefer schema-first input plus
 * `createPlatformAppFromSchema(...)` or internal bridges; this module remains the controller-side
 * runtime compatibility layer consumed after that bridge step.
 */
export declare function resolveResRuntime(app: LegacyAppController, path: string, options?: ResCrudRuntimeOptions & ResReportRuntimeOptions): ResRuntime | null;
export declare function buildResReportRuntime(app: LegacyAppController, path: string, options?: ResReportRuntimeOptions): ResReportRuntime | null;
export declare function buildResCrudRuntime(app: LegacyAppController, path: string, options?: ResCrudRuntimeOptions): ResCrudRuntime | null;
