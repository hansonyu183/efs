export const EFS_I18N_CONTEXT = Symbol('efs-i18n-context');
export function mergeEfsI18nConfigs(...configs) {
    const active = configs.filter(Boolean);
    if (active.length === 0)
        return undefined;
    const merged = {};
    for (const config of active) {
        if (!config)
            continue;
        if (config.locale)
            merged.locale = config.locale;
        if (config.fallbackLocale)
            merged.fallbackLocale = config.fallbackLocale;
        if (config.messages) {
            merged.messages = {
                ...(merged.messages ?? {}),
                ...config.messages,
            };
        }
    }
    return merged;
}
export function resolveEfsI18nLabel({ key, config }) {
    if (!config?.messages)
        return '';
    const candidates = resolveCandidateBundles(config);
    for (const bundle of candidates) {
        const resolved = readMessageValue(bundle, key);
        if (typeof resolved === 'string' && resolved)
            return resolved;
    }
    return '';
}
function resolveCandidateBundles(config) {
    const { messages, locale, fallbackLocale } = config;
    if (!messages)
        return [];
    if (locale && isLocaleBucketMap(messages) && messages[locale]) {
        return [
            messages[locale],
            ...(fallbackLocale && fallbackLocale !== locale && messages[fallbackLocale] ? [messages[fallbackLocale]] : []),
        ];
    }
    if (fallbackLocale && isLocaleBucketMap(messages) && messages[fallbackLocale]) {
        return [messages[fallbackLocale]];
    }
    return [messages];
}
function isLocaleBucketMap(messages) {
    return Object.values(messages).every((value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value));
}
function readMessageValue(bundle, key) {
    const direct = bundle[key];
    if (typeof direct === 'string')
        return direct;
    let current = bundle;
    for (const segment of key.split('.').filter(Boolean)) {
        if (!current || typeof current === 'string' || Array.isArray(current))
            return undefined;
        current = current[segment];
    }
    return typeof current === 'string' ? current : undefined;
}
