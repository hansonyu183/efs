<template>
 <label class="efs-appselect" :class="{ 'is-disabled': props.disabled, 'is-multiple': props.multiple, 'is-open': menuOpen }">
  <template v-if="props.multiple">
   <div class="efs-appselect__tag-picker" @click="focusFilterInput">
    <button
     v-for="option in selectedOptions"
     :key="option.value"
     type="button"
     class="efs-appselect__tag"
     :disabled="props.disabled"
     @click.stop="removeValue(option.value)"
    >
     <span class="efs-appselect__tag-label">{{ option.label }}</span>
     <span class="efs-appselect__tag-remove">×</span>
    </button>
    <input
     ref="filterInputRef"
     v-model="filterKeyword"
     class="efs-appselect__filter-input"
     :disabled="props.disabled"
     :placeholder="selectedValues.length > 0 ? '' : props.placeholder"
     @focus="menuOpen = true"
     @keydown="handleFilterKeydown"
    />
   </div>
   <div v-if="menuOpen" class="efs-appselect__menu">
   <div class="efs-appselect__menu-tools">
    <button
     type="button"
     class="efs-appselect__menu-tool"
     :disabled="props.disabled || selectableFilteredOptions.length === 0"
     @mousedown.prevent
     @click="selectAllFiltered"
    >
     全选
    </button>
    <button
     type="button"
     class="efs-appselect__menu-tool"
     :disabled="props.disabled || selectedValues.length === 0"
     @mousedown.prevent
     @click="clearAllValues"
    >
     清空
    </button>
   </div>
   <button
    v-for="option in filteredOptions"
    :key="option.value"
    type="button"
    class="efs-appselect__menu-item"
    :class="{ 'is-selected': selectedValueSet.has(option.value) }"
    :disabled="option.disabled"
    @mousedown.prevent
    @click="toggleValue(option.value)"
   >
    <span>{{ option.label }}</span>
    <span v-if="selectedValueSet.has(option.value)" class="efs-appselect__menu-check">✓</span>
   </button>
   <div v-if="filteredOptions.length === 0" class="efs-appselect__menu-empty">无匹配选项</div>
  </div>
   <select
    class="efs-appselect__native efs-appselect__native--hidden"
    :value="currentValue"
    :disabled="props.disabled"
    :multiple="props.multiple"
    tabindex="-1"
    aria-hidden="true"
   >
    <option
     v-for="option in normalizedOptions"
     :key="String(option.value)"
     :value="option.value"
     :disabled="option.disabled"
    >
     {{ option.label }}
    </option>
   </select>
  </template>
  <select
   v-else
   class="efs-appselect__control"
   :value="currentValue"
   :disabled="props.disabled"
   :multiple="props.multiple"
   @change="onChange"
  >
   <option v-if="props.placeholder && !props.multiple" value="">{{ props.placeholder }}</option>
   <option
    v-for="option in normalizedOptions"
    :key="String(option.value)"
    :value="option.value"
    :disabled="option.disabled"
   >
    {{ option.label }}
   </option>
  </select>
 </label>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

defineOptions({ name: 'AppSelect' })

type AppSelectOption = Record<string, unknown> & {
 label?: string
 title?: string
 value?: string
 disabled?: boolean
}

interface AppSelectProps {
 modelValue?: string | string[]
 options?: AppSelectOption[]
 placeholder?: string
 disabled?: boolean
 multiple?: boolean
 optionLabelKey?: string
 optionValueKey?: string
 optionDisabledKey?: string
}

const props = withDefaults(defineProps<AppSelectProps>(), {
 modelValue: '',
 options: () => [],
 placeholder: '',
 disabled: false,
 multiple: false,
 optionLabelKey: 'label',
 optionValueKey: 'value',
 optionDisabledKey: 'disabled',
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: string | string[]): void
}>()

const filterInputRef = ref<HTMLInputElement | null>(null)
const filterKeyword = ref('')
const menuOpen = ref(false)

const normalizedOptions = computed(() =>
 props.options.map((option) => {
  const rawLabel = option[props.optionLabelKey] ?? option.title ?? option.label ?? option[props.optionValueKey]
  const rawValue = option[props.optionValueKey] ?? option.value ?? ''
  return {
   label: String(rawLabel ?? ''),
   value: String(rawValue ?? ''),
   disabled: Boolean(option[props.optionDisabledKey] ?? option.disabled),
  }
 }),
)

const selectedValues = computed(() => {
 if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue.map((item) => String(item)) : []
 return Array.isArray(props.modelValue) ? [String(props.modelValue[0] ?? '')] : [String(props.modelValue ?? '')]
})

const selectedValueSet = computed(() => new Set(selectedValues.value))

const selectedOptions = computed(() => {
 const byValue = new Map(normalizedOptions.value.map((option) => [option.value, option]))
 return selectedValues.value.map((value) => byValue.get(value) ?? { label: value, value, disabled: false })
})

const filteredOptions = computed(() => {
 const keyword = filterKeyword.value.trim().toLowerCase()
 if (!keyword) return normalizedOptions.value
 return normalizedOptions.value.filter((option) => option.label.toLowerCase().includes(keyword) || option.value.toLowerCase().includes(keyword))
})

const selectableFilteredOptions = computed(() => filteredOptions.value.filter((option) => !option.disabled))

const currentValue = computed(() => {
 if (props.multiple) return selectedValues.value
 return selectedValues.value[0] ?? ''
})

function onChange(event: Event) {
 const target = event.target as HTMLSelectElement
 if (props.multiple) {
  emit('update:modelValue', Array.from(target.selectedOptions).map((option) => option.value))
  return
 }
 emit('update:modelValue', target.value)
}

