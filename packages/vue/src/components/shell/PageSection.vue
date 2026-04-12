<template>
  <section class="efs-pagesection">
    <header v-if="props.title || props.subtitle || $slots.actions" class="efs-pagesection__header">
      <div class="efs-pagesection__heading">
        <h2 v-if="props.title" class="efs-pagesection__title">{{ props.title }}</h2>
        <p v-if="props.subtitle" class="efs-pagesection__subtitle">{{ props.subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="efs-pagesection__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="efs-pagesection__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageSection' })

interface PageSectionProps {
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<PageSectionProps>(), {
  title: '',
  subtitle: '',
})
</script>

<style scoped>
.efs-pagesection {
  display: grid;
  gap: 16px;
}

.efs-pagesection__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
}

.efs-pagesection__heading {
  min-width: 0;
}

.efs-pagesection__title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.2;
}

.efs-pagesection__subtitle {
  margin: 6px 0 0;
  color: var(--efs-text-muted, #64748b);
}

.efs-pagesection__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.efs-pagesection__body {
  min-width: 0;
}
</style>
