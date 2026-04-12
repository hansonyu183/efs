<template>
    <div class="efs-formshell">
      <header>{{ props.title }}</header><slot /><footer>sections: {{ props.sections.length }}</footer>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'FormShell' })

  interface FormShellProps {
    title?: string
sections?: any[]
  }

  const props = withDefaults(defineProps<FormShellProps>(), {
    title: '',
sections: () => []
  })
  </script>
