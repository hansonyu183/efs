const requiredFalse = { bypassAllowed: false }

export const componentCatalog = {
  AppShell: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  AuthLayout: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  MainLayout: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  AppAlerts: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  ThemeSwitcher: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  LocaleSwitcher: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  OrgSwitcher: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  PermissionGuard: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },
  SessionBootstrap: { layer: 'foundation', priority: 'P0', required: true, ...requiredFalse },

  PageSection: { layer: 'shell', priority: 'P0', required: true, ...requiredFalse },
  QueryToolbarShell: { layer: 'shell', priority: 'P0', required: true, ...requiredFalse },
  EntityListTable: { layer: 'shell', priority: 'P0', required: true, ...requiredFalse },
  SimpleTableShell: { layer: 'shell', priority: 'P0', required: true, ...requiredFalse },
  CrudDialogShell: { layer: 'shell', priority: 'P0', required: true, ...requiredFalse },
  DashboardCardShell: { layer: 'shell', priority: 'P0', required: true, ...requiredFalse },
  FormShell: { layer: 'shell', priority: 'P1', required: false, ...requiredFalse },
  DetailShell: { layer: 'shell', priority: 'P1', required: false, ...requiredFalse },
  MasterDetailShell: { layer: 'shell', priority: 'P1', required: false, ...requiredFalse },
  ReportShell: { layer: 'shell', priority: 'P1', required: false, ...requiredFalse },

  StatusChip: { layer: 'interaction', priority: 'P0', required: true, ...requiredFalse },
  ActionBar: { layer: 'interaction', priority: 'P0', required: true, ...requiredFalse },
  Pagination: { layer: 'interaction', priority: 'P0', required: true, ...requiredFalse },
  EmptyState: { layer: 'interaction', priority: 'P0', required: true, ...requiredFalse },
  ErrorState: { layer: 'interaction', priority: 'P0', required: true, ...requiredFalse },
  ColumnSettings: { layer: 'interaction', priority: 'P1', required: false, ...requiredFalse },
  PermissionAwareAction: { layer: 'interaction', priority: 'P1', required: false, ...requiredFalse },

  DynamicPageRenderer: { layer: 'runtime', priority: 'P1', required: false, ...requiredFalse },
  MetadataFormRenderer: { layer: 'runtime', priority: 'P1', required: false, ...requiredFalse },
  MetadataTableRenderer: { layer: 'runtime', priority: 'P1', required: false, ...requiredFalse },
  ActionRenderer: { layer: 'runtime', priority: 'P1', required: false, ...requiredFalse }
}

export const requiredGlobalCapabilities = ['theme', 'i18n', 'alerts', 'permission', 'org-context']

export const pageCatalog = {
  login: {
    priority: 'P0',
    requiredComponents: ['AuthLayout', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts']
  },
  workbench: {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'DashboardCardShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'query-list': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'paginated-list': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'Pagination', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'crud-dialog-page': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'CrudDialogShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'form-page': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'FormShell', 'ActionBar', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'readonly-detail': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'DetailShell', 'StatusChip', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'list-detail': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'MasterDetailShell', 'EntityListTable', 'DetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'master-detail': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'MasterDetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'report-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'ReportShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'base-data-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'CrudDialogShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'rbac-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'MasterDetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'org-management': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'OrgSwitcher', 'MasterDetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'system-config': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'FormShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  },
  'runtime-metadata-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'DynamicPageRenderer', 'MetadataFormRenderer', 'MetadataTableRenderer', 'ActionRenderer', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: requiredGlobalCapabilities
  }
}
