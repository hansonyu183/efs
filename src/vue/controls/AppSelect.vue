<template>
 <VAutocomplete
  v-if="props.multiple"
  :model-value="multipleValue"
  class="efs-appselect"
  :items="normalizedOptions"
  item-title="label"
  item-value="value"
  :placeholder="props.placeholder"
  :disabled="props.disabled"
  multiple
  chips
  closable-chips
  clearable
  variant="outlined"
  density="comfortable"
  hide-details
  @update:model-value="onMultipleChange"
 />
 <VSelect
  v-else
  :model-value="singleValue"
  class="efs-appselect"
  :items="normalizedOptions"
  item-title="label"
  item-value="value"
  :placeholder="props.placeholder"
  :disabled="props.disabled"
  clearable
  variant="outlined"
  density="comfortable"
  hide-details
  @update:model-value="onSingleChange"
 />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VAutocomplete, VSelect } from 'vuetify/components'

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

const multipleValue = computed(() => Array.isArray(props.modelValue) ? props.modelValue.map((item) => String(item)) : [])
const singleValue = computed(() => Array.isArray(props.modelValue) ? String(props.modelValue[0] ?? '') : String(props.modelValue ?? ''))

function onMultipleChange(value: unknown) {
 emit('update:modelValue', Array.isArray(value) ? value.map((item) => String(item)) : [])
}

function onSingleChange(value: unknown) {
 emit('update:modelValue', value == null ? '' : String(value))
}
</script>

<style scoped>
.efs-appselect :deep(input) {
 font-size: 16px;
}
</style>
