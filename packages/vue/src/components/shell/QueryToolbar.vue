<template>
 <section class="efs-querytoolbarshell" @keydown.enter="onEnter">
  <header v-if="props.title || props.subtitle || $slots.headerActions" class="efs-querytoolbarshell__header">
   <div>
    <h3 v-if="props.title" class="efs-querytoolbarshell__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-querytoolbarshell__subtitle">{{ props.subtitle }}</p>
   </div>
   <div v-if="$slots.headerActions" class="efs-querytoolbarshell__header-actions">
    <slot name="headerActions" />
   </div>
  </header>

  <div class="efs-querytoolbarshell__filters">
   <slot name="filters" />
  </div>

  <div v-if="$slots.actions" class="efs-querytoolbarshell__actions">
   <slot name="actions" />
  </div>

  <div v-if="$slots.after" class="efs-querytoolbarshell__after">
   <slot name="after" />
  </div>
 </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'QueryToolbar' })

const props = withDefaults(defineProps<{
 title?: string
 subtitle?: string
 collapsible?: boolean
}>(), {
 title: '',
 subtitle: '',
 collapsible: false,
})

const emit = defineEmits<{
 (e: 'submit'): void
}>()

function onEnter(event: KeyboardEvent) {
 const target = event.target as HTMLElement | null
 if (target?.tagName === 'TEXTAREA') return
 event.preventDefault()
 emit('submit')
}
</script>

<style scoped>
.efs-querytoolbarshell {
 padding: 18px 20px;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
 display: grid;
 gap: 16px;
}

.efs-querytoolbarshell__header {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-querytoolbarshell__header-actions {
 display: flex;
 gap: 8px;
 flex-wrap: wrap;
}

.efs-querytoolbarshell__title {
 margin: 0;
 font-size: 1rem;
}

.efs-querytoolbarshell__subtitle {
 margin: 6px 0 0;
 color: var(--efs-text-muted, #64748b);
}

.efs-querytoolbarshell__filters {
 display: grid;
 gap: 12px;
}

.efs-querytoolbarshell__actions {
 display: flex;
 justify-content: space-between;
 gap: 12px;
 flex-wrap: wrap;
 padding-top: 4px;
}

.efs-querytoolbarshell__after {
 border-top: 1px solid var(--efs-border, #dbe3ef);
 padding-top: 12px;
}
</style>
