<template>
 <section class="efs-reportview">
  <ReportPanel
   :title="props.title"
   :subtitle="''"
   :description="''"
   :exportable="Boolean(props.controller?.handlers?.export)"
   :busy="resolvedBusy"
   :query="{ summary: querySummaryText }"
   :result="{ countText: resultCountText }"
   @export="handleExport"
  >
   <template #header-actions>
    <div v-if="visibleActions.length === 0" />
   </template>

   <template #query>
    <div v-if="props.queryFields.length > 0" class="efs-reportview__query-filters">
     <div class="efs-reportview__filters-grid">
      <AppField v-for="queryField in normalizedQueryFields" :key="queryField.key" :label="queryField.label">
       <AppSelect
        v-if="queryField.type === 'select'"
        :model-value="stringValue(localQueryValues[queryField.key])"
        :options="queryField.options"
        @update:model-value="(value) => updateQueryValue(queryField.key, value)"
       />
       <AppInput
        v-else
        :model-value="stringValue(localQueryValues[queryField.key])"
        :type="queryField.type"
        @update:model-value="(value) => updateQueryValue(queryField.key, value)"
       />
      </AppField>
     </div>
     <div class="efs-reportview__query-actions">
      <AppButton variant="primary" :disabled="resolvedBusy" @click="handleSearch">{{ resolvedSearchLabel }}</AppButton>
      <AppButton :disabled="resolvedBusy" @click="handleReset">{{ resolvedResetLabel }}</AppButton>
     </div>
    </div>
   </template>

   <template #result>
    <div class="efs-reportview__result">
     <section v-if="resolvedSummary.length > 0" class="efs-reportview__summary-grid">
      <DashboardCardPanel
       v-for="metric in resolvedSummary"
       :key="metric.key"
       :title="resolveMetricTitle(metric.key)"
       :value="metric.value ?? '-'"
       :subtitle="metric.note ?? ''"
       :eyebrow="metric.badge ?? ''"
      />
     </section>

     <div v-if="resolvedBusy" class="efs-reportview__state-wrap">
      <LoadingState variant="report" />
     </div>
     <div v-else-if="resolvedError" class="efs-reportview__state-wrap">
      <ErrorState variant="report" :detail="resolvedError" />
     </div>
     <div v-else-if="resolvedItems.length === 0" class="efs-reportview__state-wrap">
      <EmptyState variant="report" />
     </div>
     <DataTable
      v-else
      row-key="__reportRowKey"
      :columns="normalizedColumns"
      :rows="resultRows"
      :clickable="false"
      :visible-column-keys="visibleColumnKeys"
      :row-actions="[]"
      :selectable="false"
      :selected-row-keys="[]"
     />
    </div>
   </template>
  </ReportPanel>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue'
import AppButton from '../controls/AppButton.vue'
import AppField from '../controls/AppField.vue'
import AppInput from '../controls/AppInput.vue'
import AppSelect from '../controls/AppSelect.vue'
import ActionBar from '../interaction/ActionBar.vue'
import DataTable from '../interaction/DataTable.vue'
import EmptyState from '../interaction/EmptyState.vue'
import ErrorState from '../interaction/ErrorState.vue'
import LoadingState from '../interaction/LoadingState.vue'
import DashboardCardPanel from '../panels/DashboardCardPanel.vue'
import ReportPanel from '../panels/ReportPanel.vue'
import { resolveLabel, resolveOptionalLabel } from '../shared/label-resolver'
import type {
 ReportViewAction,
 ReportViewActionHandlerPayload,
 ReportViewController,
 ReportViewQueryField,
 ReportViewResultColumn,
 ReportViewSummaryMetric,
} from '../legacy/report-view-types'

defineOptions({ name: 'ReportView' })

interface ReportViewProps {
 title?: string
 queryFields?: ReportViewQueryField[]
 columns?: ReportViewResultColumn[]
 controller?: ReportViewController
 pageSizeOptions?: number[]
 storageKey?: string
}

const instance = getCurrentInstance()

const props = withDefaults(defineProps<ReportViewProps>(), {
 title: '',
 queryFields: () => [],
 columns: () => [],
 controller: undefined,
 pageSizeOptions: () => [10, 20, 50],
 storageKey: '',
})

const localQueryValues = ref<Record<string, string>>({})
const localPage = ref(1)
const localPageSize = ref(20)
const localItems = ref<Record<string, unknown>[]>([])
const localTotal = ref(0)
const localSummary = ref<ReportViewSummaryMetric[]>([])
const localBusy = ref(false)
const localError = ref('')
const visibleColumnKeys = ref<string[]>([])
const restoredFromSession = ref(false)
const storageReady = ref(false)

const normalizedQueryFields = computed(() => props.queryFields.map((field) => ({
 key: field.key,
 type: field.type ?? 'text',
 label: resolveQueryFieldLabel(field.key),
 options: field.options?.map((option) => ({
  title: resolveQueryOptionLabel(field.key, option.key),
  value: option.value,
  disabled: option.disabled,
 })) ?? [],
})))

