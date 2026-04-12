import { pageCatalog } from '../../../contracts/src/index.mjs'
import { ActionRenderer } from './ActionRenderer.mjs'
import { MetadataFormRenderer } from './MetadataFormRenderer.mjs'
import { MetadataTableRenderer } from './MetadataTableRenderer.mjs'

function defaultLayoutFor(pageType) {
  switch (pageType) {
    case 'workbench':
      return ['MainLayout', 'PageSection', 'DashboardCardShell', 'PermissionGuard', 'AppAlerts']
    case 'runtime-metadata-page':
      return ['MainLayout', 'DynamicPageRenderer', 'MetadataFormRenderer', 'MetadataTableRenderer', 'ActionRenderer', 'PermissionGuard', 'AppAlerts']
    default:
      return pageCatalog[pageType]?.requiredComponents || ['MainLayout', 'PageSection', 'PermissionGuard', 'AppAlerts']
  }
}

export function renderDynamicPage(manifest, metadata = {}) {
  const pageType = manifest?.pageType
  const spec = pageCatalog[pageType]
  if (!spec) {
    throw new Error(`Unknown pageType: ${pageType}`)
  }

  return {
    pageType,
    shellPlan: defaultLayoutFor(pageType),
    permissions: metadata.permissions || [],
    query: metadata.query || null,
    table: MetadataTableRenderer(metadata.table || {}),
    form: MetadataFormRenderer(metadata.form || {}),
    actions: ActionRenderer(metadata.actions || [])
  }
}

export function DynamicPageRenderer(pageType, manifest, metadata = {}) {
  return {
    pageType,
    manifest,
    strategy: 'standard-shell-runtime-renderer',
    rendered: renderDynamicPage(manifest, metadata)
  }
}
