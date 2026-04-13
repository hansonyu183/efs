<template>
 <label class="efs-appfield">
  <span v-if="props.label || $slots.label" class="efs-appfield__header">
   <span class="efs-appfield__label">
    <slot name="label">{{ props.label }}</slot>
   </span>
   <span v-if="props.required" class="efs-appfield__required">*</span>
  </span>
  <slot />
  <span v-if="props.error" class="efs-appfield__feedback efs-appfield__feedback--error">{{ props.error }}</span>
  <span v-else-if="props.hint" class="efs-appfield__feedback">{{ props.hint }}</span>
 </label>
</template>

<script setup lang="ts">
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
 color: var(--efs-text, #172033);
 font-weight: 600;
}

.efs-appfield__required {
 color: var(--efs-danger, #dc2626);
}

.efs-appfield__feedback {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.875rem;
}

.efs-appfield__feedback--error {
 color: var(--efs-danger, #dc2626);
}
</style>
