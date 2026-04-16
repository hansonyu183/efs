import type { EfsAppI18nSchema, EfsAppSchema } from './app/app-schema.js'
import type { EfsServiceSchema } from './app/service-schema.js'
import type { EfsEndpointSchema, EfsResourceSchema } from './resource/resource-schema.js'
import { createRuntimeFromSchema, type SchemaAuthAdapter, type SchemaOperationAdapterMap, type SchemaResourceAdapters } from './adapter/platform-runtime.js'

export interface CreateAppFromSchemaOptions {
  fetcher?: typeof fetch
  serviceKey?: string
}

export interface EfsAppProps {
  app: ReturnType<typeof createAppFromSchema>
  appName: string
  brandIcon?: string
  theme?: 'light' | 'dark'
  i18n?: EfsAppI18nSchema
}

type TransportOptions = {
  requestDataKey?: string
  responseDataKey?: string
  authHeader?: string
  authScheme?: string
}

export function createAppFromSchema(schema: EfsAppSchema, options: CreateAppFromSchemaOptions = {}) {
  const fetcher = options.fetcher ?? globalThis.fetch
  if (!fetcher) {
    throw new Error('fetch is not available; provide options.fetcher when creating a platform app from schema')
  }

  const service = resolvePrimaryService(schema, options.serviceKey)
  const baseUrl = service?.baseUrl ?? ''
  const transport = resolveTransportOptions(service)
  let currentOrgCode: string | undefined
  let currentAccessToken: string | undefined
  let cachedOrgs: Array<{ key: string; value: string; title?: string; label?: string; disabled?: boolean }> = []

  const auth: SchemaAuthAdapter = buildAuthAdapter(
    schema,
    baseUrl,
    transport,
    fetcher,
    () => currentOrgCode,
    (value) => {
      currentOrgCode = value
    },
    () => currentAccessToken,
    (value) => {
      currentAccessToken = value
    },
    () => cachedOrgs,
    (value) => {
      cachedOrgs = value
    },
  )
  const resources = buildResourceAdapters(schema, baseUrl, transport, fetcher, () => currentAccessToken)

  return createRuntimeFromSchema({
    schema,
    auth,
    resources,
  })
}

export function createAppPropsFromSchema(
  schema: EfsAppSchema,
  options: CreateAppFromSchemaOptions = {},
): EfsAppProps {
  return {
    app: createAppFromSchema(schema, options),
    appName: schema.app.title || schema.app.name,
    brandIcon: schema.app.brandIcon,
    theme: schema.app.theme,
    i18n: resolvePlatformI18n(schema),
  }
}

function resolvePrimaryService(schema: EfsAppSchema, serviceKey?: string) {
  if (!schema.services) return undefined
  if (serviceKey && schema.services[serviceKey]) return schema.services[serviceKey]
  if (schema.services.api) return schema.services.api
  return Object.values(schema.services).find((service) => service.kind === 'http' || service.kind === 'gateway' || service.kind === 'mock')
}

function resolvePlatformI18n(schema: EfsAppSchema): EfsAppI18nSchema | undefined {
  const locale = schema.i18n?.locale ?? schema.app.locale
  const fallbackLocale = schema.i18n?.fallbackLocale ?? schema.app.locale ?? schema.i18n?.locale
  if (!locale && !fallbackLocale && !schema.i18n?.messages) return undefined
  return {
    locale,
    fallbackLocale,
    messages: schema.i18n?.messages,
  }
}

function resolveTransportOptions(service?: EfsServiceSchema): TransportOptions {
  return {
    requestDataKey: service?.transport?.requestDataKey,
    responseDataKey: service?.transport?.responseDataKey,
    authHeader: service?.transport?.authHeader || 'Authorization',
    authScheme: service?.transport?.authScheme || 'Bearer',
  }
}

