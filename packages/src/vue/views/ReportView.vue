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
        :model-value="stringValue(viewState.queryValues[queryField.key])"
        :options="queryField.options"
        @update:model-value="(value) => updateQueryValue(queryField.key, value)"
       />
       <AppInput
        v-else
        :model-value="stringValue(viewState.queryValues[queryField.key])"
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
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue'
import AppButton from '../controls/AppButton.vue'
import AppField from '../controls/AppField.vue'
import AppInput from '../controls/AppInput.vue'
import AppSelect from '../controls/AppSelect.vue'
import ActionBar from '../interactions/ActionBar.vue'
import DataTable from '../interactions/DataTable.vue'
import EmptyState from '../feedback/EmptyState.vue'
import ErrorState from '../feedback/ErrorState.vue'
import LoadingState from '../feedback/LoadingState.vue'
import DashboardCardPanel from '../panels/DashboardCardPanel.vue'
import ReportPanel from '../panels/ReportPanel.vue'
import { resolveLabel, resolveOptionalLabel } from '../../model/resource/label-resolver'
import { applyControllerStatePatch } from '../../model/page/controller-state'
import { useControllerStateSync } from '../../model/page/use-controller-state'
import { useViewSessionState } from '../../model/page/use-view-session'
import type {
 ReportViewAction,
 ReportViewActionHandlerPayload,
 ReportViewController,
 ReportViewQueryField,
 ReportViewResultColumn,
 ReportViewSummaryMetric,
} from '../../model/types/report-view'

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

const viewState = reactive({
 queryValues: {} as Record<string, string>,
 page: 1,
 pageSize: 20,
 items: [] as Record<string, unknown>[],
 total: 0,
 summary: [] as ReportViewSummaryMetric[],
})
const runtimeState = reactive({
 busy: false,
 error: '',
})
const visibleColumnKeys = ref<string[]>([])

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

const resolvedBusy = computed(() => props.controller?.state?.busy ?? runtimeState.busy)
const resolvedError = computed(() => props.controller?.state?.error ?? runtimeState.error)
const resolvedItems = computed(() => props.controller?.state?.items ?? viewState.items)
const resolvedTotal = computed(() => props.controller?.state?.total ?? viewState.total)
const resolvedSummary = computed(() => props.controller?.state?.summary ?? viewState.summary)
const resolvedPageCount = computed(() => Math.max(1, Math.ceil(resolvedTotal.value / Math.max(viewState.pageSize, 1))))
const resolvedSearchLabel = computed(() => resolveOptionalLabel({ key: 'searchLabel', instance, namespaces: ['efs.reportView'] }) || '查询')
const resolvedResetLabel = computed(() => resolveOptionalLabel({ key: 'resetLabel', instance, namespaces: ['efs.reportView'] }) || '重置')
const resolvedFiltersSummaryLabel = computed(() => resolveOptionalLabel({ key: 'filtersSummaryLabel', instance, namespaces: ['efs.reportView'] }) || '筛选字段')
const resolvedTotalLabel = computed(() => resolveOptionalLabel({ key: 'totalLabel', instance, namespaces: ['efs.reportView'] }) || '总数')
const querySummaryText = computed(() => normalizedQueryFields.value.length > 0 ? `${resolvedFiltersSummaryLabel.value}：${normalizedQueryFields.value.length}` : '')
const resultCountText = computed(() => `${resolvedTotalLabel.value}：${resolvedTotal.value}`)
const stateStorageKey = computed(() => props.storageKey ? `efs:view-state:report:${props.storageKey}` : '')
const { syncViewStateToController } = useControllerStateSync(props.controller, () => ({
 queryValues: { ...viewState.queryValues },
 page: viewState.page,
 pageSize: viewState.pageSize,
 items: [...viewState.items],
 total: viewState.total,
 summary: [...viewState.summary],
}))
const { restoredFromSession, storageReady, hydrateSessionState, persistSessionState } = useViewSessionState<{
 queryValues?: Record<string, string>
 page?: number
 pageSize?: number
 items?: Record<string, unknown>[]
 total?: number
 summary?: ReportViewSummaryMetric[]
}>(stateStorageKey, {
 loadState: (parsed) => {
  viewState.queryValues = { ...buildDefaultQueryValues(), ...(parsed.queryValues ?? {}) }
  viewState.page = typeof parsed.page === 'number' && parsed.page > 0 ? parsed.page : viewState.page
  viewState.pageSize = typeof parsed.pageSize === 'number' && parsed.pageSize > 0 ? parsed.pageSize : viewState.pageSize
  viewState.items = Array.isArray(parsed.items) ? [...parsed.items] : []
  viewState.total = typeof parsed.total === 'number' ? parsed.total : viewState.items.length
  viewState.summary = Array.isArray(parsed.summary) ? [...parsed.summary] : []
  runtimeState.busy = false
  runtimeState.error = ''
  syncViewStateToController()
 },
 getState: () => ({
  queryValues: viewState.queryValues,
  page: viewState.page,
  pageSize: viewState.pageSize,
  items: viewState.items,
  total: viewState.total,
  summary: viewState.summary,
 }),
})

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
 viewState.queryValues = buildDefaultQueryValues()
}, { immediate: true, deep: true })

