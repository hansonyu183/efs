<template>
 <MainPage
  title="客户管理"
  app-name="EFS Demo"
  org-code="demo-org"
  :locale="locale"
  :theme="theme"
  @update:locale="locale = $event"
  @update:theme="theme = $event"
 >
  <template #sidebar>
   <DemoSidebarNav :items="demoSidebarMenus" :current-path="route.path" />
  </template>

  <PagePanel title="标准 CRUD 页" subtitle="EntityListView 已升级为 controller-first 的厚版标准 CRUD 页">
   <EntityListView
    row-key="id"
    title="客户资源"
    :query-fields="queryFields"
    :columns="columns"
    :detail-fields="detailFields"
    :page-size-options="[2, 4, 6]"
    :selectable-rows="true"
    :form-sections="formSections"
    :controller="customerCrud"
   >
    <template #table-header-actions>
     <AppButton variant="ghost" @click="setTableState('default')">恢复默认</AppButton>
    </template>

    <template #detail-actions="{ activeItem, openEdit }">
     <AppButton variant="ghost" :disabled="!activeItem" @click="activeItem && openEdit(activeItem)">编辑当前项</AppButton>
    </template>

    <template #form="{ mode }">
     <div class="demo-crud-form">
      <div class="demo-crud-form__grid">
       <AppField label="客户编码" required>
        <AppInput v-model="form.code" placeholder="请输入客户编码" />
       </AppField>
       <AppField label="客户名称" required>
        <AppInput v-model="form.name" placeholder="请输入客户名称" />
       </AppField>
       <AppField label="状态">
        <AppSelect v-model="form.status" :options="statusOptions" />
       </AppField>
       <AppField label="行业">
        <AppSelect v-model="form.industry" :options="industryOptions" />
       </AppField>
      </div>
      <AppField label="标签">
       <AppInput v-model="form.tagsText" :placeholder="mode === 'edit' ? '更新标签，多个标签用逗号分隔' : '多个标签用逗号分隔'" />
      </AppField>
     </div>
    </template>
   </EntityListView>
  </PagePanel>
 </MainPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import MainPage from '../../../../packages/vue/src/components/foundation/MainPage.vue'
import AppButton from '../../../../packages/vue/src/components/foundation/AppButton.vue'
import AppField from '../../../../packages/vue/src/components/foundation/AppField.vue'
import AppInput from '../../../../packages/vue/src/components/foundation/AppInput.vue'
import AppSelect from '../../../../packages/vue/src/components/foundation/AppSelect.vue'
import PagePanel from '../../../../packages/vue/src/components/shell/PagePanel.vue'
import EntityListView from '../../../../packages/vue/src/components/shell/EntityListView.vue'
import type { ResourceCrudController } from '../../../../packages/vue/src/components/shell/resource-crud-types'
import DemoSidebarNav from '../components/DemoSidebarNav.vue'
import { demoSidebarMenus } from '../navigation'

const route = useRoute()
const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('light')

type TableState = 'default' | 'loading' | 'error' | 'empty'
type Customer = {
 id: number
 code: string
 name: string
 status: string
 industry: string
 tags: string[]
}

const queryFields = [
 { key: 'keyword', type: 'search' as const },
 { key: 'status', type: 'select' as const, options: [
  { key: 'all', value: '' },
  { key: 'enabled', value: 'enabled' },
  { key: 'pending', value: 'pending' },
  { key: 'disabled', value: 'disabled' },
 ] },
 { key: 'industry', type: 'select' as const, options: [
  { key: 'all', value: '' },
  { key: 'manufacturing', value: 'manufacturing' },
  { key: 'technology', value: 'technology' },
  { key: 'retail', value: 'retail' },
 ] },
]

const columns = [
 { key: 'name' },
 { key: 'status', render: 'status' as const },
 { key: 'industry' },
 { key: 'tags', render: 'tags' as const },
]

const statusOptions = [
 { label: '启用', value: 'enabled' },
 { label: '维护中', value: 'pending' },
 { label: '停用', value: 'disabled' },
]

const industryOptions = [
 { label: '制造', value: 'manufacturing' },
 { label: '科技', value: 'technology' },
 { label: '零售', value: 'retail' },
]

const customers = ref<Customer[]>([
 { id: 1, code: 'C001', name: '星河科技', status: 'enabled', industry: 'technology', tags: ['战略客户', '华东'] },
 { id: 2, code: 'C002', name: '远航制造', status: 'pending', industry: 'manufacturing', tags: ['重点跟进'] },
 { id: 3, code: 'C003', name: '森川零售', status: 'disabled', industry: 'retail', tags: ['历史客户'] },
 { id: 4, code: 'C004', name: '蓝海设备', status: 'enabled', industry: 'manufacturing', tags: ['新签约', '华南'] },
])

const tableState = ref<TableState>('default')
const form = reactive({
 id: 0,
 code: '',
 name: '',
 status: 'enabled',
 industry: 'technology',
 tagsText: '',
})

