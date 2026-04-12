<template>
    <div class="efs-errorstate">
      <div><strong>{{ props.title }}</strong><p>{{ props.message }}</p></div>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'ErrorState' })

  interface ErrorStateProps {
    title?: string
message?: string
  }

  const props = withDefaults(defineProps<ErrorStateProps>(), {
    title: '',
message: ''
  })
  </script>
