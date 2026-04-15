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
      baseUrl: 'http://127.0.0.1:8002',
      port: 8002,
      healthPath: '/healthz',
      devCommand: 'go run ./cmd/server',
      workingDir: '../../../go-dev/AgentOS',
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
