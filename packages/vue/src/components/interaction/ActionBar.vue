<template>
  <div class="efs-actionbar">
    <div>actions: {{ props.actions.length }}</div><slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ActionBar' })

interface ActionBarProps {
  actions?: any[]
}

const props = withDefaults(defineProps<ActionBarProps>(), {
  actions: () => []
})
</script>
