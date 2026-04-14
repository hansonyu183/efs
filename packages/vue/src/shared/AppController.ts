import { computed, reactive } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { FlatMenuNode } from './NavigationMenu'
import type {
 ResourceCrudColumn,
 ResourceCrudDetailField,
 ResourceCrudFormField,
 ResourceCrudFormSection,
 ResourceCrudQueryField,
 ResourceCrudQueryOption,
 ResourceCrudController,
} from '../components/views/resource-crud-types'
import type {
 ReportViewAction,
 ReportViewController,
 ReportViewResultColumn,
 ReportViewSummaryMetric,
} from '../components/views/report-view-types'

export type DomainKey = string
export type ResKey = string
export type DomainResPath<D extends string = string, R extends string = string> = `${D}/${R}`
export type MenuOrder = number

export type FieldUse = 'query' | 'list' | 'form' | 'detail'
export type ResFieldKind = 'text' | 'number' | 'bool' | 'date' | 'datetime' | 'enum' | 'ref' | 'tags' | 'json'
export type ResFieldIdentity = 'primary' | 'title' | 'code'
export type ResFieldQueryType = 'text' | 'search' | 'date' | 'number' | 'select'
export type ResFieldWidget = 'text' | 'number' | 'switch' | 'date' | 'select' | 'tags' | 'json'

export type ResFieldOption = {
 key: string
 value: string
 disabled?: boolean
}

export type ResFieldRender = ResourceCrudColumn['render']

type ResFieldBase<K extends string = string> = {
 key: K
 use?: readonly FieldUse[]
 required?: boolean
 readonly?: boolean
 order?: MenuOrder
 identity?: ResFieldIdentity
 title?: string
 queryType?: ResFieldQueryType
 widget?: ResFieldWidget
 render?: ResFieldRender
 summary?: boolean
}

export type ResValueField<K extends string = string> = ResFieldBase<K> & {
 kind?: Extract<ResFieldKind, 'text' | 'number' | 'bool' | 'date' | 'datetime' | 'tags' | 'json'>
 dict?: never
 options?: never
 ref?: never
}

export type ResEnumField<K extends string = string> = ResFieldBase<K> & (
 | {
    kind: 'enum'
    dict: string
    options?: readonly ResFieldOption[]
    ref?: never
   }
 | {
    kind: 'enum'
    dict?: string
    options: readonly ResFieldOption[]
    ref?: never
   }
)

export type ResRefField<K extends string = string> = ResFieldBase<K> & {
 kind: 'ref'
 ref: string
 dict?: string
 options?: readonly ResFieldOption[]
}

export type ResSelectField<K extends string = string> = ResEnumField<K> | ResRefField<K>

export type ResField<K extends string = string> = ResValueField<K> | ResSelectField<K>

export type ResQueryValues = Record<string, string>
export type ResRow = Record<string, unknown>
export type ResSaveMode = 'create' | 'edit'

export type ResQueryParams = {
 queryValues: ResQueryValues
 page: number
 pageSize: number
}

export type ResQueryResult = {
 items: ResRow[]
 total?: number
 activeItem?: ResRow | null
 summary?: ReportViewSummaryMetric[]
}

export type ResSaveParams = {
 mode: ResSaveMode
 item: ResRow
 queryValues: ResQueryValues
 page: number
 pageSize: number
}

export type ResSaveResult = {
 refresh?: boolean
 close?: boolean
 activeItem?: ResRow | null
}

export type ResRemoveResult = {
 refresh?: boolean
 activeItem?: ResRow | null
}

export type ResActionScope = 'page' | 'batch' | 'row'

export type ResActionHandlerPayload = {
 key: string
 scope: ResActionScope
 item?: ResRow | null
 selectedRowKeys: string[]
 selectedCount: number
 queryValues: ResQueryValues
 activeItem?: ResRow | null
}

export type ResAction = {
 key: string
 variant?: 'default' | 'primary' | 'danger' | 'ghost'
 disabled?: boolean
 visible?: boolean
}

