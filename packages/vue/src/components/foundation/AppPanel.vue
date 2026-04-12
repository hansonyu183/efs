<template>
  <section class="efs-apppanel" :class="{ 'efs-apppanel--borderless': props.borderless, 'efs-apppanel--unpadded': !props.padded }">
    <header v-if="props.title || props.subtitle || $slots.actions" class="efs-apppanel__header">
      <div class="efs-apppanel__heading">
        <h3 v-if="props.title" class="efs-apppanel__title">{{ props.title }}</h3>
        <p v-if="props.subtitle" class="efs-apppanel__subtitle">{{ props.subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="efs-apppanel__actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
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
.efs-apppanel {
  padding: 24px;
  border-radius: 24px;
  background: var(--efs-surface, #fff);
  border: 1px solid var(--efs-border, #dbe3ef);
  box-shadow: var(--efs-shadow, 0 18px 40px rgba(15, 23, 42, 0.08));
}

.efs-apppanel--unpadded {
  padding: 0;
}

.efs-apppanel--borderless {
  border-color: transparent;
  box-shadow: none;
}

.efs-apppanel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.efs-apppanel__heading {
  min-width: 0;
}

.efs-apppanel__title {
  margin: 0;
  font-size: 1.35rem;
}

.efs-apppanel__subtitle {
  margin: 8px 0 0;
  color: var(--efs-text-muted, #64748b);
}

.efs-apppanel__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
