<template>
 <div class="efs-pagination" :class="{ 'efs-pagination--compact': props.compact }">
  <template v-if="props.compact">
   <div class="efs-pagination__actions efs-pagination__actions--compact">
    <AppButton size="sm" variant="default" :disabled="props.page <= 1" :aria-label="resolvedPreviousLabel" :title="resolvedPreviousLabel" @click="emit('update:page', props.page - 1)">
     <template #leading>
      <SemanticIcon name="previous" />
     </template>
    </AppButton>
    <div class="efs-pagination__summary efs-pagination__summary--compact">{{ props.page }}/{{ Math.max(props.pageCount, 1) }}</div>
    <AppButton size="sm" variant="default" :disabled="props.page >= Math.max(props.pageCount, 1)" :aria-label="resolvedNextLabel" :title="resolvedNextLabel" @click="emit('update:page', props.page + 1)">
     <template #leading>
      <SemanticIcon name="next" />
     </template>
    </AppButton>
   </div>
  </template>
  <template v-else>
   <div class="efs-pagination__summary">{{ resolvedSummaryLabel }} {{ props.page }} / {{ Math.max(props.pageCount, 1) }}</div>
   <div v-if="props.pageSizeOptions.length > 0" class="efs-pagination__pagesize">
    <span>{{ resolvedPageSizeLabel }}</span>
    <AppSelect :model-value="String(props.pageSize)" :options="pageSizeItems" @update:model-value="onPageSizeChange" />
   </div>
   <VPagination
    class="efs-pagination__pager"
    :model-value="props.page"
    :length="Math.max(props.pageCount, 1)"
    density="comfortable"
    rounded="circle"
    @update:model-value="(value) => emit('update:page', Number(value))"
   />
  </template>
 </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { VPagination } from 'vuetify/components'
import AppButton from '../controls/AppButton.vue'
import AppSelect from '../controls/AppSelect.vue'
import SemanticIcon from '../controls/SemanticIcon.vue'
import { resolveOptionalLabel } from '../../model/resource/label-resolver'

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
const pageSizeItems = computed(() => props.pageSizeOptions.map((size) => ({ label: String(size), value: String(size) })))

function onPageSizeChange(value: string | string[]) {
 const next = Array.isArray(value) ? value[0] : value
 emit('update:pageSize', Number(next))
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
 min-width: 220px;
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
