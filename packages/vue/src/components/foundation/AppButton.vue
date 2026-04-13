<template>
 <button
  :type="props.type"
  class="efs-appbutton"
  :class="[
   `efs-appbutton--${props.variant}`,
   `efs-appbutton--${props.size}`,
   {
    'efs-appbutton--block': props.block,
    'is-loading': props.loading,
   },
  ]"
  :disabled="props.disabled || props.loading"
  :aria-busy="props.loading ? 'true' : undefined"
 >
  <span v-if="$slots.leading" class="efs-appbutton__icon efs-appbutton__icon--leading">
   <slot name="leading" />
  </span>
  <span class="efs-appbutton__label">
   <slot />
  </span>
  <span v-if="$slots.trailing" class="efs-appbutton__icon efs-appbutton__icon--trailing">
   <slot name="trailing" />
  </span>
 </button>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppButton' })

interface AppButtonProps {
 type?: 'button' | 'submit' | 'reset'
 variant?: 'default' | 'primary' | 'danger' | 'ghost'
 size?: 'sm' | 'md' | 'lg'
 disabled?: boolean
 loading?: boolean
 block?: boolean
}

const props = withDefaults(defineProps<AppButtonProps>(), {
 type: 'button',
 variant: 'default',
 size: 'md',
 disabled: false,
 loading: false,
 block: false,
})
</script>

<style scoped>
.efs-appbutton {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 gap: 8px;
 min-height: 42px;
 padding: 0 16px;
 border-radius: 12px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 color: var(--efs-text, #172033);
 cursor: pointer;
 transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.efs-appbutton:disabled {
 opacity: 0.65;
 cursor: not-allowed;
}

.efs-appbutton--sm {
 min-height: 36px;
 padding: 0 12px;
 border-radius: 10px;
}

.efs-appbutton--lg {
 min-height: 48px;
 padding: 0 20px;
 border-radius: 14px;
}

.efs-appbutton--block {
 width: 100%;
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

.efs-appbutton--ghost {
 background: transparent;
 border-color: transparent;
}

.efs-appbutton__icon {
 display: inline-flex;
 align-items: center;
}

.efs-appbutton__label {
 display: inline-flex;
 align-items: center;
}
</style>
