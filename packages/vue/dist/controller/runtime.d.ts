import type { ResCrudRuntime, ResCrudRuntimeOptions, ResReportRuntime, ResReportRuntimeOptions, ResRuntime } from './shared-types';
import type { AppController } from './app-controller';
export declare function resolveResRuntime(app: AppController, path: string, options?: ResCrudRuntimeOptions & ResReportRuntimeOptions): ResRuntime | null;
export declare function buildResReportRuntime(app: AppController, path: string, options?: ResReportRuntimeOptions): ResReportRuntime | null;
export declare function buildResCrudRuntime(app: AppController, path: string, options?: ResCrudRuntimeOptions): ResCrudRuntime | null;
