import type { DomainResPath } from './resource-model'
import type { PlatformDomain } from './domain'

export interface PlatformMain {
  kind: 'main'
  domains: readonly PlatformDomain[]
  defaultPath?: DomainResPath | ''
}