export type ResRowAction = {
 key: string
 variant?: 'default' | 'primary' | 'danger' | 'ghost'
 visible?: (row: ResRow) => boolean
}

export interface ResController<D extends string = string, R extends string = string> {
 kind: 'res'
 domain: D
 res: R
 title?: string
 icon?: string
 order?: MenuOrder
 runtimeKind?: 'crud' | 'report'
 fields?: readonly ResField[]
 query?: (params: ResQueryParams) => Promise<ResQueryResult>
 save?: (params: ResSaveParams) => Promise<ResSaveResult | void>
 remove?: (item: ResRow) => Promise<ResRemoveResult | void>
 create?: () => void | Promise<void>
 edit?: (row: ResRow) => void | Promise<void>
 export?: (params: {
  queryValues: ResQueryValues
  page: number
  pageSize: number
  items: ResRow[]
  total: number
  summary: ReportViewSummaryMetric[]
 }) => Promise<void> | void
 actions?: {
  page?: readonly ResAction[]
  batch?: readonly ResAction[]
  row?: readonly ResRowAction[]
  report?: readonly ReportViewAction[]
  custom?: Record<string, (payload: ResActionHandlerPayload) => void | Promise<void>>
 }
 state?: {
  queryValues?: Ref<ResQueryValues>
  page?: Ref<number>
  pageSize?: Ref<number>
  selectedRowKeys?: Ref<string[]>
  activeItem?: Ref<ResRow | null>
 }
}

export interface DomainController<D extends string = string> {
 kind: 'domain'
 domain: D
 title?: string
 icon?: string
 order?: MenuOrder
 items: readonly ResController<D, string>[]
}

export interface MainController {
 kind: 'main'
 domains: readonly DomainController[]
 currentPath?: Ref<DomainResPath | ''>
}

export interface AuthController {
 kind: 'auth'
 name: Ref<string>
 pwd: Ref<string>
 login: () => void | Promise<void>
 logout?: () => void | Promise<void>
}

export interface AppController {
 kind: 'app'
 appName?: string
 auth: AuthController
 main: MainController
}

export interface ResCrudRuntimeOptions {
 rowKey?: string
 initialPage?: number
 initialPageSize?: number
 pageSizeOptions?: number[]
 selectableRows?: boolean
 detailValueFormatter?: (value: unknown, key: string) => unknown
}

export interface ResReportRuntimeOptions {
 initialPage?: number
 initialPageSize?: number
 pageSizeOptions?: number[]
}

export interface ResCrudRuntime {
 kind: 'crud'
 title: string
 rowKey: string
 pageSizeOptions: number[]
 selectableRows: boolean
 queryFields: ResourceCrudQueryField[]
 columns: ResourceCrudColumn[]
 formSections: ResourceCrudFormSection[]
 controller: ResourceCrudController
 detailFields: ComputedRef<ResourceCrudDetailField[]>
}

export interface ResReportRuntime {
 kind: 'report'
 title: string
 pageSizeOptions: number[]
 queryFields: ResourceCrudQueryField[]
 columns: ReportViewResultColumn[]
 controller: ReportViewController
}

export type ResRuntime = ResCrudRuntime | ResReportRuntime

export function buildResPath<D extends string, R extends string>(domain: D, res: R): DomainResPath<D, R> {
 return `${domain}/${res}` as DomainResPath<D, R>
}

export function splitResPath(path: string): { domain: string, res: string } | null {
 if (typeof path !== 'string') return null
 const normalized = path.replace(/^\/+|\/+$/g, '')
 const parts = normalized.split('/').filter(Boolean)
 if (parts.length !== 2) return null
 const [domain, res] = parts
 if (!domain || !res) return null
 return { domain, res }
}

export function isResController(value: unknown): value is ResController {
 return Boolean(
  value
   && typeof value === 'object'
   && (value as { kind?: unknown }).kind === 'res'
   && typeof (value as { domain?: unknown }).domain === 'string'
   && typeof (value as { res?: unknown }).res === 'string',
 )
}

