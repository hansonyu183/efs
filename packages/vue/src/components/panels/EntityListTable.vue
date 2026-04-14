<template>
 <section class="efs-entitylisttable">
  <header class="efs-entitylisttable__header">
   <div>
    <h3 class="efs-entitylisttable__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-entitylisttable__subtitle">{{ props.subtitle }}</p>
   </div>
   <div class="efs-entitylisttable__header-actions">
    <span class="efs-entitylisttable__total">{{ resolvedLabels.total }} {{ props.total }}</span>
    <ColumnSettings
     v-if="enableColumnSettings && !isMobile"
     :label="resolvedLabels.columnSettings"
     :reset-label="resolvedLabels.resetColumns"
     :show-all-label="resolvedLabels.showAllColumns"
     :columns="normalizedColumns"
     :visible-keys="visibleColumnKeys"
     @update:visible-keys="onVisibleKeysChange"
     @reset="resetColumns"
     @show-all="showAllColumns"
    />
    <slot name="header-actions" :visible-columns="visibleColumns" :visible-column-keys="visibleColumnKeys" />
   </div>
  </header>

  <div v-if="!isMobile" class="efs-entitylisttable__body">
   <slot :visible-columns="visibleColumns" :visible-column-keys="visibleColumnKeys" :is-column-visible="isColumnVisible" />
  </div>

  <div v-else class="efs-entitylisttable__mobile">
   <slot
    v-if="$slots.mobile"
    name="mobile"
    :visible-columns="visibleColumns"
    :visible-column-keys="visibleColumnKeys"
    :is-column-visible="isColumnVisible"
   />
   <div v-else class="efs-entitylisttable__mobile-list">
    <article v-for="(item, index) in props.items" :key="resolveRowKey(item, index)" class="efs-entitylisttable__mobile-card">
     <div v-for="column in visibleColumns" :key="column.key" class="efs-entitylisttable__mobile-field">
      <span class="efs-entitylisttable__mobile-label">{{ column.title }}</span>
      <div class="efs-entitylisttable__mobile-value">
       <template v-if="column.render === 'status'">
        <StatusChip :label="displayText(resolveDisplayValue(item, column))" :tone="resolveTone(item, column)" />
       </template>
       <template v-else-if="column.render === 'tags'">
        <div class="efs-entitylisttable__mobile-taglist">
         <AppTag v-for="tag in resolveTags(item, column)" :key="`${resolveRowKey(item, index)}-${column.key}-${tag}`">{{ tag }}</AppTag>
         <span v-if="resolveTags(item, column).length === 0">-</span>
        </div>
       </template>
       <strong v-else>{{ displayText(resolveDisplayValue(item, column)) }}</strong>
      </div>
     </div>
    </article>
   </div>
  </div>

  <footer v-if="$slots.footer || props.items.length > 0 || props.showPagination" class="efs-entitylisttable__footer">
   <div class="efs-entitylisttable__summary">{{ resolvedLabels.rows }} {{ props.items.length }}</div>
   <div class="efs-entitylisttable__footer-actions">
    <slot name="footer" :visible-columns="visibleColumns" :visible-column-keys="visibleColumnKeys" />
    <Pagination
     v-if="props.showPagination"
     :page="props.page"
     :page-count="props.pageCount"
     :page-size="props.pageSize"
     :page-size-options="props.pageSizeOptions"
     :page-size-label="resolvedLabels.pageSize"
     :summary-label="resolvedLabels.pageSummary"
     :previous-label="resolvedLabels.previous"
     :next-label="resolvedLabels.next"
     @update:page="(value) => emit('update:page', value)"
     @update:page-size="(value) => emit('update:pageSize', value)"
    />
   </div>
  </footer>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppTag from '../interaction/AppTag.vue'
import ColumnSettings from '../interaction/ColumnSettings.vue'
import Pagination from '../interaction/Pagination.vue'
import StatusChip from '../interaction/StatusChip.vue'
import { resolveLabel } from '../../shared/LabelResolver'

defineOptions({ name: 'EntityListTable' })

type InputColumn = {
 key: string
 render?: 'text' | 'status' | 'tags'
 formatter?: (value: unknown, row: Record<string, unknown>) => unknown
 visible?: boolean
}

interface NormalizedColumn {
 key: string
 title: string
 render: 'text' | 'status' | 'tags'
 formatter?: (value: unknown, row: Record<string, unknown>) => unknown
 visible: boolean
 hideable: boolean
}

type EntityListTableLabels = {
 total?: string
 rows?: string
 columnSettings?: string
 resetColumns?: string
 showAllColumns?: string
 pageSize?: string
 pageSummary?: string
 previous?: string
 next?: string
}

