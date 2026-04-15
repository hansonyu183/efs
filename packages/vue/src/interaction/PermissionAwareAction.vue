<template>
  <div class="efs-permissionawareaction">
   <button data-efs-allow-raw-button type="button" :disabled="!props.granted">
    <slot />
   </button>
  </div>
 </template>

 <script setup lang="ts">
 defineOptions({ name: 'PermissionAwareAction' })

 interface PermissionAwareActionProps {
granted?: boolean
 }

 const props = withDefaults(defineProps<PermissionAwareActionProps>(), {
granted: false
 })
 </script>
