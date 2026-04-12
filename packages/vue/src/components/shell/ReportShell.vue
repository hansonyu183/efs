<template>
    <div class="efs-reportshell">
      <header>{{ props.title }}</header><div>exportable: {{ props.exportable }}</div><slot name="query" /><slot name="result" />
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'ReportShell' })

  interface ReportShellProps {
    title?: string
exportable?: boolean
  }

  const props = withDefaults(defineProps<ReportShellProps>(), {
    title: '',
exportable: false
  })
  </script>