interface EntityListTableProps {
 rowKey: string
 title?: string
 subtitle?: string
 columns?: InputColumn[]
 items?: Record<string, unknown>[]
 total?: number | string
 loading?: boolean
 page?: number
 pageCount?: number
 pageSize?: number
 pageSizeOptions?: number[]
 showPagination?: boolean
 labels?: EntityListTableLabels
}

const props = withDefaults(defineProps<EntityListTableProps>(), {
 title: '',
 subtitle: '',
 columns: () => [],
 items: () => [],
 total: 0,
 loading: false,
 page: 1,
 pageCount: 1,
 pageSize: 20,
 pageSizeOptions: () => [],
 showPagination: true,
 labels: () => ({
  total: '总数：',
  rows: '当前行数：',
  columnSettings: '列设置',
  resetColumns: '重置',
  showAllColumns: '显示全部',
  pageSize: '每页条数',
  pageSummary: '页码',
  previous: '上一页',
  next: '下一页',
 }),
})

const emit = defineEmits<{
 (e: 'update:page', value: number): void
 (e: 'update:pageSize', value: number): void
}>()

const instance = getCurrentInstance()
const visibleColumnKeys = ref<string[]>([])
const isMobile = ref(false)
const resolvedLabels = computed(() => ({
 total: props.labels?.total ?? '总数：',
 rows: props.labels?.rows ?? '当前行数：',
 columnSettings: props.labels?.columnSettings ?? '列设置',
 resetColumns: props.labels?.resetColumns ?? '重置',
 showAllColumns: props.labels?.showAllColumns ?? '显示全部',
 pageSize: props.labels?.pageSize ?? '每页条数',
 pageSummary: props.labels?.pageSummary ?? '页码',
 previous: props.labels?.previous ?? '上一页',
 next: props.labels?.next ?? '下一页',
}))

const inferredColumns = computed<NormalizedColumn[]>(() => {
 const firstRow = props.items[0] ?? null
 if (!firstRow) return []
 return Object.keys(firstRow)
  .filter((key) => !isIdentityKey(key))
  .map((key) => ({
   key,
   title: resolveColumnTitle(key),
   render: inferRenderer(key, firstRow[key]),
   visible: true,
   hideable: true,
  }))
})

const normalizedColumns = computed<NormalizedColumn[]>(() => (props.columns.length > 0
 ? props.columns.map((column) => ({
   key: column.key,
   title: resolveColumnTitle(column),
   render: column.render ?? inferRenderer(column.key),
   formatter: column.formatter,
   visible: column.visible !== false,
   hideable: true,
  }))
 : inferredColumns.value))

const storageKey = computed(() => {
 const base = (props.title || instance?.type?.name || 'entity-list-table').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
 const pathPart = typeof window === 'undefined' ? 'server' : window.location.pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'root'
 return `efs.table.columns.${pathPart}.${base || 'table'}`
})

const enableColumnSettings = computed(() => normalizedColumns.value.length > 0)

const defaultVisibleKeys = computed(() => normalizedColumns.value
 .filter((column) => column.visible)
 .map((column) => column.key))

const visibleColumns = computed(() => {
 const visible = new Set(visibleColumnKeys.value)
 return normalizedColumns.value.filter((column) => column.visible && visible.has(column.key))
})

function isIdentityKey(key: string) {
 return key === props.rowKey
}

function resolveRowKey(row: Record<string, unknown>, rowIndex: number) {
 const value = row[props.rowKey]
 if (typeof value === 'string' || typeof value === 'number') return String(value)
 throw new Error(`EntityListTable row is missing required rowKey "${props.rowKey}" at index ${rowIndex}`)
}

function resolveDisplayValue(row: Record<string, unknown>, column: NormalizedColumn) {
 const raw = row[column.key]
 return column.formatter ? column.formatter(raw, row) : raw
}

function resolveTags(row: Record<string, unknown>, column: NormalizedColumn) {
 const value = resolveDisplayValue(row, column)
 if (Array.isArray(value)) return value.map((item) => displayText(item)).filter((item) => item !== '-')
 if (typeof value === 'string' && value.includes(',')) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
 }
 return value ? [displayText(value)] : []
}

function resolveTone(row: Record<string, unknown>, column: NormalizedColumn) {
 const value = resolveDisplayValue(row, column)
 const normalized = String(value ?? '').toLowerCase()
 if (['enabled', 'active', 'ready', 'normal', 'success'].includes(normalized)) return 'success'
 if (['pending', 'warning', 'attention', 'in_progress'].includes(normalized)) return 'warning'
 if (['disabled', 'inactive', 'failed', 'error', 'blocked'].includes(normalized)) return 'danger'
 return 'neutral'
}

function displayText(value: unknown): string {
 if (value === null || value === undefined || value === '') return '-'
 if (Array.isArray(value)) {
  const parts: string[] = value.map((item) => displayText(item)).filter((item) => item !== '-')
  return parts.length > 0 ? parts.join(', ') : '-'
 }
 if (typeof value === 'object') return summarizeObject(value as Record<string, unknown>)
 return String(value)
}

