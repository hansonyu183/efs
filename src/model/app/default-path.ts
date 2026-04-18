import type { EfsAppSchema } from '../../schema/index.ts'

export function buildDefaultPathFromSchema(schema: Readonly<EfsAppSchema>) {
  if (schema.app.defaultDomain && schema.app.defaultRes) {
    return `${schema.app.defaultDomain}/${schema.app.defaultRes}`
  }

  const firstDomain = schema.domains[0]
  const firstResource = firstDomain?.resources[0]
  if (!firstDomain || !firstResource) return ''
  return `${firstDomain.key}/${firstResource.key}`
}
