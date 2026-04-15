<template>
 <section class="efs-resourcecrudpage">
  <header class="efs-resourcecrudpage__header">
   <div class="efs-resourcecrudpage__heading">
    <h2 class="efs-resourcecrudpage__title">{{ props.title }}</h2>
   </div>
  </header>

  <section v-if="!isMobile" class="efs-resourcecrudpage__query-panel" @keydown.enter="handleQueryEnter">
   <div v-if="normalizedQueryFields.length > 0" class="efs-resourcecrudpage__query-filters">
    <div class="efs-resourcecrudpage__filters-grid">
     <AppField
      v-for="queryField in normalizedQueryFields"
      :key="queryField.key"
      :label="queryField.label"
      :hint="queryField.hint"
     >
      <AppSelect
       v-if="queryField.type === 'select'"
       :model-value="stringValue(localQueryValues[queryField.key])"
       :options="queryField.options"
       :placeholder="queryField.placeholder"
       @update:model-value="(value) => updateQueryValue(queryField.key, value)"
      />
      <AppInput
       v-else
       :model-value="stringValue(localQueryValues[queryField.key])"
       :type="queryField.type"
       :placeholder="queryField.placeholder"
       @update:model-value="(value) => updateQueryValue(queryField.key, value)"
      />
     </AppField>
    </div>
   </div>

   <div class="efs-resourcecrudpage__query-actions">
    <div class="efs-resourcecrudpage__toolbar-actions-main">
     <AppButton variant="primary" :disabled="resolvedBusy" @click="handleSearch">查询</AppButton>
     <AppButton :disabled="resolvedBusy" @click="handleReset">重置</AppButton>
    </div>
   </div>

   <div v-if="showBatchBar" class="efs-resourcecrudpage__query-after">
    <div class="efs-resourcecrudpage__batch-bar">
     <span class="efs-resourcecrudpage__batch-text">已选：{{ resolvedSelectedCount }}</span>
     <div class="efs-resourcecrudpage__batch-actions">
      <ActionBar :actions="visibleBatchActions" align="start" :busy="resolvedBusy" />
      <AppButton
       v-if="props.selectableRows && localSelectedRowKeys.length > 0"
       variant="ghost"
       :disabled="resolvedBusy"
       @click="clearSelectedRows"
      >
       清空选择
      </AppButton>
     </div>
    </div>
   </div>
  </section>

  <button
   v-if="isMobile && normalizedQueryFields.length > 0"
   type="button"
   class="efs-resourcecrudpage__query-summary-bar"
   :disabled="resolvedBusy"
   @click="querySheetOpen = true"
  >
   <span class="efs-resourcecrudpage__query-summary-main">
    <span class="efs-resourcecrudpage__query-summary-title">
     <SemanticIcon name="settings" label="筛选" aria-hidden="true" />
     {{ mobileQuerySummaryTitle }}
    </span>
    <span class="efs-resourcecrudpage__query-summary-text">{{ mobileQuerySummaryText }}</span>
   </span>
   <span class="efs-resourcecrudpage__query-summary-action">
    {{ activeQueryCount > 0 ? '修改' : '筛选' }}
    <span v-if="activeQueryCount > 0" class="efs-resourcecrudpage__filter-count">{{ activeQueryCount }}</span>
   </span>
  </button>

  <div v-if="isMobile && querySheetOpen" class="efs-resourcecrudpage__query-sheet-backdrop" @click.self="querySheetOpen = false">
   <section class="efs-resourcecrudpage__query-sheet" @keydown.enter="handleQueryEnter">
    <header class="efs-resourcecrudpage__query-sheet-header">
     <div class="efs-resourcecrudpage__query-sheet-heading">
      <strong>筛选条件</strong>
      <span v-if="activeQueryCount > 0" class="efs-resourcecrudpage__query-sheet-summary">已筛选 {{ activeQueryCount }} 项</span>
     </div>
     <button type="button" class="efs-resourcecrudpage__query-sheet-close" :disabled="resolvedBusy" @click="querySheetOpen = false">关闭</button>
    </header>
    <div v-if="normalizedQueryFields.length > 0" class="efs-resourcecrudpage__query-filters">
     <div class="efs-resourcecrudpage__filters-grid">
      <AppField
       v-for="queryField in normalizedQueryFields"
       :key="queryField.key"
       :label="queryField.label"
       :hint="queryField.hint"
      >
       <AppSelect
        v-if="queryField.type === 'select'"
        :model-value="stringValue(localQueryValues[queryField.key])"
        :options="queryField.options"
        :placeholder="queryField.placeholder"
        @update:model-value="(value) => updateQueryValue(queryField.key, value)"
       />
       <AppInput
        v-else
        :model-value="stringValue(localQueryValues[queryField.key])"
        :type="queryField.type"
        :placeholder="queryField.placeholder"
        @update:model-value="(value) => updateQueryValue(queryField.key, value)"
       />
      </AppField>
     </div>
    </div>
    <div class="efs-resourcecrudpage__query-sheet-footer">
     <AppButton :disabled="resolvedBusy" @click="handleReset">重置</AppButton>
     <AppButton variant="primary" :disabled="resolvedBusy" @click="handleSearch">应用筛选</AppButton>
    </div>
   </section>
  </div>

  <div class="efs-resourcecrudpage__content" :class="{ 'efs-resourcecrudpage__content--with-detail': hasDetail }">
   <EntityListTable
    class="efs-resourcecrudpage__list"
    :row-key="props.rowKey"
    :columns="props.columns"
    :items="resolvedItems"
    :total="resolvedTotal"
    :page="localPage"
    :page-count="resolvedPageCount"
    :page-size="localPageSize"
    :page-size-options="props.pageSizeOptions"
    @update:page="handlePageChange"
    @update:page-size="handlePageSizeChange"
   >
    <template #header-actions>
     <div class="efs-resourcecrudpage__list-header-actions">
      <div class="efs-resourcecrudpage__list-action-group">
       <ActionBar :actions="visibleHeaderActions" align="end" :busy="resolvedBusy" />
      </div>
     </div>
    </template>
    <template #default="slotProps">
     <div v-if="resolvedLoading" class="efs-resourcecrudpage__state-wrap">
      <LoadingState title="正在加载数据" message="请稍候，资源列表正在同步。" />
     </div>
     <div v-else-if="resolvedError" class="efs-resourcecrudpage__state-wrap">
      <ErrorState title="加载失败" :message="resolvedErrorMessage" />
     </div>
     <div v-else-if="resolvedItems.length === 0" class="efs-resourcecrudpage__state-wrap">
      <EmptyState title="暂无数据" description="当前没有可展示的资源记录。" />
     </div>
     <DataTable
      v-else
      :row-key="props.rowKey"
      :columns="props.columns"
      :rows="resolvedItems"
      :clickable="props.clickableRows"
      :visible-column-keys="slotProps.visibleColumnKeys"
      actions-label="操作"
      :row-actions="resolvedRowActions"
      :selectable="props.selectableRows"
      :selected-row-keys="localSelectedRowKeys"
      selection-label="选择行"
      @row-click="handleRowClick"
      @update:selected-row-keys="handleSelectedRowKeysChange"
     />
    </template>
   </EntityListTable>

   <DetailPanel
    v-if="hasDetail"
    class="efs-resourcecrudpage__detail"
    title="详情信息"
    :subtitle="''"
    :description="''"
    :fields="resolvedDetailFields"
    fields-label="字段数："
    :columns="2"
    empty-text="请选择一条记录查看详情。"
   />
  </div>

  <div v-if="isMobile && showBatchBar" class="efs-resourcecrudpage__mobile-batch-bar">
   <div class="efs-resourcecrudpage__mobile-batch-summary">
    <span class="efs-resourcecrudpage__batch-text">已选：{{ resolvedSelectedCount }}</span>
    <span v-if="activeQueryCount > 0" class="efs-resourcecrudpage__list-summary">筛选：{{ activeQueryCount }}</span>
   </div>
   <div class="efs-resourcecrudpage__mobile-batch-actions">
    <ActionBar :actions="visibleBatchActions" align="start" :busy="resolvedBusy" />
    <AppButton
     v-if="props.selectableRows && localSelectedRowKeys.length > 0"
     variant="ghost"
     :disabled="resolvedBusy"
     @click="clearSelectedRows"
    >
     清空选择
    </AppButton>
   </div>
  </div>

  <CrudDialog
   :model-value="dialogOpen"
   :title="resolvedDialogTitle"
   :subtitle="''"
   :summary="''"
   size="md"
   :busy="resolvedBusy"
   :dirty="resolvedDirty"
   :close-on-backdrop="true"
   :guard-dirty-close="true"
   :show-close="true"
   close-label="关闭"
   :footer="{ showActions: false, dirtyLabel: '存在未保存修改' }"
   @update:model-value="handleDialogToggle"
   @submit="handleSave"
   @cancel="handleCancel"
   @close="handleClose"
   @request-close="handleRequestClose"
  >
   <div @input="handleFormMutation" @change="handleFormMutation">
    <FormPanel
     title="编辑表单"
     :subtitle="''"
     :sections="props.formSections"
     :summary="''"
     :dirty="resolvedDirty"
     :busy="resolvedBusy"
     required-hint="* 必填字段"
     :footer="{ showActions: false, dirtyLabel: '存在未保存修改' }"
    >
     <div v-if="normalizedFormSections.length > 0" class="efs-resourcecrudpage__form-sections">
      <section v-for="section in normalizedFormSections" :key="section.key" class="efs-resourcecrudpage__form-section">
       <header class="efs-resourcecrudpage__form-section-header">
        <strong>{{ section.title }}</strong>
        <span v-if="section.description" class="efs-resourcecrudpage__form-section-description">{{ section.description }}</span>
       </header>
       <div class="efs-resourcecrudpage__form-grid">
        <AppField v-for="field in section.fields" :key="field.key" :label="field.label">
         <AppSelect
          v-if="field.widget === 'select'"
          :model-value="stringValue(editingDraft[field.key])"
          :options="field.options"
          @update:model-value="(value) => updateDraftValue(field.key, value)"
         />
         <AppInput
          v-else
          :model-value="stringValue(editingDraft[field.key])"
          :placeholder="field.placeholder"
          @update:model-value="(value) => updateDraftValue(field.key, value)"
         />
        </AppField>
       </div>
      </section>
     </div>
    </FormPanel>
   </div>
   <template #footer>
    <div class="efs-resourcecrudpage__dialog-footer">
     <div class="efs-resourcecrudpage__dialog-footer-meta">
      <span>* 必填字段</span>
      <span v-if="resolvedDirty" class="efs-resourcecrudpage__dirty">存在未保存修改</span>
     </div>
     <div class="efs-resourcecrudpage__dialog-footer-actions">
      <AppButton :disabled="resolvedBusy" @click="requestCancel">取消</AppButton>
      <AppButton variant="primary" :loading="resolvedBusy" @click="handleSave">保存</AppButton>
     </div>
    </div>
   </template>
  </CrudDialog>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppButton from '../controls/AppButton.vue'
