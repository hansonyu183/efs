import { inferResourceRuntime } from '../inference/resource-runtime.js'
import type { EfsAppSchema } from '../app/app-schema.js'
import type { EfsResourceSchema } from '../resource/resource-schema.js'
import type { EfsResourceUiSchema } from '../resource/ui-schema.js'

export interface SchemaAuthAdapter {
  login: (input: { name: string; pwd: string; orgCode?: string }) => Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string; tokenType?: string }> | { accessToken: string; refreshToken?: string; expiresAt?: string; tokenType?: string }
  logout?: () => Promise<void> | void
  getOrgs?: () => Promise<readonly { key: string; value: string; title?: string; label?: string; disabled?: boolean }[]> | readonly { key: string; value: string; title?: string; label?: string; disabled?: boolean }[]
  getCurrentOrgCode?: () => string | undefined
  setCurrentOrgCode?: (orgCode: string) => Promise<void> | void
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

export interface AdaptAppSchemaToVueControllerOptions {
  schema: EfsAppSchema
  auth: SchemaAuthAdapter
  resources?: SchemaResourceAdapters
}

export function adaptAppSchemaToVueController(options: AdaptAppSchemaToVueControllerOptions) {
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

function adaptResourceToVueController(
  schema: EfsAppSchema,
  domainKey: string,
  resource: EfsResourceSchema,
  handlers?: SchemaOperationAdapterMap,
) {
  const resourceUi = schema.ui?.domains?.[domainKey]?.resources?.[resource.key]
  const inferred = inferResourceRuntime(resource, resourceUi)
  const fieldDefs = adaptFields(resource, inferred.mode, resourceUi)

  return {
    kind: 'res' as const,
    domain: domainKey,
    res: resource.key,
    title: resource.title,
    runtimeKind: inferred.mode === 'report' ? 'report' as const : 'crud' as const,
    fields: fieldDefs,
    query: adaptQueryHandler(resource, handlers, inferred.mode),
    save: inferred.mode === 'crud' ? adaptSaveHandler(handlers) : undefined,
    remove: inferred.mode === 'crud' ? adaptRemoveHandler(handlers) : undefined,
    export: inferred.mode === 'report' ? adaptReportExportHandler(handlers) : undefined,
    actions: inferred.mode === 'report'
      ? buildReportActions(inferred, handlers)
      : buildCrudActions(inferred, handlers),
  }
}

function adaptQueryHandler(resource: EfsResourceSchema, handlers: SchemaOperationAdapterMap | undefined, mode: 'crud' | 'report' | 'workspace' | 'custom') {
  const operationKey = mode === 'report' ? 'query' : resource.operations?.list ? 'list' : resource.operations?.query ? 'query' : undefined
  if (!operationKey) return undefined
  const handler = handlers?.[operationKey]
  if (!handler) return undefined
  return async ({ queryValues, page, pageSize }: { queryValues: Record<string, string>; page: number; pageSize: number }) => {
    const result = await handler({ queryValues, page, pageSize })
    return {
      items: result?.items ?? [],
      total: result?.total,
      activeItem: result?.activeItem,
      summary: result?.summary,
    }
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
  if (!handlers?.remove) return undefined
  return async (item: Record<string, unknown>) => await handlers.remove?.({ item })
}

function adaptReportExportHandler(handlers?: SchemaOperationAdapterMap) {
  const exportHandler = handlers?.export
  if (!exportHandler) return undefined
  return async ({ queryValues, page, pageSize, items, total, summary }: { queryValues: Record<string, string>; page: number; pageSize: number; items: Record<string, unknown>[]; total: number; summary: any[] }) => {
    await exportHandler({ queryValues, page, pageSize, items, total, summary })
  }
}

function buildCrudActions(inferred: ReturnType<typeof inferResourceRuntime>, handlers?: SchemaOperationAdapterMap) {
  const page = [] as Array<{ key: string }>
  const row = [] as Array<{ key: string }>
  const custom: Record<string, (payload: any) => Promise<void> | void> = {}

  for (const action of inferred.actions) {
    if (action.hidden) continue
    if (action.kind === 'runtime') {
      if (action.key === 'refresh') {
        page.push({ key: action.key })
      }
      continue
    }

    if (action.api === 'create') {
      page.push({ key: 'create' })
      continue
    }
    if (action.api === 'update') {
      row.push({ key: 'update' })
      continue
    }
    if (action.api === 'remove') {
      row.push({ key: 'remove' })
      continue
    }

    if (action.api && handlers?.[action.api]) {
      if (action.placement === 'row') row.push({ key: action.key })
      else page.push({ key: action.key })
      custom[action.key] = async (payload) => {
        await handlers[action.api]?.(payload)
      }
    }
  }

  return {
    page,
    row,
    custom,
  }
}

function buildReportActions(inferred: ReturnType<typeof inferResourceRuntime>, handlers?: SchemaOperationAdapterMap) {
  const report = [] as Array<{ key: string }>
  const custom: Record<string, (payload: any) => Promise<void> | void> = {}

  for (const action of inferred.actions) {
    if (action.hidden) continue
    if (action.kind === 'runtime') {
      continue
    }
    if (action.api === 'export') {
      continue
    }
    if (action.api && handlers?.[action.api]) {
      report.push({ key: action.key })
      custom[action.key] = async (payload) => {
        await handlers[action.api]?.(payload)
      }
    }
  }

  return {
    report,
    custom,
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
