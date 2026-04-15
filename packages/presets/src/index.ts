type SchemaPresetType = 'crud' | 'report' | 'workbench'

export type ScaffoldedPreset = {
  appSchema: string
  mainEntry: string
}

function toSlug(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()
}

function toAppName(value: string) {
  return toSlug(value).replace(/^-+|-+$/g, '') || 'sample-app'
}

function buildAppSchema(preset: SchemaPresetType, appName: string, title: string) {
  const domainKey = preset === 'workbench' ? 'platform' : 'demo'
  const resKey = preset === 'workbench' ? 'workbench' : appName

  if (preset === 'report') {
    return `import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: '${appName}',
    name: '${appName}',
    title: '${title}',
    defaultDomain: '${domainKey}',
    defaultRes: '${resKey}',
  },
  services: {
    api: {
      kind: 'http',
      baseUrl: 'http://127.0.0.1:8080',
      healthPath: '/healthz',
    },
  },
  domains: [
    {
      key: '${domainKey}',
      title: '演示域',
      resources: [
        {
          key: '${resKey}',
          title: '标准报表资源',
          fields: [
            { key: 'month', title: '月份', type: 'string', identity: 'code' },
            { key: 'amount', title: '金额', type: 'number' },
          ],
          operations: {
            query: { path: '/api/${domainKey}/${resKey}', method: 'GET' },
            export: { path: '/api/${domainKey}/${resKey}/export', method: 'POST' },
          },
        },
      ],
    },
  ],
  ui: {
    domains: {
      ${domainKey}: {
        resources: {
          '${resKey}': {
            view: { mode: 'report' },
            actions: {
              export: { api: 'export', placement: 'page' },
              refresh: { runtime: 'refresh' },
            },
          },
        },
      },
    },
  },
})
`
  }

  if (preset === 'workbench') {
    return `import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: '${appName}',
    name: '${appName}',
    title: '${title}',
    defaultDomain: '${domainKey}',
    defaultRes: '${resKey}',
  },
  services: {
    api: {
      kind: 'http',
      baseUrl: 'http://127.0.0.1:8080',
      healthPath: '/healthz',
    },
  },
  domains: [
    {
      key: '${domainKey}',
      title: '平台',
      resources: [
        {
          key: '${resKey}',
          title: '工作台',
          fields: [
            { key: 'summary', title: '概览', type: 'string', identity: 'title' },
          ],
          operations: {
            list: { path: '/api/${domainKey}/${resKey}', method: 'GET' },
          },
        },
      ],
    },
  ],
  ui: {
    domains: {
      ${domainKey}: {
        resources: {
          '${resKey}': {
            view: { mode: 'workspace' },
            actions: {
              refresh: { runtime: 'refresh' },
            },
          },
        },
      },
    },
  },
})
`
  }

  return `import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: '${appName}',
    name: '${appName}',
    title: '${title}',
    defaultDomain: '${domainKey}',
    defaultRes: '${resKey}',
  },
  services: {
    api: {
      kind: 'http',
      baseUrl: 'http://127.0.0.1:8080',
      healthPath: '/healthz',
    },
  },
  domains: [
    {
      key: '${domainKey}',
      title: '演示域',
      resources: [
        {
          key: '${resKey}',
          title: '标准 CRUD 资源',
          fields: [
            { key: 'id', title: '编号', type: 'string', identity: 'id', readonly: true },
            { key: 'name', title: '名称', type: 'string', identity: 'title', required: true },
          ],
          operations: {
            list: { path: '/api/${domainKey}/${resKey}', method: 'GET' },
            get: { path: '/api/${domainKey}/${resKey}/:id', method: 'GET' },
            create: { path: '/api/${domainKey}/${resKey}', method: 'POST' },
            update: { path: '/api/${domainKey}/${resKey}/:id', method: 'PUT' },
            remove: { path: '/api/${domainKey}/${resKey}/:id', method: 'DELETE' },
          },
        },
      ],
    },
  ],
  ui: {
    domains: {
      ${domainKey}: {
        resources: {
          '${resKey}': {
            view: { mode: 'crud' },
            actions: {
              filter: { runtime: 'filter' },
              refresh: { runtime: 'refresh' },
            },
          },
        },
      },
    },
  },
})
`
}

function buildMainEntry() {
  return `import { createApp } from 'vue'
import { createPlatformAppFromSchema } from '@efs/schema'
import { EfsApp } from '@efs/vue'
import { appSchema } from '../schemas/app.schema'

const app = createPlatformAppFromSchema(appSchema)
const appNameText = appSchema.app.title || appSchema.app.name

createApp(EfsApp, {
  app,
  appName: appNameText,
}).mount('#app')
`
}

export function scaffoldPreset(preset: SchemaPresetType, name: string): ScaffoldedPreset {
  const appName = toAppName(name)
  return {
    appSchema: buildAppSchema(preset, appName, name),
    mainEntry: buildMainEntry(),
  }
}

export function listPresets(): SchemaPresetType[] {
  return ['crud', 'report', 'workbench']
}
