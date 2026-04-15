import { computed, ref } from 'vue'
import type {
 AppController,
 AuthController,
 DomainController,
 MainController,
 ResController,
} from '../../../../packages/vue/src/controller/AppController'
import type { FlatMenuNode } from '../../../../packages/vue/src/shared/NavigationMenu'
import {
 flattenAppMenuNodes,
 resolveResRuntime,
} from '../../../../packages/vue/src/controller/AppController'
import { useAppAlerts } from '../../../../packages/vue/src/shared/app-alerts'

type User = {
 id: number
 code: string
 name: string
 status: string
 roleId: string
 tags: string[]
 createdAt: string
}

const roleOptions = [
 { key: 'admin', value: 'admin' },
 { key: 'operator', value: 'operator' },
 { key: 'auditor', value: 'auditor' },
] as const

const statusOptions = [
 { key: 'enabled', value: 'enabled' },
 { key: 'pending', value: 'pending' },
 { key: 'disabled', value: 'disabled' },
] as const

const users = ref<User[]>([
 { id: 1, code: 'U001', name: '张明', status: 'enabled', roleId: 'admin', tags: ['平台管理员'], createdAt: '2026-04-01 09:30' },
 { id: 2, code: 'U002', name: '李欣', status: 'pending', roleId: 'operator', tags: ['运营'], createdAt: '2026-04-02 14:15' },
 { id: 3, code: 'U003', name: '周航', status: 'disabled', roleId: 'auditor', tags: ['审计'], createdAt: '2026-04-03 10:20' },
 { id: 4, code: 'U004', name: '陈雨', status: 'enabled', roleId: 'operator', tags: ['客服', '华东'], createdAt: '2026-04-05 16:40' },
])

const { success, warning, clear } = useAppAlerts()

export function useAuth(): AuthController {
 const name = ref('admin')
 const pwd = ref('demo')

 async function login() {}
 async function logout() {}

 return {
  kind: 'auth',
  name,
  pwd,
  login,
  logout,
 }
}

export function useUser(): ResController<'admin', 'user'> {
 async function query({ queryValues, page, pageSize }) {
  const code = String(queryValues.code ?? '').trim().toLowerCase()
  const name = String(queryValues.name ?? '').trim().toLowerCase()
  const filtered = users.value.filter((item) => {
   const codeMatch = !code || item.code.toLowerCase().includes(code)
   const nameMatch = !name || item.name.toLowerCase().includes(name)
   const statusMatch = !queryValues.status || item.status === queryValues.status
   const roleMatch = !queryValues.roleId || item.roleId === queryValues.roleId
   return codeMatch && nameMatch && statusMatch && roleMatch
  })
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  return {
   items,
   total: filtered.length,
   activeItem: items[0] ?? null,
  }
 }

 async function save({ mode, item }) {
  const draft = item as Record<string, unknown>
  const tags = String(draft.tags ?? '').split(',').map((value) => value.trim()).filter(Boolean)
  if (mode === 'create') {
   const next: User = {
    id: Date.now(),
    code: String(draft.code ?? ''),
    name: String(draft.name ?? ''),
    status: String(draft.status ?? 'enabled'),
    roleId: String(draft.roleId ?? 'operator'),
    tags,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
   }
   users.value = [next, ...users.value]
   success({ key: 'user-create', title: '新建成功', message: `用户“${next.name}”已创建。` })
   return { refresh: true, close: true, activeItem: next }
  }

  const id = Number(draft.id ?? 0)
  users.value = users.value.map((row) => row.id === id
   ? {
      ...row,
      code: String(draft.code ?? ''),
      name: String(draft.name ?? ''),
      status: String(draft.status ?? 'enabled'),
      roleId: String(draft.roleId ?? 'operator'),
      tags,
     }
   : row)
  const activeItem = users.value.find((row) => row.id === id) ?? null
  success({ key: 'user-edit', title: '保存成功', message: '用户信息已更新。' })
  return { refresh: true, close: true, activeItem }
 }

 async function remove(row) {
  const user = row as User
  users.value = users.value.filter((item) => item.id !== user.id)
  warning({ key: 'user-delete', title: '已删除', message: `用户“${user.name}”已删除。` })
  return { refresh: true, activeItem: users.value[0] ?? null }
 }

 return {
  kind: 'res',
  domain: 'admin',
  res: 'user',
  title: '用户管理',
  icon: 'users',
  order: 110,
  fields: [
   { key: 'id', identity: 'primary', readonly: true, use: ['detail'] },
   { key: 'code', identity: 'code', queryType: 'search' },
   { key: 'name', identity: 'title', queryType: 'search', summary: true },
   { key: 'status', kind: 'enum', dict: 'user-status', options: statusOptions, render: 'status', use: ['query', 'list', 'form', 'detail'], summary: true },
   { key: 'roleId', kind: 'ref', ref: 'admin/role', options: roleOptions, use: ['query', 'list', 'form', 'detail'] },
   { key: 'tags', kind: 'tags', use: ['list', 'form', 'detail'] },
   { key: 'createdAt', kind: 'datetime', use: ['list', 'detail'] },
  ],
  query,
  save,
  remove,
  actions: {
   batch: [{ key: 'export' }, { key: 'enable' }],
   custom: {
    export: async ({ selectedCount }) => {
     success({ key: 'user-export', title: '导出成功', message: `已导出演示数据（选中 ${selectedCount} 条）。` })
    },
    enable: async ({ selectedRowKeys }) => {
     const selectedSet = new Set(selectedRowKeys.map(String))
     users.value = users.value.map((item) => selectedSet.has(String(item.id)) ? { ...item, status: 'enabled' } : item)
     clear()
     success({ key: 'user-enable', title: '批量启用成功', message: `已处理 ${selectedRowKeys.length} 条记录。` })
    },
   },
  },
 }
}

