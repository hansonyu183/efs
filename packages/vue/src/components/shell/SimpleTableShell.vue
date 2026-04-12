<template>
    <div class="efs-simpletableshell">
      <header>{{ props.title }}</header><slot /><footer>rows: {{ props.items.length }}</footer>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'SimpleTableShell' })

  interface SimpleTableShellProps {
    title?: string
columns?: any[]
items?: any[]
  }

  const props = withDefaults(defineProps<SimpleTableShellProps>(), {
    title: '',
columns: () => [],
items: () => []
  })
  </script>
