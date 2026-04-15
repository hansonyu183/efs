<template>
 <section class="efs-simpletablepanel">
  <header class="efs-simpletablepanel__header">
   <div>
    <h3 class="efs-simpletablepanel__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-simpletablepanel__subtitle">{{ props.subtitle }}</p>
   </div>
   <div class="efs-simpletablepanel__meta">
    <span>{{ resolvedRowsLabel }} {{ props.items.length }}</span>
    <slot name="actions" />
   </div>
  </header>
  <div class="efs-simpletablepanel__body">
   <slot />
  </div>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveOptionalLabel } from '../shared/label-resolver'

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
.efs-simpletablepanel {
 padding: 20px;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
 display: grid;
 gap: 16px;
}

.efs-simpletablepanel__header {
 display: flex;
 justify-content: space-between;
 gap: 12px;
 flex-wrap: wrap;
 align-items: start;
}

.efs-simpletablepanel__title {
 margin: 0;
 font-size: 1.05rem;
}

.efs-simpletablepanel__subtitle,
.efs-simpletablepanel__meta {
 color: var(--efs-text-muted, #64748b);
}

.efs-simpletablepanel__subtitle {
 margin: 6px 0 0;
}

.efs-simpletablepanel__meta {
 display: flex;
 gap: 12px;
 align-items: center;
 flex-wrap: wrap;
}
</style>