const normalizedColumns = computed(() => props.columns.map((column) => ({
 key: column.key,
 render: column.render,
 formatter: column.formatter,
 visible: column.visible,
})))

const resolvedBusy = computed(() => props.controller?.state?.busy ?? localBusy.value)
const resolvedError = computed(() => props.controller?.state?.error ?? localError.value)
const resolvedItems = computed(() => props.controller?.state?.items ?? localItems.value)
const resolvedTotal = computed(() => props.controller?.state?.total ?? localTotal.value)
const resolvedSummary = computed(() => props.controller?.state?.summary ?? localSummary.value)
const resolvedPageCount = computed(() => Math.max(1, Math.ceil(resolvedTotal.value / Math.max(localPageSize.value, 1))))
const resolvedSearchLabel = computed(() => resolveOptionalLabel({ key: 'searchLabel', instance, namespaces: ['efs.reportView'] }) || '查询')
const resolvedResetLabel = computed(() => resolveOptionalLabel({ key: 'resetLabel', instance, namespaces: ['efs.reportView'] }) || '重置')
const resolvedFiltersSummaryLabel = computed(() => resolveOptionalLabel({ key: 'filtersSummaryLabel', instance, namespaces: ['efs.reportView'] }) || '筛选字段')
const resolvedTotalLabel = computed(() => resolveOptionalLabel({ key: 'totalLabel', instance, namespaces: ['efs.reportView'] }) || '总数')
const querySummaryText = computed(() => normalizedQueryFields.value.length > 0 ? `${resolvedFiltersSummaryLabel.value}：${normalizedQueryFields.value.length}` : '')
const resultCountText = computed(() => `${resolvedTotalLabel.value}：${resolvedTotal.value}`)
const stateStorageKey = computed(() => props.storageKey ? `efs:view-state:report:${props.storageKey}` : '')

const resultRows = computed(() => resolvedItems.value.map((item, index) => ({
 __reportRowKey: String(index + 1),
 ...item,
})))

const visibleActions = computed(() => (props.controller?.actions?.actions ?? [])
 .filter((action) => action.visible !== false)
 .map((action) => ({
  key: action.key,
  label: resolveActionLabel(action.key),
  variant: action.variant,
  disabled: resolvedBusy.value || action.disabled,
  visible: action.visible,
  onClick: () => dispatchAction(action),
 })))

watch(() => props.queryFields, () => {
 localQueryValues.value = buildDefaultQueryValues()
}, { immediate: true, deep: true })

watch(() => props.columns, () => {
 visibleColumnKeys.value = props.columns.filter((column) => column.visible !== false).map((column) => column.key)
}, { immediate: true, deep: true })

watch(() => props.controller?.state, () => {
 syncFromControllerState()
}, { immediate: true, deep: true })

watch([localQueryValues, localPage, localPageSize, localItems, localTotal, localSummary], () => {
 if (!storageReady.value) return
 persistSessionState()
}, { deep: true })

onMounted(() => {
 hydrateSessionState()
 storageReady.value = true
 if (props.controller?.handlers?.query && shouldRunInitialQuery()) runQuery()
})

function shouldRunInitialQuery() {
 return !restoredFromSession.value || localItems.value.length === 0
}

function syncFromControllerState() {
 const state = props.controller?.state
 if (!state) return
 localQueryValues.value = state.queryValues ? { ...buildDefaultQueryValues(), ...state.queryValues } : buildDefaultQueryValues()
 localPage.value = state.page && state.page > 0 ? state.page : 1
 localPageSize.value = state.pageSize && state.pageSize > 0 ? state.pageSize : 20
 localItems.value = state.items ?? []
 localTotal.value = state.total ?? localItems.value.length
 localSummary.value = state.summary ?? []
 localBusy.value = state.busy ?? false
 localError.value = state.error ?? ''
}

function hydrateSessionState() {
 if (typeof window === 'undefined' || !stateStorageKey.value || typeof window.localStorage === 'undefined') return
 try {
  const raw = window.localStorage.getItem(stateStorageKey.value)
  if (!raw) return
  const parsed = JSON.parse(raw) as {
   queryValues?: Record<string, string>
   page?: number
   pageSize?: number
   items?: Record<string, unknown>[]
   total?: number
   summary?: ReportViewSummaryMetric[]
  }
  localQueryValues.value = { ...buildDefaultQueryValues(), ...(parsed.queryValues ?? {}) }
  localPage.value = typeof parsed.page === 'number' && parsed.page > 0 ? parsed.page : localPage.value
  localPageSize.value = typeof parsed.pageSize === 'number' && parsed.pageSize > 0 ? parsed.pageSize : localPageSize.value
  localItems.value = Array.isArray(parsed.items) ? [...parsed.items] : []
  localTotal.value = typeof parsed.total === 'number' ? parsed.total : localItems.value.length
  localSummary.value = Array.isArray(parsed.summary) ? [...parsed.summary] : []
  setControllerState({
   queryValues: { ...localQueryValues.value },
   page: localPage.value,
   pageSize: localPageSize.value,
   items: [...localItems.value],
   total: localTotal.value,
   summary: [...localSummary.value],
   busy: false,
   error: '',
  })
  restoredFromSession.value = true
 } catch {
  restoredFromSession.value = false
 }
}

