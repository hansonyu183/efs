import { pageCatalog } from '../../../contracts/src/index.mjs'
import { ActionRenderer } from './ActionRenderer'
import { MetadataFormRenderer } from './MetadataFormRenderer'
import { MetadataTableRenderer } from './MetadataTableRenderer'

type RuntimeManifest = {
  pageType?: string
  name?: string
  domain?: string
  resource?: string
}

type RuntimeMetadata = {
  permissions?: string[]
  query?: Record<string, unknown> | null
  table?: Record<string, unknown>
  resultTable?: Record<string, unknown>
  form?: Record<string, unknown>
  detail?: Record<string, unknown>
  report?: Record<string, unknown>
  actions?: Record<string, unknown>[]
  theme?: string | null
  locale?: string | null
  orgId?: string | null
  subtitle?: string
}

const pageTypeAliases: Record<string, string> = {
  list: 'query-list',
  form: 'form-page',
  detail: 'readonly-detail',
  report: 'report-page'
}

function resolvePageType(pageType?: string) {
  return pageType ? (pageTypeAliases[pageType] || pageType) : ''
}

function normalizeDetailFields(fields: Array<Record<string, unknown>> = []) {
  return fields.map((field, index) => ({
    key: String(field.key || `field_${index + 1}`),
    label: String(field.label || field.key || `Field ${index + 1}`),
    value: field.value ?? '-',
    hint: String(field.hint || ''),
    permission: field.permission || null
  }))
}

