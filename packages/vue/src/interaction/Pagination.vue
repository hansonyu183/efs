<template>
 <div class="efs-pagination" :class="{ 'efs-pagination--compact': props.compact }">
  <template v-if="props.compact">
   <div class="efs-pagination__actions efs-pagination__actions--compact">
    <button
     type="button"
     :disabled="props.page <= 1"
     :aria-label="resolvedPreviousLabel"
     :title="resolvedPreviousLabel"
     @click="emit('update:page', props.page - 1)"
    >
     <SemanticIcon name="previous" fallback="‹" />
    </button>
    <div class="efs-pagination__summary efs-pagination__summary--compact">{{ props.page }}/{{ Math.max(props.pageCount, 1) }}</div>
    <button
     type="button"
     :disabled="props.page >= Math.max(props.pageCount, 1)"
     :aria-label="resolvedNextLabel"
     :title="resolvedNextLabel"
     @click="emit('update:page', props.page + 1)"
    >
     <SemanticIcon name="next" fallback="›" />
    </button>
   </div>
  </template>
  <template v-else>
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
  </template>
 </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import SemanticIcon from '../controls/SemanticIcon.vue'
import { resolveOptionalLabel } from '../shared/label-resolver'

defineOptions({ name: 'Pagination' })

const props = withDefaults(defineProps<{
 page?: number
 pageCount?: number
 pageSize?: number
 pageSizeOptions?: number[]
 compact?: boolean
}>(), {
 page: 1,
 pageCount: 1,
 pageSize: 20,
 pageSizeOptions: () => [],
 compact: false,
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
 border: 1px solid var(--efs-border-strong, var(--efs-border, #dbe3ef));
 background: var(--efs-surface-soft, var(--efs-surface, #fff));
 color: var(--efs-text, #172033);
 font-weight: 700;
 cursor: pointer;
}

.efs-pagination__actions button:disabled {
 opacity: 0.45;
 color: var(--efs-text-muted, #64748b);
 cursor: not-allowed;
}

.efs-pagination__actions button:not(:disabled):hover {
 border-color: var(--efs-primary, #2563eb);
}

.efs-pagination__actions button:focus-visible {
 outline: 2px solid var(--efs-primary, #2563eb);
 outline-offset: 2px;
}

.efs-pagination__actions button:active:not(:disabled) {
 transform: translateY(1px);
}

.efs-pagination__actions button :deep(.efs-semanticicon) {
 color: currentColor;
}

.efs-pagination--compact {
 gap: 0;
}

.efs-pagination__actions--compact {
 align-items: center;
 gap: 6px;
 flex-wrap: nowrap;
}

.efs-pagination__actions--compact button {
 min-width: 32px;
 min-height: 32px;
 padding: 0;
 border-radius: 999px;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--efs-text, #172033) 14%, transparent);
}

.efs-pagination__actions--compact button:not(:disabled) {
 background: color-mix(in srgb, var(--efs-surface-soft, var(--efs-surface, #fff)) 88%, var(--efs-text, #172033) 12%);
}

.efs-pagination__actions--compact button:disabled {
 box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--efs-text-muted, #64748b) 12%, transparent);
}

.efs-pagination__summary--compact {
 min-width: 3.25rem;
 text-align: center;
 font-variant-numeric: tabular-nums;
 color: var(--efs-text, #172033);
 font-weight: 700;
}

@supports not (color: color-mix(in srgb, white 50%, black)) {
 .efs-pagination__actions--compact button {
  box-shadow: inset 0 0 0 1px var(--efs-border-strong, var(--efs-border, #dbe3ef));
 }

 .efs-pagination__actions--compact button:not(:disabled) {
  background: var(--efs-surface-soft, var(--efs-surface, #fff));
 }
}

@media (prefers-color-scheme: dark) {
 .efs-pagination__actions--compact button:not(:disabled) {
  border-color: color-mix(in srgb, var(--efs-text, #e5eefb) 24%, transparent);
 }
}

@supports not (color: color-mix(in srgb, white 50%, black)) {
 @media (prefers-color-scheme: dark) {
  .efs-pagination__actions--compact button:not(:disabled) {
   border-color: var(--efs-border-strong, var(--efs-border, #475569));
  }
 }
}
</style>
