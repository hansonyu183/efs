import type { EfsAppI18nSchema, EfsAppSchema } from './app/app-schema.js'
import type { EfsEndpointSchema, EfsResourceSchema } from './resource/resource-schema.js'
import { adaptAppSchemaToVueController, type SchemaAuthAdapter, type SchemaOperationAdapterMap, type SchemaResourceAdapters } from './adapter/vue-controller.js'

export interface CreatePlatformAppFromSchemaOptions {
  fetcher?: typeof fetch
  serviceKey?: string
}

export interface PlatformEfsAppProps {
  app: ReturnType<typeof createPlatformAppFromSchema>
  appName: string
  brandIcon?: string
  i18n?: EfsAppI18nSchema
}

export function createPlatformAppFromSchema(schema: EfsAppSchema, options: CreatePlatformAppFromSchemaOptions = {}) {
  const fetcher = options.fetcher ?? globalThis.fetch
  if (!fetcher) {
    throw new Error('fetch is not available; provide options.fetcher when creating a platform app from schema')
  }

  const service = resolvePrimaryService(schema, options.serviceKey)
  const baseUrl = service?.baseUrl ?? ''
  let currentOrgCode: string | undefined

  const auth: SchemaAuthAdapter = buildAuthAdapter(schema, baseUrl, fetcher, () => currentOrgCode, (value) => {
    currentOrgCode = value
  })
  const resources = buildResourceAdapters(schema, baseUrl, fetcher)

  return adaptAppSchemaToVueController({
    schema,
    auth,
    resources,
  })
}

export function createPlatformEfsAppPropsFromSchema(
  schema: EfsAppSchema,
  options: CreatePlatformAppFromSchemaOptions = {},
): PlatformEfsAppProps {
  return {
    app: createPlatformAppFromSchema(schema, options),
    appName: schema.app.title || schema.app.name,
    brandIcon: schema.app.brandIcon,
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

function buildAuthAdapter(
  schema: EfsAppSchema,
  baseUrl: string,
  fetcher: typeof fetch,
  getCurrentOrgCode: () => string | undefined,
  setCurrentOrgCode: (orgCode: string | undefined) => void,
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
      const data = await requestJson(fetcher, baseUrl, auth.login, { json: input })
      const token = String(data?.[accessTokenField] ?? data?.accessToken ?? 'anonymous-token')
      const orgCode = data?.[currentOrgCodeField]
      if (typeof orgCode === 'string') setCurrentOrgCode(orgCode)
      return {
        accessToken: token,
        refreshToken: asOptionalString(data?.[refreshTokenField]),
        expiresAt: asOptionalString(data?.[expiresAtField]),
        tokenType: asOptionalString(data?.[tokenTypeField]),
      }
    },
    logout: auth?.logout
      ? async () => {
          await requestJson(fetcher, baseUrl, auth.logout!, { json: { orgCode: getCurrentOrgCode() } })
        }
      : undefined,
    getOrgs: auth?.orgs
      ? async () => {
          const data = await requestJson(fetcher, baseUrl, auth.orgs!, {})
          const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
          return items.map((item: any) => ({
            key: String(item?.key ?? item?.value ?? item?.code ?? item?.orgCode ?? ''),
            value: String(item?.value ?? item?.code ?? item?.orgCode ?? item?.key ?? ''),
            title: asOptionalString(item?.title ?? item?.label ?? item?.name),
            label: asOptionalString(item?.label ?? item?.title ?? item?.name),
            disabled: Boolean(item?.disabled),
          }))
        }
      : undefined,
    getCurrentOrgCode,
    setCurrentOrgCode(orgCode) {
      setCurrentOrgCode(orgCode)
    },
  }
}

function buildResourceAdapters(schema: EfsAppSchema, baseUrl: string, fetcher: typeof fetch): SchemaResourceAdapters {
  const resources: SchemaResourceAdapters = {}
  for (const domain of schema.domains) {
    for (const resource of domain.resources) {
      resources[`${domain.key}/${resource.key}`] = buildOperationAdapterMap(resource, baseUrl, fetcher)
    }
  }
  return resources
}

function buildOperationAdapterMap(resource: EfsResourceSchema, baseUrl: string, fetcher: typeof fetch): SchemaOperationAdapterMap {
  const handlers: SchemaOperationAdapterMap = {}
  for (const [operationKey, endpoint] of Object.entries(resource.operations || {})) {
    if (!endpoint) continue
    handlers[operationKey] = async (context: any = {}) => {
      const response = await requestJson(fetcher, baseUrl, endpoint, { context })
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

  if (operationKey === 'remove') {
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
  endpoint: EfsEndpointSchema,
  options: { json?: unknown; context?: any },
) {
  const method = endpoint.method || 'GET'
  const { url, body } = buildRequest(baseUrl, endpoint, options.context, options.json)
  const response = await fetcher(url, {
    method,
    headers: body == null ? undefined : { 'content-type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function buildRequest(baseUrl: string, endpoint: EfsEndpointSchema, context: any, explicitJson: unknown) {
  const method = endpoint.method || 'GET'
  const path = interpolatePath(endpoint.path, context)
  const url = new URL(path, ensureBaseUrl(baseUrl))

  if (method === 'GET') {
    const queryValues = context?.queryValues && typeof context.queryValues === 'object' ? context.queryValues : {}
    for (const [key, value] of Object.entries(queryValues)) {
      if (value == null || value === '') continue
      url.searchParams.set(key, String(value))
    }
    if (typeof context?.page === 'number') url.searchParams.set('page', String(context.page))
    if (typeof context?.pageSize === 'number') url.searchParams.set('pageSize', String(context.pageSize))
    return { url: url.toString(), body: undefined }
  }

  if (explicitJson !== undefined) {
    return { url: url.toString(), body: explicitJson }
  }

  if (context?.item && typeof context.item === 'object') {
    return { url: url.toString(), body: context.item }
  }

  return { url: url.toString(), body: context }
}

function interpolatePath(path: string, context: any) {
  const item = context?.item && typeof context.item === 'object' ? context.item : undefined
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const value = context?.[key] ?? item?.[key] ?? item?.id
    return encodeURIComponent(String(value ?? key))
  })
}

function ensureBaseUrl(baseUrl: string) {
  return baseUrl || 'http://127.0.0.1'
}

function asOptionalString(value: unknown) {
  return value == null ? undefined : String(value)
}