watch(() => props.columns, () => {
 visibleColumnKeys.value = props.columns.filter((column) => column.visible !== false).map((column) => column.key)
}, { immediate: true, deep: true })

watch(() => props.controller?.state, () => {
 syncFromControllerState()
}, { immediate: true, deep: true })

watch(viewState, () => {
 syncViewStateToController()
 if (!storageReady.value) return
 persistSessionState()
}, { deep: true })

onMounted(() => {
 hydrateSessionState()
 storageReady.value = true
 if (props.controller?.handlers?.query && shouldRunInitialQuery()) runQuery()
})

function shouldRunInitialQuery() {
 return !restoredFromSession.value || viewState.items.length === 0
}

function syncFromControllerState() {
 const state = props.controller?.state
 if (!state) return
 viewState.queryValues = state.queryValues ? { ...buildDefaultQueryValues(), ...state.queryValues } : buildDefaultQueryValues()
 viewState.page = state.page && state.page > 0 ? state.page : 1
 viewState.pageSize = state.pageSize && state.pageSize > 0 ? state.pageSize : 20
 viewState.items = state.items ?? []
 viewState.total = state.total ?? viewState.items.length
 viewState.summary = state.summary ?? []
 runtimeState.busy = state.busy ?? false
 runtimeState.error = state.error ?? ''
}

function buildDefaultQueryValues() {
 return Object.fromEntries(props.queryFields.map((field) => [field.key, '']))
}

function stringValue(value: unknown) {
 return value === null || value === undefined ? '' : String(value)
}

function updateQueryValue(key: string, value: string) {
 viewState.queryValues = {
  ...viewState.queryValues,
  [key]: value,
 }
}

async function runQuery() {
 if (!props.controller?.handlers?.query) return
 runtimeState.busy = true
 runtimeState.error = ''
 applyControllerStatePatch(props.controller, { busy: true, error: '' })
 try {
  const result = await props.controller.handlers.query({
   queryValues: viewState.queryValues,
   page: viewState.page,
   pageSize: viewState.pageSize,
  })
  viewState.items = result.items
  viewState.total = result.total ?? result.items.length
  viewState.summary = result.summary ?? []
 syncViewStateToController()
} catch (error) {
  const message = error instanceof Error ? error.message : '报表查询失败'
  runtimeState.error = message
  applyControllerStatePatch(props.controller, { busy: false, error: message })
 } finally {
  runtimeState.busy = false
 }
}

function handleSearch() {
 viewState.page = 1
 runQuery()
}

function handleReset() {
 viewState.queryValues = buildDefaultQueryValues()
 viewState.page = 1
 runQuery()
}

function handlePageChange(value: number) {
 viewState.page = value
 runQuery()
}

function handlePageSizeChange(value: number) {
 viewState.pageSize = value
 viewState.page = 1
 runQuery()
}

async function handleExport() {
 if (!props.controller?.handlers?.export || resolvedBusy.value) return
 await props.controller.handlers.export({
  queryValues: viewState.queryValues,
  page: viewState.page,
  pageSize: viewState.pageSize,
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
  queryValues: viewState.queryValues,
  page: viewState.page,
  pageSize: viewState.pageSize,
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
