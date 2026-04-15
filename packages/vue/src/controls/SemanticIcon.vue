<template>
 <span class="efs-semantic-icon" :class="sizeClass" :aria-label="label" role="img">
  {{ glyph }}
 </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveSemanticIcon } from '../shared/semantic-icons'

defineOptions({ name: 'SemanticIcon' })

interface SemanticIconProps {
 name?: string
 fallback?: string
 label?: string
 size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<SemanticIconProps>(), {
 name: '',
 fallback: '•',
 label: '',
 size: 'md',
})

const glyph = computed(() => resolveSemanticIcon(props.name, props.fallback))
const sizeClass = computed(() => `efs-semantic-icon--${props.size}`)
</script>

<style scoped>
.efs-semantic-icon {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 width: 1.25rem;
 height: 1.25rem;
 line-height: 1;
 font-style: normal;
 font-weight: 700;
 flex-shrink: 0;
}

.efs-semantic-icon--sm {
 width: 1rem;
 height: 1rem;
 font-size: 0.85rem;
}

.efs-semantic-icon--md {
 font-size: 1rem;
}

.efs-semantic-icon--lg {
 width: 1.5rem;
 height: 1.5rem;
 font-size: 1.15rem;
}
</style>