import AppField from '../controls/AppField.vue'
import AppInput from '../controls/AppInput.vue'
import AppSelect from '../controls/AppSelect.vue'
import SemanticIcon from '../controls/SemanticIcon.vue'
import ActionBar from '../interaction/ActionBar.vue'
import DataTable from '../interaction/DataTable.vue'
import EmptyState from '../interaction/EmptyState.vue'
import ErrorState from '../interaction/ErrorState.vue'
import LoadingState from '../interaction/LoadingState.vue'
import { resolveLabel, resolveOptionalLabel } from '../../shared/LabelResolver'
import CrudDialog from '../panels/CrudDialog.vue'
import DetailPanel from '../panels/DetailPanel.vue'
import EntityListTable from '../panels/EntityListTable.vue'
import FormPanel from '../panels/FormPanel.vue'
import type {
 ResourceCrudAction,
 ResourceCrudActionHandlerPayload,
 ResourceCrudActionScope,
 ResourceCrudColumn,
 ResourceCrudController,
 ResourceCrudDetailField,
 ResourceCrudQueryField,
 ResourceCrudFormSection,
 ResourceCrudRowAction,
 RowSelectionKey,
} from './resource-crud-types'

defineOptions({ name: 'EntityListView' })

interface EntityListViewProps {
 rowKey: string
 title?: string
 columns?: ResourceCrudColumn[]
 queryFields?: ResourceCrudQueryField[]
 pageSizeOptions?: number[]
 selectableRows?: boolean
 clickableRows?: boolean
 formSections?: ResourceCrudFormSection[]
 detailFields?: ResourceCrudDetailField[]
 controller?: ResourceCrudController
}

