import { reactive } from 'vue'
import type { EfsAppSchema } from './compose.ts'
import { requestJson, type HttpTransportOptions } from '../http/index.ts'
import type {
  ReportViewAction,
  ReportViewController,
  ReportViewResultColumn,
  ReportViewSummaryMetric,
  ResourceCrudController,
  ResourceCrudAction,
  ResourceCrudColumn,
  ResourceCrudDetailField,
  ResourceCrudFormSection,
  ResourceCrudQueryField,
  ResourceCrudRowAction,
  ResCrudModel,
  ResModel,
  ResReportModel,
  ResRowAction,
  ResAction,
} from '../model/types/resource-model.ts'

export type EfsAppI18nMessages = {
  [key: string]: string | EfsAppI18nMessages
}

export type EfsAppI18nSchema = NonNullable<EfsAppSchema['i18n']> & {
  locale?: string
  fallbackLocale?: string
  messages?: EfsAppI18nMessages | Record<string, EfsAppI18nMessages>
}

export type EfsServiceTransportSchema = {
  requestDataKey?: string
  responseDataKey?: string
  authHeader?: string
  authScheme?: string
}

export type EfsServiceSchema = NonNullable<EfsAppSchema['services']>[keyof NonNullable<EfsAppSchema['services']>] & {
  kind: string
  baseUrl?: string
  port?: number
  healthPath?: string
  devCommand?: string
  workingDir?: string
  env?: Record<string, string>
  transport?: EfsServiceTransportSchema
}

export interface CreateSchemaRuntimeOptions {
  fetcher?: typeof fetch
  serviceKey?: string
  getAccessToken?: () => string | undefined
}

interface SchemaAuthAdapter {
  login: (input: { name: string; pwd: string }) => Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string; tokenType?: string }> | { accessToken: string; refreshToken?: string; expiresAt?: string; tokenType?: string }
  logout?: () => Promise<void> | void
}

interface SchemaResourceAdapterContext {
  queryValues: Record<string, string>
  page: number
  pageSize: number
}

interface SchemaCrudSaveContext extends SchemaResourceAdapterContext {
  item: Record<string, unknown>
}

type SchemaOperationAdapter = (context: any) => Promise<any> | any

interface SchemaOperationAdapterMap {
  list?: (context: SchemaResourceAdapterContext) => Promise<SchemaQueryResult> | SchemaQueryResult
  query?: (context: SchemaResourceAdapterContext) => Promise<SchemaQueryResult> | SchemaQueryResult
  get?: (context: { id?: string; code?: string; item?: Record<string, unknown> | null }) => Promise<Record<string, unknown> | null | undefined> | Record<string, unknown> | null | undefined
  detail?: (context: { id?: string; code?: string; item?: Record<string, unknown> | null }) => Promise<Record<string, unknown> | null | undefined> | Record<string, unknown> | null | undefined
  create?: (context: SchemaCrudSaveContext) => Promise<SchemaSaveResult | void> | SchemaSaveResult | void
  update?: (context: SchemaCrudSaveContext) => Promise<SchemaSaveResult | void> | SchemaSaveResult | void
  remove?: (context: { item: Record<string, unknown> }) => Promise<SchemaRemoveResult | void> | SchemaRemoveResult | void
  delete?: (context: { item: Record<string, unknown> }) => Promise<SchemaRemoveResult | void> | SchemaRemoveResult | void
  export?: (context: any) => Promise<void> | void
  [operation: string]: SchemaOperationAdapter | undefined
}

interface SchemaQueryResult {
  items: Record<string, unknown>[]
  total?: number
  activeItem?: Record<string, unknown> | null
  summary?: Array<{ key: string; title?: string; value?: string | number; note?: string; badge?: string }>
}

interface SchemaSaveResult {
  refresh?: boolean
  close?: boolean
  activeItem?: Record<string, unknown> | null
}

interface SchemaRemoveResult {
  refresh?: boolean
  activeItem?: Record<string, unknown> | null
}

interface SchemaResourceAdapters {
  [resourcePath: string]: SchemaOperationAdapterMap | undefined
}

type CrudResourceSchema = RuntimeResourceSchema & {
  view: {
    kind: 'crud'
    rowKey: string
    pageSizeOptions?: number[]
    selectableRows?: boolean
  }
  queryFields: ResourceCrudQueryField[]
  columns: ResourceCrudColumn[]
  formSections: ResourceCrudFormSection[]
  detailFields: ResourceCrudDetailField[]
  actions?: {
    page?: ResourceCrudAction[]
    batch?: ResourceCrudAction[]
    row?: ResourceCrudRowAction[]
  }
}

