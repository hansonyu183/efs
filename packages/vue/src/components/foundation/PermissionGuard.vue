<template>
 <div class="efs-permissionguard">
  <div v-if="props.granted"><slot /></div><div v-else><slot name="fallback">forbidden</slot></div>
 </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PermissionGuard' })

interface PermissionGuardProps {
 granted?: boolean
}

const props = withDefaults(defineProps<PermissionGuardProps>(), {
 granted: false
})
</script>
