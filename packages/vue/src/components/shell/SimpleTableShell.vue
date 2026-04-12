<template>
  <section class="efs-simpletableshell">
    <header class="efs-simpletableshell__header">
      <div>
        <h3 class="efs-simpletableshell__title">{{ props.title }}</h3>
        <p v-if="props.subtitle" class="efs-simpletableshell__subtitle">{{ props.subtitle }}</p>
      </div>
      <div class="efs-simpletableshell__meta">
        <span>{{ props.rowsLabel }} {{ props.items.length }}</span>
        <slot name="actions" />
      </div>
    </header>
    <div class="efs-simpletableshell__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'SimpleTableShell' })

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  columns?: unknown[]
  items?: unknown[]
  rowsLabel?: string
}>(), {
  title: '',
  subtitle: '',
  columns: () => [],
  items: () => [],
  rowsLabel: 'Rows:',
})
</script>

<style scoped>
.efs-simpletableshell {
  padding: 20px;
  border-radius: 20px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  display: grid;
  gap: 16px;
}

.efs-simpletableshell__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: start;
}

.efs-simpletableshell__title {
  margin: 0;
  font-size: 1.05rem;
}

.efs-simpletableshell__subtitle,
.efs-simpletableshell__meta {
  color: var(--efs-text-muted, #64748b);
}

.efs-simpletableshell__subtitle {
  margin: 6px 0 0;
}

.efs-simpletableshell__meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
