<template>
 <div class="efs-datatable">
  <table class="efs-datatable__table">
   <thead>
    <tr>
     <th v-if="props.selectable" class="efs-datatable__selection-header">
      <input
       type="checkbox"
       :checked="allRowsSelected"
       :indeterminate="someRowsSelected && !allRowsSelected"
       :aria-label="resolvedSelectionLabel"
       @change="toggleSelectAll"
      >
     </th>
     <th v-for="column in normalizedColumns" :key="column.key" :class="column.meta.cellClass">{{ column.title }}</th>
     <th v-if="props.rowActions.length > 0" class="efs-datatable__actions-header">{{ resolvedActionsLabel }}</th>
    </tr>
   </thead>
   <tbody>
    <tr
     v-for="(row, rowIndex) in props.rows"
     :key="resolveRowKey(row, rowIndex)"
     :class="{
      'efs-datatable__row--clickable': props.clickable,
      'efs-datatable__row--selected': isSelected(row, rowIndex),
     }"
     @click="props.clickable && emit('row-click', row)"
    >
     <td v-if="props.selectable" class="efs-datatable__selection-cell" @click.stop>
      <input
       type="checkbox"
       :checked="isSelected(row, rowIndex)"
       :aria-label="`${resolvedSelectionLabel} ${resolveRowKey(row, rowIndex)}`"
       @change="toggleRowSelection(row, rowIndex)"
      >
     </td>
     <td v-for="column in normalizedColumns" :key="column.key" :class="column.meta.cellClass">
      <template v-if="column.render === 'status'">
       <span class="efs-datatable__cell-content efs-datatable__cell-content--status">
        <StatusChip :tone="resolveTone(row, column)">{{ displayText(resolveDisplayValue(row, column)) }}</StatusChip>
       </span>
      </template>
      <template v-else-if="column.render === 'tags'">
       <div class="efs-datatable__taglist">
        <AppTag v-for="item in resolveTags(row, column)" :key="`${column.key}-${item}`">{{ item }}</AppTag>
        <span v-if="resolveTags(row, column).length === 0">-</span>
       </div>
      </template>
      <template v-else>
       <span
        class="efs-datatable__cell-content"
        :class="column.meta.cellClass"
        :title="displayText(resolveDisplayValue(row, column))"
       >
        {{ displayText(resolveDisplayValue(row, column)) }}
       </span>
      </template>
     </td>
     <td v-if="props.rowActions.length > 0" class="efs-datatable__actions-cell" @click.stop>
      <div class="efs-datatable__actionlist">
       <button
        v-for="action in standardActions(row)"
        :key="action.key"
        type="button"
        class="efs-datatable__actionbutton"
        :class="`efs-datatable__actionbutton--${action.variant ?? 'default'}`"
        @click="action.onClick(row)"
       >
        {{ action.label }}
       </button>
       <details v-if="overflowActions(row).length > 0" class="efs-datatable__moremenu">
        <summary class="efs-datatable__morebutton" :aria-label="resolvedMoreLabel" :title="resolvedMoreLabel">…</summary>
        <div class="efs-datatable__morepanel">
         <button
          v-for="action in overflowActions(row)"
          :key="action.key"
          type="button"
          class="efs-datatable__moreitem"
          :class="`efs-datatable__moreitem--${action.variant ?? 'default'}`"
          @click="action.onClick(row)"
         >
          {{ action.label }}
         </button>
        </div>
       </details>
      </div>
     </td>
    </tr>
   </tbody>
  </table>
  <footer v-if="$slots.footer" class="efs-datatable__footer">
   <slot name="footer" />
  </footer>
 </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import AppTag from './AppTag.vue'
import StatusChip from './StatusChip.vue'
import { resolveLabel, resolveOptionalLabel } from '../shared/label-resolver'

defineOptions({ name: 'DataTable' })

type CellRenderer = 'text' | 'status' | 'tags'
type RowSelectionKey = string

type InputColumn = {
 key: string
 render?: CellRenderer
 formatter?: (value: unknown, row: Record<string, unknown>) => unknown
 visible?: boolean
}

type RowAction = {
 key: string
 label: string
 variant?: 'default' | 'primary' | 'danger'
 onClick: (row: Record<string, unknown>) => void
 visible?: (row: Record<string, unknown>) => boolean
}

interface NormalizedColumn {
 key: string
 title: string
 render: CellRenderer
 formatter?: (value: unknown, row: Record<string, unknown>) => unknown
 visible: boolean
 meta: ColumnMeta
}

interface ColumnMeta {
 align: 'left' | 'right'
 codeLike: boolean
 truncates: boolean
 compact: boolean
 statusLike: boolean
 cellClass: string[]
}

