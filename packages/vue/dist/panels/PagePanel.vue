<template>
 <section class="efs-pagepanel">
  <header v-if="props.title || props.subtitle || $slots.actions" class="efs-pagepanel__header">
   <div class="efs-pagepanel__heading">
    <h2 v-if="props.title" class="efs-pagepanel__title">{{ props.title }}</h2>
    <p v-if="props.subtitle" class="efs-pagepanel__subtitle">{{ props.subtitle }}</p>
   </div>
   <div v-if="$slots.actions" class="efs-pagepanel__actions">
    <slot name="actions" />
   </div>
  </header>
  <div class="efs-pagepanel__body">
   <slot />
  </div>
 </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'PagePanel' })

interface PagePanelProps {
 title?: string
 subtitle?: string
}

const props = withDefaults(defineProps<PagePanelProps>(), {
 title: '',
 subtitle: '',
})
</script>

<style scoped>
.efs-pagepanel {
 display: grid;
 gap: 16px;
}

.efs-pagepanel__header {
 display: flex;
 justify-content: space-between;
 align-items: end;
 gap: 16px;
 flex-wrap: wrap;
}

.efs-pagepanel__heading {
 min-width: 0;
}

.efs-pagepanel__title {
 margin: 0;
 font-size: 1.5rem;
 line-height: 1.2;
}

.efs-pagepanel__subtitle {
 margin: 6px 0 0;
 color: var(--efs-text-muted, #64748b);
}

.efs-pagepanel__actions {
 display: flex;
 align-items: center;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-pagepanel__body {
 min-width: 0;
}
</style>
