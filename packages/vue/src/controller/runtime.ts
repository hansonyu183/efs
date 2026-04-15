import { computed, reactive } from 'vue'
import type {
  ReportViewController,
  ReportViewControllerHandlers,
} from '../components/views/report-view-types'
import type { ResourceCrudController } from '../components/views/resource-crud-types'
import {
  defaultDetailValueFormatter,
  inferDetailFields,
  inferFormSections,
  inferListColumns,
  inferQueryFields,
  inferReportColumns,
  inferReportSummaryMetrics,
} from './field-inference'
import { findResByPath } from './path-helpers'
import type {
  ResCrudRuntime,
  ResCrudRuntimeOptions,
  ResReportRuntime,
  ResReportRuntimeOptions,
  ResRuntime,
} from './shared-types'
import type { AppController } from './app-controller'

export function resolveResRuntime(
  app: AppController,
  path: string,
  options: ResCrudRuntimeOptions & ResReportRuntimeOptions = {},
): ResRuntime | null {
  const res = findResByPath(app, path)
  if (!res) return null
  if (res.runtimeKind === 'report') return buildResReportRuntime(app, path, options)
  return buildResCrudRuntime(app, path, options)
}

export function buildResReportRuntime(app: AppController, path: string, options: ResReportRuntimeOptions = {}): ResReportRuntime | null {
  const res = findResByPath(app, path)
  if (!res) return null

  const controller = reactive<ReportViewController>({
    state: {
      queryValues: {},
      page: options.initialPage ?? 1,
      pageSize: options.initialPageSize ?? 10,
      items: [],
      total: 0,
      summary: inferReportSummaryMetrics(res),
      busy: false,
      error: '',
    },
    actions: {
      actions: res.actions?.report ? [...res.actions.report] : [],
    },
    handlers: {
      query: async ({ queryValues, page, pageSize }) => {
        const result = await res.query?.({ queryValues, page, pageSize })
        return {
          items: result?.items ?? [],
          total: result?.total ?? result?.items?.length ?? 0,
          summary: result?.summary ?? inferReportSummaryMetrics(res, result?.items ?? []),
        }
      },
      export: res.export ? async ({ queryValues, page, pageSize, items, total, summary }) => {
        await res.export?.({ queryValues, page, pageSize, items, total, summary })
      } : undefined,
      actions: res.actions?.custom as unknown as ReportViewControllerHandlers['actions'],
    },
  })

  return {
    kind: 'report',
    title: res.title || res.res,
    pageSizeOptions: options.pageSizeOptions ?? [10, 20, 50],
    queryFields: inferQueryFields(res),
    columns: inferReportColumns(res),
    controller,
  }
}

export function buildResCrudRuntime(app: AppController, path: string, options: ResCrudRuntimeOptions = {}): ResCrudRuntime | null {
  const res = findResByPath(app, path)
  if (!res) return null

  const controller = reactive<ResourceCrudController>({
    state: {
      queryValues: {},
      page: options.initialPage ?? 1,
      pageSize: options.initialPageSize ?? 10,
      selectedRowKeys: [],
      activeItem: null,
      items: [],
      total: 0,
    },
    actions: {
      actions: res.actions?.page ? [...res.actions.page] : [],
      batchActions: res.actions?.batch ? [...res.actions.batch] : [],
      rowActions: res.actions?.row
        ? res.actions.row.map((action) => ({
            ...action,
            variant: action.variant === 'ghost' ? 'default' : action.variant,
          }))
        : [],
    },
    handlers: {
      query: res.query,
      save: res.save ? async ({ mode, item, queryValues, page, pageSize }) => {
        if (!item) return
        return await res.save?.({ mode, item, queryValues, page, pageSize })
      } : undefined,
      remove: res.remove,
      create: res.create,
      edit: res.edit,
      actions: res.actions?.custom,
    },
  })

  const formatDetailValue = options.detailValueFormatter ?? defaultDetailValueFormatter
  const detailFields = computed(() => {
    const activeItem = controller.state?.activeItem ?? null
    if (!activeItem) return []
    return inferDetailFields(res).map((field) => ({
      key: field.key,
      value: formatDetailValue(activeItem[field.key], field.key),
    }))
  })

  return {
    kind: 'crud',
    title: res.title || res.res,
    rowKey: options.rowKey ?? 'id',
    pageSizeOptions: options.pageSizeOptions ?? [10, 20, 50],
    selectableRows: options.selectableRows ?? true,
    queryFields: inferQueryFields(res),
    columns: inferListColumns(res),
    formSections: inferFormSections(res),
    controller,
    detailFields,
  }
}
