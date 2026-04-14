export type ReportViewQueryOption = {
 key: string
 value: string
 disabled?: boolean
}

export type ReportViewQueryField = {
 key: string
 type?: 'text' | 'search' | 'date' | 'number' | 'select'
 options?: ReportViewQueryOption[]
}

export type ReportViewResultColumn = {
 key: string
 render?: 'text' | 'status' | 'tags'
 formatter?: (value: unknown, row: Record<string, unknown>) => unknown
 visible?: boolean
}

export type ReportViewSummaryMetric = {
 key: string
 value?: number | string
 note?: string
 badge?: string
}

export type ReportViewAction = {
 key: string
 variant?: 'default' | 'primary' | 'danger' | 'ghost'
 disabled?: boolean
 visible?: boolean
}

export type ReportViewActionHandlerPayload = {
 key: string
 scope: 'page'
 queryValues: Record<string, string>
 page: number
 pageSize: number
 items: Record<string, unknown>[]
 total: number
 summary: ReportViewSummaryMetric[]
}

export type ReportViewQueryResult = {
 items: Record<string, unknown>[]
 total?: number
 summary?: ReportViewSummaryMetric[]
}

export type ReportViewExportResult = void

export type ReportViewCustomActionHandler = (
 payload: ReportViewActionHandlerPayload
) => void | Promise<void>

export interface ReportViewControllerState {
 queryValues?: Record<string, string>
 page?: number
 pageSize?: number
 items?: Record<string, unknown>[]
 total?: number
 summary?: ReportViewSummaryMetric[]
 busy?: boolean
 error?: string
}

export interface ReportViewControllerHandlers {
 query?: (params: {
  queryValues: Record<string, string>
  page: number
  pageSize: number
 }) => Promise<ReportViewQueryResult>
 export?: (params: {
  queryValues: Record<string, string>
  page: number
  pageSize: number
  items: Record<string, unknown>[]
  total: number
  summary: ReportViewSummaryMetric[]
 }) => Promise<ReportViewExportResult>
 actions?: Record<string, ReportViewCustomActionHandler>
}

export interface ReportViewControllerActions {
 actions?: ReportViewAction[]
}

export interface ReportViewController {
 state?: ReportViewControllerState
 handlers?: ReportViewControllerHandlers
 actions?: ReportViewControllerActions
}
