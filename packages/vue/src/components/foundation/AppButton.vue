<template>
  <button :type="props.type" class="efs-appbutton" :class="`efs-appbutton--${props.variant}`" :disabled="props.disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppButton' })

interface AppButtonProps {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}

const props = withDefaults(defineProps<AppButtonProps>(), {
  type: 'button',
  variant: 'default',
  disabled: false,
})
</script>

<style scoped>
.efs-appbutton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  color: var(--efs-text, #172033);
  cursor: pointer;
}

.efs-appbutton:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.efs-appbutton--primary {
  background: var(--efs-primary, #2563eb);
  border-color: var(--efs-primary, #2563eb);
  color: #fff;
}

.efs-appbutton--danger {
  background: var(--efs-danger, #dc2626);
  border-color: var(--efs-danger, #dc2626);
  color: #fff;
}
</style>
