<template>
    <div class="efs-detailshell">
      <header>{{ props.title }}</header><slot /><footer>fields: {{ props.fields.length }}</footer>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'DetailShell' })

  interface DetailShellProps {
    title?: string
fields?: any[]
  }

  const props = withDefaults(defineProps<DetailShellProps>(), {
    title: '',
fields: () => []
  })
  </script>