type ReportResourceSchema = RuntimeResourceSchema & {
  view: {
    kind: 'report'
    pageSizeOptions?: number[]
  }
  queryFields: ResourceCrudQueryField[]
  columns: ReportViewResultColumn[]
  summary?: ReportViewSummaryMetric[]
  actions?: {
    report?: ReportViewAction[]
  }
}

type RuntimeResourceSchema = {
  key: string
  title: string
  icon?: string
  order?: number
  description?: string
  fields?: Array<Record<string, unknown>>
  operations?: Record<string, { path: string; method?: string } | undefined>
  view: {
    kind: string
    rowKey?: string
    pageSizeOptions?: number[]
    selectableRows?: boolean
  }
  queryFields?: Array<Record<string, unknown>>
  columns?: Array<Record<string, unknown>>
  formSections?: Array<Record<string, unknown>>
  detailFields?: Array<Record<string, unknown>>
  summary?: Array<Record<string, unknown>>
  actions?: {
    page?: Array<Record<string, unknown>>
    batch?: Array<Record<string, unknown>>
    row?: Array<Record<string, unknown>>
    report?: Array<Record<string, unknown>>
  }
}

type RuntimeDomainSchema = {
  key: string
  title: string
  resources: RuntimeResourceSchema[]
}

type RuntimeAppSchema = {
  schemaVersion: EfsAppSchema['schemaVersion']
  app: NonNullable<EfsAppSchema['app']> & {
    title?: string
    description?: string
    brandIcon?: string
    locale?: string
    theme?: string
    defaultDomain?: string
    defaultRes?: string
  }
  auth?: {
    mode: string
    login: { path: string; method: string }
    logout?: { path: string; method: string }
    token?: {
      accessTokenField?: string
      refreshTokenField?: string
      expiresAtField?: string
      tokenTypeField?: string
    }
  }
  services?: Record<string, EfsServiceSchema>
  domains: RuntimeDomainSchema[]
  i18n?: EfsAppI18nSchema
}

export function createAuthRuntime(schema: EfsAppSchema, options: CreateSchemaRuntimeOptions = {}) {
  const runtimeSchema = schema as RuntimeAppSchema
  const fetcher = options.fetcher ?? globalThis.fetch
  if (!fetcher) {
    throw new Error('fetch is not available; provide options.fetcher when creating auth runtime from schema')
  }

  const service = resolvePrimaryService(runtimeSchema, options.serviceKey)
  const baseUrl = service?.baseUrl ?? ''
  const transport = resolveTransportOptions(service)
  return buildAuthAdapter(
    runtimeSchema,
    baseUrl,
    transport,
    fetcher,
    options.getAccessToken ?? (() => undefined),
  )
}

export function createResModelResolver(schema: EfsAppSchema, options: CreateSchemaRuntimeOptions = {}) {
  const runtimeSchema = schema as RuntimeAppSchema
  const fetcher = options.fetcher ?? globalThis.fetch
  if (!fetcher) {
    throw new Error('fetch is not available; provide options.fetcher when creating resource resolver from schema')
  }

  const service = resolvePrimaryService(runtimeSchema, options.serviceKey)
  const baseUrl = service?.baseUrl ?? ''
  const transport = resolveTransportOptions(service)
  const resources = buildResourceAdapters(runtimeSchema, baseUrl, transport, fetcher, options.getAccessToken ?? (() => undefined))

  return (path: string) => {
    const resolved = findRuntimeResourceByPath(runtimeSchema, path)
    if (!resolved) return null
    return attachResourceRuntime(resolved.resource, resources[`${resolved.domainKey}/${resolved.resource.key}`])
  }
}

export function buildDefaultPathFromSchema(schema: EfsAppSchema) {
  const runtimeSchema = schema as RuntimeAppSchema
  if (runtimeSchema.app.defaultDomain && runtimeSchema.app.defaultRes) {
    return `${runtimeSchema.app.defaultDomain}/${runtimeSchema.app.defaultRes}`
  }

  const firstDomain = runtimeSchema.domains[0]
  const firstResource = firstDomain?.resources[0]
  if (!firstDomain || !firstResource) return ''
  return `${firstDomain.key}/${firstResource.key}`
}

function attachResourceRuntime(resource: RuntimeResourceSchema, handlers?: SchemaOperationAdapterMap): ResModel {
  if (isReportResourceSchema(resource)) {
    return attachReportResourceRuntime(resource, handlers)
  }
  return attachCrudResourceRuntime(resource as CrudResourceSchema, handlers)
}

function isReportResourceSchema(resource: RuntimeResourceSchema): resource is ReportResourceSchema {
  return resource.view.kind === 'report'
}

