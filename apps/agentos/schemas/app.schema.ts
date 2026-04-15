import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: 'agentos',
    name: 'agentos',
    title: 'AgentOS',
    locale: 'zh-CN',
    theme: 'light',
    defaultDomain: 'admin',
    defaultRes: 'user',
  },
  auth: {
    mode: 'token',
    login: { path: '/session/login', method: 'POST' },
    logout: { path: '/session/logout', method: 'POST' },
    orgs: { path: '/session/orgs', method: 'GET' },
    token: {
      accessTokenField: 'token',
      tokenTypeField: 'tokenType',
    },
    org: {
      currentOrgCodeField: 'principal.orgCode',
    },
  },
  services: {
    api: {
      kind: 'http',
      baseUrl: '/agentos-api',
      port: 8002,
      healthPath: '/healthz',
      devCommand: 'go run ./cmd/server',
      workingDir: '../../../go-dev/AgentOS',
      transport: {
        requestDataKey: 'data',
        responseDataKey: 'data',
        authHeader: 'Authorization',
        authScheme: 'Bearer',
      },
    },
  },
  i18n: {
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': {
        efs: {
          brand: {
            title: 'AgentOS',
            subtitle: '企业管理平台',
          },
          auth: {
            title: '登录到 AgentOS',
            subtitle: '请输入账号凭证继续访问平台。',
            nameLabel: '用户名',
            namePlaceholder: '请输入用户名',
            passwordLabel: '密码',
            passwordPlaceholder: '请输入密码',
            orgLabel: '组织',
            orgPlaceholder: '请输入组织编码',
            submitLabel: '登录',
            submittingLabel: '登录中…',
          },
          shell: {
            localeLabel: '语言',
            themeLabel: '主题',
            orgLabel: '组织',
            logoutLabel: '退出登录',
            moreLabel: '更多',
            closeLabel: '关闭',
          },
          localeOptions: {
            'zh-CN': '中',
            'en-US': 'EN',
          },
          themeOptions: {
            light: '明',
            dark: '暗',
          },
          runtime: {
            emptyTitle: '资源不存在',
            emptySubtitle: '当前 path 未注册对应资源。',
          },
        },
      },
      'en-US': {
        efs: {
          brand: {
            title: 'AgentOS',
            subtitle: 'Enterprise workspace',
          },
          auth: {
            title: 'Sign in to AgentOS',
            subtitle: 'Enter your credentials to continue.',
            nameLabel: 'Username',
            namePlaceholder: 'Enter username',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Enter password',
            orgLabel: 'Organization',
            orgPlaceholder: 'Enter organization code',
            submitLabel: 'Sign in',
            submittingLabel: 'Signing in…',
          },
          shell: {
            localeLabel: 'Language',
            themeLabel: 'Theme',
            orgLabel: 'Organization',
            logoutLabel: 'Sign out',
            moreLabel: 'More',
            closeLabel: 'Close',
          },
          localeOptions: {
            'zh-CN': 'ZH',
            'en-US': 'EN',
          },
          themeOptions: {
            light: 'Light',
            dark: 'Dark',
          },
          runtime: {
            emptyTitle: 'Resource not found',
            emptySubtitle: 'The current path is not registered in the application shell.',
          },
        },
      },
    },
  },
  domains: [
    {
      key: 'admin',
      title: '平台管理',
      resources: [
        {
          key: 'user',
          title: '用户',
          fields: [
            { key: 'id', title: 'ID', type: 'number', identity: 'id', readonly: true },
            { key: 'username', title: '用户名', type: 'string', required: true },
            { key: 'displayName', title: '显示名称', type: 'string', identity: 'title', required: true },
            { key: 'password', title: '密码', type: 'string' },
          ],
          operations: {
            create: { path: '/admin/user/create', method: 'POST' },
            query: { path: '/admin/user/query', method: 'POST' },
            detail: { path: '/admin/user/detail', method: 'POST' },
            update: { path: '/admin/user/update', method: 'POST' },
            delete: { path: '/admin/user/delete', method: 'POST' },
          },
        },
        {
          key: 'role',
          title: '角色',
          fields: [
            { key: 'code', title: '角色编码', type: 'string', identity: 'code', required: true },
            { key: 'name', title: '角色名称', type: 'string', identity: 'title', required: true },
            { key: 'permissions', title: '权限', type: 'json' },
          ],
          operations: {
            create: { path: '/admin/role/create', method: 'POST' },
            query: { path: '/admin/role/query', method: 'POST' },
            detail: { path: '/admin/role/detail', method: 'POST' },
            update: { path: '/admin/role/update', method: 'POST' },
            delete: { path: '/admin/role/delete', method: 'POST' },
          },
        },
        {
          key: 'organization',
          title: '组织',
          fields: [
            { key: 'code', title: '组织编码', type: 'string', identity: 'code', required: true },
            { key: 'name', title: '组织名称', type: 'string', identity: 'title', required: true },
          ],
          operations: {
            create: { path: '/admin/organization/create', method: 'POST' },
            query: { path: '/admin/organization/query', method: 'POST' },
            detail: { path: '/admin/organization/detail', method: 'POST' },
            update: { path: '/admin/organization/update', method: 'POST' },
          },
        },
      ],
    },
    {
      key: 'crm',
      title: '客户中心',
      resources: [
        {
          key: 'customer',
          title: '客户',
          fields: [
            { key: 'id', title: 'ID', type: 'number', identity: 'id', readonly: true },
            { key: 'code', title: '客户编码', type: 'string', identity: 'code', required: true },
            { key: 'name', title: '客户名称', type: 'string', identity: 'title', required: true },
            {
              key: 'status',
              title: '状态',
              type: 'enum',
              options: [
                { key: 'active', value: 'active', title: '启用' },
                { key: 'inactive', value: 'inactive', title: '停用' },
              ],
            },
          ],
          operations: {
            create: { path: '/crm/customer/create', method: 'POST' },
            query: { path: '/crm/customer/query', method: 'POST' },
            detail: { path: '/crm/customer/detail', method: 'POST' },
            update: { path: '/crm/customer/update', method: 'POST' },
            delete: { path: '/crm/customer/delete', method: 'POST' },
          },
        },
      ],
    },
    {
      key: 'workflow',
      title: '流程中心',
      resources: [
        {
          key: 'process',
          title: '流程实例',
          description: '对应 AgentOS workflow/process 资源的 schema-first 演示。',
          fields: [
            { key: 'id', title: 'ID', type: 'number', identity: 'id', readonly: true },
            { key: 'definitionCode', title: '流程定义', type: 'string', identity: 'code', required: true },
            { key: 'title', title: '标题', type: 'string', identity: 'title', required: true },
            {
              key: 'status',
              title: '状态',
              type: 'enum',
              options: [
                { key: 'pending', value: 'pending', title: '待处理' },
                { key: 'approved', value: 'approved', title: '已通过' },
                { key: 'cancelled', value: 'cancelled', title: '已取消' },
                { key: 'completed', value: 'completed', title: '已完成' },
              ],
            },
            { key: 'currentStep', title: '当前步骤', type: 'string' },
            { key: 'assigneeName', title: '处理人', type: 'string' },
          ],
          operations: {
            query: { path: '/workflow/process/query', method: 'POST' },
            detail: { path: '/workflow/process/detail', method: 'POST' },
            start: { path: '/workflow/process/start', method: 'POST' },
            approve: { path: '/workflow/process/approve', method: 'POST' },
            cancel: { path: '/workflow/process/cancel', method: 'POST' },
            complete: { path: '/workflow/process/complete', method: 'POST' },
          },
        },
      ],
    },
  ],
  ui: {
    domains: {
      admin: {
        resources: {
          user: {
            view: { mode: 'crud' },
            actions: {
              delete: { api: 'delete', placement: 'row', label: '删除' },
              refresh: { runtime: 'refresh' },
            },
          },
          role: {
            view: { mode: 'crud' },
            actions: {
              delete: { api: 'delete', placement: 'row', label: '删除' },
              refresh: { runtime: 'refresh' },
            },
          },
          organization: {
            view: { mode: 'crud' },
            actions: {
              refresh: { runtime: 'refresh' },
            },
          },
        },
      },
      crm: {
        resources: {
          customer: {
            view: { mode: 'crud' },
            actions: {
              delete: { api: 'delete', placement: 'row', label: '删除' },
              refresh: { runtime: 'refresh' },
            },
          },
        },
      },
      workflow: {
        resources: {
          process: {
            view: { mode: 'report' },
            actions: {
              start: { api: 'start', placement: 'page', label: '发起流程' },
              approve: { api: 'approve', placement: 'page', label: '审批通过' },
              cancel: { api: 'cancel', placement: 'page', label: '取消流程' },
              complete: { api: 'complete', placement: 'page', label: '完成流程' },
            },
          },
        },
      },
    },
  },
})
