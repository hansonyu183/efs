import type { HttpTransportOptions } from '../../http/index.ts'
import type { EfsAppSchema } from '../../schema/index.ts'

export type EfsServiceTransportSchema = {
  requestDataKey?: string
  responseDataKey?: string
  authHeader?: string
  authScheme?: string
}

export type EfsServiceSchema = NonNullable<EfsAppSchema['services']>[keyof NonNullable<EfsAppSchema['services']>] & {
  kind: string
  baseUrl?: string
  port?: number
  healthPath?: string
  devCommand?: string
  workingDir?: string
  env?: Record<string, string>
  transport?: EfsServiceTransportSchema
}

export interface SchemaRuntimeOptions {
  fetcher?: typeof fetch
  serviceKey?: string
  getAccessToken?: () => string | undefined
}

export function resolvePrimaryService(schema: Readonly<EfsAppSchema>, serviceKey?: string) {
  const services = schema.services as Record<string, EfsServiceSchema> | undefined
  if (!services) return undefined
  if (serviceKey && services[serviceKey]) return services[serviceKey]
  if (services.api) return services.api
  return Object.values(services).find((service) => service.kind === 'http' || service.kind === 'gateway' || service.kind === 'mock')
}

export function resolveTransportOptions(service?: EfsServiceSchema): HttpTransportOptions {
  return {
    requestDataKey: service?.transport?.requestDataKey,
    responseDataKey: service?.transport?.responseDataKey,
    authHeader: service?.transport?.authHeader || 'Authorization',
    authScheme: service?.transport?.authScheme || 'Bearer',
  }
}
