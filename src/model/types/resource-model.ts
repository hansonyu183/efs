import type {
  ResourceCrudColumn,
  ResourceCrudDetailField,
  ResourceCrudFormSection,
  ResourceCrudQueryField,
  ResourceCrudController,
  ResourceCrudAction,
  ResourceCrudRowAction,
} from './crud-view'
import type {
  ReportViewAction,
  ReportViewController,
  ReportViewResultColumn,
  ReportViewSummaryMetric,
} from './report-view'

export type DomainKey = string
export type ResKey = string
export type DomainResPath<D extends string = string, R extends string = string> = `${D}/${R}`
export type EfsI18nConfig = import('../app/i18n').EfsI18nConfig
export type MenuOrder = number

export type ResFieldOption = {
  key: string
  value: string
  title?: string
  disabled?: boolean
}

export type ResFieldType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'ref' | 'json'
export type ResFieldIdentity = 'id' | 'title' | 'code'

export type ResField<K extends string = string> = {
  key: K
  title?: string
  type?: ResFieldType
  required?: boolean
  readonly?: boolean
  identity?: ResFieldIdentity
  options?: readonly ResFieldOption[]
  ref?: string
  description?: string
}

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
  title?: string
  builtin?: string
  api?: string
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  disabled?: boolean
  visible?: boolean
}

export type ResRowAction = {
  key: string
  title?: string
  builtin?: string
  api?: string
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  visible?: (row: ResRow) => boolean
}

export type AuthOption = {
  key: string
  value: string
  title?: string
  label?: string
  disabled?: boolean
}

export interface ResCrudModelOptions {
  initialPage?: number
  initialPageSize?: number
}

export interface ResReportModelOptions {
  initialPage?: number
  initialPageSize?: number
}

export interface ResEndpoint {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

export interface ResOperations {
  list?: ResEndpoint
  get?: ResEndpoint
  detail?: ResEndpoint
  query?: ResEndpoint
  create?: ResEndpoint
  update?: ResEndpoint
  remove?: ResEndpoint
  delete?: ResEndpoint
  export?: ResEndpoint
  [operation: string]: ResEndpoint | undefined
}

export interface CrudResourceViewConfig {
  kind: 'crud'
  rowKey: string
  pageSizeOptions?: number[]
  selectableRows?: boolean
}

export interface ReportResourceViewConfig {
  kind: 'report'
  pageSizeOptions?: number[]
}

interface ResModelBase {
  key: ResKey
  title: string
  description?: string
  icon?: string
  order?: MenuOrder
  fields?: readonly ResField[]
  operations?: ResOperations
}

export interface ResCrudModel extends ResModelBase {
  view: CrudResourceViewConfig
  queryFields: ResourceCrudQueryField[]
  columns: ResourceCrudColumn[]
  formSections: ResourceCrudFormSection[]
  detailFields: ResourceCrudDetailField[]
  actions?: {
    page?: ResourceCrudAction[]
    batch?: ResourceCrudAction[]
    row?: ResourceCrudRowAction[]
  }
  controller?: ResourceCrudController
}

export interface ResReportModel extends ResModelBase {
  view: ReportResourceViewConfig
  queryFields: ResourceCrudQueryField[]
  columns: ReportViewResultColumn[]
  summary?: ReportViewSummaryMetric[]
  actions?: {
    report?: ReportViewAction[]
  }
  controller?: ReportViewController
}

export type ResModel = ResCrudModel | ResReportModel

export type {
  ReportViewAction,
  ReportViewController,
  ReportViewResultColumn,
  ReportViewSummaryMetric,
  ResourceCrudColumn,
  ResourceCrudController,
  ResourceCrudDetailField,
  ResourceCrudFormSection,
  ResourceCrudQueryField,
  ResourceCrudAction,
  ResourceCrudRowAction,
}
