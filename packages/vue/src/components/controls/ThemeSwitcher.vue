<template>
 <button
  type="button"
  class="efs-themeswitcher"
  :class="{ 'efs-themeswitcher--menu': props.mode === 'menu' }"
  :aria-label="props.label"
  :title="props.label"
  @click="cycleTheme"
 >
  <span class="efs-themeswitcher__lead">
   <SemanticIcon :name="iconName" :label="props.label" aria-hidden="true" />
   <span v-if="props.mode === 'menu'" class="efs-themeswitcher__label">{{ props.label }}</span>
  </span>
  <span class="efs-themeswitcher__value">{{ currentLabel }}</span>
 </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SemanticIcon from './SemanticIcon.vue'

defineOptions({ name: 'ThemeSwitcher' })

type ThemeOption = {
 label?: string
 title?: string
 value: string
}

interface ThemeSwitcherProps {
 modelValue?: string
 label?: string
 options?: ThemeOption[]
 mode?: 'pill' | 'menu'
}

const props = withDefaults(defineProps<ThemeSwitcherProps>(), {
 modelValue: 'light',
 label: '主题',
 options: () => [
  { label: '明', value: 'light' },
  { label: '暗', value: 'dark' },
 ],
 mode: 'pill',
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: string): void
}>()

const currentLabel = computed(() => {
 const matched = props.options.find((option) => option.value === props.modelValue)
 return matched?.label || matched?.title || props.modelValue
})

const iconName = computed(() => (props.modelValue === 'dark' ? 'dark' : 'light'))

function cycleTheme() {
 if (props.options.length === 0) return
 const currentIndex = props.options.findIndex((option) => option.value === props.modelValue)
 const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % props.options.length : 0
 const nextValue = props.options[nextIndex]?.value ?? props.modelValue
 emit('update:modelValue', nextValue)
}
</script>

<style scoped>
.efs-themeswitcher {
 min-height: 38px;
 min-width: 38px;
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 999px;
 background: color-mix(in srgb, var(--efs-surface, #ffffff) 94%, transparent);
 color: var(--efs-text, #172033);
 padding: 0 12px;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 gap: 8px;
 cursor: pointer;
}

.efs-themeswitcher:hover {
 background: var(--efs-surface, #ffffff);
}

.efs-themeswitcher--menu {
 width: 100%;
 min-height: 40px;
 border-radius: 10px;
 justify-content: space-between;
}

.efs-themeswitcher__lead {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 min-width: 0;
}

.efs-themeswitcher__label,
.efs-themeswitcher__value {
 font-size: 0.85rem;
}

.efs-themeswitcher__label {
 font-weight: 600;
}

.efs-themeswitcher__value {
 color: var(--efs-text-muted, #64748b);
}
</style>
