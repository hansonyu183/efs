import { inferResourceRuntime } from '../inference/resource-runtime.ts'
import type { EfsAppSchema } from '../app/app-schema.ts'
import type { EfsResourceSchema } from '../resource/resource-schema.ts'
import type { EfsResourceUiSchema } from '../resource/ui-schema.ts'

/**
 * Bridge schema-first app/resource input into the current Vue runtime
 * contract. This adapter is the compatibility seam between the public
 * authoring model (`app.schema.ts`) and the internal controller-shaped
 * runtime consumed by the platform shell.
 */

export interface SchemaAuthAdapter {
  login: (input: { name: string; pwd: string; orgCode?: string }) => Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string; tokenType?: string }> | { accessToken: string; refreshToken?: string; expiresAt?: string; tokenType?: string }
  logout?: () => Promise<void> | void
  getOrgs?: () => Promise<readonly { key: string; value: string; title?: string; label?: string; disabled?: boolean }[]> | readonly { key: string; value: string; title?: string; label?: string; disabled?: boolean }[]
  getCurrentOrgCode?: () => string | undefined
  setCurrentOrgCode?: (orgCode: string) => Promise<void> | void
  getCurrentAccessToken?: () => string | undefined
  setCurrentAccessToken?: (token?: string) => Promise<void> | void
}

export interface SchemaResourceAdapterContext {
  queryValues: Record<string, string>
  page: number
  pageSize: number
}

export interface SchemaCrudSaveContext extends SchemaResourceAdapterContext {
  item: Record<string, unknown>
}

export interface SchemaOperationAdapterMap {
  list?: (context: SchemaResourceAdapterContext) => Promise<SchemaQueryResult> | SchemaQueryResult
  query?: (context: SchemaResourceAdapterContext) => Promise<SchemaQueryResult> | SchemaQueryResult
  get?: (context: { id?: string; item?: Record<string, unknown> | null }) => Promise<Record<string, unknown> | null | undefined> | Record<string, unknown> | null | undefined
  create?: (context: SchemaCrudSaveContext) => Promise<SchemaSaveResult | void> | SchemaSaveResult | void
  update?: (context: SchemaCrudSaveContext) => Promise<SchemaSaveResult | void> | SchemaSaveResult | void
  remove?: (context: { item: Record<string, unknown> }) => Promise<SchemaRemoveResult | void> | SchemaRemoveResult | void
  [operation: string]: ((context: any) => Promise<any> | any) | undefined
}

