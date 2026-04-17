import type { EfsAuthSchema } from './auth-schema.ts'
import type { EfsServiceSchema } from './service-schema.ts'
import type { EfsDomainSchema } from '../resource/resource-schema.ts'
import type { EfsAppUiSchema } from '../resource/ui-schema.ts'

export type EfsAppI18nMessages = {
  [key: string]: string | EfsAppI18nMessages
}

export interface EfsAppI18nSchema {
  locale?: string
  fallbackLocale?: string
  messages?: EfsAppI18nMessages | Record<string, EfsAppI18nMessages>
}

export interface EfsAppSchema {
  schemaVersion: 'v1'
  app: EfsAppInfoSchema
  auth?: EfsAuthSchema
  services?: Record<string, EfsServiceSchema>
  domains: EfsDomainSchema[]
  ui?: EfsAppUiSchema
  i18n?: EfsAppI18nSchema
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