export function listAllResControllers(app: AppController): ResController[] {
 return app.main.domains.flatMap((domain) => [...domain.items])
}

export function findDomainByKey<D extends string = string>(app: AppController, domainKey: D): DomainController<D> | undefined {
 return app.main.domains.find((domain) => domain.domain === domainKey) as DomainController<D> | undefined
}

export function findResByPath(app: AppController, path: string): ResController | undefined {
 const parsed = splitResPath(path)
 if (!parsed) return undefined
 return listAllResControllers(app).find((item) => item.domain === parsed.domain && item.res === parsed.res)
}

export function flattenAppMenuNodes(app: AppController): FlatMenuNode[] {
 const domainNodes: FlatMenuNode[] = app.main.domains.map((domain, index) => ({
  key: domain.domain,
  title: domain.title || domain.domain,
  icon: domain.icon || '',
  order: domain.order ?? (index + 1) * 10,
  type: 'group',
 }))

 const itemNodes: FlatMenuNode[] = app.main.domains.flatMap((domain, domainIndex) => domain.items.map((item, itemIndex) => ({
  key: buildResPath(item.domain, item.res),
  title: item.title || item.res,
  path: `/${buildResPath(item.domain, item.res)}`,
  icon: item.icon || '',
  order: item.order ?? ((domainIndex + 1) * 100 + (itemIndex + 1) * 10),
  parentKey: domain.domain,
  type: 'item',
 })))

 return [...domainNodes, ...itemNodes]
}

export function inferFieldUses(field: ResField): readonly FieldUse[] {
 if (field.use?.length) return [...field.use]
 if (field.identity === 'primary') return ['detail']
 if (field.identity === 'title') return ['query', 'list', 'form', 'detail']
 if (field.identity === 'code') return ['query', 'list', 'detail']
 if (field.kind === 'enum' || field.kind === 'ref') return ['query', 'list', 'form', 'detail']
 if (field.kind === 'datetime') return ['list', 'detail']
 if (field.kind === 'date') return ['query', 'list', 'detail']
 return ['list', 'form', 'detail']
}

export function inferFieldOrder(field: ResField): number {
 if (typeof field.order === 'number') return field.order
 if (field.identity === 'primary') return 10
 if (field.identity === 'title') return 20
 if (field.identity === 'code') return 30
 if (isStatusLikeKey(field.key)) return 40
 if (isDateLikeKind(field.kind)) return 90
 return 60
}

export function inferListColumns(res: ResController): ResourceCrudColumn[] {
 return getOrderedFields(res)
  .filter((field) => inferFieldUses(field).includes('list'))
  .map((field) => ({
   key: field.key,
   render: inferColumnRenderer(field),
   visible: true,
  }))
}

export function inferQueryFields(res: ResController): ResourceCrudQueryField[] {
 return getOrderedFields(res)
  .filter((field) => inferFieldUses(field).includes('query'))
  .map((field) => ({
   key: field.key,
   type: inferQueryFieldType(field),
   options: toQueryOptions(field),
  }))
}

export function inferFormFields(res: ResController): ResourceCrudFormField[] {
 return getOrderedFields(res)
  .filter((field) => !field.readonly && inferFieldUses(field).includes('form'))
  .map((field) => ({
   key: field.key,
   widget: inferFormWidget(field),
  }))
}

export function inferFormSections(res: ResController): ResourceCrudFormSection[] {
 const fields = inferFormFields(res)
 if (fields.length === 0) return []
 return [{ key: 'basic', fields }]
}

export function inferDetailFields(res: ResController): ResourceCrudDetailField[] {
 return getOrderedFields(res)
  .filter((field) => inferFieldUses(field).includes('detail'))
  .map((field) => ({ key: field.key }))
}

