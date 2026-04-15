<template>
 <details ref="detailsRef" class="efs-columnsettings">
  <summary class="efs-columnsettings__trigger">{{ resolvedLabel }}</summary>
  <div class="efs-columnsettings__panel">
   <div class="efs-columnsettings__list">
    <label v-for="column in normalizedColumns" :key="column.key" class="efs-columnsettings__item">
     <input
      type="checkbox"
      :checked="isVisible(column.key)"
      :disabled="column.hideable === false"
      @change="onToggle(column.key, ($event.target as HTMLInputElement).checked)"
     />
     <span>{{ column.title }}</span>
    </label>
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
  return { key: column, title: column, hideable: true }
 }
 return {
  key: column.key,
  title: column.title ?? column.label ?? column.key,
  hideable: column.hideable !== false,
 }
}))

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
 width: 240px;
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
 gap: 8px;
}

.efs-columnsettings__item {
 display: flex;
 align-items: center;
 gap: 8px;
 font-size: 0.9rem;
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
</style>