const formSections = [
 {
  key: 'basic',
  fields: [
   { key: 'code', widget: 'text' },
   { key: 'name', widget: 'text' },
   { key: 'status', widget: 'select' },
   { key: 'industry', widget: 'select' },
  ],
 },
 {
  key: 'tags',
  fields: [
   { key: 'tags', widget: 'tags' },
  ],
 },
]

const customerCrud = reactive<ResourceCrudController>({
 state: {
  queryValues: { keyword: '', status: '', industry: '' },
  page: 1,
  pageSize: 2,
  selectedRowKeys: [],
  activeItem: customers.value[0] ?? null,
  items: [],
  total: 0,
 },
 actions: {
  actions: [
   { key: 'state-default' },
   { key: 'state-loading' },
   { key: 'state-error' },
   { key: 'state-empty' },
  ],
  batchActions: [
   {
    key: 'export',
   },
   {
    key: 'enable',
   },
  ],
 },
 handlers: {
  async create() {
   fillForm(null)
  },
  async edit(row) {
   fillForm(row as Customer)
  },
  async query({ queryValues, page, pageSize }) {
   if (tableState.value === 'error') {
    throw new Error('客户资源加载失败，请稍后重试。')
   }
   if (tableState.value === 'loading') {
    await Promise.resolve()
   }
   const keyword = String(queryValues.keyword ?? '').trim().toLowerCase()
   const filtered = customers.value.filter((item) => {
    const keywordMatch = !keyword || item.code.toLowerCase().includes(keyword) || item.name.toLowerCase().includes(keyword)
    const statusMatch = !queryValues.status || item.status === queryValues.status
    const industryMatch = !queryValues.industry || item.industry === queryValues.industry
    return keywordMatch && statusMatch && industryMatch
   })
   if (tableState.value === 'empty') {
    return { items: [], total: 0, activeItem: null }
   }
   const start = (page - 1) * pageSize
   const items = filtered.slice(start, start + pageSize)
   const activeItem = customerCrud.state?.activeItem as Customer | null | undefined
   return {
    items,
    total: filtered.length,
    activeItem: activeItem && items.some((item) => item.id === activeItem.id)
     ? activeItem
     : (items[0] ?? null),
   }
  },
  async save({ mode }) {
   await Promise.resolve()
   const tags = form.tagsText.split(',').map((item) => item.trim()).filter(Boolean)
   if (mode === 'create') {
    const next: Customer = {
     id: Date.now(),
     code: form.code,
     name: form.name,
     status: form.status,
     industry: form.industry,
     tags,
    }
    customers.value = [next, ...customers.value]
    if (customerCrud.state) customerCrud.state.activeItem = next
   } else {
    customers.value = customers.value.map((item) => item.id === form.id
     ? { ...item, code: form.code, name: form.name, status: form.status, industry: form.industry, tags }
     : item)
    if (customerCrud.state) {
     customerCrud.state.activeItem = customers.value.find((item) => item.id === form.id) ?? customerCrud.state.activeItem ?? null
    }
   }
   tableState.value = 'default'
   return { refresh: true, close: true, activeItem: customerCrud.state?.activeItem ?? null }
  },
  async remove(row) {
   const customer = row as Customer
   await Promise.resolve()
   customers.value = customers.value.filter((item) => item.id !== customer.id)
   if (customerCrud.state) {
    customerCrud.state.activeItem = customers.value[0] ?? null
   }
   return { refresh: true, activeItem: customerCrud.state?.activeItem ?? null }
  },
  actions: {
   'state-default': async () => {
    setTableState('default')
   },
   'state-loading': async () => {
    setTableState('loading')
   },
   'state-error': async () => {
    setTableState('error')
   },
   'state-empty': async () => {
    setTableState('empty')
   },
   export: async ({ selectedRowKeys }) => {
    if (!customerCrud.state) return
    customerCrud.state.selectedRowKeys = [...selectedRowKeys]
   },
   enable: async ({ selectedRowKeys }) => {
    const selectedSet = new Set(selectedRowKeys.map(String))
    customers.value = customers.value.map((item) => selectedSet.has(String(item.id)) ? { ...item, status: 'enabled' } : item)
   },
  },
 },
})

const detailFields = computed(() => {
 const activeItem = customerCrud.state?.activeItem as Customer | null | undefined
 if (!activeItem) return []
 return [
  { key: 'code', value: activeItem.code },
  { key: 'name', value: activeItem.name },
  { key: 'status', value: activeItem.status },
  { key: 'industry', value: activeItem.industry },
  { key: 'tags', value: activeItem.tags.join('，') || '-' },
 ]
})

function setTableState(state: TableState) {
 tableState.value = state
}

function fillForm(row: Customer | null) {
 form.id = row?.id ?? 0
 form.code = row?.code ?? ''
 form.name = row?.name ?? ''
 form.status = row?.status ?? 'enabled'
 form.industry = row?.industry ?? 'technology'
 form.tagsText = row?.tags.join(', ') ?? ''
}
</script>

<style scoped>
.demo-crud-form {
 display: grid;
 gap: 16px;
}

.demo-crud-form__grid {
 display: grid;
 gap: 12px;
 grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
</style>