function attachReportResourceRuntime(resource: ReportResourceSchema, handlers?: SchemaOperationAdapterMap): ResReportModel {
  const controller = reactive<ReportViewController>({
    state: {
      queryValues: {},
      page: 1,
      pageSize: resource.view.pageSizeOptions?.[0] ?? 20,
      items: [],
      total: 0,
      summary: resource.summary ? [...resource.summary] : [],
      busy: false,
      error: '',
    },
    actions: {
      actions: resource.actions?.report ? [...resource.actions.report] : [],
    },
    handlers: {
      query: createReportQueryHandler(resource, handlers),
      export: handlers?.export
        ? async ({ queryValues, page, pageSize, items, total, summary }) => {
            await handlers.export?.({ queryValues, page, pageSize, items, total, summary })
          }
        : undefined,
      actions: buildReportActionHandlers(resource, handlers),
    },
  })

  return {
    ...resource,
    summary: resource.summary ? [...resource.summary] : [],
    controller,
  } as unknown as ResReportModel
}

function attachCrudResourceRuntime(resource: CrudResourceSchema, handlers?: SchemaOperationAdapterMap): ResCrudModel {
  const controller = reactive<ResourceCrudController>({
    state: {
      queryValues: {},
      page: 1,
      pageSize: resource.view.pageSizeOptions?.[0] ?? 20,
      selectedRowKeys: [],
      activeItem: null,
      items: [],
      total: 0,
    },
    actions: {
      actions: resource.actions?.page ? [...resource.actions.page] : [],
      batchActions: resource.actions?.batch ? [...resource.actions.batch] : [],
      rowActions: resource.actions?.row ? [...resource.actions.row] : [],
    },
    handlers: {
      query: createCrudQueryHandler(handlers),
      save: createCrudSaveHandler(handlers),
      remove: createCrudRemoveHandler(handlers),
      create: resource.operations?.create ? async () => undefined : undefined,
      edit: createCrudEditHandler(handlers),
      actions: buildCrudActionHandlers(resource, handlers),
    },
  })

  return {
    ...resource,
    controller,
  } as unknown as ResCrudModel
}

function createCrudQueryHandler(handlers?: SchemaOperationAdapterMap) {
  const handler = handlers?.query ?? handlers?.list
  if (!handler) return undefined
  return async ({ queryValues, page, pageSize }: { queryValues: Record<string, string>; page: number; pageSize: number }) => {
    const result = await handler({ queryValues, page, pageSize })
    return normalizeQueryResult(result)
  }
}

function createCrudEditHandler(handlers?: SchemaOperationAdapterMap) {
  const detailHandler = handlers?.detail ?? handlers?.get
  if (!detailHandler) return undefined
  return async (row: Record<string, unknown>) => {
    const result = await detailHandler({
      item: row,
      id: typeof row?.id === 'string' || typeof row?.id === 'number' ? String(row.id) : undefined,
      code: typeof row?.code === 'string' ? row.code : undefined,
    })
    if (result && typeof result === 'object' && 'item' in result && result.item && typeof result.item === 'object') {
      return { ...row, ...(result.item as Record<string, unknown>) }
    }
    if (result && typeof result === 'object') {
      return { ...row, ...(result as Record<string, unknown>) }
    }
    return row
  }
}

function createCrudSaveHandler(handlers?: SchemaOperationAdapterMap) {
  if (!handlers?.create && !handlers?.update) return undefined
  return async ({ mode, item, queryValues, page, pageSize }: { mode: 'create' | 'edit'; item: Record<string, unknown> | null; queryValues: Record<string, string>; page: number; pageSize: number }) => {
    if (!item) return undefined
    const handler = mode === 'create' ? handlers?.create : handlers?.update
    if (!handler) return undefined
    return await handler({ item, queryValues, page, pageSize })
  }
}

function createCrudRemoveHandler(handlers?: SchemaOperationAdapterMap) {
  const removeHandler = handlers?.remove ?? handlers?.delete
  if (!removeHandler) return undefined
  return async (item: Record<string, unknown>) => await removeHandler({ item })
}

function createReportQueryHandler(resource: ReportResourceSchema, handlers?: SchemaOperationAdapterMap) {
  const handler = handlers?.query ?? handlers?.list
  if (!handler) return undefined
  return async ({ queryValues, page, pageSize }: { queryValues: Record<string, string>; page: number; pageSize: number }) => {
    const result = normalizeQueryResult(await handler({ queryValues, page, pageSize }))
    return {
      items: result.items ?? [],
      total: result.total ?? result.items?.length ?? 0,
      summary: result.summary ?? resource.summary ?? [],
    }
  }
}

