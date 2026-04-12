export const componentCatalog = {
  AppShell: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  AuthLayout: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  MainLayout: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  AppAlerts: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  ThemeSwitcher: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  LocaleSwitcher: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  OrgSwitcher: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  PermissionGuard: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  SessionBootstrap: { layer: 'foundation', priority: 'P0', required: true, bypassAllowed: false },
  PageSection: { layer: 'shell', priority: 'P0', required: true, bypassAllowed: false },
  QueryToolbarShell: { layer: 'shell', priority: 'P0', required: true, bypassAllowed: false },
  EntityListTable: { layer: 'shell', priority: 'P0', required: true, bypassAllowed: false },
  SimpleTableShell: { layer: 'shell', priority: 'P0', required: true, bypassAllowed: false },
  CrudDialogShell: { layer: 'shell', priority: 'P0', required: true, bypassAllowed: false },
  DashboardCardShell: { layer: 'shell', priority: 'P0', required: true, bypassAllowed: false },
  FormShell: { layer: 'shell', priority: 'P1', required: false, bypassAllowed: false },
  DetailShell: { layer: 'shell', priority: 'P1', required: false, bypassAllowed: false },
  MasterDetailShell: { layer: 'shell', priority: 'P1', required: false, bypassAllowed: false },
  ReportShell: { layer: 'shell', priority: 'P1', required: false, bypassAllowed: false },
  StatusChip: { layer: 'interaction', priority: 'P0', required: true, bypassAllowed: false },
  ActionBar: { layer: 'interaction', priority: 'P0', required: true, bypassAllowed: false },
  Pagination: { layer: 'interaction', priority: 'P0', required: true, bypassAllowed: false },
  EmptyState: { layer: 'interaction', priority: 'P0', required: true, bypassAllowed: false },
  ErrorState: { layer: 'interaction', priority: 'P0', required: true, bypassAllowed: false },
  ColumnSettings: { layer: 'interaction', priority: 'P1', required: false, bypassAllowed: false },
  PermissionAwareAction: { layer: 'interaction', priority: 'P1', required: false, bypassAllowed: false },
  DynamicPageRenderer: { layer: 'runtime', priority: 'P1', required: false, bypassAllowed: false },
  MetadataFormRenderer: { layer: 'runtime', priority: 'P1', required: false, bypassAllowed: false },
  MetadataTableRenderer: { layer: 'runtime', priority: 'P1', required: false, bypassAllowed: false },
  ActionRenderer: { layer: 'runtime', priority: 'P1', required: false, bypassAllowed: false }
}

export const pageCatalog = {
  login: {
    priority: 'P0',
    requiredComponents: ['AuthLayout', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts']
  },
  workbench: {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'DashboardCardShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'query-list': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'paginated-list': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'Pagination', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'crud-dialog-page': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'CrudDialogShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'form-page': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'FormShell', 'ActionBar', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'readonly-detail': {
    priority: 'P0',
    requiredComponents: ['MainLayout', 'PageSection', 'DetailShell', 'StatusChip', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'list-detail': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'MasterDetailShell', 'EntityListTable', 'DetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'master-detail': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'MasterDetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'report-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'ReportShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'base-data-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'QueryToolbarShell', 'EntityListTable', 'CrudDialogShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'rbac-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'MasterDetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'org-management': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'OrgSwitcher', 'MasterDetailShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'system-config': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'PageSection', 'FormShell', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  },
  'runtime-metadata-page': {
    priority: 'P1',
    requiredComponents: ['MainLayout', 'DynamicPageRenderer', 'MetadataFormRenderer', 'MetadataTableRenderer', 'ActionRenderer', 'PermissionGuard', 'AppAlerts'],
    requiredCapabilities: ['theme', 'i18n', 'alerts', 'permission', 'org-context']
  }
}

export const requiredGlobalCapabilities = ['theme', 'i18n', 'alerts', 'permission', 'org-context']
