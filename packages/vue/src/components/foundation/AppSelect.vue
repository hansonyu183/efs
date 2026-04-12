<template>
  <select class="efs-appselect" :value="props.modelValue" @change="onChange">
    <option v-for="option in props.options" :key="String(option.value)" :value="option.value">{{ option.label ?? option.title ?? String(option.value) }}</option>
  </select>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSelect' })

type OptionValue = string | number

interface AppSelectOption {
  label?: string
  title?: string
  value: OptionValue
}

interface AppSelectProps {
  modelValue?: OptionValue
  options?: AppSelectOption[]
}

const props = withDefaults(defineProps<AppSelectProps>(), {
  modelValue: '',
  options: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<style scoped>
.efs-appselect {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  color: var(--efs-text, #172033);
}
</style>
