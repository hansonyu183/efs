<template>
 <VIcon v-if="glyph" class="efs-semantic-icon" :class="sizeClass" :icon="glyph" :aria-label="label" role="img" />
 <span v-else class="efs-semantic-icon efs-semantic-icon--fallback" :class="sizeClass" :aria-label="label" role="img">{{ fallbackText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VIcon } from 'vuetify/components'
import { resolveSemanticIcon } from '../../model/app/semantic-icons'

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

const glyph = computed(() => resolveSemanticIcon(props.name))
const fallbackText = computed(() => props.fallback)
const sizeClass = computed(() => `efs-semantic-icon--${props.size}`)
</script>

<style scoped>
.efs-semantic-icon {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 flex-shrink: 0;
}

.efs-semantic-icon--fallback {
 line-height: 1;
}

.efs-semantic-icon--sm {
 font-size: 16px;
}

.efs-semantic-icon--md {
 font-size: 20px;
}

.efs-semantic-icon--lg {
 font-size: 24px;
}
</style>
