import { adaptAppSchemaToVueController } from './adapter/vue-controller.js';
export function createPlatformAppFromSchema(schema, options = {}) {
    const fetcher = options.fetcher ?? globalThis.fetch;
    if (!fetcher) {
        throw new Error('fetch is not available; provide options.fetcher when creating a platform app from schema');
    }
    const service = resolvePrimaryService(schema, options.serviceKey);
    const baseUrl = service?.baseUrl ?? '';
    let currentOrgCode;
    const auth = buildAuthAdapter(schema, baseUrl, fetcher, () => currentOrgCode, (value) => {
        currentOrgCode = value;
    });
    const resources = buildResourceAdapters(schema, baseUrl, fetcher);
    return adaptAppSchemaToVueController({
        schema,
        auth,
        resources,
    });
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
function buildAuthAdapter(schema, baseUrl, fetcher, getCurrentOrgCode, setCurrentOrgCode) {
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
            const data = await requestJson(fetcher, baseUrl, auth.login, { json: input });
            const token = String(data?.[accessTokenField] ?? data?.accessToken ?? 'anonymous-token');
            const orgCode = data?.[currentOrgCodeField];
            if (typeof orgCode === 'string')
                setCurrentOrgCode(orgCode);
            return {
                accessToken: token,
                refreshToken: asOptionalString(data?.[refreshTokenField]),
                expiresAt: asOptionalString(data?.[expiresAtField]),
                tokenType: asOptionalString(data?.[tokenTypeField]),
            };
        },
        logout: auth?.logout
            ? async () => {
                await requestJson(fetcher, baseUrl, auth.logout, { json: { orgCode: getCurrentOrgCode() } });
            }
            : undefined,
        getOrgs: auth?.orgs
            ? async () => {
                const data = await requestJson(fetcher, baseUrl, auth.orgs, {});
                const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
                return items.map((item) => ({
                    key: String(item?.key ?? item?.value ?? item?.code ?? item?.orgCode ?? ''),
                    value: String(item?.value ?? item?.code ?? item?.orgCode ?? item?.key ?? ''),
                    title: asOptionalString(item?.title ?? item?.label ?? item?.name),
                    label: asOptionalString(item?.label ?? item?.title ?? item?.name),
                    disabled: Boolean(item?.disabled),
                }));
            }
            : undefined,
        getCurrentOrgCode,
        setCurrentOrgCode(orgCode) {
            setCurrentOrgCode(orgCode);
        },
    };
}
function buildResourceAdapters(schema, baseUrl, fetcher) {
    const resources = {};
    for (const domain of schema.domains) {
        for (const resource of domain.resources) {
            resources[`${domain.key}/${resource.key}`] = buildOperationAdapterMap(resource, baseUrl, fetcher);
        }
    }
    return resources;
}
function buildOperationAdapterMap(resource, baseUrl, fetcher) {
    const handlers = {};
    for (const [operationKey, endpoint] of Object.entries(resource.operations || {})) {
        if (!endpoint)
            continue;
        handlers[operationKey] = async (context = {}) => {
            const response = await requestJson(fetcher, baseUrl, endpoint, { context });
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
    if (operationKey === 'remove') {
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
async function requestJson(fetcher, baseUrl, endpoint, options) {
    const method = endpoint.method || 'GET';
    const { url, body } = buildRequest(baseUrl, endpoint, options.context, options.json);
    const response = await fetcher(url, {
        method,
        headers: body == null ? undefined : { 'content-type': 'application/json' },
        body: body == null ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    if (!text)
        return undefined;
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
function buildRequest(baseUrl, endpoint, context, explicitJson) {
    const method = endpoint.method || 'GET';
    const path = interpolatePath(endpoint.path, context);
    const url = new URL(path, ensureBaseUrl(baseUrl));
    if (method === 'GET') {
        const queryValues = context?.queryValues && typeof context.queryValues === 'object' ? context.queryValues : {};
        for (const [key, value] of Object.entries(queryValues)) {
            if (value == null || value === '')
                continue;
            url.searchParams.set(key, String(value));
        }
        if (typeof context?.page === 'number')
            url.searchParams.set('page', String(context.page));
        if (typeof context?.pageSize === 'number')
            url.searchParams.set('pageSize', String(context.pageSize));
        return { url: url.toString(), body: undefined };
    }
    if (explicitJson !== undefined) {
        return { url: url.toString(), body: explicitJson };
    }
    if (context?.item && typeof context.item === 'object') {
        return { url: url.toString(), body: context.item };
    }
    return { url: url.toString(), body: context };
}
function interpolatePath(path, context) {
    const item = context?.item && typeof context.item === 'object' ? context.item : undefined;
    return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
        const value = context?.[key] ?? item?.[key] ?? item?.id;
        return encodeURIComponent(String(value ?? key));
    });
}
function ensureBaseUrl(baseUrl) {
    return baseUrl || 'http://127.0.0.1';
}
function asOptionalString(value) {
    return value == null ? undefined : String(value);
}