export function useUserReport(): ResController<'admin', 'user-report'> {
 async function query({ queryValues }) {
  const roleId = String(queryValues.roleId ?? '')
  const status = String(queryValues.status ?? '')
  const filtered = users.value.filter((item) => (!roleId || item.roleId === roleId) && (!status || item.status === status))
  const roleCounts = new Map<string, number>()
  for (const item of filtered) {
   roleCounts.set(item.roleId, (roleCounts.get(item.roleId) ?? 0) + 1)
  }
  const items = [...roleCounts.entries()].map(([roleKey, count]) => ({
   roleId: roleKey,
   count,
  }))
  return {
   items,
   total: items.length,
   summary: [
    { key: 'count', value: filtered.length, badge: '总人数' },
    { key: 'enabled', value: filtered.filter((item) => item.status === 'enabled').length, badge: '启用' },
   ],
  }
 }

 async function exportReport({ total }) {
  success({ key: 'user-report-export', title: '导出成功', message: `用户报表已导出（共 ${total} 条汇总记录）。` })
 }

 return {
  kind: 'res',
  domain: 'admin',
  res: 'user-report',
  title: '用户报表',
  icon: 'report',
  order: 120,
  runtimeKind: 'report',
  fields: [
   { key: 'status', kind: 'enum', dict: 'user-status', options: statusOptions, use: ['query'], summary: true },
   { key: 'roleId', kind: 'ref', ref: 'admin/role', options: roleOptions, use: ['query', 'list'], summary: true },
   { key: 'count', kind: 'number', use: ['list'], summary: true },
  ],
  query,
  export: exportReport,
  actions: {
   report: [{ key: 'refresh' }],
   custom: {
    refresh: async () => {
     success({ key: 'user-report-refresh', title: '刷新完成', message: '用户报表已刷新。' })
    },
   },
  },
 }
}

export function useAdmin(): DomainController<'admin'> {
 return {
  kind: 'domain',
  domain: 'admin',
  title: '系统管理',
  icon: 'settings',
  order: 20,
  items: [useUser(), useUserReport()],
 }
}

export function useMain(): MainController {
 return {
  kind: 'main',
  domains: [useAdmin()],
  currentPath: ref(''),
 }
}

export function useApp(): AppController {
 return {
  kind: 'app',
  appName: 'EFS Demo',
  auth: useAuth(),
  main: useMain(),
 }
}

export const demoApp = useApp()

export const demoSidebarMenus = computed<FlatMenuNode[]>(() => [
 {
  key: 'workbench',
  title: '工作台',
  path: '/workbench',
  icon: 'workbench',
  order: 10,
  parentKey: null,
  type: 'item',
 },
 ...flattenAppMenuNodes(demoApp),
])

export function resolveDemoResRuntime(path: string) {
 return resolveResRuntime(demoApp, path, {
  rowKey: 'id',
  initialPageSize: 10,
  pageSizeOptions: [2, 4, 10],
  selectableRows: true,
 })
}
