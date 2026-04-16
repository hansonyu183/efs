import type { MenuOrder } from './runtime-types'
import type { PlatformResource } from './resource-contract'

export interface PlatformDomain<D extends string = string> {
  kind: 'domain'
  domain: D
  title?: string
  icon?: string
  order?: MenuOrder
  items: readonly PlatformResource<D, string>[]
}
