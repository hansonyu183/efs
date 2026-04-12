<template>
    <div class="efs-statuschip">
      <span>{{ props.label }} ({{ props.tone }})</span>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'StatusChip' })

  interface StatusChipProps {
    label?: string
tone?: string
  }

  const props = withDefaults(defineProps<StatusChipProps>(), {
    label: '',
tone: ''
  })
  </script>
