<template>
  <div class="efs-permissionawareaction">
   <button data-efs-allow-raw-button type="button" :disabled="!props.granted">{{ props.label }}</button>
  </div>
 </template>

 <script setup lang="ts">
 defineOptions({ name: 'PermissionAwareAction' })

 interface PermissionAwareActionProps {
  label?: string
granted?: boolean
 }

 const props = withDefaults(defineProps<PermissionAwareActionProps>(), {
  label: '',
granted: false
 })
 </script>
