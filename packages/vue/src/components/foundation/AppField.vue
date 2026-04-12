<template>
  <label class="efs-appfield">
    <span v-if="props.label" class="efs-appfield__label">{{ props.label }}</span>
    <slot />
  </label>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppField' })

interface AppFieldProps {
  label?: string
}

const props = withDefaults(defineProps<AppFieldProps>(), {
  label: '',
})
</script>

<style scoped>
.efs-appfield {
  display: grid;
  gap: 8px;
}

.efs-appfield__label {
  color: var(--efs-text, #172033);
}
</style>