export interface SchemaQueryResult {
  items: Record<string, unknown>[]
  total?: number
  activeItem?: Record<string, unknown> | null
  summary?: Array<{ key: string; label?: string; value?: string | number; note?: string; badge?: string }>
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

export interface SchemaResourceAdapters {
  [resourcePath: string]: SchemaOperationAdapterMap | undefined
}

export interface CreateRuntimeFromSchemaOptions {
  schema: EfsAppSchema
  auth: SchemaAuthAdapter
  resources?: SchemaResourceAdapters
}

export function createRuntimeFromSchema(options: CreateRuntimeFromSchemaOptions) {
  const { schema } = options

  return {
    kind: 'app' as const,
    auth: {
      kind: 'auth' as const,
      login: options.auth.login,
      logout: options.auth.logout,
      getOrgs: options.auth.getOrgs,
      getCurrentOrgCode: options.auth.getCurrentOrgCode,
      setCurrentOrgCode: options.auth.setCurrentOrgCode,
      getCurrentAccessToken: options.auth.getCurrentAccessToken,
      setCurrentAccessToken: options.auth.setCurrentAccessToken,
    },
    main: {
      kind: 'main' as const,
      defaultPath: buildDefaultPath(schema),
      domains: schema.domains.map((domain) => ({
        kind: 'domain' as const,
        domain: domain.key,
        title: domain.title,
        items: domain.resources.map((resource) => adaptResourceToVueController(schema, domain.key, resource, options.resources?.[`${domain.key}/${resource.key}`])),
      })),
    },
  }
}

type InferredRuntime = ReturnType<typeof inferResourceRuntime>

type SchemaResourceRuntimeBridge = {
  domainKey: string
  resource: EfsResourceSchema
  handlers?: SchemaOperationAdapterMap
  inferred: InferredRuntime
  fieldDefs: ReturnType<typeof adaptFields>
}

function adaptResourceToVueController(
  schema: EfsAppSchema,
  domainKey: string,
  resource: EfsResourceSchema,
  handlers?: SchemaOperationAdapterMap,
) {
  const resourceUi = schema.ui?.domains?.[domainKey]?.resources?.[resource.key]
  const inferred = inferResourceRuntime(resource, resourceUi)
  const bridge: SchemaResourceRuntimeBridge = {
    domainKey,
    resource,
    handlers,
    inferred,
    fieldDefs: adaptFields(resource, inferred.mode, resourceUi),
  }

  return {
    kind: 'res' as const,
    domain: bridge.domainKey,
    res: bridge.resource.key,
    title: bridge.resource.title,
    viewKind: bridge.inferred.mode === 'report' ? 'report' as const : 'crud' as const,
    fields: bridge.fieldDefs,
    query: adaptQueryHandler(bridge),
    edit: bridge.inferred.mode === 'crud' ? adaptEditHandler(bridge.handlers) : undefined,
    save: bridge.inferred.mode === 'crud' ? adaptSaveHandler(bridge.handlers) : undefined,
    remove: bridge.inferred.mode === 'crud' ? adaptRemoveHandler(bridge.handlers) : undefined,
    export: bridge.inferred.mode === 'report' ? adaptReportExportHandler(bridge.handlers) : undefined,
    actions: buildRuntimeActions(bridge),
  }
}

function adaptQueryHandler(bridge: SchemaResourceRuntimeBridge) {
  const operationKey = bridge.inferred.mode === 'report'
    ? 'query'
    : bridge.resource.operations?.list ? 'list' : bridge.resource.operations?.query ? 'query' : undefined
  if (!operationKey) return undefined
  const handler = bridge.handlers?.[operationKey]
  if (!handler) return undefined
  return async ({ queryValues, page, pageSize }: { queryValues: Record<string, string>; page: number; pageSize: number }) => {
    const result = await handler({ queryValues, page, pageSize })
    return normalizeQueryResult(result)
  }
}

function adaptEditHandler(handlers?: SchemaOperationAdapterMap) {
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

function adaptSaveHandler(handlers?: SchemaOperationAdapterMap) {
  if (!handlers?.create && !handlers?.update) return undefined
  return async ({ mode, item, queryValues, page, pageSize }: { mode: 'create' | 'edit'; item: Record<string, unknown>; queryValues: Record<string, string>; page: number; pageSize: number }) => {
    const handler = mode === 'create' ? handlers?.create : handlers?.update
    if (!handler) return undefined
    return await handler({ item, queryValues, page, pageSize })
  }
}

function adaptRemoveHandler(handlers?: SchemaOperationAdapterMap) {
  const removeHandler = handlers?.remove ?? handlers?.delete
  if (!removeHandler) return undefined
  return async (item: Record<string, unknown>) => await removeHandler({ item })
}

function adaptReportExportHandler(handlers?: SchemaOperationAdapterMap) {
  const exportHandler = handlers?.export
  if (!exportHandler) return undefined
  return async ({ queryValues, page, pageSize, items, total, summary }: { queryValues: Record<string, string>; page: number; pageSize: number; items: Record<string, unknown>[]; total: number; summary: any[] }) => {
    await exportHandler({ queryValues, page, pageSize, items, total, summary })
  }
}

function buildRuntimeActions(bridge: SchemaResourceRuntimeBridge) {
  const actionState = buildActionState(bridge.inferred, bridge.handlers)
  if (bridge.inferred.mode === 'report') {
    return {
      report: actionState.report,
      custom: actionState.custom,
    }
  }
  return {
    page: actionState.page,
    row: actionState.row,
    custom: actionState.custom,
  }
}

function buildActionState(inferred: InferredRuntime, handlers?: SchemaOperationAdapterMap) {
  const page = [] as Array<{ key: string }>
  const row = [] as Array<{ key: string }>
  const report = [] as Array<{ key: string }>
  const custom: Record<string, (payload: any) => Promise<void> | void> = {}

  for (const action of inferred.actions) {
    if (action.hidden) continue
    if (action.kind === 'runtime') {
      if (action.key === 'refresh' && inferred.mode !== 'report') {
        page.push({ key: action.key })
      }
      continue
    }

    if (action.api === 'create' && inferred.mode !== 'report') {
      page.push({ key: 'create' })
      continue
    }
    if (action.api === 'update' && inferred.mode !== 'report') {
      row.push({ key: 'update' })
      continue
    }
    if ((action.api === 'remove' || action.api === 'delete') && inferred.mode !== 'report') {
      row.push({ key: 'remove' })
      continue
    }
    if (action.api === 'export' && inferred.mode === 'report') {
      continue
    }

    if (action.api && handlers?.[action.api]) {
      if (inferred.mode === 'report') {
        report.push({ key: action.key })
      } else if (action.placement === 'row') {
        row.push({ key: action.key })
      } else {
        page.push({ key: action.key })
      }
      custom[action.key] = async (payload) => {
        await handlers[action.api]?.(payload)
      }
    }
  }

  return {
    page,
    row,
    report,
    custom,
  }
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

function adaptFields(resource: EfsResourceSchema, mode: 'crud' | 'report' | 'workspace' | 'custom', ui?: EfsResourceUiSchema) {
  return (resource.fields || [])
    .filter((field) => !ui?.fields?.[field.key]?.hidden)
    .map((field) => {
      const kind = adaptFieldKind(field.type)
      const uses = inferFieldUses(field, mode)
      const base = {
        key: field.key,
        title: ui?.fields?.[field.key]?.label || field.title,
        kind,
        use: uses,
        required: field.required,
        readonly: field.readonly,
        identity: adaptIdentity(field.identity),
        queryType: inferQueryType(field.type, field.options?.length ? true : false),
        widget: inferWidget(field.type, field.options?.length ? true : false),
        render: field.type === 'enum' ? 'status' : undefined,
        summary: mode === 'report' && field.type === 'number',
      }

      if (field.type === 'enum') {
        return {
          ...base,
          kind: 'enum' as const,
          options: field.options?.map((option) => ({ key: option.key, value: option.value, disabled: option.disabled })),
        }
      }

      if (field.type === 'ref' && field.ref) {
        return {
          ...base,
          kind: 'ref' as const,
          ref: field.ref,
          options: field.options?.map((option) => ({ key: option.key, value: option.value, disabled: option.disabled })),
        }
      }

      return base
    })
}

function inferFieldUses(field: { readonly?: boolean; type?: string }, mode: 'crud' | 'report' | 'workspace' | 'custom') {
  if (mode === 'report') {
    return ['query', 'list', 'detail'] as const
  }

  const uses = ['list', 'detail'] as Array<'query' | 'list' | 'form' | 'detail'>
  if (supportsQueryField(field.type)) {
    uses.unshift('query')
  }
  if (!field.readonly) {
    uses.push('form')
  }
  return uses
}

function supportsQueryField(type?: string) {
  return type !== 'json'
}

function adaptFieldKind(type?: string) {
  if (type === 'string') return 'text'
  if (type === 'boolean') return 'bool'
  if (type === 'enum') return 'enum'
  if (type === 'ref') return 'ref'
  if (type === 'number' || type === 'date' || type === 'datetime' || type === 'json') return type
  return 'text'
}

function adaptIdentity(identity?: string) {
  if (identity === 'id') return 'primary'
  if (identity === 'title' || identity === 'code') return identity
  return undefined
}

function inferQueryType(type?: string, hasOptions?: boolean) {
  if (type === 'number') return 'number'
  if (type === 'date' || type === 'datetime') return 'date'
  if (type === 'enum' || type === 'ref' || hasOptions) return 'select'
  return 'search'
}

function inferWidget(type?: string, hasOptions?: boolean) {
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'switch'
  if (type === 'date' || type === 'datetime') return 'date'
  if (type === 'enum' || type === 'ref' || hasOptions) return 'select'
  return 'text'
}

function buildDefaultPath(schema: EfsAppSchema) {
  if (schema.app.defaultDomain && schema.app.defaultRes) {
    return `${schema.app.defaultDomain}/${schema.app.defaultRes}`
  }

  const firstDomain = schema.domains[0]
  const firstResource = firstDomain?.resources[0]
  if (!firstDomain || !firstResource) return ''
  return `${firstDomain.key}/${firstResource.key}`
}
