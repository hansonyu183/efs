import type { FlatMenuNode } from '../shared/NavigationMenu';
import type { DomainResPath } from './shared-types';
import type { AppController } from './app-controller';
import type { DomainController } from './domain-controller';
import type { ResController } from './res-controller';
export declare function buildResPath<D extends string, R extends string>(domain: D, res: R): DomainResPath<D, R>;
export declare function splitResPath(path: string): {
    domain: string;
    res: string;
} | null;
export declare function isResController(value: unknown): value is ResController;
export declare function listAllResControllers(app: AppController): ResController[];
export declare function findDomainByKey<D extends string = string>(app: AppController, domainKey: D): DomainController<D> | undefined;
export declare function findResByPath(app: AppController, path: string): ResController | undefined;
export declare function flattenAppMenuNodes(app: AppController): FlatMenuNode[];
