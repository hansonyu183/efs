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
      icon: 'group',
      order: 10,
      resources: [
        {
          key: 'customer',
          title: '客户管理',
          icon: 'group',
          order: 10,
          view: {
            kind: 'crud',
          },
          datasource: {
            service: 'api',
            query: { path: '/api/crm/customers', method: 'GET' },
            save: { path: '/api/crm/customers/save', method: 'POST' },
            remove: { path: '/api/crm/customers/remove', method: 'POST' },
            export: { path: '/api/crm/customers/export', method: 'POST' },
          },
          fields: [
            { key: 'id', title: '客户编号', identity: 'primary', readonly: true, use: ['list', 'detail'] },
            { key: 'name', title: '客户名称', identity: 'title', queryType: 'search', use: ['query', 'list', 'form', 'detail'] },
            { key: 'owner', title: '负责人', use: ['query', 'list', 'form', 'detail'] },
            {
              key: 'status',
              title: '状态',
              kind: 'enum',
              render: 'status',
              use: ['query', 'list', 'form', 'detail'],
              options: [
                { key: 'active', value: 'active', title: '启用' },
                { key: 'inactive', value: 'inactive', title: '停用' },
              ],
            },
          ],
          actions: [
            { key: 'create', title: '新建', scope: 'page', variant: 'primary' },
            { key: 'edit', title: '编辑', scope: 'row' },
            { key: 'remove', title: '删除', scope: 'row', variant: 'danger', confirm: true, dangerous: true },
            { key: 'export', title: '导出', scope: 'page' },
          ],
        },
      ],
    },
    {
      key: 'bi',
      title: '经营分析',
      icon: 'report',
      order: 20,
      resources: [
        {
          key: 'customer-report',
          title: '客户分析',
          icon: 'report',
          order: 10,
          view: {
            kind: 'report',
          },
          datasource: {
            service: 'api',
            query: { path: '/api/bi/customer-report', method: 'GET' },
            export: { path: '/api/bi/customer-report/export', method: 'POST' },
          },
          fields: [
            { key: 'month', title: '月份', use: ['query', 'list'] },
            { key: 'count', title: '客户数', kind: 'number', summary: true, use: ['list', 'detail'] },
          ],
          actions: [
            { key: 'export', title: '导出报表', scope: 'page' },
          ],
        },
      ],
    },
  ],
})
