<template>
 <div class="efs-pagination">
  <div class="efs-pagination__summary">{{ resolvedSummaryLabel }} {{ props.page }} / {{ Math.max(props.pageCount, 1) }}</div>
  <label v-if="props.pageSizeOptions.length > 0" class="efs-pagination__pagesize">
   <span>{{ resolvedPageSizeLabel }}</span>
   <select :value="String(props.pageSize)" @change="onPageSizeChange">
    <option v-for="size in props.pageSizeOptions" :key="size" :value="String(size)">{{ size }}</option>
   </select>
  </label>
  <div class="efs-pagination__actions">
   <button type="button" :disabled="props.page <= 1" @click="emit('update:page', props.page - 1)">{{ resolvedPreviousLabel }}</button>
   <button type="button" :disabled="props.page >= Math.max(props.pageCount, 1)" @click="emit('update:page', props.page + 1)">{{ resolvedNextLabel }}</button>
  </div>
 </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveOptionalLabel } from '../shared/label-resolver'

defineOptions({ name: 'Pagination' })

const props = withDefaults(defineProps<{
 page?: number
 pageCount?: number
 pageSize?: number
 pageSizeOptions?: number[]
}>(), {
 page: 1,
 pageCount: 1,
 pageSize: 20,
 pageSizeOptions: () => [],
})

const emit = defineEmits<{
 (e: 'update:page', value: number): void
 (e: 'update:pageSize', value: number): void
}>()

const instance = getCurrentInstance()
const resolvedPageSizeLabel = computed(() => resolveOptionalLabel({ key: 'pageSizeLabel', instance, namespaces: ['efs.pagination'] }) || '每页条数')
const resolvedSummaryLabel = computed(() => resolveOptionalLabel({ key: 'summaryLabel', instance, namespaces: ['efs.pagination'] }) || '页码')
const resolvedPreviousLabel = computed(() => resolveOptionalLabel({ key: 'previousLabel', instance, namespaces: ['efs.pagination'] }) || '上一页')
const resolvedNextLabel = computed(() => resolveOptionalLabel({ key: 'nextLabel', instance, namespaces: ['efs.pagination'] }) || '下一页')

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
