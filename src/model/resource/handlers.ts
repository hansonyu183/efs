import { requestJson, type HttpTransportOptions } from '../../http/index.ts'
import type { EfsAppSchema } from '../../schema/index.ts'
import { resolvePrimaryService, resolveTransportOptions, type SchemaRuntimeOptions } from '../app/service-config'
import type { ReportViewSummaryMetric } from '../types/resource-model'

type RuntimeOperation = { path: string; method?: string }

type RuntimeResourceSchema = EfsAppSchema['domains'][number]['resources'][number] & {
  operations?: Record<string, RuntimeOperation | undefined>
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

export interface SchemaQueryResult {
  items: Record<string, unknown>[]
  total?: number
  activeItem?: Record<string, unknown> | null
  summary?: ReportViewSummaryMetric[]
}

export interface SchemaSaveResult {
  refresh?: boolean
  close?: boolean
  activeItem?: Record<string, unknown> | null
}

export interface SchemaRemoveResult {
  refresh?: boolean
  activeItem?: Record<string, unknown> | null
}

export interface SchemaOperationAdapterMap {
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

export interface SchemaResourceAdapters {
  [resourcePath: string]: SchemaOperationAdapterMap | undefined
}

export function buildResourceAdapters(
  schema: Readonly<EfsAppSchema>,
  options: SchemaRuntimeOptions = {},
): SchemaResourceAdapters {
  const fetcher = options.fetcher ?? globalThis.fetch
  if (!fetcher) {
    throw new Error('fetch is not available; provide options.fetcher when creating resource adapters from schema')
  }

  const service = resolvePrimaryService(schema, options.serviceKey)
  const baseUrl = service?.baseUrl ?? ''
  const transport = resolveTransportOptions(service)
  const getAccessToken = options.getAccessToken ?? (() => undefined)
  const resources: SchemaResourceAdapters = {}

  for (const domain of schema.domains) {
    for (const rawResource of domain.resources) {
      const resource = rawResource as RuntimeResourceSchema
      resources[`${domain.key}/${resource.key}`] = buildOperationAdapterMap(resource, baseUrl, transport, fetcher, getAccessToken)
    }
  }

  return resources
}

export function createCrudQueryHandler(handlers?: SchemaOperationAdapterMap) {
  const handler = handlers?.query ?? handlers?.list
  if (!handler) return undefined
  return async ({ queryValues, page, pageSize }: { queryValues: Record<string, string>; page: number; pageSize: number }) => {
    const result = await handler({ queryValues, page, pageSize })
    return normalizeQueryResult(result)
  }
}

export function createCrudEditHandler(handlers?: SchemaOperationAdapterMap) {
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

export function createCrudSaveHandler(handlers?: SchemaOperationAdapterMap) {
  if (!handlers?.create && !handlers?.update) return undefined
  return async ({ mode, item, queryValues, page, pageSize }: { mode: 'create' | 'edit'; item: Record<string, unknown> | null; queryValues: Record<string, string>; page: number; pageSize: number }) => {
    if (!item) return undefined
    const handler = mode === 'create' ? handlers?.create : handlers?.update
    if (!handler) return undefined
    return await handler({ item, queryValues, page, pageSize })
  }
}

export function createCrudRemoveHandler(handlers?: SchemaOperationAdapterMap) {
  const removeHandler = handlers?.remove ?? handlers?.delete
  if (!removeHandler) return undefined
  return async (item: Record<string, unknown>) => await removeHandler({ item })
}

export function createReportQueryHandler(summary: ReportViewSummaryMetric[] | undefined, handlers?: SchemaOperationAdapterMap) {
  const handler = handlers?.query ?? handlers?.list
  if (!handler) return undefined
  return async ({ queryValues, page, pageSize }: { queryValues: Record<string, string>; page: number; pageSize: number }) => {
    const result = normalizeQueryResult(await handler({ queryValues, page, pageSize }))
    return {
      items: result.items ?? [],
      total: result.total ?? result.items?.length ?? 0,
      summary: result.summary ?? summary ?? [],
    }
  }
}

export function normalizeOperationResult(operationKey: string, response: any) {
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

export function normalizeQueryResult(result: SchemaQueryResult | Record<string, unknown>[] | null | undefined): SchemaQueryResult {
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

function buildOperationAdapterMap(
  resource: RuntimeResourceSchema,
  baseUrl: string,
  transport: HttpTransportOptions,
  fetcher: typeof fetch,
  getAccessToken: () => string | undefined,
): SchemaOperationAdapterMap {
  const handlers: SchemaOperationAdapterMap = {}
  for (const [operationKey, endpoint] of Object.entries(resource.operations || {})) {
    if (!endpoint) continue
    handlers[operationKey] = async (context: any = {}) => {
      const response = await requestJson(fetcher, baseUrl, transport, endpoint, {
        context,
        accessToken: getAccessToken(),
      })
      return normalizeOperationResult(operationKey, response)
    }
  }
  return handlers
}
