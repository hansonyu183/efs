type SchemaPresetType = 'crud' | 'report' | 'workbench'

export type ScaffoldedPreset = {
  appSchema: string
  runtimeEntry: string
  rootVue: string
}

function toSlug(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()
}

function toResKey(value: string) {
  return toSlug(value).replace(/^-+|-+$/g, '') || 'sample'
}

function buildAppSchema(preset: SchemaPresetType, name: string) {
  const resKey = toResKey(name)
  const domainKey = preset === 'workbench' ? 'platform' : 'demo'

  if (preset === 'workbench') {
    return `import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: '${resKey}-app',
    name: '${resKey}-app',
    title: '${name}',
    defaultDomain: '${domainKey}',
    defaultRes: '${resKey}',
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

  if (preset === 'report') {
    return `import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: '${resKey}-app',
    name: '${resKey}-app',
    title: '${name}',
    defaultDomain: '${domainKey}',
    defaultRes: '${resKey}',
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

  return `import { defineAppSchema } from '@efs/schema'

export const appSchema = defineAppSchema({
  schemaVersion: 'v1',
  app: {
    id: '${resKey}-app',
    name: '${resKey}-app',
    title: '${name}',
    defaultDomain: '${domainKey}',
    defaultRes: '${resKey}',
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

function buildRuntimeEntry(name: string) {
  return `import type { LegacyAppController, ResQueryParams, ResRow } from '@efs/vue/legacy'
import { adaptAppSchemaToVueController } from '@efs/schema'
import { appSchema } from '../app.schema'

const rows: ResRow[] = [
  { id: 'sample-001', name: '${name} 示例' },
]

function paginate(items: ResRow[], { page, pageSize }: ResQueryParams) {
  const start = Math.max(page - 1, 0) * pageSize
  return items.slice(start, start + pageSize)
}

export const app = adaptAppSchemaToVueController({
  schema: appSchema,
  auth: {
    async login() {
      return { accessToken: 'demo-token' }
    },
  },
  resources: {
    'demo/${toResKey(name)}': {
      async list({ queryValues, page, pageSize }) {
        return {
          items: paginate(rows, { queryValues, page, pageSize }),
          total: rows.length,
          activeItem: rows[0] ?? null,
        }
      },
      async query({ queryValues, page, pageSize }) {
        return {
          items: paginate(rows, { queryValues, page, pageSize }),
          total: rows.length,
        }
      },
      async create() {
        return { refresh: true, close: true }
      },
      async update() {
        return { refresh: true, close: true }
      },
      async remove() {
        return { refresh: true, activeItem: null }
      },
      async export() {},
    },
    'platform/${toResKey(name)}': {
      async list({ queryValues, page, pageSize }) {
        return {
          items: paginate(rows, { queryValues, page, pageSize }),
          total: rows.length,
        }
      },
    },
  },
}) satisfies LegacyAppController
`
}

function buildRootVue() {
  return `<template>\n  <EfsApp :app="app" app-name="EFS Schema App" />\n</template>\n\n<script setup lang="ts">\nimport { EfsApp } from '@efs/vue'\nimport { app } from './app-from-schema'\n</script>\n`
}

export function scaffoldPreset(preset: SchemaPresetType, name: string): ScaffoldedPreset {
  return {
    appSchema: buildAppSchema(preset, name),
    runtimeEntry: buildRuntimeEntry(name),
    rootVue: buildRootVue(),
  }
}

export function listPresets(): SchemaPresetType[] {
  return ['crud', 'report', 'workbench']
}
