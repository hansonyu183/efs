<template>
 <button
  type="button"
  class="efs-localeswitcher"
  :class="{ 'efs-localeswitcher--menu': props.mode === 'menu' }"
  :aria-label="props.label"
  :title="props.label"
  @click="cycleLocale"
 >
  <span class="efs-localeswitcher__lead">
   <SemanticIcon name="locale" :label="props.label" aria-hidden="true" />
   <span v-if="props.mode === 'menu'" class="efs-localeswitcher__label">{{ props.label }}</span>
  </span>
  <span v-if="props.mode !== 'icon'" class="efs-localeswitcher__value">{{ currentLabel }}</span>
 </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SemanticIcon from './SemanticIcon.vue'

defineOptions({ name: 'LocaleSwitcher' })

type LocaleOption = {
 label?: string
 title?: string
 value: string
}

interface LocaleSwitcherProps {
 modelValue?: string
 label?: string
 options?: LocaleOption[]
 mode?: 'pill' | 'menu' | 'icon'
}

const props = withDefaults(defineProps<LocaleSwitcherProps>(), {
 modelValue: 'zh-CN',
 label: '语言',
 options: () => [
  { label: '中', value: 'zh-CN' },
  { label: 'EN', value: 'en-US' },
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

function cycleLocale() {
 if (props.options.length === 0) return
 const currentIndex = props.options.findIndex((option) => option.value === props.modelValue)
 const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % props.options.length : 0
 const nextValue = props.options[nextIndex]?.value ?? props.modelValue
 emit('update:modelValue', nextValue)
}
</script>

<style scoped>
.efs-localeswitcher {
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

.efs-localeswitcher:hover {
 background: var(--efs-surface, #ffffff);
}

.efs-localeswitcher--menu {
 width: 100%;
 min-height: 40px;
 border-radius: 10px;
 justify-content: space-between;
}

.efs-localeswitcher__lead {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 min-width: 0;
}

.efs-localeswitcher__label,
.efs-localeswitcher__value {
 font-size: 0.85rem;
}

.efs-localeswitcher__label {
 font-weight: 600;
}

.efs-localeswitcher__value {
 color: var(--efs-text-muted, #64748b);
}
</style>
