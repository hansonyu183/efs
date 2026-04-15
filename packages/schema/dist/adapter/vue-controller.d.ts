import type { EfsAppSchema } from '../app/app-schema.js';
/**
 * Bridge schema-first app/resource input into the current Vue runtime's
 * legacy controller contract. This adapter is the compatibility seam between
 * the public authoring model (`app.schema.ts`) and the existing controller-
 * shaped runtime consumed by `@efs/vue`.
 */
export interface SchemaAuthAdapter {
    login: (input: {
        name: string;
        pwd: string;
        orgCode?: string;
    }) => Promise<{
        accessToken: string;
        refreshToken?: string;
        expiresAt?: string;
        tokenType?: string;
    }> | {
        accessToken: string;
        refreshToken?: string;
        expiresAt?: string;
        tokenType?: string;
    };
    logout?: () => Promise<void> | void;
    getOrgs?: () => Promise<readonly {
        key: string;
        value: string;
        title?: string;
        label?: string;
        disabled?: boolean;
    }[]> | readonly {
        key: string;
        value: string;
        title?: string;
        label?: string;
        disabled?: boolean;
    }[];
    getCurrentOrgCode?: () => string | undefined;
    setCurrentOrgCode?: (orgCode: string) => Promise<void> | void;
}
export interface SchemaResourceAdapterContext {
    queryValues: Record<string, string>;
    page: number;
    pageSize: number;
}
export interface SchemaCrudSaveContext extends SchemaResourceAdapterContext {
    item: Record<string, unknown>;
}
export interface SchemaOperationAdapterMap {
    list?: (context: SchemaResourceAdapterContext) => Promise<SchemaQueryResult> | SchemaQueryResult;
    query?: (context: SchemaResourceAdapterContext) => Promise<SchemaQueryResult> | SchemaQueryResult;
    get?: (context: {
        id?: string;
        item?: Record<string, unknown> | null;
    }) => Promise<Record<string, unknown> | null | undefined> | Record<string, unknown> | null | undefined;
    create?: (context: SchemaCrudSaveContext) => Promise<SchemaSaveResult | void> | SchemaSaveResult | void;
    update?: (context: SchemaCrudSaveContext) => Promise<SchemaSaveResult | void> | SchemaSaveResult | void;
    remove?: (context: {
        item: Record<string, unknown>;
    }) => Promise<SchemaRemoveResult | void> | SchemaRemoveResult | void;
    [operation: string]: ((context: any) => Promise<any> | any) | undefined;
}
export interface SchemaQueryResult {
    items: Record<string, unknown>[];
    total?: number;
    activeItem?: Record<string, unknown> | null;
    summary?: Array<{
        key: string;
        label?: string;
        value?: string | number;
        note?: string;
        badge?: string;
    }>;
}
export interface SchemaSaveResult {
    refresh?: boolean;
    close?: boolean;
    activeItem?: Record<string, unknown> | null;
}
export interface SchemaRemoveResult {
    refresh?: boolean;
    activeItem?: Record<string, unknown> | null;
}
export interface SchemaResourceAdapters {
    [resourcePath: string]: SchemaOperationAdapterMap | undefined;
}
export interface AdaptAppSchemaToVueControllerOptions {
    schema: EfsAppSchema;
    auth: SchemaAuthAdapter;
    resources?: SchemaResourceAdapters;
}
export declare function adaptAppSchemaToVueController(options: AdaptAppSchemaToVueControllerOptions): {
    kind: "app";
    auth: {
        kind: "auth";
        login: (input: {
            name: string;
            pwd: string;
            orgCode?: string;
        }) => Promise<{
            accessToken: string;
            refreshToken?: string;
            expiresAt?: string;
            tokenType?: string;
        }> | {
            accessToken: string;
            refreshToken?: string;
            expiresAt?: string;
            tokenType?: string;
        };
        logout: () => Promise<void> | void;
        getOrgs: () => Promise<readonly {
            key: string;
            value: string;
            title?: string;
            label?: string;
            disabled?: boolean;
        }[]> | readonly {
            key: string;
            value: string;
            title?: string;
            label?: string;
            disabled?: boolean;
        }[];
        getCurrentOrgCode: () => string | undefined;
        setCurrentOrgCode: (orgCode: string) => Promise<void> | void;
    };
    main: {
        kind: "main";
        defaultPath: string;
        domains: {
            kind: "domain";
            domain: string;
            title: string;
            items: {
                kind: "res";
                domain: string;
                res: string;
                title: string;
                runtimeKind: "crud" | "report";
                fields: ({
                    key: string;
                    title: string;
                    kind: string;
                    use: readonly ["query", "list", "detail"] | ("list" | "query" | "detail" | "form")[];
                    required: boolean;
                    readonly: boolean;
                    identity: string;
                    queryType: string;
                    widget: string;
                    render: string;
                    summary: boolean;
                } | {
                    kind: "enum";
                    options: {
                        key: string;
                        value: string;
                        disabled: boolean;
                    }[];
                    key: string;
                    title: string;
                    use: readonly ["query", "list", "detail"] | ("list" | "query" | "detail" | "form")[];
                    required: boolean;
                    readonly: boolean;
                    identity: string;
                    queryType: string;
                    widget: string;
                    render: string;
                    summary: boolean;
                } | {
                    kind: "ref";
                    ref: string;
                    options: {
                        key: string;
                        value: string;
                        disabled: boolean;
                    }[];
                    key: string;
                    title: string;
                    use: readonly ["query", "list", "detail"] | ("list" | "query" | "detail" | "form")[];
                    required: boolean;
                    readonly: boolean;
                    identity: string;
                    queryType: string;
                    widget: string;
                    render: string;
                    summary: boolean;
                })[];
                query: ({ queryValues, page, pageSize }: {
                    queryValues: Record<string, string>;
                    page: number;
                    pageSize: number;
                }) => Promise<{
                    items: Record<string, unknown>[];
                    total: number;
                    activeItem: Record<string, unknown>;
                    summary: {
                        key: string;
                        label?: string;
                        value?: string | number;
                        note?: string;
                        badge?: string;
                    }[];
                }>;
                save: ({ mode, item, queryValues, page, pageSize }: {
                    mode: "create" | "edit";
                    item: Record<string, unknown>;
                    queryValues: Record<string, string>;
                    page: number;
                    pageSize: number;
                }) => Promise<void | SchemaSaveResult>;
                remove: (item: Record<string, unknown>) => Promise<void | SchemaRemoveResult>;
                export: ({ queryValues, page, pageSize, items, total, summary }: {
                    queryValues: Record<string, string>;
                    page: number;
                    pageSize: number;
                    items: Record<string, unknown>[];
                    total: number;
                    summary: any[];
                }) => Promise<void>;
                actions: {
                    report: {
                        key: string;
                    }[];
                    custom: Record<string, (payload: any) => Promise<void> | void>;
                } | {
                    page: {
                        key: string;
                    }[];
                    row: {
                        key: string;
                    }[];
                    custom: Record<string, (payload: any) => Promise<void> | void>;
                };
            }[];
        }[];
    };
};
