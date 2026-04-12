<template>
  <div class="efs-authlayout">
    <header class="efs-auth-layout__title">{{ props.title }}</header>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AuthLayout' })

interface AuthLayoutProps {
  title?: string
}

const props = withDefaults(defineProps<AuthLayoutProps>(), {
  title: ''
})
</script>
