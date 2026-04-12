<template>
    <div class="efs-pagesection">
      <header><h2>{{ props.title }}</h2><p v-if="props.subtitle">{{ props.subtitle }}</p></header><slot />
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'PageSection' })

  interface PageSectionProps {
    title?: string
subtitle?: string
  }

  const props = withDefaults(defineProps<PageSectionProps>(), {
    title: '',
subtitle: ''
  })
  </script>