const props = withDefaults(defineProps<EntityListViewProps>(), {
 title: '',
 columns: () => [],
 queryFields: () => [],
 pageSizeOptions: () => [10, 20, 50],
 selectableRows: false,
 clickableRows: true,
 formSections: () => [],
 detailFields: () => [],
 controller: undefined,
})

const instance = getCurrentInstance()
const localQueryValues = ref<Record<string, string>>({ ...(props.controller?.state?.queryValues ?? {}) })
const localSelectedRowKeys = ref<RowSelectionKey[]>([...(props.controller?.state?.selectedRowKeys ?? [])])
const localItems = ref<Record<string, unknown>[]>([...(props.controller?.state?.items ?? [])])
const localTotal = ref<number>(Number(props.controller?.state?.total ?? 0))
const localLoading = ref(false)
const localError = ref<boolean | string>(false)
const localBusy = ref(false)
const localDirty = ref(false)
const localPage = ref(props.controller?.state?.page ?? 1)
const localPageSize = ref(props.controller?.state?.pageSize ?? props.pageSizeOptions[0] ?? 20)
const localActiveItem = ref<Record<string, unknown> | null>(props.controller?.state?.activeItem ?? null)
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const isMobile = ref(false)
const querySheetOpen = ref(false)
const editingItem = ref<Record<string, unknown> | null>(null)
const editingDraft = ref<Record<string, unknown>>({})

watch(() => props.controller?.state?.queryValues, (value) => {
 if (!value) return
 localQueryValues.value = { ...value }
}, { deep: true })

watch(() => props.controller?.state?.selectedRowKeys, (value) => {
 if (!value) return
 localSelectedRowKeys.value = [...value]
}, { deep: true })

watch(() => props.controller?.state?.activeItem, (value) => {
 localActiveItem.value = value ?? null
}, { deep: true })

watch(() => props.controller?.state?.items, (value) => {
 if (!value) return
 localItems.value = [...value]
}, { deep: true })

