<template>
  <section class="efs-entitylisttable">
    <header class="efs-entitylisttable__header">
      <div>
        <h3 class="efs-entitylisttable__title">{{ props.title }}</h3>
        <p v-if="props.subtitle" class="efs-entitylisttable__subtitle">{{ props.subtitle }}</p>
      </div>
      <div class="efs-entitylisttable__header-actions">
        <span class="efs-entitylisttable__total">{{ props.totalLabel }} {{ props.total }}</span>
        <ColumnSettings
          v-if="enableColumnSettings && !isMobile"
          :label="props.columnSettingsLabel"
          :reset-label="props.resetColumnsLabel"
          :show-all-label="props.showAllColumnsLabel"
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
        <article v-for="(item, index) in mobileItems" :key="String(item[props.rowKey] ?? index)" class="efs-entitylisttable__mobile-card">
          <div v-for="column in visibleColumns" :key="column.key" class="efs-entitylisttable__mobile-field">
            <span class="efs-entitylisttable__mobile-label">{{ column.title }}</span>
            <strong class="efs-entitylisttable__mobile-value">{{ item[column.key] ?? '-' }}</strong>
          </div>
        </article>
      </div>
    </div>

    <footer v-if="$slots.footer || props.items.length > 0 || props.showPagination" class="efs-entitylisttable__footer">
      <div class="efs-entitylisttable__summary">{{ props.rowsLabel }} {{ props.items.length }}</div>
      <div class="efs-entitylisttable__footer-actions">
        <slot name="footer" :visible-columns="visibleColumns" :visible-column-keys="visibleColumnKeys" />
        <Pagination
          v-if="props.showPagination"
          :page="props.page"
          :page-count="props.pageCount"
          :page-size="props.pageSize"
          :page-size-options="props.pageSizeOptions"
          :page-size-label="props.pageSizeLabel"
          :summary-label="props.pageSummaryLabel"
          :previous-label="props.previousLabel"
          :next-label="props.nextLabel"
          @update:page="(value) => emit('update:page', value)"
          @update:page-size="(value) => emit('update:pageSize', value)"
        />
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ColumnSettings from '../interaction/ColumnSettings.vue'
import Pagination from '../interaction/Pagination.vue'

defineOptions({ name: 'EntityListTable' })

type InputColumn = string | {
  key: string
  title?: string
  label?: string
  defaultVisible?: boolean
  hideable?: boolean
}

interface NormalizedColumn {
  key: string
  title: string
  defaultVisible: boolean
  hideable: boolean
}

interface EntityListTableProps {
  title?: string
  subtitle?: string
  columns?: InputColumn[]
  items?: Record<string, unknown>[]
  mobileItems?: Record<string, unknown>[]
  rowKey?: string
  total?: number | string
  loading?: boolean
  totalLabel?: string
  rowsLabel?: string
  tableKey?: string
  columnSettingsLabel?: string
  resetColumnsLabel?: string
  showAllColumnsLabel?: string
  page?: number
  pageCount?: number
  pageSize?: number
  pageSizeOptions?: number[]
  pageSizeLabel?: string
  pageSummaryLabel?: string
  previousLabel?: string
  nextLabel?: string
  showPagination?: boolean
}

const props = withDefaults(defineProps<EntityListTableProps>(), {
  title: '',
  subtitle: '',
  columns: () => [],
  items: () => [],
  mobileItems: () => [],
  rowKey: 'id',
  total: 0,
  loading: false,
  totalLabel: 'Total:',
  rowsLabel: 'Rows:',
  tableKey: '',
  columnSettingsLabel: 'Columns',
  resetColumnsLabel: 'Reset',
  showAllColumnsLabel: 'Show all',
  page: 1,
  pageCount: 1,
  pageSize: 20,
  pageSizeOptions: () => [],
  pageSizeLabel: 'Page size',
  pageSummaryLabel: 'Page',
  previousLabel: 'Previous',
  nextLabel: 'Next',
  showPagination: true,
})

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const normalizedColumns = computed<NormalizedColumn[]>(() => props.columns.map((column) => {
  if (typeof column === 'string') {
    return { key: column, title: column, defaultVisible: true, hideable: true }
  }
  return {
    key: column.key,
    title: column.title ?? column.label ?? column.key,
    defaultVisible: column.defaultVisible !== false,
    hideable: column.hideable !== false,
  }
}))

const storageKey = computed(() => props.tableKey.trim() ? `efs.table.columns.${props.tableKey.trim()}` : '')
const visibleColumnKeys = ref<string[]>([])
const isMobile = ref(false)

const enableColumnSettings = computed(() => normalizedColumns.value.length > 0)

const defaultVisibleKeys = computed(() => normalizedColumns.value
  .filter((column) => column.defaultVisible || column.hideable === false)
  .map((column) => column.key))

const visibleColumns = computed(() => {
  const visible = new Set(visibleColumnKeys.value)
  return normalizedColumns.value.filter((column) => visible.has(column.key) || column.hideable === false)
})

const mobileItems = computed(() => props.mobileItems.length > 0 ? props.mobileItems : props.items)

function syncViewport() {
  if (typeof window === 'undefined') return
  isMobile.value = window.innerWidth <= 960
}

function syncVisibleColumns() {
  if (!storageKey.value) {
    visibleColumnKeys.value = defaultVisibleKeys.value
    return
  }
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (!raw) {
      visibleColumnKeys.value = defaultVisibleKeys.value
      return
    }
    const parsed = JSON.parse(raw)
    const keys = Array.isArray(parsed) ? parsed.map((item) => String(item)) : defaultVisibleKeys.value
    visibleColumnKeys.value = normalizedColumns.value
      .filter((column) => column.hideable === false || keys.includes(column.key))
      .map((column) => column.key)
  } catch {
    visibleColumnKeys.value = defaultVisibleKeys.value
  }
}

onMounted(() => {
  syncViewport()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncViewport)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', syncViewport)
  }
})

watch(normalizedColumns, () => {
  syncVisibleColumns()
}, { immediate: true, deep: true })

watch(visibleColumnKeys, (value) => {
  if (!storageKey.value) return
  localStorage.setItem(storageKey.value, JSON.stringify(value))
}, { deep: true })

function onVisibleKeysChange(value: string[]) {
  visibleColumnKeys.value = normalizedColumns.value
    .filter((column) => column.hideable === false || value.includes(column.key))
    .map((column) => column.key)
}

function resetColumns() {
  visibleColumnKeys.value = defaultVisibleKeys.value
  if (storageKey.value) {
    localStorage.removeItem(storageKey.value)
  }
}

function showAllColumns() {
  visibleColumnKeys.value = normalizedColumns.value.map((column) => column.key)
}

function isColumnVisible(key: string) {
  return visibleColumnKeys.value.includes(key)
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
  line-height: 1.4;
  word-break: break-word;
}

.efs-entitylisttable__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  border-top: 1px solid var(--efs-border, #dbe3ef);
  padding-top: 16px;
}

.efs-entitylisttable__summary {
  color: var(--efs-text-muted, #64748b);
  font-size: 0.9rem;
}

.efs-entitylisttable__footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
}
</style>
