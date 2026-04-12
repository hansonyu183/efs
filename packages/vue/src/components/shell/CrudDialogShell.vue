<template>
    <div class="efs-cruddialogshell">
      <div v-if="props.modelValue"><header>{{ props.title }}</header><slot /><footer>{{ props.submitLabel }}</footer></div>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'CrudDialogShell' })

  interface CrudDialogShellProps {
    modelValue?: boolean
title?: string
submitLabel?: string
  }

  const props = withDefaults(defineProps<CrudDialogShellProps>(), {
    modelValue: false,
title: '',
submitLabel: ''
  })
  </script>
