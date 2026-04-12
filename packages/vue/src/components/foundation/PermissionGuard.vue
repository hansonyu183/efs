<template>
  <div class="efs-permissionguard">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PermissionGuard' })
</script>
