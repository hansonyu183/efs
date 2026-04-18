<template>
 <div class="efs-appfield">
  <div v-if="props.label || $slots.label" class="efs-appfield__header">
   <VLabel class="efs-appfield__label">
    <slot name="label">{{ props.label }}</slot>
   </VLabel>
   <span v-if="props.required" class="efs-appfield__required">*</span>
  </div>
  <slot />
  <VMessages
   v-if="props.error || props.hint"
   class="efs-appfield__messages"
   :active="true"
   :color="props.error ? 'error' : undefined"
   :messages="[props.error || props.hint]"
  />
 </div>
</template>

<script setup lang="ts">
import { VLabel, VMessages } from 'vuetify/components'

defineOptions({ name: 'AppField' })

interface AppFieldProps {
 label?: string
 hint?: string
 error?: string
 required?: boolean
}

const props = withDefaults(defineProps<AppFieldProps>(), {
 label: '',
 hint: '',
 error: '',
 required: false,
})
</script>

<style scoped>
.efs-appfield {
 display: grid;
 gap: 8px;
}

.efs-appfield__header {
 display: inline-flex;
 align-items: center;
 gap: 4px;
}

.efs-appfield__label {
 font-weight: 600;
}

.efs-appfield__required {
 color: var(--efs-danger, #dc2626);
}

.efs-appfield__messages :deep(.v-messages__message) {
 font-size: 0.875rem;
}
</style>
