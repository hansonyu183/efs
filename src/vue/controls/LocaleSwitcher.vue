<template>
 <VBtn
  class="efs-localeswitcher"
  :class="{ 'efs-localeswitcher--menu': props.mode === 'menu' }"
  variant="outlined"
  :aria-label="resolvedLabel"
  :title="resolvedLabel"
  @click="cycleLocale"
 >
  <span class="efs-localeswitcher__lead">
   <span class="efs-localeswitcher__badge" aria-hidden="true">{{ currentLabel }}</span>
   <span v-if="props.mode === 'menu'" class="efs-localeswitcher__label">{{ resolvedLabel }}</span>
  </span>
  <span v-if="props.mode !== 'icon'" class="efs-localeswitcher__value">{{ currentLabel }}</span>
 </VBtn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VBtn } from 'vuetify/components'
import { useT } from '../i18n'

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

const t = useT()
const resolvedLabel = computed(() => t('efs.shell.localeLabel', '语言'))
const resolvedOptions = computed<LocaleOption[]>(() => [
 { label: t('efs.localeOptions.zh-CN', '中'), value: 'zh-CN' },
 { label: t('efs.localeOptions.en-US', 'EN'), value: 'en-US' },
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
</script>

<style scoped>
.efs-localeswitcher__lead {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 min-width: 0;
}

.efs-localeswitcher__badge {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 min-width: 1.8rem;
 font-size: 0.85rem;
 font-weight: 700;
 line-height: 1;
 text-transform: uppercase;
}

.efs-localeswitcher__label,
.efs-localeswitcher__value {
 font-size: 0.85rem;
}

.efs-localeswitcher__label {
 font-weight: 600;
}
</style>
