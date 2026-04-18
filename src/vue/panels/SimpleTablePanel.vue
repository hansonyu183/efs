<template>
 <AppPanel class="efs-simpletablepanel" :title="props.title" :subtitle="props.subtitle">
  <template #actions>
   <div class="efs-simpletablepanel__meta">
    <span>{{ resolvedRowsLabel }} {{ props.items.length }}</span>
    <slot name="actions" />
   </div>
  </template>
  <div class="efs-simpletablepanel__body">
   <slot />
  </div>
 </AppPanel>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import AppPanel from '../controls/AppPanel.vue'
import { resolveOptionalLabel } from '../../model/resource/label-resolver'

defineOptions({ name: 'SimpleTablePanel' })

const props = withDefaults(defineProps<{
 title?: string
 subtitle?: string
 columns?: unknown[]
 items?: unknown[]
}>(), {
 title: '',
 subtitle: '',
 columns: () => [],
 items: () => [],
})

const instance = getCurrentInstance()
const resolvedRowsLabel = computed(() => resolveOptionalLabel({ key: 'rowsLabel', instance, namespaces: ['efs.simpleTable'] }) || '当前行数：')
</script>

<style scoped>
.efs-simpletablepanel__meta {
 display: flex;
 gap: 12px;
 align-items: center;
 flex-wrap: wrap;
 color: var(--efs-text-muted, #64748b);
}

.efs-simpletablepanel__body {
 display: grid;
 gap: 12px;
}
</style>
