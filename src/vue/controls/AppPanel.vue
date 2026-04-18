<template>
 <VCard class="efs-apppanel" :class="{ 'efs-apppanel--borderless': props.borderless }" :flat="props.borderless">
  <template v-if="props.title || props.subtitle || $slots.actions">
   <VCardItem class="efs-apppanel__header">
    <template #title>
     <div v-if="props.title" class="efs-apppanel__title">{{ props.title }}</div>
    </template>
    <template #subtitle>
     <div v-if="props.subtitle" class="efs-apppanel__subtitle">{{ props.subtitle }}</div>
    </template>
    <template v-if="$slots.actions" #append>
     <div class="efs-apppanel__actions">
      <slot name="actions" />
     </div>
    </template>
   </VCardItem>
  </template>
  <VCardText :class="{ 'efs-apppanel__content--unpadded': !props.padded }">
   <slot />
  </VCardText>
 </VCard>
</template>

<script setup lang="ts">
import { VCard, VCardItem, VCardText } from 'vuetify/components'

defineOptions({ name: 'AppPanel' })

interface AppPanelProps {
 title?: string
 subtitle?: string
 padded?: boolean
 borderless?: boolean
}

const props = withDefaults(defineProps<AppPanelProps>(), {
 title: '',
 subtitle: '',
 padded: true,
 borderless: false,
})
</script>

<style scoped>
.efs-apppanel--borderless {
 box-shadow: none;
}

.efs-apppanel__content--unpadded {
 padding: 0 !important;
}

.efs-apppanel__subtitle {
 opacity: 0.8;
}

.efs-apppanel__actions {
 display: inline-flex;
 align-items: center;
 gap: 8px;
}
</style>
