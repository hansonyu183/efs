<template>
 <VChip class="efs-apptag" size="small" variant="tonal">
  <slot />
 </VChip>
</template>

<script setup lang="ts">
import { VChip } from 'vuetify/components'

defineOptions({ name: 'AppTag' })
</script>
