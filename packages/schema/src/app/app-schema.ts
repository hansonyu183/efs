import type { EfsAuthSchema } from './auth-schema'
import type { EfsServiceSchema } from './service-schema'
import type { EfsDomainSchema } from '../resource/resource-schema'

export interface EfsAppSchema {
  schemaVersion: 'v1'
  app: EfsAppInfoSchema
  auth?: EfsAuthSchema
  services?: Record<string, EfsServiceSchema>
  domains: EfsDomainSchema[]
}

export interface EfsAppInfoSchema {
  id: string
  name: string
  title?: string
  description?: string
  brandIcon?: string
  locale?: string
  theme?: 'light' | 'dark'
  defaultDomain?: string
  defaultRes?: string
}
