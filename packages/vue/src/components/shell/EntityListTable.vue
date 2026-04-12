<template>
    <div class="efs-entitylisttable">
      <header>{{ props.title }} ({{ props.total }})</header><slot /><footer>rows: {{ props.items.length }}</footer>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'EntityListTable' })

  interface EntityListTableProps {
    title?: string
columns?: any[]
items?: any[]
total?: number | string
loading?: boolean
  }

  const props = withDefaults(defineProps<EntityListTableProps>(), {
    title: '',
columns: () => [],
items: () => [],
total: 0,
loading: false
  })
  </script>
