import type { DomainResPath } from './runtime-types'
import type { PlatformDomain } from './domain-contract'

export interface PlatformMain {
  kind: 'main'
  domains: readonly PlatformDomain[]
  defaultPath?: DomainResPath | ''
}
