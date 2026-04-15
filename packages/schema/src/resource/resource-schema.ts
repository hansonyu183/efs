import type { EfsFieldSchema } from './field-schema'
import type { EfsActionSchema } from './action-schema'

export interface EfsDomainSchema {
  key: string
  title: string
  icon?: string
  order?: number
  resources: EfsResourceSchema[]
}

export interface EfsResourceSchema {
  key: string
  title: string
  icon?: string
  order?: number
  path?: string
  view: EfsViewSchema
  datasource?: EfsDatasourceSchema
  fields?: EfsFieldSchema[]
  actions?: EfsActionSchema[]
}

export interface EfsViewSchema {
  kind: 'crud' | 'report' | 'dashboard' | 'workspace' | 'custom'
}

export interface EfsDatasourceSchema {
  service: string
  query?: EfsEndpointSchema
  save?: EfsEndpointSchema
  remove?: EfsEndpointSchema
  export?: EfsEndpointSchema
}

export interface EfsEndpointSchema {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}
