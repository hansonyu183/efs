<template>
 <div class="efs-actionbar" :class="[`efs-actionbar--${props.align}`]">
  <div v-if="$slots.leading" class="efs-actionbar__leading">
   <slot name="leading" />
  </div>

  <div v-if="visibleActions.length > 0" class="efs-actionbar__actions">
   <AppButton
    v-for="action in visibleActions"
    :key="action.key"
    :variant="action.variant ?? 'default'"
    size="sm"
    :disabled="props.busy || action.disabled"
    @click="action.onClick?.()"
   >
    {{ action.label }}
   </AppButton>
  </div>

  <div v-if="$slots.default" class="efs-actionbar__custom">
   <slot />
  </div>
 </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '../controls/AppButton.vue'

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
</style>
