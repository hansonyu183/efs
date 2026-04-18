<template>
 <VBtn
  class="efs-themeswitcher"
  :class="{ 'efs-themeswitcher--menu': props.mode === 'menu' }"
  variant="outlined"
  :aria-label="resolvedLabel"
  :title="resolvedLabel"
  @click="cycleTheme"
 >
  <span class="efs-themeswitcher__lead">
   <SemanticIcon :name="iconName" :label="resolvedLabel" aria-hidden="true" />
   <span v-if="props.mode === 'menu'" class="efs-themeswitcher__label">{{ resolvedLabel }}</span>
  </span>
  <span v-if="props.mode !== 'icon'" class="efs-themeswitcher__value">{{ currentLabel }}</span>
 </VBtn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VBtn } from 'vuetify/components'
import SemanticIcon from './SemanticIcon.vue'
import { useT } from '../i18n'

defineOptions({ name: 'ThemeSwitcher' })

type ThemeOption = {
 label?: string
 title?: string
 value: string
}

interface ThemeSwitcherProps {
 modelValue?: string
 mode?: 'pill' | 'menu' | 'icon'
}

const props = withDefaults(defineProps<ThemeSwitcherProps>(), {
 modelValue: 'light',
 mode: 'pill',
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: string): void
}>()

const t = useT()
const resolvedLabel = computed(() => t('efs.shell.themeLabel', '主题'))
const resolvedOptions = computed<ThemeOption[]>(() => [
 { label: t('efs.themeOptions.light', '明'), value: 'light' },
 { label: t('efs.themeOptions.dark', '暗'), value: 'dark' },
])

const currentLabel = computed(() => {
 const matched = resolvedOptions.value.find((option) => option.value === props.modelValue)
 return matched?.label || matched?.title || props.modelValue
})

const iconName = computed(() => (props.modelValue === 'dark' ? 'dark' : 'light'))

function cycleTheme() {
 if (resolvedOptions.value.length === 0) return
 const currentIndex = resolvedOptions.value.findIndex((option) => option.value === props.modelValue)
 const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % resolvedOptions.value.length : 0
 const nextValue = resolvedOptions.value[nextIndex]?.value ?? props.modelValue
 emit('update:modelValue', nextValue)
}
</script>

<style scoped>
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
</style>
