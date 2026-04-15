import type { ComputedRef, InjectionKey } from 'vue';
export type EfsI18nMessages = {
    [key: string]: string | EfsI18nMessages;
};
export interface EfsI18nConfig {
    locale?: string;
    fallbackLocale?: string;
    messages?: EfsI18nMessages | Record<string, EfsI18nMessages>;
}
export interface EfsI18nContext {
    config: ComputedRef<EfsI18nConfig | undefined>;
    translate: (key: string) => string;
}
export declare const EFS_I18N_CONTEXT: InjectionKey<EfsI18nContext>;
type ResolveMessageOptions = {
    key: string;
    config?: EfsI18nConfig;
};
export declare function mergeEfsI18nConfigs(...configs: Array<EfsI18nConfig | undefined>): EfsI18nConfig | undefined;
export declare function resolveEfsI18nLabel({ key, config }: ResolveMessageOptions): string;
export {};
