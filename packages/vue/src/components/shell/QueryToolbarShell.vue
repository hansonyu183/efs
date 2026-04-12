<template>
    <div class="efs-querytoolbarshell">
      <header>{{ props.title }}</header><slot name="filters" /><slot name="actions" />
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'QueryToolbarShell' })

  interface QueryToolbarShellProps {
    title?: string
collapsible?: boolean
  }

  const props = withDefaults(defineProps<QueryToolbarShellProps>(), {
    title: '',
collapsible: false
  })
  </script>