interface DataTableProps {
 rowKey: string
 columns?: InputColumn[]
 rows?: Record<string, unknown>[]
 clickable?: boolean
 visibleColumnKeys?: string[]
 rowActions?: RowAction[]
 selectable?: boolean
 selectedRowKeys?: RowSelectionKey[]
}

const props = withDefaults(defineProps<DataTableProps>(), {
 columns: () => [],
 rows: () => [],
 clickable: false,
 visibleColumnKeys: () => [],
 rowActions: () => [],
 selectable: false,
 selectedRowKeys: () => [],
})

const emit = defineEmits<{
 (e: 'row-click', row: Record<string, unknown>): void
 (e: 'update:selectedRowKeys', value: RowSelectionKey[]): void
}>()

const instance = getCurrentInstance()
const resolvedActionsLabel = computed(() => resolveOptionalLabel({ key: 'actionsLabel', instance, namespaces: ['efs.dataTable'] }) || '操作')
const resolvedSelectionLabel = computed(() => resolveOptionalLabel({ key: 'selectionLabel', instance, namespaces: ['efs.dataTable'] }) || '选择行')
const resolvedMoreLabel = computed(() => resolveOptionalLabel({ key: 'moreLabel', instance, namespaces: ['efs.dataTable'] }) || '更多')

const inferredColumns = computed<NormalizedColumn[]>(() => {
 const firstRow = props.rows[0] ?? null
 if (!firstRow) return []
 return Object.keys(firstRow)
  .filter((key) => !isIdentityKey(key))
 .map((key) => ({
  key,
  title: resolveColumnTitle(key),
  render: inferRenderer(key, firstRow[key]),
  visible: true,
  meta: resolveColumnMeta(key, inferRenderer(key, firstRow[key])),
  }))
})

const normalizedColumns = computed<NormalizedColumn[]>(() => {
 const base = props.columns.length > 0
  ? props.columns.map((column) => ({
   key: column.key,
   title: resolveColumnTitle(column),
   render: column.render ?? inferRenderer(column.key),
   formatter: column.formatter,
   visible: column.visible !== false,
   meta: resolveColumnMeta(column.key, column.render ?? inferRenderer(column.key)),
   }))
  : inferredColumns.value

 const initiallyVisible = base.filter((column) => column.visible)
 if (props.visibleColumnKeys.length === 0) return initiallyVisible
 const visible = new Set(props.visibleColumnKeys)
 return initiallyVisible.filter((column) => visible.has(column.key))
})

const selectedKeySet = computed(() => new Set(props.selectedRowKeys.map((item) => String(item))))
const rowSelectionKeys = computed(() => props.rows.map((row, index) => String(resolveRowKey(row, index))))
const allRowsSelected = computed(() => rowSelectionKeys.value.length > 0 && rowSelectionKeys.value.every((key) => selectedKeySet.value.has(key)))
const someRowsSelected = computed(() => rowSelectionKeys.value.some((key) => selectedKeySet.value.has(key)))

function isIdentityKey(key: string) {
 return key === props.rowKey
}

