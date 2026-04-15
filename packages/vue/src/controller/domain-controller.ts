import type { MenuOrder } from './shared-types'
import type { ResController } from './res-controller'

export interface DomainController<D extends string = string> {
  kind: 'domain'
  domain: D
  title?: string
  icon?: string
  order?: MenuOrder
  items: readonly ResController<D, string>[]
}
