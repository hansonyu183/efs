import { componentCatalog, pageCatalog, requiredGlobalCapabilities } from './library.mjs'

export function validatePageDefinition(pageDef) {
  const errors = []

  if (!pageDef || typeof pageDef !== 'object') {
    return { valid: false, errors: ['Page definition must be an object.'] }
  }

  if (!pageDef.id) errors.push('Missing required field: id')
  if (!pageDef.name) errors.push('Missing required field: name')
  if (!pageDef.pageType) errors.push('Missing required field: pageType')

  const pageSpec = pageCatalog[pageDef.pageType]
  if (!pageSpec) {
    errors.push(`Unknown pageType: ${pageDef.pageType}`)
    return { valid: false, errors }
  }

  const components = new Set(pageDef.standardComponents || [])
  for (const component of components) {
    if (!componentCatalog[component]) {
      errors.push(`Unknown standard component: ${component}`)
    }
  }

  for (const required of pageSpec.requiredComponents) {
    if (!components.has(required)) {
      errors.push(`pageType=${pageDef.pageType} requires component: ${required}`)
    }
  }

  const capabilities = new Set(pageDef.runtimeCapabilities || [])
  for (const requiredCapability of pageSpec.requiredCapabilities) {
    if (!capabilities.has(requiredCapability)) {
      errors.push(`pageType=${pageDef.pageType} requires runtime capability: ${requiredCapability}`)
    }
  }

  for (const capability of requiredGlobalCapabilities) {
    if (!capabilities.has(capability)) {
      errors.push(`Missing mandatory global capability: ${capability}`)
    }
  }

  const exception = pageDef.exception
  if (exception !== null && exception !== undefined) {
    if (!exception.reason) errors.push('Exception must include reason')
    if (!exception.owner) errors.push('Exception must include owner')
    if (!exception.expiresAt) errors.push('Exception must include expiresAt')
  }

  return { valid: errors.length === 0, errors }
}
