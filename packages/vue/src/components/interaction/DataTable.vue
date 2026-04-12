<template>
  <div class="efs-datatable">
    <table class="efs-datatable__table">
      <thead>
        <tr>
          <th v-for="column in normalizedColumns" :key="column.key">{{ column.title }}</th>
          <th v-if="props.rowActions.length > 0" class="efs-datatable__actions-header">{{ props.actionsLabel }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in props.rows"
          :key="String(row[props.rowKey] ?? rowIndex)"
          :class="{ 'efs-datatable__row--clickable': props.clickable }"
          @click="props.clickable && emit('rowClick', row)"
        >
          <td v-for="column in normalizedColumns" :key="column.key">
            <template v-if="column.render === 'status'">
              <StatusChip :label="displayText(resolveDisplayValue(row, column))" :tone="resolveTone(row, column)" />
            </template>
            <template v-else-if="column.render === 'tags'">
              <div class="efs-datatable__taglist">
                <AppTag v-for="item in resolveTags(row, column)" :key="`${column.key}-${item}`">{{ item }}</AppTag>
                <span v-if="resolveTags(row, column).length === 0">-</span>
              </div>
            </template>
            <template v-else>
              {{ displayText(resolveDisplayValue(row, column)) }}
            </template>
          </td>
          <td v-if="props.rowActions.length > 0" class="efs-datatable__actions-cell" @click.stop>
            <div class="efs-datatable__actionlist">
              <button
                v-for="action in visibleActions(row)"
                :key="action.key"
                type="button"
                class="efs-datatable__actionbutton"
                :class="`efs-datatable__actionbutton--${action.variant ?? 'default'}`"
                @click="action.onClick(row)"
              >
                {{ action.label }}
              </button>
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
import { computed } from 'vue'
import AppTag from './AppTag.vue'
import StatusChip from './StatusChip.vue'

defineOptions({ name: 'DataTable' })

type CellRenderer = 'text' | 'status' | 'tags'

type InputColumn = string | {
  key: string
  title?: string
  label?: string
  render?: CellRenderer
  toneMap?: Record<string, string>
  formatter?: (value: unknown, row: Record<string, unknown>) => unknown
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
  toneMap?: Record<string, string>
  formatter?: (value: unknown, row: Record<string, unknown>) => unknown
}

interface DataTableProps {
  columns?: InputColumn[]
  rows?: Record<string, unknown>[]
  rowKey?: string
  clickable?: boolean
  visibleColumnKeys?: string[]
  actionsLabel?: string
  rowActions?: RowAction[]
}

const props = withDefaults(defineProps<DataTableProps>(), {
  columns: () => [],
  rows: () => [],
  rowKey: 'id',
  clickable: false,
  visibleColumnKeys: () => [],
  actionsLabel: 'Actions',
  rowActions: () => [],
})

const normalizedColumns = computed<NormalizedColumn[]>(() => {
  const base = props.columns.map((column) => typeof column === 'string'
    ? { key: column, title: column, render: 'text' as CellRenderer }
    : {
        key: column.key,
        title: column.title ?? column.label ?? column.key,
        render: column.render ?? 'text',
        toneMap: column.toneMap,
        formatter: column.formatter,
      })
  if (props.visibleColumnKeys.length === 0) return base
  const visible = new Set(props.visibleColumnKeys)
  return base.filter((column) => visible.has(column.key))
})

function resolveDisplayValue(row: Record<string, unknown>, column: NormalizedColumn) {
  const raw = row[column.key]
  return column.formatter ? column.formatter(raw, row) : raw
}

function resolveTags(row: Record<string, unknown>, column: NormalizedColumn) {
  const value = resolveDisplayValue(row, column)
  if (Array.isArray(value)) {
    return value.map((item) => String(item))
  }
  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return value ? [String(value)] : []
}

function resolveTone(row: Record<string, unknown>, column: NormalizedColumn) {
  const value = resolveDisplayValue(row, column)
  const normalized = String(value ?? '').toLowerCase()
  if (column.toneMap?.[normalized]) return column.toneMap[normalized]
  if (['enabled', 'active', 'ready', 'normal', 'success'].includes(normalized)) return 'success'
  if (['pending', 'warning', 'attention', 'in_progress'].includes(normalized)) return 'warning'
  if (['disabled', 'inactive', 'failed', 'error', 'blocked'].includes(normalized)) return 'danger'
  return 'neutral'
}

function displayText(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

function visibleActions(row: Record<string, unknown>) {
  return props.rowActions.filter((action) => action.visible ? action.visible(row) : true)
}

const emit = defineEmits<{
  (e: 'rowClick', row: Record<string, unknown>): void
}>()
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

.efs-datatable__actions-header,
.efs-datatable__actions-cell {
  width: 1%;
  white-space: nowrap;
}

.efs-datatable__row--clickable {
  cursor: pointer;
}

.efs-datatable__row--clickable:hover {
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
