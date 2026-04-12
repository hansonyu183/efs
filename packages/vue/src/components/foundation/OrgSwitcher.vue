<template>
    <div class="efs-orgswitcher">
      <div>org: {{ props.currentOrgCode }} / options: {{ props.options.length }}</div>
    </div>
  </template>

  <script setup lang="ts">
  defineOptions({ name: 'OrgSwitcher' })

  interface OrgSwitcherProps {
    currentOrgCode?: string
options?: any[]
  }

  const props = withDefaults(defineProps<OrgSwitcherProps>(), {
    currentOrgCode: '',
options: () => []
  })
  </script>
