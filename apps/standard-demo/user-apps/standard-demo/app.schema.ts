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
