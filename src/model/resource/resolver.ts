import type { EfsAppSchema } from '../../schema/index.ts'
import { type SchemaRuntimeOptions } from '../app/service-config'
import { buildResourceAdapters } from './handlers'
import { attachResourceRuntime, type RuntimeResourceSchema } from './runtime'

export function createResModelResolver(schema: Readonly<EfsAppSchema>, options: SchemaRuntimeOptions = {}) {
  const resources = buildResourceAdapters(schema, options)

  return (path: string) => {
    const resolved = findRuntimeResourceByPath(schema, path)
    if (!resolved) return null
    return attachResourceRuntime(resolved.resource, resources[`${resolved.domainKey}/${resolved.resource.key}`])
  }
}

function findRuntimeResourceByPath(schema: Readonly<EfsAppSchema>, path: string) {
  const normalized = String(path || '').replace(/^\/+|\/+$/g, '')
  const parts = normalized.split('/').filter(Boolean)
  if (parts.length !== 2) return null

  const [domainKey, resourceKey] = parts
  const domain = schema.domains.find((item) => item.key === domainKey)
  if (!domain) return null
  const resource = domain.resources.find((item) => item.key === resourceKey)
  if (!resource) return null

  return {
    domainKey,
    resource: resource as RuntimeResourceSchema,
  }
}
