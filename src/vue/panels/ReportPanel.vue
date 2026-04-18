<template>
 <AppPanel class="efs-reportshell" :title="props.title" :subtitle="props.subtitle">
  <template #actions>
   <div class="efs-reportshell__actions">
    <slot name="header-actions" />
    <AppButton
     v-if="props.exportable"
     variant="primary"
     :disabled="props.busy"
     @click="emit('export')"
    >
     {{ resolvedExportLabel }}
    </AppButton>
   </div>
  </template>

  <p v-if="props.description" class="efs-reportshell__description">{{ props.description }}</p>

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
 </AppPanel>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import AppButton from '../controls/AppButton.vue'
import AppPanel from '../controls/AppPanel.vue'
import { resolveOptionalLabel } from '../../model/resource/label-resolver'

defineOptions({ name: 'ReportPanel' })

interface ReportPanelProps {
 title?: string
 subtitle?: string
 description?: string
 exportable?: boolean
 busy?: boolean
 query?: {
  summary?: string
 }
 result?: {
  countText?: string
 }
}

const props = withDefaults(defineProps<ReportPanelProps>(), {
 title: '',
 subtitle: '',
 description: '',
 exportable: false,
 busy: false,
  query: () => ({
  summary: '',
 }),
 result: () => ({
  countText: '',
 }),
})

const emit = defineEmits<{
 (e: 'export'): void
}>()

const instance = getCurrentInstance()
const resolvedExportLabel = computed(() => resolveOptionalLabel({ key: 'exportLabel', instance, namespaces: ['efs.reportPanel'] }) || '导出')
const resolvedQuery = computed(() => ({
 title: resolveOptionalLabel({ key: 'queryTitle', instance, namespaces: ['efs.reportPanel'] }) || '查询条件',
 summary: props.query?.summary ?? '',
 emptyText: resolveOptionalLabel({ key: 'queryEmptyText', instance, namespaces: ['efs.reportPanel'] }) || '未配置报表查询条件。',
}))

const resolvedResult = computed(() => ({
 title: resolveOptionalLabel({ key: 'resultTitle', instance, namespaces: ['efs.reportPanel'] }) || '结果列表',
 countText: props.result?.countText ?? '',
 emptyText: resolveOptionalLabel({ key: 'resultEmptyText', instance, namespaces: ['efs.reportPanel'] }) || '暂无报表结果。',
}))
</script>

<style scoped>
.efs-reportshell__header,
.efs-reportshell__query-header,
.efs-reportshell__result-header {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
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
 border-radius: 16px;
 background: color-mix(in srgb, var(--v-theme-surface) 86%, transparent);
 padding: 16px;
 display: grid;
 gap: 12px;
}

.efs-reportshell__result-body,
.efs-reportshell__query-body {
 min-width: 0;
}
</style>
