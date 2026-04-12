<template>
    <div class="efs-dashboardcardshell">
      <header>{{ props.title }}</header><strong>{{ props.value }}</strong><small>{{ props.subtitle }}</small><slot />
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'DashboardCardShell' })

  interface DashboardCardShellProps {
    title?: string
value?: number | string
subtitle?: string
  }

  const props = withDefaults(defineProps<DashboardCardShellProps>(), {
    title: '',
value: 0,
subtitle: ''
  })
  </script>
