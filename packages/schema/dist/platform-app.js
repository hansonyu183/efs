import { adaptAppSchemaToVueController } from './adapter/vue-controller.js';
export function createPlatformAppFromSchema(schema, options = {}) {
    const fetcher = options.fetcher ?? globalThis.fetch;
    if (!fetcher) {
        throw new Error('fetch is not available; provide options.fetcher when creating a platform app from schema');
    }
    const service = resolvePrimaryService(schema, options.serviceKey);
    const baseUrl = service?.baseUrl ?? '';
    const transport = resolveTransportOptions(service);
    let currentOrgCode;
    let currentAccessToken;
    let cachedOrgs = [];
    const auth = buildAuthAdapter(schema, baseUrl, transport, fetcher, () => currentOrgCode, (value) => {
        currentOrgCode = value;
    }, () => currentAccessToken, (value) => {
        currentAccessToken = value;
    }, () => cachedOrgs, (value) => {
        cachedOrgs = value;
    });
    const resources = buildResourceAdapters(schema, baseUrl, transport, fetcher, () => currentAccessToken);
    return adaptAppSchemaToVueController({
        schema,
        auth,
        resources,
    });
}
export function createPlatformEfsAppPropsFromSchema(schema, options = {}) {
    return {
        app: createPlatformAppFromSchema(schema, options),
        appName: schema.app.title || schema.app.name,
        brandIcon: schema.app.brandIcon,
        theme: schema.app.theme,
        i18n: resolvePlatformI18n(schema),
    };
}
function resolvePrimaryService(schema, serviceKey) {
    if (!schema.services)
        return undefined;
    if (serviceKey && schema.services[serviceKey])
        return schema.services[serviceKey];
    if (schema.services.api)
        return schema.services.api;
    return Object.values(schema.services).find((service) => service.kind === 'http' || service.kind === 'gateway' || service.kind === 'mock');
}
function resolvePlatformI18n(schema) {
    const locale = schema.i18n?.locale ?? schema.app.locale;
    const fallbackLocale = schema.i18n?.fallbackLocale ?? schema.app.locale ?? schema.i18n?.locale;
    if (!locale && !fallbackLocale && !schema.i18n?.messages)
        return undefined;
    return {
        locale,
        fallbackLocale,
        messages: schema.i18n?.messages,
    };
}
function resolveTransportOptions(service) {
    return {
        requestDataKey: service?.transport?.requestDataKey,
        responseDataKey: service?.transport?.responseDataKey,
        authHeader: service?.transport?.authHeader || 'Authorization',
        authScheme: service?.transport?.authScheme || 'Bearer',
    };
}
function buildAuthAdapter(schema, baseUrl, transport, fetcher, getCurrentOrgCode, setCurrentOrgCode, getCurrentAccessToken, setCurrentAccessToken, getCachedOrgs, setCachedOrgs) {
    const auth = schema.auth;
    const accessTokenField = auth?.token?.accessTokenField || 'accessToken';
    const refreshTokenField = auth?.token?.refreshTokenField || 'refreshToken';
    const expiresAtField = auth?.token?.expiresAtField || 'expiresAt';
    const tokenTypeField = auth?.token?.tokenTypeField || 'tokenType';
    const currentOrgCodeField = auth?.org?.currentOrgCodeField || 'orgCode';
    return {
        async login(input) {
            if (!auth?.login) {
                return {
                    accessToken: 'anonymous-token',
                };
            }
            const data = await requestJson(fetcher, baseUrl, transport, auth.login, {
                json: {
                    ...input,
                    username: input.name,
                    password: input.pwd,
                },
            });
            const token = asOptionalString(readPath(data, accessTokenField) ?? data?.accessToken) || 'anonymous-token';
            const orgCode = asOptionalString(readPath(data, currentOrgCodeField) ?? data?.orgCode);
            const orgs = normalizeAuthOptions(readOrganizations(data));
            setCurrentAccessToken(token);
            if (typeof orgCode === 'string' && orgCode)
                setCurrentOrgCode(orgCode);
            if (orgs.length > 0)
                setCachedOrgs(orgs);
            return {
                accessToken: token,
                refreshToken: asOptionalString(readPath(data, refreshTokenField)),
                expiresAt: asOptionalString(readPath(data, expiresAtField)),
                tokenType: asOptionalString(readPath(data, tokenTypeField)) ?? transport.authScheme,
            };
        },
        logout: auth?.logout
            ? async () => {
                try {
                    await requestJson(fetcher, baseUrl, transport, auth.logout, {
                        json: getCurrentOrgCode() ? { orgCode: getCurrentOrgCode() } : undefined,
                        accessToken: getCurrentAccessToken(),
                    });
                }
                finally {
                    setCurrentAccessToken(undefined);
                    setCurrentOrgCode(undefined);
                    setCachedOrgs([]);
                }
            }
            : undefined,
        getOrgs: auth?.orgs
            ? async () => {
                const accessToken = getCurrentAccessToken();
                if (!accessToken && getCachedOrgs().length > 0)
                    return getCachedOrgs();
                const data = await requestJson(fetcher, baseUrl, transport, auth.orgs, { accessToken });
                const items = normalizeAuthOptions(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : readOrganizations(data));
                if (items.length > 0)
                    setCachedOrgs(items);
                return items;
            }
            : undefined,
        getCurrentOrgCode,
        setCurrentOrgCode(orgCode) {
            setCurrentOrgCode(orgCode);
        },
        getCurrentAccessToken,
        setCurrentAccessToken(token) {
            setCurrentAccessToken(token);
        },
    };
}
function buildResourceAdapters(schema, baseUrl, transport, fetcher, getCurrentAccessToken) {
    const resources = {};
    for (const domain of schema.domains) {
        for (const resource of domain.resources) {
            resources[`${domain.key}/${resource.key}`] = buildOperationAdapterMap(resource, baseUrl, transport, fetcher, getCurrentAccessToken);
        }
    }
    return resources;
}
function buildOperationAdapterMap(resource, baseUrl, transport, fetcher, getCurrentAccessToken) {
    const handlers = {};
    for (const [operationKey, endpoint] of Object.entries(resource.operations || {})) {
        if (!endpoint)
            continue;
        handlers[operationKey] = async (context = {}) => {
            const response = await requestJson(fetcher, baseUrl, transport, endpoint, {
                context,
                accessToken: getCurrentAccessToken(),
            });
            return normalizeOperationResult(operationKey, response);
        };
    }
    return handlers;
}
function normalizeOperationResult(operationKey, response) {
    if (operationKey === 'list' || operationKey === 'query') {
        if (Array.isArray(response)) {
            return {
                items: response,
                total: response.length,
            };
        }
        return {
            items: Array.isArray(response?.items) ? response.items : [],
            total: Number(response?.total ?? (Array.isArray(response?.items) ? response.items.length : 0)),
            activeItem: response?.activeItem ?? null,
            summary: Array.isArray(response?.summary) ? response.summary : undefined,
        };
    }
    if (operationKey === 'remove' || operationKey === 'delete') {
        return {
            refresh: true,
            activeItem: null,
            ...(response && typeof response === 'object' ? response : {}),
        };
    }
    if (operationKey === 'create' || operationKey === 'update') {
        return {
            refresh: true,
            close: true,
            ...(response && typeof response === 'object' ? response : {}),
        };
    }
    return response;
}
async function requestJson(fetcher, baseUrl, transport, endpoint, options) {
    const method = endpoint.method || 'GET';
    const { url, body } = buildRequest(baseUrl, transport, endpoint, options.context, options.json);
    const headers = {};
    if (body != null)
        headers['content-type'] = 'application/json';
    if (options.accessToken)
        headers[transport.authHeader || 'Authorization'] = `${transport.authScheme || 'Bearer'} ${options.accessToken}`;
    const response = await fetcher(url, {
        method,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: body == null ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let data = undefined;
    if (text) {
        try {
            data = JSON.parse(text);
        }
        catch {
            data = text;
        }
    }
    const unwrapped = unwrapResponseData(data, transport);
    const isOk = typeof response.ok === 'boolean' ? response.ok : true;
    if (!isOk) {
        const message = asOptionalString(data?.message ?? unwrapped?.message) || `${response.status} ${response.statusText}`;
        throw new Error(message);
    }
    return unwrapped;
}
function buildRequest(baseUrl, transport, endpoint, context, explicitJson) {
    const method = endpoint.method || 'GET';
    const path = interpolatePath(endpoint.path, context);
    const url = buildUrl(baseUrl, path);
    if (method === 'GET') {
        const target = new URL(url);
        const queryValues = context?.queryValues && typeof context.queryValues === 'object' ? context.queryValues : {};
        for (const [key, value] of Object.entries(queryValues)) {
            if (value == null || value === '')
                continue;
            target.searchParams.set(key, String(value));
        }
        if (typeof context?.page === 'number')
            target.searchParams.set('page', String(context.page));
        if (typeof context?.pageSize === 'number')
            target.searchParams.set('pageSize', String(context.pageSize));
        return { url: target.toString(), body: undefined };
    }
    const payload = explicitJson !== undefined
        ? explicitJson
        : context?.item && typeof context.item === 'object'
            ? context.item
            : context;
    return { url, body: wrapRequestData(payload, transport) };
}
function interpolatePath(path, context) {
    const item = context?.item && typeof context.item === 'object' ? context.item : undefined;
    return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
        const value = context?.[key] ?? item?.[key] ?? item?.id;
        return encodeURIComponent(String(value ?? key));
    });
}
function buildUrl(baseUrl, path) {
    if (/^https?:\/\//i.test(path))
        return path;
    const resolvedBase = resolveBaseUrl(baseUrl);
    const normalizedBase = resolvedBase.replace(/\/+$/, '');
    const normalizedPath = String(path || '').replace(/^\/+/, '');
    return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
}
function resolveBaseUrl(baseUrl) {
    if (!baseUrl) {
        if (typeof window !== 'undefined' && window.location?.origin)
            return window.location.origin;
        return 'http://127.0.0.1';
    }
    if (/^https?:\/\//i.test(baseUrl))
        return baseUrl;
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`;
    }
    return `http://127.0.0.1${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`;
}
function wrapRequestData(payload, transport) {
    if (!transport.requestDataKey)
        return payload;
    return {
        [transport.requestDataKey]: payload,
    };
}
function unwrapResponseData(data, transport) {
    if (!transport.responseDataKey)
        return data;
    if (data && typeof data === 'object' && transport.responseDataKey in data)
        return data[transport.responseDataKey];
    return data;
}
function readPath(value, path) {
    if (!value || !path)
        return undefined;
    let current = value;
    for (const segment of path.split('.').filter(Boolean)) {
        if (!current || typeof current !== 'object')
            return undefined;
        current = current[segment];
    }
    return current;
}
function normalizeAuthOptions(items) {
    return items.map((item) => ({
        key: String(item?.key ?? item?.value ?? item?.code ?? item?.orgCode ?? ''),
        value: String(item?.value ?? item?.code ?? item?.orgCode ?? item?.key ?? ''),
        title: asOptionalString(item?.title ?? item?.label ?? item?.name),
        label: asOptionalString(item?.label ?? item?.title ?? item?.name),
        disabled: Boolean(item?.disabled),
    }));
}
function readOrganizations(data) {
    if (Array.isArray(data?.organizations))
        return data.organizations;
    if (Array.isArray(data?.orgs))
        return data.orgs;
    return [];
}
function asOptionalString(value) {
    return value == null ? undefined : String(value);
}