function buildCrudActionHandlers(resource: CrudResourceSchema, handlers?: SchemaOperationAdapterMap) {
  const actionHandlers: Record<string, (payload: any) => Promise<void> | void> = {}
  for (const action of [
    ...(resource.actions?.page ?? []),
    ...(resource.actions?.batch ?? []),
    ...(resource.actions?.row ?? []),
  ]) {
    if (!action.api || isBuiltinCrudAction(action)) continue
    if (!handlers?.[action.api]) continue
    actionHandlers[action.key] = async (payload) => {
      await handlers[action.api]?.(payload)
    }
  }
  return Object.keys(actionHandlers).length > 0 ? actionHandlers : undefined
}

function buildReportActionHandlers(resource: ReportResourceSchema, handlers?: SchemaOperationAdapterMap) {
  const actionHandlers: Record<string, (payload: any) => Promise<void> | void> = {}
  for (const action of resource.actions?.report ?? []) {
    if (!action.api || isBuiltinReportAction(action)) continue
    if (!handlers?.[action.api]) continue
    actionHandlers[action.key] = async (payload) => {
      await handlers[action.api]?.(payload)
    }
  }
  return Object.keys(actionHandlers).length > 0 ? actionHandlers : undefined
}

function isBuiltinCrudAction(action: ResAction | ResRowAction) {
  return ['create', 'detail', 'edit', 'update', 'delete', 'remove', 'refresh', 'export'].includes(action.key)
    || ['create', 'detail', 'edit', 'update', 'delete', 'remove', 'refresh', 'export'].includes(action.builtin ?? '')
}

function isBuiltinReportAction(action: { key: string; builtin?: string }) {
  return ['refresh', 'export'].includes(action.key) || ['refresh', 'export'].includes(action.builtin ?? '')
}

function resolvePrimaryService(schema: RuntimeAppSchema, serviceKey?: string) {
  if (!schema.services) return undefined
  if (serviceKey && schema.services[serviceKey]) return schema.services[serviceKey]
  if (schema.services.api) return schema.services.api
  return Object.values(schema.services).find((service) => service.kind === 'http' || service.kind === 'gateway' || service.kind === 'mock')
}

function resolveTransportOptions(service?: EfsServiceSchema): HttpTransportOptions {
  return {
    requestDataKey: service?.transport?.requestDataKey,
    responseDataKey: service?.transport?.responseDataKey,
    authHeader: service?.transport?.authHeader || 'Authorization',
    authScheme: service?.transport?.authScheme || 'Bearer',
  }
}

function buildAuthAdapter(
  schema: RuntimeAppSchema,
  baseUrl: string,
  transport: HttpTransportOptions,
  fetcher: typeof fetch,
  getCurrentAccessToken: () => string | undefined,
): SchemaAuthAdapter {
  const auth = schema.auth
  const accessTokenField = auth?.token?.accessTokenField || 'accessToken'
  const refreshTokenField = auth?.token?.refreshTokenField || 'refreshToken'
  const expiresAtField = auth?.token?.expiresAtField || 'expiresAt'
  const tokenTypeField = auth?.token?.tokenTypeField || 'tokenType'

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
      return {
        accessToken: token,
        refreshToken: asOptionalString(readPath(data, refreshTokenField)),
        expiresAt: asOptionalString(readPath(data, expiresAtField)),
        tokenType: asOptionalString(readPath(data, tokenTypeField)) ?? transport.authScheme,
      }
    },
    logout: auth?.logout
      ? async () => {
          await requestJson(fetcher, baseUrl, transport, auth.logout!, {
            accessToken: getCurrentAccessToken(),
          })
        }
      : undefined,
  }
}

function buildResourceAdapters(
  schema: RuntimeAppSchema,
  baseUrl: string,
  transport: HttpTransportOptions,
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
  resource: RuntimeResourceSchema,
  baseUrl: string,
  transport: HttpTransportOptions,
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

function normalizeQueryResult(result: SchemaQueryResult | Record<string, unknown>[] | null | undefined): SchemaQueryResult {
  if (Array.isArray(result)) {
    return {
      items: result,
      total: result.length,
    }
  }
  return {
    items: result?.items ?? [],
    total: result?.total ?? (Array.isArray(result?.items) ? result.items.length : 0),
    activeItem: result?.activeItem,
    summary: result?.summary,
  }
}

function findRuntimeResourceByPath(schema: RuntimeAppSchema, path: string) {
  const normalized = String(path || '').replace(/^\/+|\/+$/g, '')
  const parts = normalized.split('/').filter(Boolean)
  if (parts.length !== 2) return null

  const [domainKey, resourceKey] = parts
  const domain = schema.domains.find((item) => item.key === domainKey)
  if (!domain) return null
  const resource = domain.resources.find((item) => item.key === resourceKey)
  if (!resource) return null

  return { domainKey, resource }
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

function asOptionalString(value: unknown) {
  return value == null ? undefined : String(value)
}
