import type { MenuOrder } from './resource-model'
import type { PlatformResource } from './resource'

export interface PlatformDomain<D extends string = string> {
  kind: 'domain'
  domain: D
  title?: string
  icon?: string
  order?: MenuOrder
  items: readonly PlatformResource<D, string>[]
}
