import { reactive } from 'vue'
import type {
  ReportViewAction,
  ReportViewController,
  ReportViewResultColumn,
  ReportViewSummaryMetric,
  ResourceCrudAction,
  ResourceCrudColumn,
  ResourceCrudController,
  ResourceCrudDetailField,
  ResourceCrudFormSection,
  ResourceCrudQueryField,
  ResourceCrudRowAction,
  ResAction,
  ResCrudModel,
  ResModel,
  ResReportModel,
  ResRowAction,
} from '../types/resource-model'
import type {
  SchemaOperationAdapterMap,
} from './handlers'
import {
  createCrudEditHandler,
  createCrudQueryHandler,
  createCrudRemoveHandler,
  createCrudSaveHandler,
  createReportQueryHandler,
} from './handlers'

export type RuntimeResourceSchema = {
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
  queryFields?: ResourceCrudQueryField[]
  columns?: Array<Record<string, unknown>>
  formSections?: ResourceCrudFormSection[]
  detailFields?: ResourceCrudDetailField[]
  summary?: ReportViewSummaryMetric[]
  actions?: {
    page?: ResourceCrudAction[]
    batch?: ResourceCrudAction[]
    row?: ResourceCrudRowAction[]
    report?: ReportViewAction[]
  }
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

export function attachResourceRuntime(resource: RuntimeResourceSchema, handlers?: SchemaOperationAdapterMap): ResModel {
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
      query: createReportQueryHandler(resource.summary, handlers),
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
