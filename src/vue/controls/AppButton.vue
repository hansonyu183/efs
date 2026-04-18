<template>
 <VBtn
  :type="props.type"
  class="efs-appbutton"
  :class="[`efs-appbutton--${props.size}`]"
  :variant="resolvedVariant"
  :color="resolvedColor"
  :disabled="props.disabled"
  :loading="props.loading"
  :block="props.block"
  :size="resolvedSize"
 >
  <template v-if="$slots.leading" #prepend>
   <slot name="leading" />
  </template>
  <slot />
  <template v-if="$slots.trailing" #append>
   <slot name="trailing" />
  </template>
 </VBtn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VBtn } from 'vuetify/components'

defineOptions({ name: 'AppButton' })

interface AppButtonProps {
 type?: 'button' | 'submit' | 'reset'
 variant?: 'default' | 'primary' | 'danger' | 'ghost'
 size?: 'sm' | 'md' | 'lg'
 disabled?: boolean
 loading?: boolean
 block?: boolean
}

const props = withDefaults(defineProps<AppButtonProps>(), {
 type: 'button',
 variant: 'default',
 size: 'md',
 disabled: false,
 loading: false,
 block: false,
})

const resolvedVariant = computed(() => {
 if (props.variant === 'ghost') return 'text'
 if (props.variant === 'default') return 'outlined'
 return 'flat'
})

const resolvedColor = computed(() => {
 if (props.variant === 'primary') return 'primary'
 if (props.variant === 'danger') return 'error'
 return undefined
})

const resolvedSize = computed(() => {
 if (props.size === 'sm') return 'small'
 if (props.size === 'lg') return 'large'
 return 'default'
})
</script>

<style scoped>
.efs-appbutton--sm {
 --v-btn-height: 36px;
}

.efs-appbutton--lg {
 --v-btn-height: 48px;
}
</style>
