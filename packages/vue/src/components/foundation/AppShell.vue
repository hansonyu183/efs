<template>
    <div class="efs-appshell">
      <header class="efs-app-shell__header">{{ props.appName }}</header>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'AppShell' })

  interface AppShellProps {
    appName?: string
orgCode?: string
  }

  const props = withDefaults(defineProps<AppShellProps>(), {
    appName: '',
orgCode: ''
  })
  </script>
