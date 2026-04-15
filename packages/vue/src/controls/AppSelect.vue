<template>
 <label class="efs-appselect" :class="{ 'is-disabled': props.disabled }">
  <select
   class="efs-appselect__control"
   :value="currentValue"
   :disabled="props.disabled"
   @change="onChange"
  >
   <option v-if="props.placeholder" value="">{{ props.placeholder }}</option>
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
import { computed } from 'vue'

defineOptions({ name: 'AppSelect' })

type AppSelectOption = Record<string, unknown> & {
 label?: string
 title?: string
 value?: string
 disabled?: boolean
}

interface AppSelectProps {
 modelValue?: string
 options?: AppSelectOption[]
 placeholder?: string
 disabled?: boolean
 optionLabelKey?: string
 optionValueKey?: string
 optionDisabledKey?: string
}

const props = withDefaults(defineProps<AppSelectProps>(), {
 modelValue: '',
 options: () => [],
 placeholder: '',
 disabled: false,
 optionLabelKey: 'label',
 optionValueKey: 'value',
 optionDisabledKey: 'disabled',
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: string): void
}>()

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

const currentValue = computed(() => props.modelValue ?? '')

function onChange(event: Event) {
 emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<style scoped>
.efs-appselect {
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
</style>
