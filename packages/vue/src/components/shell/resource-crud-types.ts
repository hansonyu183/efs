export type CellRenderer = 'text' | 'status' | 'tags'
export type RowSelectionKey = string

export type ResourceCrudColumn = {
 key: string
 render?: CellRenderer
 formatter?: (value: unknown, row: Record<string, unknown>) => unknown
 visible?: boolean
}

export type ResourceCrudQueryOption = {
 key: string
 value: string
 disabled?: boolean
}

export type ResourceCrudQueryField = {
 key: string
 type?: 'text' | 'search' | 'date' | 'number' | 'select'
 options?: ResourceCrudQueryOption[]
}

export type ResourceCrudFormField = {
 key: string
 widget?: string
}

export type ResourceCrudFormSection = {
 key: string
 fields?: ResourceCrudFormField[]
}

export type ResourceCrudDetailField = {
 key: string
 value?: unknown
}

export type ResourceCrudAction = {
 key: string
 variant?: 'default' | 'primary' | 'danger' | 'ghost'
 disabled?: boolean
 visible?: boolean
}

export type ResourceCrudRowAction = {
 key: string
 variant?: 'default' | 'primary' | 'danger'
 visible?: (row: Record<string, unknown>) => boolean
}

export type ResourceCrudActionScope = 'page' | 'batch' | 'row'

export type ResourceCrudActionHandlerPayload = {
 key: string
 scope: ResourceCrudActionScope
 item?: Record<string, unknown> | null
 selectedRowKeys: RowSelectionKey[]
 selectedCount: number
 queryValues: Record<string, string>
 activeItem: Record<string, unknown> | null
}

export type ResourceCrudCustomActionHandler = (
 payload: ResourceCrudActionHandlerPayload
) => void | Promise<void>

export type ResourceCrudQueryResult = {
 items: Record<string, unknown>[]
 total?: number
 activeItem?: Record<string, unknown> | null
}

export type ResourceCrudSaveResult = void | {
 close?: boolean
 refresh?: boolean
 activeItem?: Record<string, unknown> | null
}

export type ResourceCrudRemoveResult = void | {
 refresh?: boolean
 activeItem?: Record<string, unknown> | null
}

export interface ResourceCrudControllerState {
 queryValues?: Record<string, string>
 page?: number
 pageSize?: number
 selectedRowKeys?: RowSelectionKey[]
 activeItem?: Record<string, unknown> | null
 items?: Record<string, unknown>[]
 total?: number
}

export interface ResourceCrudControllerHandlers {
 query?: (params: {
  queryValues: Record<string, string>
  page: number
  pageSize: number
 }) => Promise<ResourceCrudQueryResult>
 save?: (payload: {
  mode: 'create' | 'edit'
  item: Record<string, unknown> | null
  queryValues: Record<string, string>
  page: number
  pageSize: number
 }) => Promise<ResourceCrudSaveResult>
 remove?: (item: Record<string, unknown>) => Promise<ResourceCrudRemoveResult>
 create?: () => void | Promise<void>
 edit?: (row: Record<string, unknown>) => void | Promise<void>
 refresh?: () => void | Promise<void>
 actions?: Record<string, ResourceCrudCustomActionHandler>
}

export interface ResourceCrudControllerActions {
 actions?: ResourceCrudAction[]
 batchActions?: ResourceCrudAction[]
 rowActions?: ResourceCrudRowAction[]
}

export interface ResourceCrudController {
 state?: ResourceCrudControllerState
 handlers?: ResourceCrudControllerHandlers
 actions?: ResourceCrudControllerActions
}
