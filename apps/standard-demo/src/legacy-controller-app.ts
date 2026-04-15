// Legacy controller-first fixture kept only as a migration/reference sample.
// The runnable standard demo now uses schemas/<app-name>/app.schema.ts -> createPlatformAppFromSchema -> EfsApp.
import type { LegacyAppController, LegacyDomainController, LegacyResController, ResRow, ResQueryParams } from '@efs/vue/legacy'

const customerRows: ResRow[] = [
  { id: 'C-001', name: '杭州云启', owner: '张三', status: 'active', createdAt: '2026-04-01 09:00:00' },
  { id: 'C-002', name: '上海启明', owner: '李四', status: 'inactive', createdAt: '2026-04-03 10:30:00' },
  { id: 'C-003', name: '深圳北辰', owner: '王五', status: 'active', createdAt: '2026-04-08 14:20:00' },
]

const revenueRows: ResRow[] = [
  { month: '2026-01', revenue: 128000, orders: 32 },
  { month: '2026-02', revenue: 156000, orders: 37 },
  { month: '2026-03', revenue: 149000, orders: 35 },
]

function paginate(items: ResRow[], { page, pageSize }: ResQueryParams) {
  const start = Math.max(page - 1, 0) * pageSize
  return items.slice(start, start + pageSize)
}

const customerRes: LegacyResController<'crm', 'customer'> = {
  kind: 'res',
  domain: 'crm',
  res: 'customer',
  title: '客户列表',
  icon: 'group',
  runtimeKind: 'crud',
  fields: [
    { key: 'id', title: '客户编号', identity: 'primary', readonly: true, use: ['list', 'detail'] },
    { key: 'name', title: '客户名称', identity: 'title', queryType: 'search', use: ['query', 'list', 'form', 'detail'] },
    { key: 'owner', title: '负责人', use: ['query', 'list', 'form', 'detail'] },
    {
      key: 'status',
      title: '状态',
      kind: 'enum',
      options: [
        { key: 'active', value: 'active' },
        { key: 'inactive', value: 'inactive' },
      ],
      use: ['query', 'list', 'form', 'detail'],
    },
    { key: 'createdAt', title: '创建时间', kind: 'datetime', readonly: true, use: ['list', 'detail'] },
  ],
  async query({ queryValues, page, pageSize }) {
    const keyword = String(queryValues.name || queryValues.owner || '').trim().toLowerCase()
    const filtered = keyword
      ? customerRows.filter((item) => [item.name, item.owner].some((value) => String(value || '').toLowerCase().includes(keyword)))
      : customerRows

    return {
      items: paginate(filtered, { queryValues, page, pageSize }),
      total: filtered.length,
      activeItem: filtered[0] ?? null,
    }
  },
  async save() {
    return { refresh: true, close: true }
  },
  async remove() {
    return { refresh: true, activeItem: null }
  },
}

const revenueRes: LegacyResController<'bi', 'revenue'> = {
  kind: 'res',
  domain: 'bi',
  res: 'revenue',
  title: '营收报表',
  icon: 'report',
  runtimeKind: 'report',
  fields: [
    { key: 'month', title: '月份', queryType: 'search', use: ['query', 'list', 'detail'] },
    { key: 'revenue', title: '营收', kind: 'number', summary: true, use: ['list', 'detail'] },
    { key: 'orders', title: '订单数', kind: 'number', summary: true, use: ['list', 'detail'] },
  ],
  async query({ queryValues, page, pageSize }) {
    const keyword = String(queryValues.month || '').trim().toLowerCase()
    const filtered = keyword
      ? revenueRows.filter((item) => String(item.month || '').toLowerCase().includes(keyword))
      : revenueRows
    const totalRevenue = filtered.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
    const totalOrders = filtered.reduce((sum, item) => sum + Number(item.orders || 0), 0)

    return {
      items: paginate(filtered, { queryValues, page, pageSize }),
      total: filtered.length,
      summary: [
        { key: 'revenue', label: '总营收', value: String(totalRevenue) },
        { key: 'orders', label: '总订单数', value: String(totalOrders) },
      ],
    }
  },
}

const crmDomain: LegacyDomainController<'crm'> = {
  kind: 'domain',
  domain: 'crm',
  title: '客户中心',
  icon: 'group',
  order: 10,
  items: [customerRes],
}

const biDomain: LegacyDomainController<'bi'> = {
  kind: 'domain',
  domain: 'bi',
  title: '经营分析',
  icon: 'report',
  order: 20,
  items: [revenueRes],
}

export const app = {
  kind: 'app',
  auth: {
    kind: 'auth',
    async login({ orgCode }) {
      return {
        accessToken: `demo-token-${orgCode || 'default'}`,
        expiresAt: '2099-01-01T00:00:00.000Z',
      }
    },
    async logout() {},
    async getOrgs() {
      return [{ key: 'agentos', value: 'agentos', title: 'AgentOS' }]
    },
    getCurrentOrgCode() {
      return 'agentos'
    },
    async setCurrentOrgCode() {},
  },
  main: {
    kind: 'main',
    defaultPath: 'crm/customer',
    domains: [crmDomain, biDomain],
  },
} satisfies LegacyAppController
