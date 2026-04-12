<template>
    <div class="efs-emptystate">
      <div><strong>{{ props.title }}</strong><p>{{ props.description }}</p></div>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'EmptyState' })

  interface EmptyStateProps {
    title?: string
description?: string
  }

  const props = withDefaults(defineProps<EmptyStateProps>(), {
    title: '',
description: ''
  })
  </script>