export function inferReportColumns(res: ResController): ReportViewResultColumn[] {
 return getOrderedFields(res)
  .filter((field) => inferFieldUses(field).includes('list'))
  .map((field) => ({
   key: field.key,
   render: inferColumnRenderer(field),
   visible: true,
  }))
}

export function inferReportSummaryMetrics(res: ResController, items: ResRow[] = []): ReportViewSummaryMetric[] {
 const summaryFields = getOrderedFields(res).filter((field) => field.summary)
 return summaryFields.map((field) => ({
  key: field.key,
  value: resolveSummaryMetricValue(field.key, items),
 }))
}

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
   actions: res.actions?.custom,
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
   rowActions: res.actions?.row ? [...res.actions.row] : [],
  },
  handlers: {
   query: res.query,
   save: res.save,
   remove: res.remove,
   create: res.create,
   edit: res.edit,
   actions: res.actions?.custom,
  },
 })

 const formatDetailValue = options.detailValueFormatter ?? defaultDetailValueFormatter
 const detailFields = computed<ResourceCrudDetailField[]>(() => {
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

function getOrderedFields(res: ResController): ResField[] {
 return [...(res.fields ?? [])].sort((left, right) => {
  const orderDelta = inferFieldOrder(left) - inferFieldOrder(right)
  if (orderDelta !== 0) return orderDelta
  return left.key.localeCompare(right.key, 'zh-Hans-CN-u-co-pinyin')
 })
}

function inferColumnRenderer(field: ResField): ResourceCrudColumn['render'] {
 if (field.render) return field.render
 if (field.kind === 'tags') return 'tags'
 if (field.kind === 'enum' && isStatusLikeKey(field.key)) return 'status'
 if (isStatusLikeKey(field.key)) return 'status'
 return 'text'
}

function inferQueryFieldType(field: ResField): ResFieldQueryType {
 if (field.queryType) return field.queryType
 if (field.kind === 'enum' || field.kind === 'ref') return 'select'
 if (field.kind === 'date' || field.kind === 'datetime') return 'date'
 if (field.kind === 'number') return 'number'
 if (isSearchLikeKey(field.key)) return 'search'
 return 'text'
}

function inferFormWidget(field: ResField): ResFieldWidget {
 if (field.widget) return field.widget
 if (field.kind === 'enum' || field.kind === 'ref') return 'select'
 if (field.kind === 'bool') return 'switch'
 if (field.kind === 'number') return 'number'
 if (field.kind === 'date' || field.kind === 'datetime') return 'date'
 if (field.kind === 'tags') return 'tags'
 if (field.kind === 'json') return 'json'
 return 'text'
}

function toQueryOptions(field: ResField): ResourceCrudQueryOption[] | undefined {
 if ('options' in field && Array.isArray(field.options)) {
  return field.options.map((option) => ({
   key: option.key,
   value: option.value,
   disabled: option.disabled,
  }))
 }
 return undefined
}

function isStatusLikeKey(key: string) {
 return ['status', 'state', 'tier'].some((token) => key.toLowerCase().includes(token.toLowerCase()))
}

function isSearchLikeKey(key: string) {
 return ['name', 'title', 'code'].some((token) => key.toLowerCase().includes(token.toLowerCase()))
}

function isDateLikeKind(kind: ResField['kind']) {
 return kind === 'date' || kind === 'datetime'
}

function defaultDetailValueFormatter(value: unknown) {
 if (Array.isArray(value)) return value.join('，') || '-'
 if (value === undefined || value === null || value === '') return '-'
 return value
}

function resolveSummaryMetricValue(key: string, items: ResRow[]) {
 if (items.length === 0) return 0
 const lowerKey = key.toLowerCase()
 if (['count', 'total', 'totalcount'].includes(lowerKey)) return items.length
 const values = items.map((item) => item[key])
 if (values.every((value) => typeof value === 'number')) {
  return (values as number[]).reduce((sum, value) => sum + value, 0)
 }
 const truthyCount = values.filter((value) => Boolean(value)).length
 return truthyCount
}
