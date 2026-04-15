import type { ComponentInternalInstance } from 'vue';
type LabelResolverOptions = {
    key: string;
    overrides?: Record<string, string>;
    instance?: ComponentInternalInstance | null;
    namespaces?: string[];
};
export declare function resolveLabel({ key, overrides, instance, namespaces }: LabelResolverOptions): string;
export declare function resolveOptionalLabel({ key, overrides, instance, namespaces }: LabelResolverOptions): string;
export declare function humanizeKey(key: string): string;
export {};