function resolveRowKey(row: Record<string, unknown>, rowIndex: number) {
 const value = row[props.rowKey]
 if (typeof value === 'string' || typeof value === 'number') return String(value)
 throw new Error(`DataTable row is missing required rowKey "${props.rowKey}" at index ${rowIndex}`)
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

function visibleActions(row: Record<string, unknown>) {
 return props.rowActions.filter((action) => action.visible ? action.visible(row) : true)
}

function standardActions(row: Record<string, unknown>) {
 return visibleActions(row).filter((action) => isStandardRowActionKey(action.key))
}

function overflowActions(row: Record<string, unknown>) {
 return visibleActions(row).filter((action) => !isStandardRowActionKey(action.key))
}

function isStandardRowActionKey(key: string) {
 return ['detail', 'edit', 'update', 'delete', 'remove'].includes(key)
}

function isSelected(row: Record<string, unknown>, rowIndex: number) {
 return selectedKeySet.value.has(String(resolveRowKey(row, rowIndex)))
}

function toggleRowSelection(row: Record<string, unknown>, rowIndex: number) {
 const key = String(resolveRowKey(row, rowIndex))
 const next = new Set(props.selectedRowKeys.map((item) => String(item)))
 if (next.has(key)) next.delete(key)
 else next.add(key)
 emit('update:selectedRowKeys', Array.from(next))
}

function toggleSelectAll() {
 if (allRowsSelected.value) {
  const visibleSet = new Set(rowSelectionKeys.value)
  emit('update:selectedRowKeys', props.selectedRowKeys.filter((key) => !visibleSet.has(String(key))))
  return
 }
 const next = new Set(props.selectedRowKeys.map((item) => String(item)))
 for (const key of rowSelectionKeys.value) next.add(key)
 emit('update:selectedRowKeys', Array.from(next))
}

function inferRenderer(key: string, sampleValue?: unknown): CellRenderer {
 const normalizedKey = key.toLowerCase()
 if (Array.isArray(sampleValue)) return 'tags'
 if (['status', 'state', 'tier'].some((token) => normalizedKey.includes(token))) return 'status'
 return 'text'
}

function resolveColumnMeta(key: string, render: CellRenderer): ColumnMeta {
 const statusLike = isStatusColumn(key, render)
 const codeLike = isCodeColumn(key)
 const truncates = isLongTextColumn(key)
 const compact = statusLike || codeLike
 const align = statusLike ? 'right' as const : 'left' as const
 return {
  align,
  codeLike,
  truncates,
  compact,
  statusLike,
  cellClass: [
   align === 'right' ? 'efs-datatable__cell--align-right' : 'efs-datatable__cell--align-left',
   codeLike ? 'efs-datatable__cell--code' : '',
   truncates ? 'efs-datatable__cell--truncate' : '',
   compact ? 'efs-datatable__cell--compact' : '',
   statusLike ? 'efs-datatable__cell--status' : '',
  ].filter(Boolean),
 }
}

function isStatusColumn(key: string, render: CellRenderer) {
 const normalizedKey = key.trim().toLowerCase()
 return render === 'status' || ['status', 'state', 'tier'].some((token) => normalizedKey.includes(token))
}

function isCodeColumn(key: string) {
 const normalizedKey = key.trim().toLowerCase()
 return normalizedKey === 'code' || normalizedKey.endsWith('code') || normalizedKey.includes('code')
}

function isLongTextColumn(key: string) {
 const normalizedKey = key.trim().toLowerCase()
 return ['remark', 'memo', 'description', 'desc'].some((token) => normalizedKey.includes(token))
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
.efs-datatable {
 overflow: hidden;
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 18px;
 background: var(--efs-surface, #fff);
}

.efs-datatable__table {
 width: 100%;
 border-collapse: collapse;
}

.efs-datatable__table th,
.efs-datatable__table td {
 padding: 12px 14px;
 border-bottom: 1px solid var(--efs-border, #dbe3ef);
 text-align: left;
 vertical-align: top;
}

.efs-datatable__table th {
 background: var(--efs-surface-soft, #f8fafc);
 font-size: 0.84rem;
 color: var(--efs-text-muted, #64748b);
}

.efs-datatable__cell-content {
 display: block;
 min-width: 0;
}

.efs-datatable__cell-content--status {
 display: flex;
 justify-content: flex-end;
}

.efs-datatable__cell--align-right {
 text-align: right !important;
}

.efs-datatable__cell--code {
 font-family: ui-monospace, SFMono-Regular, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.efs-datatable__cell--truncate {
 max-width: 24ch;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
}

.efs-datatable__cell--compact {
 width: 1%;
 white-space: nowrap;
}

.efs-datatable__cell--status {
 min-width: 8.5rem;
}

.efs-datatable__selection-header,
.efs-datatable__selection-cell,
.efs-datatable__actions-header,
.efs-datatable__actions-cell {
 width: 1%;
 white-space: nowrap;
}

.efs-datatable__selection-cell input,
.efs-datatable__selection-header input {
 cursor: pointer;
}

.efs-datatable__row--clickable {
 cursor: pointer;
}

.efs-datatable__row--clickable:hover,
.efs-datatable__row--selected {
 background: var(--efs-surface-soft, #f8fafc);
}

.efs-datatable__taglist,
.efs-datatable__actionlist {
 display: flex;
 flex-wrap: wrap;
 gap: 6px;
}

.efs-datatable__actionbutton {
 min-height: 30px;
 padding: 0 10px;
 border-radius: 999px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 color: var(--efs-text, #172033);
 cursor: pointer;
 font-size: 0.82rem;
}

.efs-datatable__actionbutton--primary {
 background: rgba(37, 99, 235, 0.1);
 border-color: rgba(37, 99, 235, 0.2);
 color: #1d4ed8;
}

.efs-datatable__actionbutton--danger {
 background: rgba(220, 38, 38, 0.1);
 border-color: rgba(220, 38, 38, 0.2);
 color: #b91c1c;
}

.efs-datatable__footer {
 display: flex;
 justify-content: space-between;
 gap: 12px;
 align-items: center;
 padding: 12px 14px;
 flex-wrap: wrap;
}
</style>