function buildAuthAdapter(
  schema: EfsAppSchema,
  baseUrl: string,
  transport: TransportOptions,
  fetcher: typeof fetch,
  getCurrentOrgCode: () => string | undefined,
  setCurrentOrgCode: (orgCode: string | undefined) => void,
  getCurrentAccessToken: () => string | undefined,
  setCurrentAccessToken: (token: string | undefined) => void,
  getCachedOrgs: () => Array<{ key: string; value: string; title?: string; label?: string; disabled?: boolean }>,
  setCachedOrgs: (orgs: Array<{ key: string; value: string; title?: string; label?: string; disabled?: boolean }>) => void,
): SchemaAuthAdapter {
  const auth = schema.auth
  const accessTokenField = auth?.token?.accessTokenField || 'accessToken'
  const refreshTokenField = auth?.token?.refreshTokenField || 'refreshToken'
  const expiresAtField = auth?.token?.expiresAtField || 'expiresAt'
  const tokenTypeField = auth?.token?.tokenTypeField || 'tokenType'
  const currentOrgCodeField = auth?.org?.currentOrgCodeField || 'orgCode'

  return {
    async login(input) {
      if (!auth?.login) {
        return {
          accessToken: 'anonymous-token',
        }
      }
      const data = await requestJson(fetcher, baseUrl, transport, auth.login, {
        json: {
          ...input,
          username: input.name,
          password: input.pwd,
        },
      })
      const token = asOptionalString(readPath(data, accessTokenField) ?? data?.accessToken) || 'anonymous-token'
      const orgCode = asOptionalString(readPath(data, currentOrgCodeField) ?? data?.orgCode)
      const orgs = normalizeAuthOptions(readOrganizations(data))
      setCurrentAccessToken(token)
      if (typeof orgCode === 'string' && orgCode) setCurrentOrgCode(orgCode)
      if (orgs.length > 0) setCachedOrgs(orgs)
      return {
        accessToken: token,
        refreshToken: asOptionalString(readPath(data, refreshTokenField)),
        expiresAt: asOptionalString(readPath(data, expiresAtField)),
        tokenType: asOptionalString(readPath(data, tokenTypeField)) ?? transport.authScheme,
      }
    },
    logout: auth?.logout
      ? async () => {
          try {
            await requestJson(fetcher, baseUrl, transport, auth.logout!, {
              json: getCurrentOrgCode() ? { orgCode: getCurrentOrgCode() } : undefined,
              accessToken: getCurrentAccessToken(),
            })
          } finally {
            setCurrentAccessToken(undefined)
            setCurrentOrgCode(undefined)
            setCachedOrgs([])
          }
        }
      : undefined,
    getOrgs: auth?.orgs
      ? async () => {
          const accessToken = getCurrentAccessToken()
          if (!accessToken && getCachedOrgs().length > 0) return getCachedOrgs()
          const data = await requestJson(fetcher, baseUrl, transport, auth.orgs!, { accessToken })
          const items = normalizeAuthOptions(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : readOrganizations(data))
          if (items.length > 0) setCachedOrgs(items)
          return items
        }
      : undefined,
    getCurrentOrgCode,
    setCurrentOrgCode(orgCode) {
      setCurrentOrgCode(orgCode)
    },
    getCurrentAccessToken,
    setCurrentAccessToken(token) {
      setCurrentAccessToken(token)
    },
  }
}

function buildResourceAdapters(
  schema: EfsAppSchema,
  baseUrl: string,
  transport: TransportOptions,
  fetcher: typeof fetch,
  getCurrentAccessToken: () => string | undefined,
): SchemaResourceAdapters {
  const resources: SchemaResourceAdapters = {}
  for (const domain of schema.domains) {
    for (const resource of domain.resources) {
      resources[`${domain.key}/${resource.key}`] = buildOperationAdapterMap(resource, baseUrl, transport, fetcher, getCurrentAccessToken)
    }
  }
  return resources
}

function buildOperationAdapterMap(
  resource: EfsResourceSchema,
  baseUrl: string,
  transport: TransportOptions,
  fetcher: typeof fetch,
  getCurrentAccessToken: () => string | undefined,
): SchemaOperationAdapterMap {
  const handlers: SchemaOperationAdapterMap = {}
  for (const [operationKey, endpoint] of Object.entries(resource.operations || {})) {
    if (!endpoint) continue
    handlers[operationKey] = async (context: any = {}) => {
      const response = await requestJson(fetcher, baseUrl, transport, endpoint, {
        context,
        accessToken: getCurrentAccessToken(),
      })
      return normalizeOperationResult(operationKey, response)
    }
  }
  return handlers
}

function normalizeOperationResult(operationKey: string, response: any) {
  if (operationKey === 'list' || operationKey === 'query') {
    if (Array.isArray(response)) {
      return {
        items: response,
        total: response.length,
      }
    }
    return {
      items: Array.isArray(response?.items) ? response.items : [],
      total: Number(response?.total ?? (Array.isArray(response?.items) ? response.items.length : 0)),
      activeItem: response?.activeItem ?? null,
      summary: Array.isArray(response?.summary) ? response.summary : undefined,
    }
  }

  if (operationKey === 'remove' || operationKey === 'delete') {
    return {
      refresh: true,
      activeItem: null,
      ...(response && typeof response === 'object' ? response : {}),
    }
  }

  if (operationKey === 'create' || operationKey === 'update') {
    return {
      refresh: true,
      close: true,
      ...(response && typeof response === 'object' ? response : {}),
    }
  }

  return response
}

