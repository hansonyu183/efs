<template>
  <section class="efs-detailshell">
    <header class="efs-detailshell__header">
      <div>
        <h3 class="efs-detailshell__title">{{ props.title }}</h3>
        <p v-if="props.subtitle" class="efs-detailshell__subtitle">{{ props.subtitle }}</p>
      </div>
      <div class="efs-detailshell__meta">
        <span>{{ props.fieldsLabel }} {{ props.fields.length }}</span>
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.default" class="efs-detailshell__custom">
      <slot />
    </div>

    <div v-else class="efs-detailshell__grid">
      <article v-for="field in props.fields" :key="field.key" class="efs-detailshell__field">
        <span class="efs-detailshell__label">{{ field.label ?? field.key }}</span>
        <strong class="efs-detailshell__value">{{ field.value ?? '-' }}</strong>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'DetailShell' })

interface DetailField {
  key: string
  label?: string
  value?: unknown
}

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  fields?: DetailField[]
  fieldsLabel?: string
}>(), {
  title: '',
  subtitle: '',
  fields: () => [],
  fieldsLabel: 'Fields:',
})
</script>

<style scoped>
.efs-detailshell {
  padding: 20px;
  border-radius: 20px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  display: grid;
  gap: 16px;
}

.efs-detailshell__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
  flex-wrap: wrap;
}

.efs-detailshell__title {
  margin: 0;
  font-size: 1.05rem;
}

.efs-detailshell__subtitle,
.efs-detailshell__meta {
  color: var(--efs-text-muted, #64748b);
}

.efs-detailshell__subtitle {
  margin: 6px 0 0;
}

.efs-detailshell__meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.efs-detailshell__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.efs-detailshell__field {
  padding: 14px;
  border-radius: 16px;
  background: var(--efs-surface-soft, #f8fafc);
  border: 1px solid var(--efs-border, #dbe3ef);
  display: grid;
  gap: 6px;
}

.efs-detailshell__label {
  color: var(--efs-text-muted, #64748b);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.efs-detailshell__value {
  font-size: 0.95rem;
  line-height: 1.45;
  word-break: break-word;
}

@media (max-width: 960px) {
  .efs-detailshell__grid {
    grid-template-columns: 1fr;
  }
}
</style>
