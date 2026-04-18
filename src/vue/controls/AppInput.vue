<template>
 <VTextField
  :model-value="props.modelValue"
  class="efs-appinput"
  :placeholder="props.placeholder"
  :type="props.type"
  :autocomplete="props.autocomplete"
  :disabled="props.disabled"
  :readonly="props.readonly"
  :error="props.invalid"
  variant="outlined"
  density="comfortable"
  hide-details
  @update:model-value="(value) => emit('update:modelValue', String(value ?? ''))"
 >
  <template v-if="$slots.leading" #prepend-inner>
   <slot name="leading" />
  </template>
  <template v-if="$slots.trailing" #append-inner>
   <slot name="trailing" />
  </template>
 </VTextField>
</template>

<script setup lang="ts">
import { VTextField } from 'vuetify/components'

defineOptions({ name: 'AppInput' })

interface AppInputProps {
 modelValue?: string
 placeholder?: string
 type?: string
 autocomplete?: string
 disabled?: boolean
 readonly?: boolean
 invalid?: boolean
}

const props = withDefaults(defineProps<AppInputProps>(), {
 modelValue: '',
 placeholder: '',
 type: 'text',
 autocomplete: '',
 disabled: false,
 readonly: false,
 invalid: false,
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped>
.efs-appinput :deep(input) {
 font-size: 16px;
}
</style>