watch(() => props.controller?.state?.total, (value) => {
 if (typeof value !== 'number') return
 localTotal.value = value
})

watch(() => props.controller?.state?.page, (value) => {
 if (typeof value !== 'number') return
 localPage.value = value
})

watch(() => props.controller?.state?.pageSize, (value) => {
 if (typeof value !== 'number') return
 localPageSize.value = value
})

const normalizedQueryFields = computed(() => props.queryFields.map((queryField) => ({
 key: queryField.key,
 label: resolveLabel({
  key: queryField.key,
  instance,
  namespaces: ['resourceCrud.queryFields', 'queryFields', 'fields'],
 }),
 hint: resolveOptionalLabel({
  key: queryField.key,
  instance,
  namespaces: ['resourceCrud.queryFieldHints', 'queryFieldHints', 'hints'],
 }),
 type: queryField.type ?? 'text',
 placeholder: resolveOptionalLabel({
  key: queryField.key,
  instance,
  namespaces: ['resourceCrud.queryFieldPlaceholders', 'queryFieldPlaceholders', 'placeholders'],
 }),
 options: (queryField.options ?? []).map((option) => ({
  label: resolveLabel({
   key: option.key,
   instance,
   namespaces: [`resourceCrud.queryOptions.${queryField.key}`, 'resourceCrud.queryOptions', 'options'],
  }),
  value: option.value,
  disabled: option.disabled,
 })),
})))

const normalizedFormSections = computed(() => props.formSections.map((section) => ({
 key: section.key,
 title: resolveLabel({
  key: section.key,
  instance,
  namespaces: ['resourceCrud.formSections', 'formSections', 'sections'],
 }),
 description: resolveOptionalLabel({
  key: section.key,
  instance,
  namespaces: ['resourceCrud.formSectionDescriptions', 'formSectionDescriptions', 'descriptions'],
 }),
 fields: (section.fields ?? []).map((field) => ({
  key: field.key,
  label: resolveLabel({
   key: field.key,
   instance,
   namespaces: ['resourceCrud.formFields', 'formFields', 'fields'],
  }),
  widget: field.widget ?? 'text',
  placeholder: resolveOptionalLabel({
   key: field.key,
   instance,
   namespaces: ['resourceCrud.formFieldPlaceholders', 'formFieldPlaceholders', 'placeholders'],
  }),
  options: (props.queryFields.find((queryField) => queryField.key === field.key)?.options ?? []).map((option) => ({
   label: resolveLabel({
    key: option.key,
    instance,
    namespaces: [`resourceCrud.queryOptions.${field.key}`, 'resourceCrud.queryOptions', 'options'],
   }),
   value: option.value,
   disabled: option.disabled,
  })),
 })),
})))

const resolvedItems = computed(() => localItems.value)
const resolvedTotal = computed(() => localTotal.value)
const resolvedLoading = computed(() => localLoading.value)
const resolvedError = computed(() => localError.value)
const resolvedBusy = computed(() => localBusy.value)
const resolvedDirty = computed(() => localDirty.value)
const resolvedActiveItem = computed(() => localActiveItem.value)
const resolvedErrorMessage = computed(() => typeof resolvedError.value === 'string' && resolvedError.value ? resolvedError.value : '资源列表加载异常，请稍后重试。')
const resolvedSelectedCount = computed(() => props.selectableRows ? localSelectedRowKeys.value.length : 0)
const activeQueryCount = computed(() => Object.values(localQueryValues.value).filter((value) => stringValue(value).trim().length > 0).length)
const activeQuerySummaries = computed(() => normalizedQueryFields.value
 .map((field) => {
  const raw = stringValue(localQueryValues.value[field.key]).trim()
  if (!raw) return ''
  const matchedOption = field.options.find((option) => option.value === raw)
  return `${field.label}：${matchedOption?.label || raw}`
 })
 .filter(Boolean))
const mobileQuerySummaryTitle = computed(() => activeQueryCount.value > 0 ? `已筛选 ${activeQueryCount.value} 项` : '全部数据')
const mobileQuerySummaryText = computed(() => activeQueryCount.value > 0 ? activeQuerySummaries.value.join(' · ') : '点击设置筛选条件')
const showBatchBar = computed(() => resolvedSelectedCount.value > 0 || (!isMobile.value && visibleBatchActions.value.length > 0))
const resolvedPageCount = computed(() => Math.max(1, Math.ceil(Math.max(resolvedTotal.value, 0) / Math.max(localPageSize.value, 1))))
const resolvedDetailFields = computed<ResourceCrudDetailField[]>(() => props.detailFields)
const hasDetail = computed(() => resolvedDetailFields.value.length > 0)

const defaultActions = computed<ResourceCrudAction[]>(() => {
 const actions: ResourceCrudAction[] = []
 actions.push({ key: 'create' })
 return actions
})

