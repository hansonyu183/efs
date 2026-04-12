<template>
  <div class="efs-datatable">
    <table class="efs-datatable__table">
      <thead>
        <tr>
          <th v-for="column in props.columns" :key="column">{{ column }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in props.rows"
          :key="String(row[props.rowKey] ?? rowIndex)"
          :class="{ 'efs-datatable__row--clickable': props.clickable }"
          @click="props.clickable && emit('rowClick', row)"
        >
          <td v-for="column in props.columns" :key="column">{{ row[column] ?? '-' }}</td>
        </tr>
      </tbody>
    </table>
    <footer v-if="$slots.footer" class="efs-datatable__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DataTable' })

interface DataTableProps {
  columns?: string[]
  rows?: Record<string, unknown>[]
  rowKey?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<DataTableProps>(), {
  columns: () => [],
  rows: () => [],
  rowKey: 'id',
  clickable: false,
})

const emit = defineEmits<{
  (e: 'rowClick', row: Record<string, unknown>): void
}>()
</script>

<style scoped>
.efs-datatable {
  margin-top: 12px;
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
}

.efs-datatable__row--clickable {
  cursor: pointer;
}

.efs-datatable__row--clickable:hover {
  background: var(--efs-surface-soft, #f8fafc);
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
