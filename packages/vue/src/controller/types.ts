import type { ComputedRef, Ref } from 'vue'
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

export type AuthOption = {
  key: string
  value: string
  title?: string
  label?: string
  disabled?: boolean
}

export interface AuthController {
  kind: 'auth'
  name: Ref<string>
  pwd: Ref<string>
  orgCode?: Ref<string>
  orgOptions?: readonly AuthOption[]
  busy?: Ref<boolean>
  error?: Ref<string>
  authenticated?: Ref<boolean>
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
