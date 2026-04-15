<template>
 <section class="efs-reportshell">
  <header class="efs-reportshell__header">
   <div>
    <h3 class="efs-reportshell__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-reportshell__subtitle">{{ props.subtitle }}</p>
    <p v-if="props.description" class="efs-reportshell__description">{{ props.description }}</p>
   </div>
   <div class="efs-reportshell__actions">
    <slot name="header-actions" />
    <button
     v-if="props.exportable"
     type="button"
     class="efs-reportshell__button"
     :disabled="props.busy"
     @click="emit('export')"
    >
     {{ props.exportLabel }}
    </button>
   </div>
  </header>

  <section v-if="$slots.query || resolvedQuery.summary" class="efs-reportshell__query">
   <div class="efs-reportshell__query-header">
    <strong>{{ resolvedQuery.title }}</strong>
    <span v-if="resolvedQuery.summary" class="efs-reportshell__query-summary">{{ resolvedQuery.summary }}</span>
   </div>
   <div class="efs-reportshell__query-body">
    <slot name="query">
     <div class="efs-reportshell__empty">{{ resolvedQuery.emptyText }}</div>
    </slot>
   </div>
  </section>

  <section class="efs-reportshell__result">
   <div class="efs-reportshell__result-header">
    <strong>{{ resolvedResult.title }}</strong>
    <div class="efs-reportshell__result-meta">
     <span v-if="resolvedResult.countText">{{ resolvedResult.countText }}</span>
     <slot name="result-actions" />
    </div>
   </div>
   <div class="efs-reportshell__result-body">
    <slot name="result">
     <div class="efs-reportshell__empty">{{ resolvedResult.emptyText }}</div>
    </slot>
   </div>
  </section>

  <footer v-if="$slots.footer" class="efs-reportshell__footer">
   <slot name="footer" />
  </footer>
 </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ReportPanel' })

interface ReportPanelProps {
 title?: string
 subtitle?: string
 description?: string
 exportable?: boolean
 exportLabel?: string
 busy?: boolean
 query?: {
  title?: string
  summary?: string
  emptyText?: string
 }
 result?: {
  title?: string
  countText?: string
  emptyText?: string
 }
}

const props = withDefaults(defineProps<ReportPanelProps>(), {
 title: '',
 subtitle: '',
 description: '',
 exportable: false,
 exportLabel: '导出',
 busy: false,
 query: () => ({
  title: '查询条件',
  summary: '',
  emptyText: '未配置报表查询条件。',
 }),
 result: () => ({
  title: '结果列表',
  countText: '',
  emptyText: '暂无报表结果。',
 }),
})

const emit = defineEmits<{
 (e: 'export'): void
}>()

const resolvedQuery = computed(() => ({
 title: props.query?.title ?? '查询条件',
 summary: props.query?.summary ?? '',
 emptyText: props.query?.emptyText ?? '未配置报表查询条件。',
}))

const resolvedResult = computed(() => ({
 title: props.result?.title ?? '结果列表',
 countText: props.result?.countText ?? '',
 emptyText: props.result?.emptyText ?? '暂无报表结果。',
}))
</script>

<style scoped>
.efs-reportshell {
 padding: 20px;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
 display: grid;
 gap: 16px;
}

.efs-reportshell__header,
.efs-reportshell__query-header,
.efs-reportshell__result-header {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-reportshell__title {
 margin: 0;
 font-size: 1.05rem;
}

.efs-reportshell__subtitle,
.efs-reportshell__description,
.efs-reportshell__query-summary,
.efs-reportshell__result-meta,
.efs-reportshell__empty {
 color: var(--efs-text-muted, #64748b);
}

.efs-reportshell__subtitle,
.efs-reportshell__description {
 margin: 6px 0 0;
}

.efs-reportshell__actions,
.efs-reportshell__result-meta {
 display: flex;
 align-items: center;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-reportshell__query,
.efs-reportshell__result {
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 16px;
 background: var(--efs-surface-soft, #f8fafc);
 padding: 16px;
 display: grid;
 gap: 12px;
}

.efs-reportshell__button {
 min-height: 40px;
 border-radius: 10px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 padding: 0 14px;
 cursor: pointer;
}

.efs-reportshell__result-body,
.efs-reportshell__query-body {
 min-width: 0;
}
</style>