const visibleActions = computed(() => normalizeResourceActions(
 (props.controller?.actions?.actions?.length ? props.controller.actions.actions : defaultActions.value)
  .filter((action) => !['create', 'add', 'new'].includes(action.key)),
 'page',
 false,
))
const visibleListActions = computed(() => normalizeResourceActions(
 (props.controller?.actions?.actions?.length ? props.controller.actions.actions : defaultActions.value)
  .filter((action) => ['create', 'add', 'new'].includes(action.key)),
 'page',
 false,
))
const visibleHeaderActions = computed(() => [
 ...visibleActions.value,
 ...visibleListActions.value,
])
const visibleBatchActions = computed(() => normalizeResourceActions(props.controller?.actions?.batchActions ?? [], 'batch', true))

const defaultRowActions = computed<ResourceCrudRowAction[]>(() => {
 const actions: ResourceCrudRowAction[] = [
  { key: 'edit' },
 ]
 if (props.controller?.handlers?.remove) {
  actions.push({ key: 'delete' })
 }
 return actions
})

const resolvedRowActions = computed(() => {
 const source = props.controller?.actions?.rowActions?.length ? props.controller.actions.rowActions : defaultRowActions.value
 return source.map((action) => ({
  ...action,
  label: resolveActionLabel(action.key, 'row'),
  onClick: (row: Record<string, unknown>) => void dispatchAction(action.key, 'row', row),
 }))
})
const resolvedDialogTitle = computed(() => dialogMode.value === 'edit' ? '编辑资源' : '新建资源')

onMounted(async () => {
 syncViewport()
 if (typeof window !== 'undefined') window.addEventListener('resize', syncViewport)
 if (props.controller?.handlers?.query) {
  await runQuery()
  return
 }
 ensureActiveItem()
})

onBeforeUnmount(() => {
 if (typeof window !== 'undefined') window.removeEventListener('resize', syncViewport)
})

function setControllerState(key: string, value: unknown) {
 if (!props.controller) return
 if (!props.controller.state) props.controller.state = {}
 ;(props.controller.state as Record<string, unknown>)[key] = value
}

function syncViewport() {
 if (typeof window === 'undefined') return
 isMobile.value = window.innerWidth <= 960
 if (!isMobile.value) querySheetOpen.value = false
}

function ensureActiveItem() {
 if (localActiveItem.value || localItems.value.length === 0) return
 localActiveItem.value = localItems.value[0] ?? null
 setControllerState('activeItem', localActiveItem.value)
}

function stringValue(value: unknown) {
 return typeof value === 'string' ? value : String(value ?? '')
}

function buildCreateDraft() {
 const draft: Record<string, unknown> = {}
 for (const section of normalizedFormSections.value) {
  for (const field of section.fields) {
   draft[field.key] = field.widget === 'select' ? (field.options[0]?.value ?? '') : ''
  }
 }
 return draft
}

function buildEditDraft(row: Record<string, unknown> | null) {
 if (!row) return buildCreateDraft()
 const draft: Record<string, unknown> = { ...row }
 for (const section of normalizedFormSections.value) {
  for (const field of section.fields) {
   const current = draft[field.key]
   if (Array.isArray(current)) {
    draft[field.key] = current.join(', ')
   } else if (current === undefined || current === null) {
    draft[field.key] = ''
   }
  }
 }
 return draft
}

function updateDraftValue(key: string, value: string) {
 editingDraft.value = {
  ...editingDraft.value,
  [key]: value,
 }
 handleFormMutation()
}

function updateQueryValue(key: string, value: string) {
 const next = {
  ...localQueryValues.value,
  [key]: value,
 }
 localQueryValues.value = next
 setControllerState('queryValues', next)
}

async function runQuery() {
 if (!props.controller?.handlers?.query) return
 localLoading.value = true
 localError.value = false
 try {
  const result = await props.controller.handlers.query({
   queryValues: { ...localQueryValues.value },
   page: localPage.value,
   pageSize: localPageSize.value,
  })
  localItems.value = [...(result.items ?? [])]
  localTotal.value = typeof result.total === 'number' ? result.total : result.items.length
  localActiveItem.value = result.activeItem ?? result.items[0] ?? null
  setControllerState('items', [...localItems.value])
  setControllerState('total', localTotal.value)
  setControllerState('activeItem', localActiveItem.value)
 } catch (error) {
  localError.value = error instanceof Error ? error.message : '资源列表加载异常，请稍后重试。'
 } finally {
  localLoading.value = false
 }
}

async function handleSearch() {
 localPage.value = 1
 setControllerState('page', localPage.value)
 await runQuery()
 if (isMobile.value) querySheetOpen.value = false
}

async function handleReset() {
 const next = Object.fromEntries(normalizedQueryFields.value.map((queryField) => [queryField.key, ''])) as Record<string, string>
 localQueryValues.value = next
 localPage.value = 1
 setControllerState('queryValues', next)
 setControllerState('page', localPage.value)
 await runQuery()
 if (isMobile.value) querySheetOpen.value = false
}

