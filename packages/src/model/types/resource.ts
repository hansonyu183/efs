import type { Ref, ReportViewAction, ReportViewSummaryMetric } from './resource-model'
import type {
  MenuOrder,
  ResAction,
  ResActionHandlerPayload,
  ResField,
  ResQueryParams,
  ResQueryResult,
  ResRemoveResult,
  ResRow,
  ResRowAction,
  ResSaveParams,
  ResSaveResult,
  ResQueryValues,
} from './resource-model'

export interface PlatformResource<D extends string = string, R extends string = string> {
  kind: 'res'
  domain: D
  res: R
  title?: string
  icon?: string
  order?: MenuOrder
  viewKind?: 'crud' | 'report'
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
