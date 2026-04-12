<template>
  <input
    :value="props.modelValue"
    class="efs-appinput"
    :placeholder="props.placeholder"
    :type="props.type"
    :autocomplete="props.autocomplete"
    @input="onInput"
  />
</template>

<script setup lang="ts">
defineOptions({ name: 'AppInput' })

interface AppInputProps {
  modelValue?: string
  placeholder?: string
  type?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<AppInputProps>(), {
  modelValue: '',
  placeholder: '',
  type: 'text',
  autocomplete: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.efs-appinput {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  color: var(--efs-text, #172033);
}
</style>