function summarizeObject(value: Record<string, unknown>): string {
 const preferredKeys = ['label', 'name', 'title', 'displayName', 'orgCode', 'code', 'id', 'value']
 for (const key of preferredKeys) {
  const candidate = value[key]
  if (candidate !== null && candidate !== undefined && candidate !== '') return displayText(candidate)
 }
 const parts: string[] = Object.entries(value)
  .map(([key, item]) => {
   const text: string = displayText(item)
   return text === '-' ? '' : `${key}: ${text}`
  })
  .filter(Boolean)
 return parts.length > 0 ? parts.join(' · ') : '-'
}

function inferRenderer(key: string, sampleValue?: unknown): 'text' | 'status' | 'tags' {
 const normalizedKey = key.toLowerCase()
 if (Array.isArray(sampleValue)) return 'tags'
 if (['status', 'state', 'tier'].some((token) => normalizedKey.includes(token))) return 'status'
 return 'text'
}

function syncViewport() {
 if (typeof window === 'undefined') return
 isMobile.value = window.innerWidth <= 960
}

function syncVisibleColumns() {
 try {
  const raw = localStorage.getItem(storageKey.value)
  if (!raw) {
   visibleColumnKeys.value = defaultVisibleKeys.value
   return
  }
  const parsed = JSON.parse(raw)
  const keys = Array.isArray(parsed) ? parsed.map((item) => String(item)) : defaultVisibleKeys.value
  visibleColumnKeys.value = normalizedColumns.value
   .filter((column) => column.visible && keys.includes(column.key))
   .map((column) => column.key)
  if (visibleColumnKeys.value.length === 0) visibleColumnKeys.value = defaultVisibleKeys.value
 } catch {
  visibleColumnKeys.value = defaultVisibleKeys.value
 }
}

onMounted(() => {
 syncViewport()
 if (typeof window !== 'undefined') window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
 if (typeof window !== 'undefined') window.removeEventListener('resize', syncViewport)
})

watch(normalizedColumns, () => {
 syncVisibleColumns()
}, { immediate: true, deep: true })

watch(visibleColumnKeys, (value) => {
 localStorage.setItem(storageKey.value, JSON.stringify(value))
}, { deep: true })

function onVisibleKeysChange(value: string[]) {
 visibleColumnKeys.value = normalizedColumns.value
  .filter((column) => column.visible && value.includes(column.key))
  .map((column) => column.key)
}

function resetColumns() {
 visibleColumnKeys.value = defaultVisibleKeys.value
 localStorage.removeItem(storageKey.value)
}

function showAllColumns() {
 visibleColumnKeys.value = normalizedColumns.value
  .filter((column) => column.visible)
  .map((column) => column.key)
}

function isColumnVisible(key: string) {
 return visibleColumnKeys.value.includes(key)
}

function resolveColumnTitle(column: string | Pick<InputColumn, 'key'>) {
 const key = typeof column === 'string' ? column : column.key
 return resolveLabel({
  key,
  instance,
  namespaces: ['table.columns', 'columns', 'fields'],
 })
}
</script>

<style scoped>
.efs-entitylisttable {
 padding: 18px 20px;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
 display: grid;
 gap: 16px;
}

.efs-entitylisttable__header {
 display: flex;
 justify-content: space-between;
 gap: 12px;
 align-items: start;
 flex-wrap: wrap;
}

.efs-entitylisttable__title {
 margin: 0;
 font-size: 1rem;
}

.efs-entitylisttable__subtitle {
 margin: 6px 0 0;
 color: var(--efs-text-muted, #64748b);
}

.efs-entitylisttable__header-actions {
 display: flex;
 align-items: center;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-entitylisttable__total {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.9rem;
}

.efs-entitylisttable__body,
.efs-entitylisttable__mobile {
 min-width: 0;
}

.efs-entitylisttable__mobile-list {
 display: grid;
 gap: 12px;
}

.efs-entitylisttable__mobile-card {
 padding: 14px;
 border-radius: 16px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface-soft, #f8fafc);
 display: grid;
 gap: 10px;
}

.efs-entitylisttable__mobile-field {
 display: grid;
 gap: 4px;
}

.efs-entitylisttable__mobile-label {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.78rem;
 text-transform: uppercase;
 letter-spacing: 0.04em;
}

.efs-entitylisttable__mobile-value {
 font-size: 0.95rem;
}

.efs-entitylisttable__footer {
 display: flex;
 justify-content: space-between;
 gap: 12px;
 align-items: center;
 flex-wrap: wrap;
}

.efs-entitylisttable__summary,
.efs-entitylisttable__footer-actions {
 display: flex;
 gap: 12px;
 align-items: center;
 flex-wrap: wrap;
}
</style>