function persistSessionState() {
 if (typeof window === 'undefined' || !stateStorageKey.value || typeof window.localStorage === 'undefined') return
 try {
  window.localStorage.setItem(stateStorageKey.value, JSON.stringify({
   queryValues: localQueryValues.value,
   page: localPage.value,
   pageSize: localPageSize.value,
   items: localItems.value,
   total: localTotal.value,
   summary: localSummary.value,
  }))
 } catch {
  // ignore storage failures
 }
}

function buildDefaultQueryValues() {
 return Object.fromEntries(props.queryFields.map((field) => [field.key, '']))
}

function setControllerState(patch: Partial<NonNullable<ReportViewController['state']>>) {
 if (!props.controller) return
 props.controller.state = {
  ...(props.controller.state ?? {}),
  ...patch,
 }
}

function stringValue(value: unknown) {
 return value === null || value === undefined ? '' : String(value)
}

function updateQueryValue(key: string, value: string) {
 localQueryValues.value = {
  ...localQueryValues.value,
  [key]: value,
 }
 setControllerState({ queryValues: localQueryValues.value })
}

async function runQuery() {
 if (!props.controller?.handlers?.query) return
 localBusy.value = true
 localError.value = ''
 setControllerState({ busy: true, error: '' })
 try {
  const result = await props.controller.handlers.query({
   queryValues: localQueryValues.value,
   page: localPage.value,
   pageSize: localPageSize.value,
  })
  localItems.value = result.items
  localTotal.value = result.total ?? result.items.length
  localSummary.value = result.summary ?? []
  setControllerState({
   queryValues: localQueryValues.value,
   page: localPage.value,
   pageSize: localPageSize.value,
   items: localItems.value,
   total: localTotal.value,
   summary: localSummary.value,
   busy: false,
   error: '',
  })
 } catch (error) {
  const message = error instanceof Error ? error.message : '报表查询失败'
  localError.value = message
  setControllerState({ busy: false, error: message })
 } finally {
  localBusy.value = false
 }
}

function handleSearch() {
 localPage.value = 1
 setControllerState({ page: 1, queryValues: localQueryValues.value })
 runQuery()
}

function handleReset() {
 localQueryValues.value = buildDefaultQueryValues()
 localPage.value = 1
 setControllerState({ queryValues: localQueryValues.value, page: 1 })
 runQuery()
}

function handlePageChange(value: number) {
 localPage.value = value
 setControllerState({ page: value })
 runQuery()
}

function handlePageSizeChange(value: number) {
 localPageSize.value = value
 localPage.value = 1
 setControllerState({ pageSize: value, page: 1 })
 runQuery()
}

async function handleExport() {
 if (!props.controller?.handlers?.export || resolvedBusy.value) return
 await props.controller.handlers.export({
  queryValues: localQueryValues.value,
  page: localPage.value,
  pageSize: localPageSize.value,
  items: resolvedItems.value,
  total: resolvedTotal.value,
  summary: resolvedSummary.value,
 })
}

async function dispatchAction(action: ReportViewAction) {
 const handler = props.controller?.handlers?.actions?.[action.key]
 if (!handler) return
 const payload: ReportViewActionHandlerPayload = {
  key: action.key,
  scope: 'page',
  queryValues: localQueryValues.value,
  page: localPage.value,
  pageSize: localPageSize.value,
  items: resolvedItems.value,
  total: resolvedTotal.value,
  summary: resolvedSummary.value,
 }
 await handler(payload)
}

function resolveQueryFieldLabel(key: string) {
 return resolveLabel({ key, namespaces: ['report.filters', 'fields', 'columns'] })
}

function resolveQueryOptionLabel(fieldKey: string, optionKey: string) {
 return resolveOptionalLabel({ key: `${fieldKey}.${optionKey}`, namespaces: ['report.options', 'options'] }) || optionKey
}

function resolveActionLabel(key: string) {
 return resolveOptionalLabel({ key, namespaces: ['report.actions', 'actions'] }) || resolveLabel({ key, namespaces: ['actions'] })
}

function resolveMetricTitle(key: string) {
 return resolveLabel({ key, namespaces: ['report.metrics', 'metrics', 'fields', 'columns'] })
}
</script>

<style scoped>
.efs-reportview {
 display: grid;
 gap: 16px;
}

.efs-reportview__header {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-reportview__title {
 margin: 0;
 font-size: 1.2rem;
}

.efs-reportview__header-actions {
 display: flex;
 align-items: center;
 justify-content: flex-end;
}

.efs-reportview__query-filters,
.efs-reportview__result {
 display: grid;
 gap: 16px;
}

.efs-reportview__filters-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
 gap: 12px;
}

.efs-reportview__query-actions {
 display: flex;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-reportview__summary-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
 gap: 12px;
}

.efs-reportview__state-wrap {
 min-width: 0;
}

@media (max-width: 768px) {
 .efs-reportview__header {
  grid-template-columns: 1fr;
 }
}
</style>
