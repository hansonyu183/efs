const REQUIRED_CAPABILITIES = ['theme', 'i18n', 'alerts', 'permission', 'org-context'] as const

type PresetPageType =
 | 'login'
 | 'workbench'
 | 'query-list'
 | 'paginated-list'
 | 'entity-list'
 | 'form-page'
 | 'detail-page'
 | 'report-page'

const PRESETS: Record<PresetPageType, string[]> = {
 login: ['AuthPage'],
 workbench: ['MainPage', 'PagePanel', 'DashboardCardPanel', 'PermissionGuard'],
 'query-list': ['MainPage', 'PagePanel', 'EntityListTable', 'PermissionGuard'],
 'paginated-list': ['MainPage', 'PagePanel', 'EntityListTable', 'Pagination', 'PermissionGuard'],
 'entity-list': ['MainPage', 'PagePanel', 'EntityListView', 'EntityListTable', 'CrudDialog', 'DetailPanel', 'PermissionGuard'],
 'form-page': ['MainPage', 'PagePanel', 'FormPanel', 'ActionBar', 'PermissionGuard'],
 'detail-page': ['MainPage', 'PagePanel', 'DetailPanel', 'StatusChip', 'PermissionGuard'],
 'report-page': ['MainPage', 'PagePanel', 'ReportPanel', 'PermissionGuard'],
}

export type PresetManifest = {
 id: string
 name: string
 pageType: PresetPageType
 domain: string
 resource: string
 standardComponents: string[]
 runtimeCapabilities: string[]
 exception: null
}

export type ScaffoldedPreset = {
 manifest: PresetManifest
 vue: string
 fileBaseName: string
}

function manifestForPreset(pageType: PresetPageType, name: string): PresetManifest {
 const standardComponents = PRESETS[pageType]
 if (!standardComponents) throw new Error(`Unknown preset: ${pageType}`)
 const slug = name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()
 return {
  id: slug,
  name,
  pageType,
  domain: 'demo',
  resource: slug,
  standardComponents,
  runtimeCapabilities: [...REQUIRED_CAPABILITIES],
  exception: null,
 }
}

function scriptBlock(pageType: PresetPageType, components: string[]) {
 const componentImports = components.map((name) => `// import ${name} from '@enterprise/${name}'`).join('\n')
 return `<script setup lang="ts">\nconst pageType = '${pageType}'\n${componentImports}\n</script>`
}

function templateBlock(pageType: PresetPageType) {
 return `<template>\n  <div class="enterprise-page" data-page-type="${pageType}">\n    <!-- Use standard Page/View/Panel components only. -->\n  </div>\n</template>`
}

function styleBlock() {
 return `<style scoped>\n.enterprise-page {\n  display: block;\n}\n</style>`
}

export function scaffoldPreset(pageType: PresetPageType, name: string): ScaffoldedPreset {
 const manifest = manifestForPreset(pageType, name)
 const vue = [
  `<!-- standard-components: ${manifest.standardComponents.join(', ')} -->`,
  scriptBlock(pageType, manifest.standardComponents),
  templateBlock(pageType),
  styleBlock(),
 ].join('\n\n')
 return { manifest, vue, fileBaseName: name }
}

export function listPresets(): PresetPageType[] {
 return Object.keys(PRESETS).sort() as PresetPageType[]
}