function handleQueryEnter(event: KeyboardEvent) {
 const target = event.target as HTMLElement | null
 if (target?.tagName === 'TEXTAREA') return
 event.preventDefault()
 void handleSearch()
}

async function handlePageChange(value: number) {
 localPage.value = value
 setControllerState('page', value)
 await runQuery()
}

async function handlePageSizeChange(value: number) {
 localPageSize.value = value
 localPage.value = 1
 setControllerState('pageSize', value)
 setControllerState('page', 1)
 await runQuery()
}

function handleRowClick(row: Record<string, unknown>) {
 localActiveItem.value = row
 setControllerState('activeItem', row)
}

function handleSelectedRowKeysChange(value: RowSelectionKey[]) {
 localSelectedRowKeys.value = value
 setControllerState('selectedRowKeys', value)
}

function clearSelectedRows() {
 handleSelectedRowKeysChange([])
}

function resetDirty() {
 localDirty.value = false
}

function handleFormMutation() {
 if (!dialogOpen.value || resolvedBusy.value) return
 localDirty.value = true
}

function createActionPayload(key: string, scope: ResourceCrudActionScope, item?: Record<string, unknown> | null): ResourceCrudActionHandlerPayload {
 return {
  key,
  scope,
  item,
  selectedRowKeys: [...localSelectedRowKeys.value],
  selectedCount: resolvedSelectedCount.value,
  queryValues: { ...localQueryValues.value },
  activeItem: resolvedActiveItem.value,
 }
}

async function runCustomAction(key: string, scope: ResourceCrudActionScope, item?: Record<string, unknown> | null) {
 await props.controller?.handlers?.actions?.[key]?.(createActionPayload(key, scope, item))
}

async function dispatchAction(key: string, scope: ResourceCrudActionScope, item?: Record<string, unknown> | null) {
 if (resolvedBusy.value) return
 if (key === 'refresh') {
  await refreshData()
  return
 }
 if (key === 'create') {
  await openCreate()
  return
 }
 if ((key === 'edit' || key === 'update') && item) {
  await openEdit(item)
  return
 }
 if ((key === 'delete' || key === 'remove') && item) {
  await handleDelete(item)
  return
 }
 await runCustomAction(key, scope, item)
}

function normalizeResourceActions(actions: ResourceCrudAction[], scope: Extract<ResourceCrudActionScope, 'page' | 'batch'>, requireSelection: boolean) {
 return actions
  .filter((action) => action.visible !== false)
  .map((action) => ({
   ...action,
   label: resolveActionLabel(action.key, scope),
   variant: action.variant ?? resolveActionVariant(action.key),
   disabled: Boolean(action.disabled) || (requireSelection && resolvedSelectedCount.value === 0),
   onClick: () => void dispatchAction(action.key, scope),
  }))
}

function resolveActionLabel(key: string, scope: Extract<ResourceCrudActionScope, 'page' | 'batch' | 'row'>) {
 return resolveLabel({
  key,
  instance,
  namespaces: [`resourceCrud.${scope}Actions`, 'resourceCrud.actions', 'actions'],
 })
}

function resolveActionVariant(key: string): 'default' | 'primary' | 'danger' | 'ghost' {
 if (['create', 'add', 'new', 'edit', 'update', 'save', 'submit'].includes(key)) return 'primary'
 if (['delete', 'remove', 'disable', 'close', 'reject'].includes(key)) return 'danger'
 if (['refresh', 'reset', 'export', 'cancel', 'back'].includes(key)) return 'ghost'
 return 'default'
}

async function refreshData() {
 if (props.controller?.handlers?.refresh) await props.controller.handlers.refresh()
 await runQuery()
}

async function openCreate() {
 dialogMode.value = 'create'
 editingItem.value = null
 editingDraft.value = buildCreateDraft()
 dialogOpen.value = true
 resetDirty()
 await props.controller?.handlers?.create?.()
}

async function openEdit(row: Record<string, unknown>) {
 dialogMode.value = 'edit'
 editingItem.value = row
 editingDraft.value = buildEditDraft(row)
 dialogOpen.value = true
 localActiveItem.value = row
 setControllerState('activeItem', row)
 resetDirty()
 await props.controller?.handlers?.edit?.(row)
}

function handleDialogToggle(value: boolean) {
 dialogOpen.value = value
 if (!value) {
  editingItem.value = null
  resetDirty()
 }
}

async function handleSave() {
 if (!props.controller?.handlers?.save) {
  dialogOpen.value = false
  editingItem.value = null
  resetDirty()
  return
 }
 localBusy.value = true
 try {
  const result = await props.controller.handlers.save({
   mode: dialogMode.value,
   item: { ...editingDraft.value },
   queryValues: { ...localQueryValues.value },
   page: localPage.value,
   pageSize: localPageSize.value,
  })
  const shouldRefresh = result?.refresh ?? Boolean(props.controller?.handlers?.query)
  const shouldClose = result?.close ?? true
  if (result?.activeItem !== undefined) {
   localActiveItem.value = result.activeItem
   setControllerState('activeItem', result.activeItem)
  }
  resetDirty()
  if (shouldRefresh) await runQuery()
  if (shouldClose) {
   dialogOpen.value = false
   editingItem.value = null
  }
 } finally {
  localBusy.value = false
 }
}

