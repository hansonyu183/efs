import { pageCatalog } from '../../../contracts/src/index.mjs'
import { ActionRenderer } from './ActionRenderer.mjs'
import { MetadataFormRenderer } from './MetadataFormRenderer.mjs'
import { MetadataTableRenderer } from './MetadataTableRenderer.mjs'

const pageTypeAliases = {
  list: 'query-list',
  form: 'form-page',
  detail: 'readonly-detail',
  report: 'report-page'
}

function resolvePageType(pageType) {
  return pageTypeAliases[pageType] || pageType
}

function normalizeDetailFields(fields = []) {
  return fields.map((field, index) => ({
    key: field.key || `field_${index + 1}`,
    label: field.label || field.key || `Field ${index + 1}`,
    value: field.value ?? '-',
    hint: field.hint || '',
    permission: field.permission || null
  }))
}

function buildLayoutPlan(pageType) {
  const spec = pageCatalog[pageType]
  return {
    strategy: 'standard-shell-runtime-renderer',
    root: 'MainLayout',
    requiredComponents: spec?.requiredComponents || ['MainLayout', 'PageSection', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: spec?.requiredCapabilities || [],
    priority: spec?.priority || 'P1'
  }
}

function buildListPage(manifest, metadata, layoutPlan) {
  const table = MetadataTableRenderer(metadata.table || {})
  const actions = ActionRenderer(metadata.actions || [])

  return {
    shell: {
      component: 'EntityListTable',
      toolbarComponent: metadata.query ? 'QueryToolbarShell' : null,
      props: {
        title: metadata.table?.title || manifest?.name || '',
        subtitle: metadata.table?.subtitle || '',
        total: metadata.table?.total || 0,
        page: metadata.table?.page || 1,
        pageCount: metadata.table?.pageCount || 1,
        pageSize: metadata.table?.pageSize || 20,
        showPagination: layoutPlan.requiredComponents.includes('Pagination')
      }
    },
    query: metadata.query || null,
    table,
    actions
  }
}

function buildFormPage(manifest, metadata) {
  const form = MetadataFormRenderer(metadata.form || {})
  const actions = ActionRenderer(metadata.actions || [])
  const fieldCount = form.schema.fields.length

  return {
    shell: {
      component: 'FormShell',
      props: {
        title: metadata.form?.title || manifest?.name || '',
        subtitle: metadata.form?.subtitle || '',
        summary: metadata.form?.summary || (fieldCount > 0 ? `Fields: ${fieldCount}` : ''),
        showFooterActions: metadata.form?.showFooterActions !== false
      }
    },
    form,
    actions
  }
}

function buildDetailPage(manifest, metadata) {
  const fields = normalizeDetailFields(metadata.detail?.fields || [])
  const actions = ActionRenderer(metadata.actions || [])

  return {
    shell: {
      component: 'DetailShell',
      props: {
        title: metadata.detail?.title || manifest?.name || '',
        subtitle: metadata.detail?.subtitle || '',
        description: metadata.detail?.description || '',
        columns: metadata.detail?.columns || 2
      }
    },
    detail: {
      kind: 'detail',
      fields
    },
    actions
  }
}

function buildReportPage(manifest, metadata) {
  const resultTable = MetadataTableRenderer(metadata.resultTable || metadata.table || {})
  const actions = ActionRenderer(metadata.actions || [])

  return {
    shell: {
      component: 'ReportShell',
      props: {
        title: metadata.report?.title || manifest?.name || '',
        subtitle: metadata.report?.subtitle || '',
        description: metadata.report?.description || '',
        exportable: metadata.report?.exportable !== false,
        resultCountText: metadata.report?.resultCountText || ''
      }
    },
    query: metadata.query || null,
    resultTable,
    actions
  }
}

function buildRuntimeMetadataPage(manifest, metadata) {
  return {
    shell: {
      component: 'DynamicPageRenderer',
      props: {
        title: manifest?.name || '',
        resource: manifest?.resource || '',
        domain: manifest?.domain || ''
      }
    },
    query: metadata.query || null,
    table: MetadataTableRenderer(metadata.table || {}),
    form: MetadataFormRenderer(metadata.form || {}),
    actions: ActionRenderer(metadata.actions || [])
  }
}

function buildPageModel(pageType, manifest, metadata, layoutPlan) {
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
            title: manifest?.name || '',
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

export function renderDynamicPage(manifest, metadata = {}) {
  const requestedPageType = manifest?.pageType
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
    pageKey: `${manifest?.domain || 'app'}/${manifest?.resource || 'page'}/${pageType}`,
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

export function DynamicPageRenderer(pageType, manifest, metadata = {}) {
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
