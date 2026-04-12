<template>
    <div class="efs-masterdetailshell">
      <header>{{ props.title }}</header><div>split: {{ props.splitRatio }}</div><slot name="master" /><slot name="detail" />
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'MasterDetailShell' })

  interface MasterDetailShellProps {
    title?: string
splitRatio?: string
  }

  const props = withDefaults(defineProps<MasterDetailShellProps>(), {
    title: '',
splitRatio: '40/60'
  })
  </script>
