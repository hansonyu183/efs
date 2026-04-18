<template>
 <div class="efs-permissionawareaction">
  <AppButton data-efs-allow-raw-button :disabled="!props.granted" size="sm">
   <slot />
  </AppButton>
 </div>
</template>

<script setup lang="ts">
import AppButton from '../controls/AppButton.vue'

defineOptions({ name: 'PermissionAwareAction' })

interface PermissionAwareActionProps {
 granted?: boolean
}

const props = withDefaults(defineProps<PermissionAwareActionProps>(), {
 granted: false,
})
</script>
