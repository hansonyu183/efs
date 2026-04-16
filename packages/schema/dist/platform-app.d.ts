import type { EfsAppI18nSchema, EfsAppSchema } from './app/app-schema.js';
export interface CreateAppFromSchemaOptions {
    fetcher?: typeof fetch;
    serviceKey?: string;
}
export interface EfsAppProps {
    app: ReturnType<typeof createAppFromSchema>;
    appName: string;
    brandIcon?: string;
    theme?: 'light' | 'dark';
    i18n?: EfsAppI18nSchema;
}
export declare function createAppFromSchema(schema: EfsAppSchema, options?: CreateAppFromSchemaOptions): {
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
        getCurrentAccessToken: () => string | undefined;
        setCurrentAccessToken: (token?: string) => Promise<void> | void;
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
                edit: (row: Record<string, unknown>) => Promise<Record<string, unknown>>;
                save: ({ mode, item, queryValues, page, pageSize }: {
                    mode: "create" | "edit";
                    item: Record<string, unknown>;
                    queryValues: Record<string, string>;
                    page: number;
                    pageSize: number;
                }) => Promise<void | import("./adapter/platform-runtime.js").SchemaSaveResult>;
                remove: (item: Record<string, unknown>) => Promise<any>;
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
export declare function createAppPropsFromSchema(schema: EfsAppSchema, options?: CreateAppFromSchemaOptions): EfsAppProps;
