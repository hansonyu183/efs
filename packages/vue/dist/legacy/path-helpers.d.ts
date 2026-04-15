import type { FlatMenuNode } from '../shared/navigation-menu';
import type { DomainResPath } from './shared-types';
import type { LegacyAppController } from './app-controller';
import type { LegacyDomainController } from './domain-controller';
import type { LegacyResController } from './res-controller';
export declare function buildResPath<D extends string, R extends string>(domain: D, res: R): DomainResPath<D, R>;
export declare function splitResPath(path: string): {
    domain: string;
    res: string;
} | null;
export declare function isResController(value: unknown): value is LegacyResController;
export declare function listAllResControllers(app: LegacyAppController): LegacyResController[];
export declare function findDomainByKey<D extends string = string>(app: LegacyAppController, domainKey: D): LegacyDomainController<D> | undefined;
export declare function findResByPath(app: LegacyAppController, path: string): LegacyResController | undefined;
export declare function flattenAppMenuNodes(app: LegacyAppController): FlatMenuNode[];
