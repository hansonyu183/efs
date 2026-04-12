import { pageCatalog, requiredGlobalCapabilities } from '../../contracts/src/index.mjs'

function manifestForPreset(pageType, name) {
  const spec = pageCatalog[pageType]
  if (!spec) {
    throw new Error(`Unknown preset: ${pageType}`)
  }

  const slug = name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()

  return {
    id: slug,
    name,
    pageType,
    domain: 'demo',
    resource: slug,
    standardComponents: spec.requiredComponents,
    runtimeCapabilities: [...requiredGlobalCapabilities],
    exception: null
  }
}

function scriptBlock(pageType, components) {
  const componentImports = components
    .map((name) => `// import ${name} from '@enterprise/${name}'`)
    .join('\n')

  return `<script setup lang="ts">\nconst pageType = '${pageType}'\n${componentImports}\n</script>`
}

function templateBlock(pageType) {
  return `<template>\n  <div class="enterprise-page" data-page-type="${pageType}">\n    <!-- Use standard shells only; no raw table/form skeletons here. -->\n  </div>\n</template>`
}

function styleBlock() {
  return `<style scoped>\n.enterprise-page {\n  display: block;\n}\n</style>`
}

export function scaffoldPreset(pageType, name) {
  const manifest = manifestForPreset(pageType, name)
  const vue = [
    `<!-- standard-components: ${manifest.standardComponents.join(', ')} -->`,
    scriptBlock(pageType, manifest.standardComponents),
    templateBlock(pageType),
    styleBlock()
  ].join('\n\n')

  return {
    manifest,
    vue,
    fileBaseName: name
  }
}

export function listPresets() {
  return Object.keys(pageCatalog).sort()
}
