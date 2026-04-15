import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: 'standard-demo',
    name: 'standard-demo',
    title: 'Enterprise Frontend Standard Demo',
    locale: 'zh-CN',
    theme: 'light',
    defaultDomain: 'crm',
    defaultRes: 'customer',
  },
  auth: {
    mode: 'token',
    login: {
      path: '/api/auth/login',
      method: 'POST',
    },
    logout: {
      path: '/api/auth/logout',
      method: 'POST',
    },
    orgs: {
      path: '/api/auth/orgs',
      method: 'GET',
    },
    token: {
      accessTokenField: 'accessToken',
      refreshTokenField: 'refreshToken',
      expiresAtField: 'expiresAt',
      tokenTypeField: 'tokenType',
    },
    org: {
      currentOrgCodeField: 'orgCode',
    },
  },
  services: {
    api: {
      kind: 'http',
      baseUrl: 'http://127.0.0.1:8080',
      port: 8080,
      healthPath: '/healthz',
      devCommand: 'go run ./cmd/server',
      workingDir: '../agentos-server',
    },
  },
  i18n: {
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': {
        efs: {
          brand: {
            title: 'Enterprise Frontend Standard Demo',
            subtitle: '标准平台示例',
          },
          auth: {
            title: '登录到标准演示平台',
            subtitle: '请输入账号凭证继续访问标准演示。',
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
        },
      },
      'en-US': {
        efs: {
          brand: {
            title: 'Enterprise Frontend Standard Demo',
            subtitle: 'Platform demo',
          },
          auth: {
            title: 'Sign in to the standard demo',
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
        },
      },
    },
  },
  domains: [
    {
      key: 'crm',
      title: '客户中心',
      resources: [
        {
          key: 'customer',
          title: '客户管理',
          fields: [
            { key: 'id', title: '客户编号', type: 'string', identity: 'id', readonly: true },
            { key: 'name', title: '客户名称', type: 'string', identity: 'title', required: true },
            { key: 'owner', title: '负责人', type: 'string' },
            {
              key: 'status',
              title: '状态',
              type: 'enum',
              options: [
                { key: 'active', value: 'active', title: '启用' },
                { key: 'inactive', value: 'inactive', title: '停用' },
              ],
            },
            { key: 'createdAt', title: '创建时间', type: 'datetime', readonly: true },
          ],
          operations: {
            query: { path: '/api/crm/customers', method: 'GET' },
            get: { path: '/api/crm/customers/:id', method: 'GET' },
            create: { path: '/api/crm/customers', method: 'POST' },
            update: { path: '/api/crm/customers/:id', method: 'PUT' },
            remove: { path: '/api/crm/customers/:id', method: 'DELETE' },
            export: { path: '/api/crm/customers/export', method: 'POST' },
          },
        },
      ],
    },
    {
      key: 'bi',
      title: '经营分析',
      resources: [
        {
          key: 'customer-report',
          title: '客户分析',
          description: '客户分析报表资源，由 EFS runtime 自动推导报表 UI。',
          fields: [
            { key: 'month', title: '月份', type: 'string', identity: 'code' },
            { key: 'count', title: '客户数', type: 'number' },
            { key: 'revenue', title: '营收', type: 'number' },
          ],
          operations: {
            query: { path: '/api/bi/customer-report', method: 'GET' },
            export: { path: '/api/bi/customer-report/export', method: 'POST' },
          },
        },
      ],
    },
  ],
  ui: {
    domains: {
      crm: {
        resources: {
          customer: {
            view: {
              mode: 'crud',
            },
            fields: {
              createdAt: {
                hidden: true,
              },
            },
            actions: {
              export: {
                placement: 'page',
                api: 'export',
              },
              filter: {
                runtime: 'filter',
              },
            },
          },
        },
      },
      bi: {
        resources: {
          'customer-report': {
            view: {
              mode: 'report',
            },
            actions: {
              export: {
                placement: 'page',
                api: 'export',
              },
              refresh: {
                runtime: 'refresh',
              },
            },
          },
        },
      },
    },
  },
})