function buildLayoutPlan(pageType: string) {
  const spec = pageCatalog[pageType]
  return {
    strategy: 'standard-shell-runtime-renderer',
    root: 'MainLayout',
    requiredComponents: spec?.requiredComponents || ['MainLayout', 'PageSection', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: spec?.requiredCapabilities || [],
    priority: spec?.priority || 'P1'
  }
}

function buildListPage(manifest: RuntimeManifest, metadata: RuntimeMetadata, layoutPlan: ReturnType<typeof buildLayoutPlan>) {
  const table = MetadataTableRenderer(metadata.table || {})
  const actions = ActionRenderer(metadata.actions || [])
  const tableMeta = metadata.table || {}

  return {
    shell: {
      component: 'EntityListTable',
      toolbarComponent: metadata.query ? 'QueryToolbarShell' : null,
      props: {
        title: String(tableMeta.title || manifest.name || ''),
        subtitle: String(tableMeta.subtitle || ''),
        total: Number(tableMeta.total || 0),
        page: Number(tableMeta.page || 1),
        pageCount: Number(tableMeta.pageCount || 1),
        pageSize: Number(tableMeta.pageSize || 20),
        showPagination: layoutPlan.requiredComponents.includes('Pagination')
      }
    },
    query: metadata.query || null,
    table,
    actions
  }
}

function buildFormPage(manifest: RuntimeManifest, metadata: RuntimeMetadata) {
  const form = MetadataFormRenderer(metadata.form || {})
  const actions = ActionRenderer(metadata.actions || [])
  const formMeta = metadata.form || {}
  const fieldCount = form.schema.fields.length

  return {
    shell: {
      component: 'FormShell',
      props: {
        title: String(formMeta.title || manifest.name || ''),
        subtitle: String(formMeta.subtitle || ''),
        summary: String(formMeta.summary || (fieldCount > 0 ? `Fields: ${fieldCount}` : '')),
        showFooterActions: formMeta.showFooterActions !== false
      }
    },
    form,
    actions
  }
}

function buildDetailPage(manifest: RuntimeManifest, metadata: RuntimeMetadata) {
  const detailMeta = metadata.detail || {}

  return {
    shell: {
      component: 'DetailShell',
      props: {
        title: String(detailMeta.title || manifest.name || ''),
        subtitle: String(detailMeta.subtitle || ''),
        description: String(detailMeta.description || ''),
        columns: Number(detailMeta.columns || 2)
      }
    },
    detail: {
      kind: 'detail',
      fields: normalizeDetailFields((detailMeta.fields as Array<Record<string, unknown>>) || [])
    },
    actions: ActionRenderer(metadata.actions || [])
  }
}

function buildReportPage(manifest: RuntimeManifest, metadata: RuntimeMetadata) {
  const reportMeta = metadata.report || {}

  return {
    shell: {
      component: 'ReportShell',
      props: {
        title: String(reportMeta.title || manifest.name || ''),
        subtitle: String(reportMeta.subtitle || ''),
        description: String(reportMeta.description || ''),
        exportable: reportMeta.exportable !== false,
        resultCountText: String(reportMeta.resultCountText || '')
      }
    },
    query: metadata.query || null,
    resultTable: MetadataTableRenderer(metadata.resultTable || metadata.table || {}),
    actions: ActionRenderer(metadata.actions || [])
  }
}

function buildRuntimeMetadataPage(manifest: RuntimeManifest, metadata: RuntimeMetadata) {
  return {
    shell: {
      component: 'DynamicPageRenderer',
      props: {
        title: manifest.name || '',
        resource: manifest.resource || '',
        domain: manifest.domain || ''
      }
    },
    query: metadata.query || null,
    table: MetadataTableRenderer(metadata.table || {}),
    form: MetadataFormRenderer(metadata.form || {}),
    actions: ActionRenderer(metadata.actions || [])
  }
}

function buildPageModel(pageType: string, manifest: RuntimeManifest, metadata: RuntimeMetadata, layoutPlan: ReturnType<typeof buildLayoutPlan>) {
  switch (pageType) {
    case 'query-list':
    case 'paginated-list':
    case 'base-data-page':
      return buildListPage(manifest, metadata, layoutPlan)
    case 'form-page':
    case 'system-config':
      return buildFormPage(manifest, metadata)
    case 'readonly-detail':
      return buildDetailPage(manifest, metadata)
    case 'report-page':
      return buildReportPage(manifest, metadata)
    case 'runtime-metadata-page':
      return buildRuntimeMetadataPage(manifest, metadata)
    default:
      return {
        shell: {
          component: layoutPlan.requiredComponents[1] || 'PageSection',
          props: {
            title: manifest.name || '',
            subtitle: metadata.subtitle || ''
          }
        },
        query: metadata.query || null,
        table: MetadataTableRenderer(metadata.table || {}),
        form: MetadataFormRenderer(metadata.form || {}),
        actions: ActionRenderer(metadata.actions || [])
      }
  }
}

export function renderDynamicPage(manifest: RuntimeManifest, metadata: RuntimeMetadata = {}) {
  const requestedPageType = manifest?.pageType || ''
  const pageType = resolvePageType(requestedPageType)
  const spec = pageCatalog[pageType]

  if (!spec) {
    throw new Error(`Unknown pageType: ${requestedPageType}`)
  }

  const layoutPlan = buildLayoutPlan(pageType)
  const pageModel = buildPageModel(pageType, manifest, metadata, layoutPlan)

  return {
    requestedPageType,
    pageType,
    pageKey: `${manifest.domain || 'app'}/${manifest.resource || 'page'}/${pageType}`,
    shellPlan: layoutPlan.requiredComponents,
    layoutPlan,
    permissions: metadata.permissions || [],
    runtimeContext: {
      theme: metadata.theme || null,
      locale: metadata.locale || null,
      orgId: metadata.orgId || null
    },
    ...pageModel
  }
}

export function DynamicPageRenderer(pageType: string, manifest: RuntimeManifest, metadata: RuntimeMetadata = {}) {
  const normalizedManifest = {
    ...(manifest || {}),
    pageType: manifest?.pageType || pageType
  }

  return {
    pageType,
    manifest: normalizedManifest,
    strategy: 'standard-shell-runtime-renderer',
    rendered: renderDynamicPage(normalizedManifest, metadata)
  }
}
