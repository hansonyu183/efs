<template>
  <section class="efs-apppanel">
    <header v-if="props.title || props.subtitle" class="efs-apppanel__header">
      <h3 v-if="props.title" class="efs-apppanel__title">{{ props.title }}</h3>
      <p v-if="props.subtitle" class="efs-apppanel__subtitle">{{ props.subtitle }}</p>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppPanel' })

interface AppPanelProps {
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<AppPanelProps>(), {
  title: '',
  subtitle: '',
})
</script>

<style scoped>
.efs-apppanel {
  padding: 24px;
  border-radius: 24px;
  background: var(--efs-surface, #fff);
  border: 1px solid var(--efs-border, #dbe3ef);
  box-shadow: var(--efs-shadow, 0 18px 40px rgba(15, 23, 42, 0.08));
}

.efs-apppanel__header {
  margin-bottom: 18px;
}

.efs-apppanel__title {
  margin: 0;
  font-size: 1.35rem;
}

.efs-apppanel__subtitle {
  margin: 8px 0 0;
  color: var(--efs-text-muted, #64748b);
}
</style>
