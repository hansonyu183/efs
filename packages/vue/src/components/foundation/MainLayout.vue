<template>
    <div class="efs-mainlayout">
      <header class="efs-main-layout__header"><span>{{ props.title }}</span><small>{{ props.orgCode }}</small></header>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'MainLayout' })

  interface MainLayoutProps {
    title?: string
orgCode?: string
  }

  const props = withDefaults(defineProps<MainLayoutProps>(), {
    title: '',
orgCode: ''
  })
  </script>
