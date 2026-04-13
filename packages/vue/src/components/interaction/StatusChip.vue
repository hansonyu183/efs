<template>
 <span class="efs-statuschip" :class="`efs-statuschip--${resolvedTone}`">
  {{ props.label || '—' }}
 </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'StatusChip' })

const props = withDefaults(defineProps<{
 label?: string
 tone?: string
}>(), {
 label: '',
 tone: 'neutral',
})

const resolvedTone = computed(() => {
 const allowed = new Set(['neutral', 'success', 'warning', 'danger', 'info'])
 return allowed.has(props.tone) ? props.tone : 'neutral'
})
</script>

<style scoped>
.efs-statuschip {
 display: inline-flex;
 align-items: center;
 min-height: 28px;
 padding: 0 10px;
 border-radius: 999px;
 border: 1px solid transparent;
 font-size: 0.82rem;
 font-weight: 700;
 white-space: nowrap;
}

.efs-statuschip--neutral {
 background: var(--efs-surface-soft, #f8fafc);
 border-color: var(--efs-border, #dbe3ef);
 color: var(--efs-text-muted, #64748b);
}

.efs-statuschip--success {
 background: rgba(22, 163, 74, 0.12);
 border-color: rgba(22, 163, 74, 0.22);
 color: #15803d;
}

.efs-statuschip--warning {
 background: rgba(245, 158, 11, 0.14);
 border-color: rgba(245, 158, 11, 0.24);
 color: #b45309;
}

.efs-statuschip--danger {
 background: rgba(220, 38, 38, 0.12);
 border-color: rgba(220, 38, 38, 0.22);
 color: #b91c1c;
}

.efs-statuschip--info {
 background: rgba(37, 99, 235, 0.12);
 border-color: rgba(37, 99, 235, 0.22);
 color: #1d4ed8;
}
</style>
