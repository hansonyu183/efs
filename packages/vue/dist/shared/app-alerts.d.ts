export type AppAlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AppAlertItem = {
    key: string;
    tone?: AppAlertTone;
    title?: string;
    message?: string;
    closable?: boolean;
};
declare function push(input: Omit<AppAlertItem, 'key'> & {
    key?: string;
}): string;
declare function remove(key: string): void;
declare function clear(): void;
export declare function useAppAlerts(): {
    items: Readonly<import("vue").Ref<readonly {
        readonly key: string;
        readonly tone?: AppAlertTone;
        readonly title?: string;
        readonly message?: string;
        readonly closable?: boolean;
    }[], readonly {
        readonly key: string;
        readonly tone?: AppAlertTone;
        readonly title?: string;
        readonly message?: string;
        readonly closable?: boolean;
    }[]>>;
    hasItems: import("vue").ComputedRef<boolean>;
    push: typeof push;
    remove: typeof remove;
    clear: typeof clear;
    info(input: Omit<AppAlertItem, "key" | "tone"> & {
        key?: string;
    }): string;
    success(input: Omit<AppAlertItem, "key" | "tone"> & {
        key?: string;
    }): string;
    warning(input: Omit<AppAlertItem, "key" | "tone"> & {
        key?: string;
    }): string;
    danger(input: Omit<AppAlertItem, "key" | "tone"> & {
        key?: string;
    }): string;
};
export {};
