<template>
 <div class="efs-actionbar" :class="[`efs-actionbar--${props.align}`]">
  <div v-if="$slots.leading" class="efs-actionbar__leading">
   <slot name="leading" />
  </div>

  <div v-if="visibleActions.length > 0" class="efs-actionbar__actions">
   <button
    v-for="action in visibleActions"
    :key="action.key"
    type="button"
    class="efs-actionbar__button"
    :class="`efs-actionbar__button--${action.variant ?? 'default'}`"
    :disabled="props.busy || action.disabled"
    @click="action.onClick?.()"
   >
    {{ action.label }}
   </button>
  </div>

  <div v-if="$slots.default" class="efs-actionbar__custom">
   <slot />
  </div>
 </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ActionBar' })

type ActionBarItem = {
 key: string
 label: string
 variant?: 'default' | 'primary' | 'danger' | 'ghost'
 disabled?: boolean
 visible?: boolean
 onClick?: () => void
}

interface ActionBarProps {
 actions?: ActionBarItem[]
 align?: 'start' | 'between' | 'end'
 busy?: boolean
}

const props = withDefaults(defineProps<ActionBarProps>(), {
 actions: () => [],
 align: 'between',
 busy: false,
})

const visibleActions = computed(() => props.actions.filter((action) => action.visible !== false))
</script>

<style scoped>
.efs-actionbar,
.efs-actionbar__actions {
 display: flex;
 gap: 10px;
 flex-wrap: wrap;
}

.efs-actionbar {
 align-items: center;
}

.efs-actionbar--start {
 justify-content: flex-start;
}

.efs-actionbar--between {
 justify-content: space-between;
}

.efs-actionbar--end {
 justify-content: flex-end;
}

.efs-actionbar__leading,
.efs-actionbar__custom {
 display: flex;
 gap: 10px;
 flex-wrap: wrap;
}

.efs-actionbar__button {
 min-height: 36px;
 padding: 0 12px;
 border-radius: 10px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 color: var(--efs-text, #172033);
 cursor: pointer;
}

.efs-actionbar__button:disabled {
 opacity: 0.65;
 cursor: not-allowed;
}

.efs-actionbar__button--primary {
 background: var(--efs-primary, #2563eb);
 border-color: var(--efs-primary, #2563eb);
 color: #fff;
}

.efs-actionbar__button--danger {
 background: var(--efs-danger, #dc2626);
 border-color: var(--efs-danger, #dc2626);
 color: #fff;
}

.efs-actionbar__button--ghost {
 background: transparent;
}
</style>