function handleCancel() {
 dialogOpen.value = false
 editingItem.value = null
 editingDraft.value = {}
 resetDirty()
}

function requestCancel() {
 if (!shouldDiscardDirtyChanges()) return
 handleCancel()
}

function handleClose() {
 dialogOpen.value = false
 editingItem.value = null
 editingDraft.value = {}
 resetDirty()
}

function shouldDiscardDirtyChanges() {
 if (!resolvedDirty.value || typeof window === 'undefined' || typeof window.confirm !== 'function') return true
 return window.confirm('当前有未保存修改，确认关闭吗？')
}

function handleRequestClose() {
 if (!shouldDiscardDirtyChanges()) return
 handleClose()
}

async function handleDelete(row: Record<string, unknown>) {
 if (!props.controller?.handlers?.remove) return
 localBusy.value = true
 try {
  const result = await props.controller.handlers.remove(row)
  if (result?.activeItem !== undefined) {
   localActiveItem.value = result.activeItem
   setControllerState('activeItem', result.activeItem)
  }
  if (result?.refresh ?? Boolean(props.controller?.handlers?.query)) await runQuery()
  if (editingItem.value === row) {
   dialogOpen.value = false
   editingItem.value = null
   resetDirty()
  }
 } finally {
  localBusy.value = false
 }
}
</script>

<style scoped>
.efs-resourcecrudpage {
 display: grid;
 gap: 18px;
}

