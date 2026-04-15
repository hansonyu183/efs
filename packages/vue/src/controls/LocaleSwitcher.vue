<template>
 <button
  type="button"
  class="efs-localeswitcher"
  :class="{ 'efs-localeswitcher--menu': props.mode === 'menu' }"
  :aria-label="resolvedLabel"
  :title="resolvedLabel"
  @click="cycleLocale"
 >
  <span class="efs-localeswitcher__lead">
   <SemanticIcon name="locale" :label="resolvedLabel" aria-hidden="true" />
   <span v-if="props.mode === 'menu'" class="efs-localeswitcher__label">{{ resolvedLabel }}</span>
  </span>
  <span v-if="props.mode !== 'icon'" class="efs-localeswitcher__value">{{ currentLabel }}</span>
 </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import SemanticIcon from './SemanticIcon.vue'
import { EFS_I18N_CONTEXT } from '../shared/efs-i18n'

defineOptions({ name: 'LocaleSwitcher' })

type LocaleOption = {
 label?: string
 title?: string
 value: string
}

interface LocaleSwitcherProps {
 modelValue?: string
 mode?: 'pill' | 'menu' | 'icon'
}

const props = withDefaults(defineProps<LocaleSwitcherProps>(), {
 modelValue: 'zh-CN',
 mode: 'pill',
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: string): void
}>()

const i18nContext = inject(EFS_I18N_CONTEXT, null)
const resolvedLabel = computed(() => resolveCopy('efs.shell.localeLabel', '语言'))
const resolvedOptions = computed<LocaleOption[]>(() => [
 { label: resolveCopy('efs.localeOptions.zh-CN', '中'), value: 'zh-CN' },
 { label: resolveCopy('efs.localeOptions.en-US', 'EN'), value: 'en-US' },
])

const currentLabel = computed(() => {
 const matched = resolvedOptions.value.find((option) => option.value === props.modelValue)
 return matched?.label || matched?.title || props.modelValue
})

function cycleLocale() {
 if (resolvedOptions.value.length === 0) return
 const currentIndex = resolvedOptions.value.findIndex((option) => option.value === props.modelValue)
 const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % resolvedOptions.value.length : 0
 const nextValue = resolvedOptions.value[nextIndex]?.value ?? props.modelValue
 emit('update:modelValue', nextValue)
}

function resolveCopy(key: string, fallback: string) {
 return i18nContext?.translate(key) || fallback
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
