import type { EfsFieldSchema } from './field-schema'

export interface EfsDomainSchema {
  key: string
  title: string
  resources: EfsResourceSchema[]
}

export interface EfsResourceSchema {
  key: string
  title: string
  fields?: EfsFieldSchema[]
  operations?: EfsResourceOperationsSchema
  description?: string
}

export interface EfsResourceOperationsSchema {
  list?: EfsEndpointSchema
  get?: EfsEndpointSchema
  query?: EfsEndpointSchema
  create?: EfsEndpointSchema
  update?: EfsEndpointSchema
  remove?: EfsEndpointSchema
  [operation: string]: EfsEndpointSchema | undefined
}

export interface EfsEndpointSchema {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}
