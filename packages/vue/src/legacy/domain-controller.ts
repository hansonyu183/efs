import type { MenuOrder } from './shared-types'
import type { LegacyResController } from './res-controller'

export interface LegacyDomainController<D extends string = string> {
  kind: 'domain'
  domain: D
  title?: string
  icon?: string
  order?: MenuOrder
  items: readonly LegacyResController<D, string>[]
}