function emitMultiple(values: string[]) {
 emit('update:modelValue', values)
}

function toggleValue(value: string) {
 if (props.disabled) return
 const next = new Set(selectedValues.value)
 if (next.has(value)) next.delete(value)
 else next.add(value)
 emitMultiple([...next])
 menuOpen.value = true
 filterKeyword.value = ''
 focusFilterInput()
}

function removeValue(value: string) {
 if (props.disabled) return
 emitMultiple(selectedValues.value.filter((item) => item !== value))
 focusFilterInput()
}

function selectAllFiltered() {
 if (props.disabled) return
 const next = new Set(selectedValues.value)
 for (const option of selectableFilteredOptions.value) next.add(option.value)
 emitMultiple([...next])
 menuOpen.value = true
 focusFilterInput()
}

function clearAllValues() {
 if (props.disabled) return
 emitMultiple([])
 menuOpen.value = true
 focusFilterInput()
}

function focusFilterInput() {
 if (props.disabled) return
 menuOpen.value = true
 queueMicrotask(() => filterInputRef.value?.focus())
}

function handleFilterKeydown(event: KeyboardEvent) {
 if (event.key === 'Backspace' && !filterKeyword.value && selectedValues.value.length > 0) {
  removeValue(selectedValues.value[selectedValues.value.length - 1])
  return
 }
 if (event.key === 'Escape') {
  menuOpen.value = false
  filterInputRef.value?.blur()
 }
}

function handleDocumentClick(event: MouseEvent) {
 const root = event.target instanceof Node ? event.target : null
 if (!root) return
 if (filterInputRef.value?.closest('.efs-appselect')?.contains(root)) return
 menuOpen.value = false
}

if (typeof document !== 'undefined') {
 document.addEventListener('click', handleDocumentClick)
}

onBeforeUnmount(() => {
 if (typeof document !== 'undefined') {
  document.removeEventListener('click', handleDocumentClick)
 }
})
</script>

<style scoped>
.efs-appselect {
 position: relative;
 display: flex;
 align-items: center;
 width: 100%;
 min-height: 44px;
 padding: 0 12px;
 box-sizing: border-box;
 border-radius: 12px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 color: var(--efs-text, #172033);
}

.efs-appselect.is-disabled {
 opacity: 0.65;
}

.efs-appselect.is-open {
 border-color: var(--efs-primary, #2563eb);
 box-shadow: 0 0 0 3px color-mix(in srgb, var(--efs-primary, #2563eb) 18%, transparent);
}

.efs-appselect__control {
 width: 100%;
 min-height: 42px;
 border: 0;
 outline: 0;
 background: transparent;
 color: inherit;
 font-size: 16px;
 line-height: 1.5;
}

.efs-appselect.is-multiple {
 align-items: stretch;
 padding: 10px 12px;
}

.efs-appselect__tag-picker {
 display: flex;
 align-items: center;
 align-content: flex-start;
 gap: 8px;
 flex-wrap: wrap;
 width: 100%;
 min-height: 44px;
 cursor: text;
}

.efs-appselect__tag {
 display: inline-flex;
 align-items: center;
 gap: 6px;
 max-width: 100%;
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 999px;
 background: var(--efs-surface-soft, #f8fafc);
 color: inherit;
 padding: 4px 10px;
 cursor: pointer;
}

.efs-appselect__tag-label {
 max-width: 18rem;
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
}

.efs-appselect__tag-remove {
 color: var(--efs-text-muted, #64748b);
}

.efs-appselect__filter-input {
 flex: 1 1 8rem;
 min-width: 8rem;
 min-height: 32px;
 border: 0;
 outline: 0;
 background: transparent;
 color: inherit;
 font-size: 16px;
}

.efs-appselect__menu {
 position: absolute;
 top: calc(100% + 8px);
 left: 0;
 right: 0;
 z-index: 20;
 display: grid;
 gap: 4px;
 max-height: 16rem;
 overflow: auto;
 padding: 8px;
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 12px;
 background: var(--efs-surface, #fff);
 box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
}

.efs-appselect__menu-tools {
 display: flex;
 justify-content: flex-end;
 gap: 8px;
 padding: 0 0 4px;
 border-bottom: 1px solid var(--efs-border, #dbe3ef);
 margin-bottom: 4px;
}

.efs-appselect__menu-tool {
 min-height: 30px;
 border: 0;
 border-radius: 8px;
 background: transparent;
 color: var(--efs-primary, #2563eb);
 padding: 0 8px;
 cursor: pointer;
}

.efs-appselect__menu-tool:disabled {
 opacity: 0.5;
 cursor: not-allowed;
}

.efs-appselect__menu-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 gap: 12px;
 width: 100%;
 min-height: 38px;
 border: 0;
 border-radius: 10px;
 background: transparent;
 color: inherit;
 text-align: left;
 padding: 0 10px;
 cursor: pointer;
}

.efs-appselect__menu-item:hover,
.efs-appselect__menu-item.is-selected {
 background: var(--efs-surface-soft, #f8fafc);
}

.efs-appselect__menu-item:disabled {
 opacity: 0.5;
 cursor: not-allowed;
}

.efs-appselect__menu-check {
 color: var(--efs-primary, #2563eb);
 font-weight: 700;
}

.efs-appselect__menu-empty {
 padding: 10px;
 color: var(--efs-text-muted, #64748b);
}

.efs-appselect__native--hidden {
 position: absolute;
 width: 1px;
 height: 1px;
 opacity: 0;
 pointer-events: none;
}
</style>
