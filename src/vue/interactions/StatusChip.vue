<template>
 <VChip class="efs-statuschip" :color="resolvedColor" :variant="resolvedVariant" size="small">
  <slot>—</slot>
 </VChip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VChip } from 'vuetify/components'

defineOptions({ name: 'StatusChip' })

const props = withDefaults(defineProps<{
 tone?: string
}>(), {
 tone: 'neutral',
})

const resolvedTone = computed(() => {
 const allowed = new Set(['neutral', 'success', 'warning', 'danger', 'info'])
 return allowed.has(props.tone) ? props.tone : 'neutral'
})

const resolvedColor = computed(() => {
 if (resolvedTone.value === 'success') return 'success'
 if (resolvedTone.value === 'warning') return 'warning'
 if (resolvedTone.value === 'danger') return 'error'
 if (resolvedTone.value === 'info') return 'info'
 return 'default'
})

const resolvedVariant = computed(() => (resolvedTone.value === 'neutral' ? 'outlined' : 'tonal'))
</script>
