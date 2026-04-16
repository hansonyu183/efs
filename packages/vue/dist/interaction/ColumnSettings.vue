<template>
 <details ref="detailsRef" class="efs-columnsettings">
  <summary class="efs-columnsettings__trigger">{{ resolvedLabel }}</summary>
  <div class="efs-columnsettings__panel">
   <div class="efs-columnsettings__list">
    <details
     v-for="group in groupedColumns"
     :key="group.key"
     class="efs-columnsettings__group"
     :open="group.defaultOpen"
    >
     <summary class="efs-columnsettings__group-summary">
      <strong class="efs-columnsettings__group-title">{{ group.title }}</strong>
     </summary>
     <div class="efs-columnsettings__group-items">
      <label v-for="column in group.columns" :key="column.key" class="efs-columnsettings__item">
       <input
        type="checkbox"
        :checked="isVisible(column.key)"
        :disabled="column.hideable === false"
        @change="onToggle(column.key, ($event.target as HTMLInputElement).checked)"
       />
       <span>{{ column.title }}</span>
      </label>
     </div>
    </details>
   </div>
   <div class="efs-columnsettings__actions">
    <button type="button" @click="emit('show-all')">{{ resolvedShowAllLabel }}</button>
    <button type="button" @click="emit('reset')">{{ resolvedResetLabel }}</button>
   </div>
  </div>
 </details>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { resolveOptionalLabel } from '../shared/label-resolver'

defineOptions({ name: 'ColumnSettings' })

type InputColumn = string | {
 key: string
 title?: string
 label?: string
 hideable?: boolean
 group?: 'business' | 'system'
}

const props = withDefaults(defineProps<{
 columns?: InputColumn[]
 visibleKeys?: string[]
}>(), {
 columns: () => [],
 visibleKeys: () => [],
})

const emit = defineEmits<{
 (e: 'update:visibleKeys', value: string[]): void
 (e: 'reset'): void
 (e: 'show-all'): void
}>()

const detailsRef = ref<HTMLDetailsElement | null>(null)
const instance = getCurrentInstance()
const resolvedLabel = computed(() => resolveOptionalLabel({ key: 'label', instance, namespaces: ['efs.columnSettings'] }) || '列设置')
const resolvedResetLabel = computed(() => resolveOptionalLabel({ key: 'resetLabel', instance, namespaces: ['efs.columnSettings'] }) || '重置')
const resolvedShowAllLabel = computed(() => resolveOptionalLabel({ key: 'showAllLabel', instance, namespaces: ['efs.columnSettings'] }) || '显示全部')

const normalizedColumns = computed(() => props.columns.map((column) => {
 if (typeof column === 'string') {
  return { key: column, title: column, hideable: true, group: 'business' as const }
 }
 return {
  key: column.key,
  title: column.title ?? column.label ?? column.key,
  hideable: column.hideable !== false,
  group: column.group === 'system' ? 'system' as const : 'business' as const,
 }
}))

const groupedColumns = computed(() => {
 const business = normalizedColumns.value.filter((column) => column.group !== 'system')
 const system = normalizedColumns.value.filter((column) => column.group === 'system')
 return [
  { key: 'business', title: '业务字段', columns: business, defaultOpen: true },
  { key: 'system', title: '系统字段', columns: system, defaultOpen: false },
 ].filter((group) => group.columns.length > 0)
})

function isVisible(key: string) {
 return props.visibleKeys.includes(key)
}

function onToggle(key: string, checked: boolean) {
 const current = new Set(props.visibleKeys)
 if (checked) current.add(key)
 else current.delete(key)
 emit('update:visibleKeys', normalizedColumns.value.filter((column) => column.hideable === false || current.has(column.key)).map((column) => column.key))
}
</script>

<style scoped>
.efs-columnsettings {
 position: relative;
}

.efs-columnsettings__trigger {
 list-style: none;
 min-height: 36px;
 padding: 0 12px;
 border-radius: 10px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 display: inline-flex;
 align-items: center;
 cursor: pointer;
 font-size: 0.9rem;
}

.efs-columnsettings__trigger::-webkit-details-marker {
 display: none;
}

.efs-columnsettings__panel {
 position: absolute;
 top: calc(100% + 8px);
 right: 0;
 width: 280px;
 padding: 10px;
 border-radius: 14px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
 display: grid;
 gap: 10px;
 z-index: 10;
}

.efs-columnsettings__list {
 display: grid;
 gap: 12px;
}

.efs-columnsettings__group {
 display: grid;
 gap: 8px;
}

.efs-columnsettings__group-summary {
 list-style: none;
 cursor: pointer;
}

.efs-columnsettings__group-summary::-webkit-details-marker {
 display: none;
}

.efs-columnsettings__group-items {
 display: grid;
 gap: 8px;
}

.efs-columnsettings__group + .efs-columnsettings__group {
 padding-top: 10px;
 border-top: 1px solid var(--efs-border, #dbe3ef);
}

.efs-columnsettings__group-title {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.82rem;
 font-weight: 700;
}

.efs-columnsettings__item {
 display: flex;
 align-items: center;
 gap: 8px;
 font-size: 0.9rem;
}

.efs-columnsettings__item input {
 flex-shrink: 0;
}

.efs-columnsettings__item span {
 min-width: 0;
}

.efs-columnsettings__actions {
 display: flex;
 gap: 8px;
 justify-content: flex-end;
}

.efs-columnsettings__actions button {
 min-height: 32px;
 padding: 0 10px;
 border-radius: 8px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface-soft, #f8fafc);
 cursor: pointer;
}

@media (max-width: 640px) {
 .efs-columnsettings__panel {
  width: min(320px, calc(100vw - 24px));
 }
}
</style>
