import type { ComputedRef, Ref } from 'vue'
import type {
  ResourceCrudColumn,
  ResourceCrudDetailField,
  ResourceCrudFormField,
  ResourceCrudFormSection,
  ResourceCrudQueryField,
  ResourceCrudQueryOption,
  ResourceCrudController,
} from './resource-crud-types'
import type {
  ReportViewAction,
  ReportViewController,
  ReportViewResultColumn,
  ReportViewSummaryMetric,
} from './report-view-types'

export type DomainKey = string
export type ResKey = string
export type DomainResPath<D extends string = string, R extends string = string> = `${D}/${R}`
export type EfsI18nConfig = import('../shared/efs-i18n').EfsI18nConfig
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

export type AuthOption = {
  key: string
  value: string
  title?: string
  label?: string
  disabled?: boolean
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

export type {
  ComputedRef,
  Ref,
  ReportViewAction,
  ReportViewController,
  ReportViewResultColumn,
  ReportViewSummaryMetric,
  ResourceCrudColumn,
  ResourceCrudController,
  ResourceCrudDetailField,
  ResourceCrudFormField,
  ResourceCrudFormSection,
  ResourceCrudQueryField,
  ResourceCrudQueryOption,
}
