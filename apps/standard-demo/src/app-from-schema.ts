import type { AppController, ResQueryParams, ResRow } from '@efs/vue/controller'
import { adaptAppSchemaToVueController } from '@efs/schema'
import { appSchema } from '../app.schema'

const customerRows: ResRow[] = [
  { id: 'C-001', name: '杭州云启', owner: '张三', status: 'active', createdAt: '2026-04-01 09:00:00' },
  { id: 'C-002', name: '上海启明', owner: '李四', status: 'inactive', createdAt: '2026-04-03 10:30:00' },
  { id: 'C-003', name: '深圳北辰', owner: '王五', status: 'active', createdAt: '2026-04-08 14:20:00' },
]

const revenueRows: ResRow[] = [
  { month: '2026-01', revenue: 128000, count: 32 },
  { month: '2026-02', revenue: 156000, count: 37 },
  { month: '2026-03', revenue: 149000, count: 35 },
]

function paginate(items: ResRow[], { page, pageSize }: ResQueryParams) {
  const start = Math.max(page - 1, 0) * pageSize
  return items.slice(start, start + pageSize)
}

export const app = adaptAppSchemaToVueController({
  schema: appSchema,
  auth: {
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
  resources: {
    'crm/customer': {
      async list({ queryValues, page, pageSize }) {
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
    'bi/customer-report': {
      async query({ queryValues, page, pageSize }) {
        const keyword = String(queryValues.month || '').trim().toLowerCase()
        const filtered = keyword
          ? revenueRows.filter((item) => String(item.month || '').toLowerCase().includes(keyword))
          : revenueRows
        const totalRevenue = filtered.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
        const totalCount = filtered.reduce((sum, item) => sum + Number(item.count || 0), 0)

        return {
          items: paginate(filtered, { queryValues, page, pageSize }),
          total: filtered.length,
          summary: [
            { key: 'revenue', label: '总营收', value: String(totalRevenue) },
            { key: 'count', label: '客户数', value: String(totalCount) },
          ],
        }
      },
      async export() {},
    },
  },
}) satisfies AppController
