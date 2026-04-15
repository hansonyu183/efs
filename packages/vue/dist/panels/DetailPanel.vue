<template>
 <section class="efs-detailshell">
  <header class="efs-detailshell__header">
   <div class="efs-detailshell__heading">
    <h3 class="efs-detailshell__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-detailshell__subtitle">{{ props.subtitle }}</p>
    <p v-if="props.description" class="efs-detailshell__description">{{ props.description }}</p>
   </div>
   <div class="efs-detailshell__meta">
    <span>{{ resolvedFieldsLabel }} {{ normalizedFields.length }}</span>
    <slot name="actions" />
   </div>
  </header>

  <div v-if="$slots.default" class="efs-detailshell__custom">
   <slot />
  </div>

  <div v-else-if="normalizedFields.length > 0" class="efs-detailshell__grid" :style="gridStyle">
   <article v-for="field in normalizedFields" :key="field.key" class="efs-detailshell__field">
    <span class="efs-detailshell__label">{{ field.label }}</span>
    <strong class="efs-detailshell__value">{{ field.value }}</strong>
    <span v-if="field.hint" class="efs-detailshell__hint">{{ field.hint }}</span>
   </article>
  </div>

  <div v-else class="efs-detailshell__empty">{{ resolvedEmptyText }}</div>

  <footer v-if="$slots.footer" class="efs-detailshell__footer">
   <slot name="footer" />
  </footer>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveLabel, resolveOptionalLabel } from '../shared/label-resolver'

defineOptions({ name: 'DetailPanel' })

interface DetailField {
 key: string
 value?: unknown
}

const props = withDefaults(defineProps<{
 title?: string
 subtitle?: string
 description?: string
 fields?: DetailField[]
 columns?: 1 | 2 | 3
}>(), {
 title: '',
 subtitle: '',
 description: '',
 fields: () => [],
 columns: 2,
})

const instance = getCurrentInstance()
const resolvedFieldsLabel = computed(() => resolveOptionalLabel({ key: 'fieldsLabel', instance, namespaces: ['efs.detailPanel'] }) || '字段数：')
const resolvedEmptyText = computed(() => resolveOptionalLabel({ key: 'emptyText', instance, namespaces: ['efs.detailPanel'] }) || '暂无详情字段。')

const normalizedFields = computed(() => props.fields.map((field) => ({
 key: field.key,
 label: resolveLabel({
  key: field.key,
  instance,
  namespaces: ['resourceCrud.detailFields', 'detailFields', 'fields'],
 }),
 value: field.value ?? '-',
 hint: resolveOptionalLabel({
  key: field.key,
  instance,
  namespaces: ['resourceCrud.detailFieldHints', 'detailFieldHints', 'hints'],
 }),
})))

const gridStyle = computed(() => ({
 '--efs-detailshell-columns': String(props.columns),
}))
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

.efs-detailshell__heading {
 min-width: 0;
}

.efs-detailshell__title {
 margin: 0;
 font-size: 1.05rem;
}

.efs-detailshell__subtitle,
.efs-detailshell__meta,
.efs-detailshell__description,
.efs-detailshell__hint,
.efs-detailshell__empty {
 color: var(--efs-text-muted, #64748b);
}

.efs-detailshell__subtitle,
.efs-detailshell__description {
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
 grid-template-columns: repeat(var(--efs-detailshell-columns, 2), minmax(0, 1fr));
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

@media (max-width: 1100px) {
 .efs-detailshell__grid {
  grid-template-columns: repeat(min(2, var(--efs-detailshell-columns, 2)), minmax(0, 1fr));
 }
}

@media (max-width: 960px) {
 .efs-detailshell__grid {
  grid-template-columns: 1fr;
 }
}
</style>