async function requestJson(
  fetcher: typeof fetch,
  baseUrl: string,
  transport: TransportOptions,
  endpoint: EfsEndpointSchema,
  options: { json?: unknown; context?: any; accessToken?: string },
) {
  const method = endpoint.method || 'GET'
  const { url, body } = buildRequest(baseUrl, transport, endpoint, options.context, options.json)
  const headers: Record<string, string> = {}
  if (body != null) headers['content-type'] = 'application/json'
  if (options.accessToken) headers[transport.authHeader || 'Authorization'] = `${transport.authScheme || 'Bearer'} ${options.accessToken}`
  const response = await fetcher(url, {
    method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: body == null ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let data: any = undefined
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  const unwrapped = unwrapResponseData(data, transport)
  const isOk = typeof response.ok === 'boolean' ? response.ok : true
  if (!isOk) {
    const message = asOptionalString(data?.message ?? unwrapped?.message) || `${response.status} ${response.statusText}`
    throw new Error(message)
  }
  return unwrapped
}

function buildRequest(
  baseUrl: string,
  transport: TransportOptions,
  endpoint: EfsEndpointSchema,
  context: any,
  explicitJson: unknown,
) {
  const method = endpoint.method || 'GET'
  const path = interpolatePath(endpoint.path, context)
  const url = buildUrl(baseUrl, path)

  if (method === 'GET') {
    const target = new URL(url)
    const queryValues = context?.queryValues && typeof context.queryValues === 'object' ? context.queryValues : {}
    for (const [key, value] of Object.entries(queryValues)) {
      if (value == null || value === '') continue
      target.searchParams.set(key, String(value))
    }
    if (typeof context?.page === 'number') target.searchParams.set('page', String(context.page))
    if (typeof context?.pageSize === 'number') target.searchParams.set('pageSize', String(context.pageSize))
    return { url: target.toString(), body: undefined }
  }

  const payload = explicitJson !== undefined
    ? explicitJson
    : context?.item && typeof context.item === 'object'
      ? context.item
      : context

  return { url, body: wrapRequestData(payload, transport) }
}

function interpolatePath(path: string, context: any) {
  const item = context?.item && typeof context.item === 'object' ? context.item : undefined
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const value = context?.[key] ?? item?.[key] ?? item?.id
    return encodeURIComponent(String(value ?? key))
  })
}

function buildUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const resolvedBase = resolveBaseUrl(baseUrl)
  const normalizedBase = resolvedBase.replace(/\/+$/, '')
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
}

function resolveBaseUrl(baseUrl: string) {
  if (!baseUrl) {
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
    return 'http://127.0.0.1'
  }
  if (/^https?:\/\//i.test(baseUrl)) return baseUrl
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`
  }
  return `http://127.0.0.1${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`
}

function wrapRequestData(payload: unknown, transport: TransportOptions) {
  if (!transport.requestDataKey) return payload
  return {
    [transport.requestDataKey]: payload,
  }
}

function unwrapResponseData(data: any, transport: TransportOptions) {
  if (!transport.responseDataKey) return data
  if (data && typeof data === 'object' && transport.responseDataKey in data) return data[transport.responseDataKey]
  return data
}

function readPath(value: any, path: string) {
  if (!value || !path) return undefined
  let current = value
  for (const segment of path.split('.').filter(Boolean)) {
    if (!current || typeof current !== 'object') return undefined
    current = current[segment]
  }
  return current
}

function normalizeAuthOptions(items: any[]): Array<{ key: string; value: string; title?: string; label?: string; disabled?: boolean }> {
  return items.map((item: any) => ({
    key: String(item?.key ?? item?.value ?? item?.code ?? item?.orgCode ?? ''),
    value: String(item?.value ?? item?.code ?? item?.orgCode ?? item?.key ?? ''),
    title: asOptionalString(item?.title ?? item?.label ?? item?.name),
    label: asOptionalString(item?.label ?? item?.title ?? item?.name),
    disabled: Boolean(item?.disabled),
  }))
}

function readOrganizations(data: any) {
  if (Array.isArray(data?.organizations)) return data.organizations
  if (Array.isArray(data?.orgs)) return data.orgs
  return []
}

function asOptionalString(value: unknown) {
  return value == null ? undefined : String(value)
}
