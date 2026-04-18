import { baselineSchema, composeAppSchema, type EfsAppSchema, type EfsAppSchemaPatch } from '@efs/schema/index.ts'

const testSchemaPatch: EfsAppSchemaPatch = {
  app: {
    id: 'test-app',
    name: 'test-app',
    title: 'Test App',
    defaultDomain: 'admin',
    defaultRes: 'user',
  },
  services: {
    api: {
      baseUrl: '/agentos-api',
      port: 8002,
    },
  },
  domains: [
    {
      key: 'admin',
      title: '管理',
      resources: [
        {
          key: 'user',
          title: '用户',
          fields: [
            { key: 'id', title: 'ID', type: 'number', identity: 'id', readonly: true },
            { key: 'username', title: '用户名', type: 'string', required: true },
          ],
          operations: {
            query: { path: '/admin/user/query', method: 'POST' },
            detail: { path: '/admin/user/detail', method: 'POST' },
            create: { path: '/admin/user/create', method: 'POST' },
            update: { path: '/admin/user/update', method: 'POST' },
            delete: { path: '/admin/user/delete', method: 'POST' },
          },
          view: {
            kind: 'crud',
            rowKey: 'id',
            pageSizeOptions: [10, 20, 50],
            selectableRows: true,
          },
          queryFields: [
            { key: 'username', title: '用户名', type: 'text' },
          ],
          columns: [
            { key: 'id', title: 'ID' },
            { key: 'username', title: '用户名' },
          ],
          formSections: [
            {
              key: 'main',
              title: '基本信息',
              fields: [
                { key: 'username', title: '用户名', widget: 'text', required: true },
              ],
            },
          ],
          detailFields: [
            { key: 'id', title: 'ID' },
            { key: 'username', title: '用户名' },
          ],
          summary: [],
          actions: {
            page: [
              { key: 'create', title: '新建', builtin: 'create' },
              { key: 'refresh', title: '刷新', builtin: 'refresh' },
            ],
            row: [
              { key: 'update', title: '编辑', builtin: 'update' },
              { key: 'delete', title: '删除', api: 'delete' },
            ],
            batch: [],
            report: [],
          },
        },
      ],
    },
  ],
}

export function createTestSchema(): EfsAppSchema {
  return composeAppSchema(baselineSchema, testSchemaPatch)
}