.efs-resourcecrudpage__header,
.efs-resourcecrudpage__dialog-footer,
.efs-resourcecrudpage__dialog-footer-actions,
.efs-resourcecrudpage__query-actions,
.efs-resourcecrudpage__toolbar-actions-main,
.efs-resourcecrudpage__toolbar-actions-secondary,
.efs-resourcecrudpage__list-header-actions,
.efs-resourcecrudpage__batch-bar,
.efs-resourcecrudpage__list-summary-group,
.efs-resourcecrudpage__list-action-group,
.efs-resourcecrudpage__batch-actions,
.efs-resourcecrudpage__query-sheet-heading,
.efs-resourcecrudpage__mobile-batch-summary,
.efs-resourcecrudpage__mobile-batch-actions {
 display: flex;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-resourcecrudpage__header,
.efs-resourcecrudpage__dialog-footer,
.efs-resourcecrudpage__batch-bar {
 justify-content: space-between;
 align-items: start;
}

.efs-resourcecrudpage__heading {
 min-width: 0;
}

.efs-resourcecrudpage__title {
 margin: 0;
 font-size: 1.3rem;
}

.efs-resourcecrudpage__list-summary,
.efs-resourcecrudpage__dialog-footer-meta,
.efs-resourcecrudpage__batch-text,
.efs-resourcecrudpage__loading-card p {
 color: var(--efs-text-muted, #64748b);
}

.efs-resourcecrudpage__loading-card p {
 margin: 6px 0 0;
}

.efs-resourcecrudpage__filter-count {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 min-width: 1.5rem;
 padding: 2px 8px;
 border-radius: 999px;
 background: var(--efs-primary-soft, rgba(37, 99, 235, 0.12));
 color: var(--efs-primary, #2563eb);
 font-size: 0.82rem;
 line-height: 1.4;
}

.efs-resourcecrudpage__list-header-actions {
 align-items: center;
 justify-content: space-between;
 width: 100%;
}

.efs-resourcecrudpage__list-action-group {
 justify-content: flex-end;
 margin-left: auto;
}

.efs-resourcecrudpage__list-summary,
.efs-resourcecrudpage__batch-text {
 font-size: 0.92rem;
}

.efs-resourcecrudpage__query-summary-bar {
 width: 100%;
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 16px;
 background: var(--efs-surface, #fff);
 padding: 12px 14px;
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;
 text-align: left;
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.efs-resourcecrudpage__query-summary-main {
 min-width: 0;
 display: grid;
 gap: 4px;
}

.efs-resourcecrudpage__query-summary-title {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 font-weight: 700;
 color: var(--efs-text, #172033);
}

.efs-resourcecrudpage__query-summary-text {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.86rem;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
}

.efs-resourcecrudpage__query-summary-action {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 color: var(--efs-primary, #2563eb);
 font-weight: 600;
 flex-shrink: 0;
}

.efs-resourcecrudpage__query-sheet-backdrop {
 position: fixed;
 inset: 0;
 z-index: 1200;
 background: rgba(15, 23, 42, 0.42);
 display: grid;
 align-items: end;
}

.efs-resourcecrudpage__query-sheet {
 background: var(--efs-surface, #fff);
 border-radius: 20px 20px 0 0;
 padding: 18px 16px calc(16px + env(safe-area-inset-bottom, 0px));
 display: grid;
 gap: 16px;
 max-height: min(82vh, 720px);
 overflow: auto;
 box-shadow: 0 -12px 32px rgba(15, 23, 42, 0.16);
}

.efs-resourcecrudpage__query-sheet-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;
}

.efs-resourcecrudpage__query-sheet-heading,
.efs-resourcecrudpage__mobile-batch-summary {
 align-items: center;
}

.efs-resourcecrudpage__query-sheet-summary {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.86rem;
}

.efs-resourcecrudpage__query-sheet-close {
 border: 0;
 background: transparent;
 color: var(--efs-text-muted, #64748b);
 font-weight: 600;
 cursor: pointer;
}

.efs-resourcecrudpage__query-sheet-footer {
 display: grid;
 grid-template-columns: 1fr 1fr;
 gap: 12px;
 position: sticky;
 bottom: calc(-16px - env(safe-area-inset-bottom, 0px));
 padding-top: 12px;
 background: linear-gradient(180deg, rgba(255,255,255,0), var(--efs-surface, #fff) 24%);
}

.efs-resourcecrudpage__query-panel {
 padding: 0;
 border: 0;
 border-radius: 0;
 background: transparent;
 box-shadow: none;
 display: grid;
 gap: 12px;
}

.efs-resourcecrudpage__query-filters {
 display: grid;
 gap: 12px;
}

.efs-resourcecrudpage__query-after {
 border-top: 1px solid var(--efs-border, #dbe3ef);
 padding-top: 12px;
}

.efs-resourcecrudpage__filters-grid {
 display: grid;
 gap: 12px;
 grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.efs-resourcecrudpage__content {
 display: grid;
 gap: 18px;
}

.efs-resourcecrudpage__content--with-detail {
 grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
 align-items: start;
}

.efs-resourcecrudpage__list,
.efs-resourcecrudpage__detail {
 min-width: 0;
}

.efs-resourcecrudpage__state-wrap {
 padding: 20px 0;
}

.efs-resourcecrudpage__mobile-batch-bar {
 position: sticky;
 bottom: 0;
 z-index: 20;
 display: none;
 gap: 12px;
 padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px));
 border-top: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 16px 16px 0 0;
 background: color-mix(in srgb, var(--efs-surface, #fff) 94%, transparent);
 backdrop-filter: blur(10px);
 box-shadow: 0 -10px 24px rgba(15, 23, 42, 0.12);
}

.efs-resourcecrudpage__mobile-batch-summary {
 justify-content: space-between;
 align-items: baseline;
 color: var(--efs-text, #0f172a);
}

.efs-resourcecrudpage__mobile-batch-actions {
 align-items: stretch;
}

.efs-resourcecrudpage__mobile-batch-actions :deep(.efs-actionbar),
.efs-resourcecrudpage__mobile-batch-actions :deep(.efs-actionbar__items),
.efs-resourcecrudpage__mobile-batch-actions :deep(.efs-actionbar__items > *),
.efs-resourcecrudpage__mobile-batch-actions > * {
 flex: 1 1 100%;
 width: 100%;
 min-width: 0;
}

.efs-resourcecrudpage__mobile-batch-actions :deep(.efs-actionbar__items) {
 gap: 10px;
 align-items: stretch;
}

.efs-resourcecrudpage__mobile-batch-actions :deep(.efs-actionbar__items > * > *),
.efs-resourcecrudpage__mobile-batch-actions > button {
 width: 100%;
}

.efs-resourcecrudpage__dialog-footer {
 width: 100%;
}

.efs-resourcecrudpage__dialog-footer-meta {
 display: grid;
 gap: 6px;
}

.efs-resourcecrudpage__dirty {
 color: var(--efs-warning, #d97706);
}

@media (max-width: 1100px) {
 .efs-resourcecrudpage__content--with-detail {
  grid-template-columns: 1fr;
 }
}

@media (max-width: 640px) {
 .efs-resourcecrudpage__dialog-footer,
 .efs-resourcecrudpage__toolbar-actions,
 .efs-resourcecrudpage__batch-bar {
  flex-direction: column;
  align-items: stretch;
 }

 .efs-resourcecrudpage__header {
  align-items: stretch;
 }

 .efs-resourcecrudpage__list-header-actions {
  align-items: stretch;
 }

 .efs-resourcecrudpage__list-action-group {
  width: 100%;
  justify-content: flex-start;
 }

 .efs-resourcecrudpage__query-summary-bar {
  padding: 12px;
 }

 .efs-resourcecrudpage__query-summary-text {
  white-space: normal;
 }

 .efs-resourcecrudpage__query-after {
  display: none;
 }

 .efs-resourcecrudpage__mobile-batch-bar {
  display: grid;
 }

 .efs-resourcecrudpage__query-sheet {
  border-radius: 18px 18px 0 0;
 }
}
</style>
