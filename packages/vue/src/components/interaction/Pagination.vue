<template>
    <div class="efs-pagination">
      <div>page {{ props.page }} / size {{ props.pageSize }} / total {{ props.total }}</div>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'Pagination' })

  interface PaginationProps {
    page?: number | string
pageSize?: number | string
total?: number | string
  }

  const props = withDefaults(defineProps<PaginationProps>(), {
    page: 1,
pageSize: 20,
total: 0
  })
  </script>
