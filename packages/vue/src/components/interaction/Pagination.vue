<template>
  <div class="efs-pagination">
    <div class="efs-pagination__summary">{{ props.summaryLabel }} {{ props.page }} / {{ Math.max(props.pageCount, 1) }}</div>
    <label v-if="props.pageSizeOptions.length > 0" class="efs-pagination__pagesize">
      <span>{{ props.pageSizeLabel }}</span>
      <select :value="String(props.pageSize)" @change="onPageSizeChange">
        <option v-for="size in props.pageSizeOptions" :key="size" :value="String(size)">{{ size }}</option>
      </select>
    </label>
    <div class="efs-pagination__actions">
      <button type="button" :disabled="props.page <= 1" @click="emit('update:page', props.page - 1)">{{ props.previousLabel }}</button>
      <button type="button" :disabled="props.page >= Math.max(props.pageCount, 1)" @click="emit('update:page', props.page + 1)">{{ props.nextLabel }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Pagination' })

const props = withDefaults(defineProps<{
  page?: number
  pageCount?: number
  pageSize?: number
  pageSizeOptions?: number[]
  pageSizeLabel?: string
  summaryLabel?: string
  previousLabel?: string
  nextLabel?: string
}>(), {
  page: 1,
  pageCount: 1,
  pageSize: 20,
  pageSizeOptions: () => [],
  pageSizeLabel: 'Page size',
  summaryLabel: 'Page',
  previousLabel: 'Previous',
  nextLabel: 'Next',
})

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

function onPageSizeChange(event: Event) {
  emit('update:pageSize', Number((event.target as HTMLSelectElement).value))
}
</script>

<style scoped>
.efs-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.efs-pagination__summary {
  color: var(--efs-text-muted, #64748b);
  font-size: 0.9rem;
}

.efs-pagination__pagesize {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--efs-text-muted, #64748b);
  font-size: 0.9rem;
}

.efs-pagination__pagesize select {
  min-height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
}

.efs-pagination__actions {
  display: flex;
  gap: 8px;
}

.efs-pagination__actions button {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  cursor: pointer;
}

.efs-pagination__actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
