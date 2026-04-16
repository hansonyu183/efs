<template>
 <section class="efs-resourcecrudpage">
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
       :model-value="stringValue(viewState.queryValues[queryField.key])"
       :options="queryField.options"
       :placeholder="queryField.placeholder"
       @update:model-value="(value) => updateQueryValue(queryField.key, value)"
      />
      <AppInput
       v-else
       :model-value="stringValue(viewState.queryValues[queryField.key])"
       :type="queryField.type"
       :placeholder="queryField.placeholder"
       @update:model-value="(value) => updateQueryValue(queryField.key, value)"
      />
     </AppField>
    </div>
   </div>

   <div class="efs-resourcecrudpage__query-actions">
    <div class="efs-resourcecrudpage__toolbar-actions-main">
     <AppButton variant="primary" :disabled="resolvedBusy" @click="handleSearch">{{ resolvedSearchLabel }}</AppButton>
     <AppButton :disabled="resolvedBusy" @click="handleReset">{{ resolvedResetLabel }}</AppButton>
    </div>
   </div>

   <div class="efs-resourcecrudpage__table-toolbar">
    <div class="efs-resourcecrudpage__list-summary-group">
     <span class="efs-resourcecrudpage__list-summary">{{ resolvedTotalSummary }}</span>
     <Pagination
      :page="viewState.page"
      :page-count="resolvedPageCount"
      :page-size="viewState.pageSize"
      :page-size-options="props.pageSizeOptions"
      compact
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
     />
    </div>
    <div class="efs-resourcecrudpage__list-action-group efs-resourcecrudpage__list-action-group--compact">
     <AppButton
      v-for="action in compactHeaderActions"
      :key="action.key"
      class="efs-resourcecrudpage__icon-button"
      :variant="action.variant"
      size="sm"
      :disabled="action.disabled"
      :aria-label="action.label"
      :title="action.label"
      @click="action.onClick"
     >
      <template v-if="action.iconName" #leading>
       <SemanticIcon :name="action.iconName" :fallback="action.fallback" size="sm" />
      </template>
      <span v-if="action.iconName" class="efs-resourcecrudpage__sr-only">{{ action.label }}</span>
      <span v-else class="efs-resourcecrudpage__button-label">{{ action.label }}</span>
     </AppButton>
     <details v-if="overflowHeaderActions.length > 0" class="efs-resourcecrudpage__overflow-menu">
      <summary class="efs-resourcecrudpage__overflow-trigger" :aria-label="resolvedMoreActionsLabel" :title="resolvedMoreActionsLabel">
       <SemanticIcon name="more" fallback="⋯" size="sm" />
      </summary>
      <div class="efs-resourcecrudpage__overflow-panel">
       <button
        v-for="action in overflowHeaderActions"
        :key="`overflow-${action.key}`"
        type="button"
        class="efs-resourcecrudpage__overflow-item"
        :disabled="action.disabled"
        @click="action.onClick"
       >
        {{ action.label }}
       </button>
      </div>
     </details>
    </div>
   </div>

   <div v-if="clientFilterState.barOpen" class="efs-resourcecrudpage__filterbar">
    <AppField :label="resolvedClientFilterKeywordLabel">
     <AppInput
      :model-value="clientFilterState.keyword"
      :placeholder="resolvedClientFilterPlaceholder"
      @update:model-value="(value) => updateFilterKeyword(value)"
     />
    </AppField>
    <div class="efs-resourcecrudpage__filterbar-scope">
     <span class="efs-resourcecrudpage__filterbar-scope-label">{{ resolvedClientFilterScopeLabel }}</span>
     <div class="efs-resourcecrudpage__filter-scope-chips">
      <AppButton
       v-for="option in filterScopeOptions"
       :key="option.key"
       size="sm"
       :variant="clientFilterState.scope === option.key ? 'primary' : 'ghost'"
       @click="setFilterScope(option.key)"
      >
       {{ option.label }}
      </AppButton>
     </div>
    </div>
    <div class="efs-resourcecrudpage__filterbar-actions">
     <AppButton :disabled="!canResetClientFilter" @click="clearFilterState">{{ resolvedResetLabel }}</AppButton>
     <AppButton variant="ghost" @click="clientFilterState.barOpen = false">{{ resolvedCloseLabel }}</AppButton>
    </div>
   </div>

   <div v-if="showBatchBar" class="efs-resourcecrudpage__query-after">
    <div class="efs-resourcecrudpage__batch-bar">
     <span class="efs-resourcecrudpage__batch-text">{{ resolvedSelectedLabel }}{{ resolvedSelectedCount }}</span>
     <div class="efs-resourcecrudpage__batch-actions">
      <ActionBar :actions="visibleBatchActions" align="start" :busy="resolvedBusy" />
      <AppButton
       v-if="props.selectableRows && viewState.selectedRowKeys.length > 0"
       variant="ghost"
       :disabled="resolvedBusy"
       @click="clearSelectedRows"
>
       {{ resolvedClearSelectionLabel }}
      </AppButton>
     </div>
    </div>
   </div>
  </section>

  <div v-if="isMobile" class="efs-resourcecrudpage__table-toolbar efs-resourcecrudpage__table-toolbar--mobile">
   <div class="efs-resourcecrudpage__list-summary-group">
    <span class="efs-resourcecrudpage__list-summary">{{ resolvedTotalSummary }}</span>
    <Pagination
     :page="viewState.page"
     :page-count="resolvedPageCount"
     :page-size="viewState.pageSize"
     :page-size-options="props.pageSizeOptions"
     compact
     @update:page="handlePageChange"
     @update:page-size="handlePageSizeChange"
    />
   </div>
  <div class="efs-resourcecrudpage__list-action-group efs-resourcecrudpage__list-action-group--compact">
   <AppButton
    v-for="action in compactHeaderActions"
    :key="action.key"
    class="efs-resourcecrudpage__icon-button"
    :variant="action.variant"
    size="sm"
    :disabled="action.disabled"
    :aria-label="action.label"
    :title="action.label"
    @click="action.onClick"
   >
    <template v-if="action.iconName" #leading>
     <SemanticIcon :name="action.iconName" :fallback="action.fallback" size="sm" />
    </template>
    <span v-if="action.iconName" class="efs-resourcecrudpage__sr-only">{{ action.label }}</span>
    <span v-else class="efs-resourcecrudpage__button-label">{{ action.label }}</span>
   </AppButton>
   <details v-if="overflowHeaderActions.length > 0" class="efs-resourcecrudpage__overflow-menu">
    <summary class="efs-resourcecrudpage__overflow-trigger" :aria-label="resolvedMoreActionsLabel" :title="resolvedMoreActionsLabel">
     <SemanticIcon name="more" fallback="⋯" size="sm" />
    </summary>
    <div class="efs-resourcecrudpage__overflow-panel">
     <button
      v-for="action in overflowHeaderActions"
      :key="`mobile-overflow-${action.key}`"
      type="button"
      class="efs-resourcecrudpage__overflow-item"
      :disabled="action.disabled"
      @click="action.onClick"
     >
      {{ action.label }}
     </button>
    </div>
   </details>
  </div>
  </div>

  <div v-if="isMobile && clientFilterState.sheetOpen" class="efs-resourcecrudpage__query-sheet-backdrop" @click.self="clientFilterState.sheetOpen = false">
   <section class="efs-resourcecrudpage__query-sheet" @keydown.enter.prevent>
    <header class="efs-resourcecrudpage__query-sheet-header">
     <div class="efs-resourcecrudpage__query-sheet-heading">
      <strong>{{ resolvedClientFilterTitle }}</strong>
      <span v-if="hasClientFilter" class="efs-resourcecrudpage__query-sheet-summary">{{ resolvedClientFilterSummary }}</span>
     </div>
     <button type="button" class="efs-resourcecrudpage__query-sheet-close" :disabled="resolvedBusy" @click="clientFilterState.sheetOpen = false">{{ resolvedCloseLabel }}</button>
    </header>
    <AppField :label="resolvedClientFilterKeywordLabel">
     <AppInput
      :model-value="clientFilterState.keyword"
      :placeholder="resolvedClientFilterPlaceholder"
      @update:model-value="(value) => updateFilterKeyword(value)"
     />
    </AppField>
    <div class="efs-resourcecrudpage__filterbar-scope efs-resourcecrudpage__filterbar-scope--sheet">
     <span class="efs-resourcecrudpage__filterbar-scope-label">{{ resolvedClientFilterScopeLabel }}</span>
     <div class="efs-resourcecrudpage__filter-scope-chips">
      <AppButton
       v-for="option in filterScopeOptions"
       :key="option.key"
       size="sm"
       :variant="clientFilterState.scope === option.key ? 'primary' : 'ghost'"
       @click="setFilterScope(option.key)"
      >
       {{ option.label }}
      </AppButton>
     </div>
    </div>
    <div class="efs-resourcecrudpage__query-sheet-footer">
     <AppButton :disabled="!canResetClientFilter" @click="clearFilterState">{{ resolvedResetLabel }}</AppButton>
     <AppButton variant="primary" @click="clientFilterState.sheetOpen = false">{{ resolvedDoneLabel }}</AppButton>
    </div>
   </section>
  </div>

  <div v-if="isMobile && uiState.querySheetOpen" class="efs-resourcecrudpage__query-sheet-backdrop" @click.self="uiState.querySheetOpen = false">
   <section class="efs-resourcecrudpage__query-sheet" @keydown.enter="handleQueryEnter">
   <header class="efs-resourcecrudpage__query-sheet-header">
    <div class="efs-resourcecrudpage__query-sheet-heading">
      <strong>{{ resolvedFilterConditionsLabel }}</strong>
      <span v-if="activeQueryCount > 0" class="efs-resourcecrudpage__query-sheet-summary">{{ resolvedFilteredSummaryPrefix }} {{ activeQueryCount }} {{ resolvedFilteredSummarySuffix }}</span>
     </div>
     <button type="button" class="efs-resourcecrudpage__query-sheet-close" :disabled="resolvedBusy" @click="uiState.querySheetOpen = false">{{ resolvedCloseLabel }}</button>
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
        :model-value="stringValue(viewState.queryValues[queryField.key])"
        :options="queryField.options"
        :placeholder="queryField.placeholder"
        @update:model-value="(value) => updateQueryValue(queryField.key, value)"
       />
       <AppInput
        v-else
        :model-value="stringValue(viewState.queryValues[queryField.key])"
        :type="queryField.type"
        :placeholder="queryField.placeholder"
        @update:model-value="(value) => updateQueryValue(queryField.key, value)"
       />
      </AppField>
     </div>
    </div>
   <div class="efs-resourcecrudpage__query-sheet-footer">
     <AppButton :disabled="resolvedBusy" @click="handleReset">{{ resolvedResetLabel }}</AppButton>
     <AppButton variant="primary" :disabled="resolvedBusy" @click="handleSearch">{{ resolvedApplyFiltersLabel }}</AppButton>
   </div>
   </section>
  </div>

  <div class="efs-resourcecrudpage__content">
   <EntityListTable
    class="efs-resourcecrudpage__list"
    :row-key="props.rowKey"
    :columns="props.columns"
    :items="resolvedItems"
    :total="resolvedTotal"
   :page="viewState.page"
   :page-count="resolvedPageCount"
   :page-size="viewState.pageSize"
   :page-size-options="props.pageSizeOptions"
    :show-pagination="false"
    @update:page="handlePageChange"
    @update:page-size="handlePageSizeChange"
   >
    <template #mobile="slotProps">
     <div v-if="resolvedLoading" class="efs-resourcecrudpage__state-wrap">
      <LoadingState variant="resource" />
     </div>
     <div v-else-if="resolvedError" class="efs-resourcecrudpage__state-wrap">
      <ErrorState variant="resource" :detail="resolvedErrorMessage" />
     </div>
     <div v-else-if="resolvedItems.length === 0" class="efs-resourcecrudpage__state-wrap">
      <EmptyState variant="resource" />
     </div>
     <div v-else class="efs-resourcecrudpage__mobile-cards">
      <article
       v-for="(item, index) in resolvedItems"
       :key="String(item[props.rowKey] ?? index)"
       class="efs-resourcecrudpage__mobile-card"
      >
       <div v-for="column in slotProps.visibleColumns" :key="column.key" class="efs-resourcecrudpage__mobile-field">
        <span class="efs-resourcecrudpage__mobile-label">{{ resolveLabel({ key: column.key, instance, namespaces: ['table.columns', 'columns', 'fields'] }) }}</span>
        <strong class="efs-resourcecrudpage__mobile-value">{{ displayCellValue(item, column.key) }}</strong>
       </div>
       <div v-if="resolvedRowActions.length > 0" class="efs-resourcecrudpage__mobile-row-actions">
        <AppButton
         v-for="action in resolvedRowActions"
         :key="`${String(item[props.rowKey] ?? index)}-${action.key}`"
         :variant="action.variant === 'danger' ? 'ghost' : 'default'"
         :disabled="resolvedBusy"
         @click="action.onClick(item)"
        >
         {{ action.label }}
        </AppButton>
       </div>
      </article>
     </div>
    </template>
    <template #default="slotProps">
     <div v-if="resolvedLoading" class="efs-resourcecrudpage__state-wrap">
      <LoadingState variant="resource" />
     </div>
     <div v-else-if="resolvedError" class="efs-resourcecrudpage__state-wrap">
      <ErrorState variant="resource" :detail="resolvedErrorMessage" />
     </div>
     <div v-else-if="resolvedItems.length === 0" class="efs-resourcecrudpage__state-wrap">
      <EmptyState variant="resource" />
     </div>
     <DataTable
      v-else
      :row-key="props.rowKey"
      :columns="props.columns"
      :rows="resolvedItems"
      :clickable="props.clickableRows"
      :visible-column-keys="slotProps.visibleColumnKeys"
      :row-actions="resolvedRowActions"
      :selectable="props.selectableRows"
      :selected-row-keys="viewState.selectedRowKeys"
      @row-click="handleRowClick"
      @update:selected-row-keys="handleSelectedRowKeysChange"
     />
    </template>
   </EntityListTable>

  </div>

  <div v-if="isMobile && showBatchBar" class="efs-resourcecrudpage__mobile-batch-bar">
   <div class="efs-resourcecrudpage__mobile-batch-summary">
    <span class="efs-resourcecrudpage__batch-text">{{ resolvedSelectedLabel }}{{ resolvedSelectedCount }}</span>
    <span v-if="activeQueryCount > 0" class="efs-resourcecrudpage__list-summary">{{ resolvedFilterLabel }}：{{ activeQueryCount }}</span>
   </div>
   <div class="efs-resourcecrudpage__mobile-batch-actions">
    <ActionBar :actions="visibleBatchActions" align="start" :busy="resolvedBusy" />
    <AppButton
     v-if="props.selectableRows && viewState.selectedRowKeys.length > 0"
     variant="ghost"
     :disabled="resolvedBusy"
     @click="clearSelectedRows"
    >
     清空选择
    </AppButton>
   </div>
  </div>

  <AppButton
   v-if="isMobile && uiState.showBackToTop"
   class="efs-resourcecrudpage__backtotop"
   size="sm"
   variant="ghost"
   :title="resolvedBackToTopLabel"
   :aria-label="resolvedBackToTopLabel"
   @click="scrollToTop"
  >
   <template #leading>
    <SemanticIcon name="previous" fallback="↑" size="sm" />
   </template>
   <span class="efs-resourcecrudpage__sr-only">{{ resolvedBackToTopLabel }}</span>
  </AppButton>

  <CrudDialog
   :model-value="dialogState.open"
   :title="''"
   :subtitle="''"
   :summary="''"
   size="md"
   :busy="resolvedBusy"
   :dirty="resolvedDirty"
   :close-on-backdrop="true"
  :guard-dirty-close="true"
  :show-close="false"
  :footer="{ showActions: false }"
   @update:model-value="handleDialogToggle"
   @submit="handleSave"
   @cancel="handleCancel"
   @close="handleClose"
   @request-close="handleRequestClose"
  >
   <div @input="handleFormMutation" @change="handleFormMutation">
    <FormPanel
     :title="resolvedFormTitle"
     :subtitle="''"
     :sections="[]"
     :summary="''"
     :dirty="resolvedDirty"
     :busy="resolvedBusy"
     :footer="{ showActions: false }"
    >
     <template #actions>
      <div class="efs-resourcecrudpage__form-toolbar">
       <AppButton size="sm" variant="ghost" :disabled="!canEditPrevious || resolvedBusy" :title="resolvedPreviousLabel" :aria-label="resolvedPreviousLabel" @click="handleQuickEdit(-1)">
        <template #leading><SemanticIcon name="previous" fallback="‹" size="sm" /></template>
        <span class="efs-resourcecrudpage__sr-only">{{ resolvedPreviousLabel }}</span>
       </AppButton>
       <AppButton size="sm" variant="ghost" :disabled="!canEditNext || resolvedBusy" :title="resolvedNextLabel" :aria-label="resolvedNextLabel" @click="handleQuickEdit(1)">
        <template #leading><SemanticIcon name="next" fallback="›" size="sm" /></template>
        <span class="efs-resourcecrudpage__sr-only">{{ resolvedNextLabel }}</span>
       </AppButton>
       <AppButton size="sm" variant="ghost" :disabled="resolvedBusy" :title="resolvedPrintLabel" :aria-label="resolvedPrintLabel" @click="handlePrintForm">
        <template #leading><SemanticIcon name="print" fallback="🖨" size="sm" /></template>
        <span class="efs-resourcecrudpage__sr-only">{{ resolvedPrintLabel }}</span>
       </AppButton>
       <AppButton size="sm" variant="ghost" :disabled="resolvedBusy" :title="resolvedCloseLabel" :aria-label="resolvedCloseLabel" @click="requestCancel">
        <template #leading><SemanticIcon name="close" fallback="✕" size="sm" /></template>
        <span class="efs-resourcecrudpage__sr-only">{{ resolvedCloseLabel }}</span>
       </AppButton>
      </div>
     </template>
     <div v-if="resolvedPrimaryFormField" class="efs-resourcecrudpage__form-primary">
      <AppField :label="resolvedPrimaryFormField.label">
       <AppInput
        class="efs-resourcecrudpage__form-title-input"
        :model-value="stringValue(editingDraft[resolvedPrimaryFormField.key])"
        :placeholder="resolvedPrimaryFormField.placeholder || resolvedPrimaryFormTitlePlaceholder"
        :type="resolveFieldInputType(resolvedPrimaryFormField)"
        @update:model-value="(value) => updateDraftValue(resolvedPrimaryFormField.key, value)"
       />
      </AppField>
     </div>
     <div v-if="secondaryFormFields.length > 0" class="efs-resourcecrudpage__form-grid efs-resourcecrudpage__form-grid--simple">
      <AppField v-for="field in secondaryFormFields" :key="field.key" :label="field.label">
       <button
        v-if="isPermissionDialogField(field)"
        type="button"
        class="efs-resourcecrudpage__permission-trigger"
        :disabled="resolvedBusy"
        @click="openPermissionDialog(field)"
       >
        <span class="efs-resourcecrudpage__permission-trigger-title">{{ summarizePermissionSelection(editingDraft[field.key]) }}</span>
        <span class="efs-resourcecrudpage__permission-trigger-meta">{{ resolvedPermissionManageLabel }}</span>
       </button>
       <AppSelect
        v-else-if="resolveFieldControl(field) === 'select'"
        :model-value="serializeDraftFieldValue(editingDraft[field.key])"
        :options="field.options"
        :multiple="isMultiSelectField(field)"
        :placeholder="field.placeholder"
        @update:model-value="(value) => updateDraftValue(field.key, deserializeDraftFieldValue(value))"
       />
       <AppInput
        v-else
        :model-value="stringValue(editingDraft[field.key])"
        :placeholder="field.placeholder"
        :type="resolveFieldInputType(field)"
        @update:model-value="(value) => updateDraftValue(field.key, value)"
       />
      </AppField>
     </div>
    </FormPanel>
   </div>
   <template #footer>
   <div class="efs-resourcecrudpage__dialog-footer">
    <div class="efs-resourcecrudpage__dialog-footer-meta">
      <span v-if="resolvedDirty" class="efs-resourcecrudpage__dirty">{{ resolvedDirtyLabel }}</span>
     </div>
     <div class="efs-resourcecrudpage__dialog-footer-actions">
      <AppButton variant="primary" :loading="resolvedBusy" @click="handleSave">{{ resolvedSaveLabel }}</AppButton>
     </div>
    </div>
  </template>
  </CrudDialog>

  <CrudDialog
   :model-value="uiState.detailDialogOpen"
   :title="resolvedDetailTitle"
   :subtitle="''"
   :summary="''"
   size="lg"
   :busy="resolvedBusy"
   :dirty="false"
   :close-on-backdrop="true"
   :guard-dirty-close="false"
   :show-close="true"
   :footer="{ showActions: false }"
   @update:model-value="uiState.detailDialogOpen = $event"
   @close="uiState.detailDialogOpen = false"
  >
   <DetailPanel
    :title="resolvedDetailTitle"
    :subtitle="''"
    :description="''"
    :fields="resolvedDetailFields"
    :columns="2"
   />
  </CrudDialog>

  <CrudDialog
   :model-value="permissionDialogState.open"
   :title="resolvedPermissionDialogTitle"
   :subtitle="resolvedPermissionDialogSubtitle"
   :summary="''"
   size="lg"
   :busy="permissionCatalogLoading"
   :dirty="false"
   :close-on-backdrop="true"
   :guard-dirty-close="false"
   :show-close="true"
   :footer="{ showActions: false }"
   @update:model-value="permissionDialogState.open = $event"
   @close="closePermissionDialog"
  >
   <div class="efs-resourcecrudpage__permission-dialog">
    <AppField :label="resolvedPermissionSearchLabel">
     <AppInput :model-value="permissionDialogState.keyword" :placeholder="resolvedPermissionSearchPlaceholder" @update:model-value="(value) => permissionDialogState.keyword = value" />
    </AppField>
    <div class="efs-resourcecrudpage__permission-toolbar">
     <span class="efs-resourcecrudpage__permission-summary">{{ summarizePermissionSelection(editingDraft[permissionDialogState.fieldKey]) }}</span>
     <AppButton size="sm" variant="ghost" :disabled="permissionDialogSelectedValues.length === 0" @click="clearPermissionSelection">{{ resolvedClearSelectionLabel }}</AppButton>
    </div>
    <div v-if="permissionCatalogLoading" class="efs-resourcecrudpage__permission-empty">{{ resolvedPermissionLoadingLabel }}</div>
    <div v-else-if="filteredPermissionGroups.length === 0" class="efs-resourcecrudpage__permission-empty">{{ resolvedPermissionEmptyLabel }}</div>
    <div v-else class="efs-resourcecrudpage__permission-groups">
     <section v-for="group in filteredPermissionGroups" :key="group.key" class="efs-resourcecrudpage__permission-group">
      <header class="efs-resourcecrudpage__permission-group-header">
       <button type="button" class="efs-resourcecrudpage__permission-group-toggle" @click="togglePermissionDomainExpanded(group.key)">
        <strong>{{ group.label }}</strong>
        <small>{{ group.resources.length }} 个资源 · {{ group.items.length }} 个 API</small>
       </button>
       <AppButton size="sm" variant="ghost" @click="togglePermissionDomain(group.items)">{{ areAllPermissionsSelected(group.items) ? resolvedPermissionClearDomainLabel : resolvedPermissionSelectDomainLabel }}</AppButton>
      </header>
      <div v-if="!isPermissionDomainCollapsed(group.key)" class="efs-resourcecrudpage__permission-resource-grid">
       <article v-for="resource in group.resources" :key="resource.key" class="efs-resourcecrudpage__permission-resource-card">
        <header class="efs-resourcecrudpage__permission-resource-header">
         <div>
          <strong>{{ resource.label }}</strong>
          <small>{{ resource.apis.length }} 个 API</small>
         </div>
         <div class="efs-resourcecrudpage__permission-resource-actions">
          <AppButton size="sm" variant="ghost" @click="togglePermissionResource(resource.apis)">{{ areAllPermissionsSelected(resource.apis) ? resolvedPermissionClearResourceLabel : resolvedPermissionSelectResourceLabel }}</AppButton>
         </div>
        </header>
        <div class="efs-resourcecrudpage__permission-api-tags">
         <label v-for="api in resource.apis" :key="api.value" class="efs-resourcecrudpage__permission-api-tag" :class="{ 'is-selected': permissionDialogSelectedSet.has(api.value) }">
          <input type="checkbox" :checked="permissionDialogSelectedSet.has(api.value)" @change="togglePermissionValue(api.value)" />
          <span>{{ normalizePermissionApiLabel(api) }}</span>
         </label>
        </div>
       </article>
      </div>
     </section>
    </div>
   </div>
   <template #footer>
    <div class="efs-resourcecrudpage__dialog-footer">
     <div class="efs-resourcecrudpage__dialog-footer-meta">
      <span>{{ summarizePermissionSelection(editingDraft[permissionDialogState.fieldKey]) }}</span>
     </div>
     <div class="efs-resourcecrudpage__dialog-footer-actions">
      <AppButton variant="primary" @click="closePermissionDialog">{{ resolvedDoneLabel }}</AppButton>
     </div>
    </div>
   </template>
  </CrudDialog>
</section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
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
import Pagination from '../interaction/Pagination.vue'
import { resolveLabel, resolveOptionalLabel } from '../shared/label-resolver'
import { loadStoredAuthSession } from '../shared/auth-session'
import { useControllerStateSync } from '../shared/use-controller-state-sync'
import { useViewSessionState } from '../shared/use-view-session-state'
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
} from '../runtime/crud-view-types'

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
 storageKey?: string
}

type PermissionCatalogItem = {
 value: string
 label: string
 domain: string
 resource: string
 operation: string
 meta: string
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
 storageKey: '',
})

const instance = getCurrentInstance()
const viewState = reactive({
 queryValues: { ...(props.controller?.state?.queryValues ?? {}) } as Record<string, string>,
 selectedRowKeys: [...(props.controller?.state?.selectedRowKeys ?? [])] as RowSelectionKey[],
 items: [...(props.controller?.state?.items ?? [])] as Record<string, unknown>[],
 total: Number(props.controller?.state?.total ?? 0),
 page: props.controller?.state?.page ?? 1,
 pageSize: props.controller?.state?.pageSize ?? props.pageSizeOptions[0] ?? 20,
 activeItem: (props.controller?.state?.activeItem ?? null) as Record<string, unknown> | null,
})
const runtimeState = reactive({
 loading: false,
 error: false as boolean | string,
 busy: false,
 dirty: false,
})
const dialogState = reactive({
 open: false,
 mode: 'create' as 'create' | 'edit',
})
const isMobile = ref(false)
const uiState = reactive({
 querySheetOpen: false,
 detailDialogOpen: false,
 showBackToTop: false,
})
const clientFilterState = reactive({
 sheetOpen: false,
 barOpen: false,
 keyword: '',
 scope: 'all',
})
const editingSourceRow = ref<Record<string, unknown> | null>(null)
const editingDraft = ref<Record<string, unknown>>({})
const permissionDialogState = reactive({
 open: false,
 fieldKey: 'permissions',
 keyword: '',
 manualCollapsedDomains: {} as Record<string, boolean>,
})
const permissionCatalogLoading = ref(false)
const permissionCatalog = ref<PermissionCatalogItem[]>([])

watch(() => props.controller?.state?.queryValues, (value) => {
 if (!value) return
 viewState.queryValues = { ...value }
}, { deep: true })

watch(() => props.controller?.state?.selectedRowKeys, (value) => {
 if (!value) return
 viewState.selectedRowKeys = [...value]
}, { deep: true })

watch(() => props.controller?.state?.activeItem, (value) => {
 viewState.activeItem = value ?? null
}, { deep: true })

watch(() => props.controller?.state?.items, (value) => {
 if (!value) return
 viewState.items = [...value]
}, { deep: true })

watch(() => props.controller?.state?.total, (value) => {
 if (typeof value !== 'number') return
 viewState.total = value
})

watch(() => props.controller?.state?.page, (value) => {
 if (typeof value !== 'number') return
 viewState.page = value
})

watch(() => props.controller?.state?.pageSize, (value) => {
 if (typeof value !== 'number') return
 viewState.pageSize = value
})

watch(viewState, () => {
 syncViewStateToController()
 if (!storageReady.value) return
 persistSessionState()
}, { deep: true })

watch([() => dialogState.open, () => dialogState.mode, editingSourceRow], ([open, mode, sourceRow]) => {
 if (!open) {
  editingDraft.value = {}
  return
 }
 editingDraft.value = mode === 'edit'
  ? buildEditDraft(sourceRow)
  : buildCreateDraft()
})

watch(() => dialogState.open, (open) => {
 if (open) return
 editingSourceRow.value = null
 resetDirty()
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
  options: collectFormFieldOptions(field.key, field.widget ?? 'text'),
 })),
})))

const flattenedFormFields = computed(() => normalizedFormSections.value.flatMap((section) => section.fields))
const resolvedPrimaryFormField = computed(() => {
 const exactTitle = flattenedFormFields.value.find((field) => field.key.toLowerCase() === 'title')
 if (exactTitle) return exactTitle
 const titleLike = flattenedFormFields.value.find((field) => field.key.toLowerCase().includes('title'))
 if (titleLike) return titleLike
 const nameLike = flattenedFormFields.value.find((field) => field.key.toLowerCase().includes('name'))
 if (nameLike) return nameLike
 return flattenedFormFields.value[0] ?? null
})
const secondaryFormFields = computed(() => flattenedFormFields.value.filter((field) => field.key !== resolvedPrimaryFormField.value?.key))
const currentEditItemIndex = computed(() => {
 if (!editingSourceRow.value) return -1
 const currentRowKey = editingSourceRow.value[props.rowKey]
 return viewState.items.findIndex((item) => item[props.rowKey] === currentRowKey)
})
const canEditPrevious = computed(() => dialogState.mode === 'edit' && currentEditItemIndex.value > 0)
const canEditNext = computed(() => dialogState.mode === 'edit' && currentEditItemIndex.value >= 0 && currentEditItemIndex.value < viewState.items.length - 1)

const filterScopeOptions = computed(() => ([
 { key: 'all', label: resolvedClientFilterAllLabel.value },
 ...props.columns.map((column) => ({
  key: column.key,
  label: resolveLabel({ key: column.key, instance, namespaces: ['table.columns', 'columns', 'fields'] }),
 })),
]))
const normalizedFilterKeyword = computed(() => clientFilterState.keyword.trim().toLowerCase())
const resolvedItems = computed(() => {
 if (!normalizedFilterKeyword.value) return viewState.items
 return viewState.items.filter((item) => matchesClientFilter(item, normalizedFilterKeyword.value))
})
const resolvedTotal = computed(() => viewState.total)
const resolvedLoading = computed(() => runtimeState.loading)
const resolvedError = computed(() => runtimeState.error)
const resolvedBusy = computed(() => runtimeState.busy)
const resolvedDirty = computed(() => runtimeState.dirty)
const resolvedActiveItem = computed(() => viewState.activeItem)
const resolvedErrorMessage = computed(() => typeof resolvedError.value === 'string' && resolvedError.value ? resolvedError.value : '资源列表加载异常，请稍后重试。')
const resolvedSelectedCount = computed(() => props.selectableRows ? viewState.selectedRowKeys.length : 0)
const activeQueryCount = computed(() => Object.values(viewState.queryValues).filter((value) => stringValue(value).trim().length > 0).length)
const activeQuerySummaries = computed(() => normalizedQueryFields.value
 .map((field) => {
  const raw = stringValue(viewState.queryValues[field.key]).trim()
  if (!raw) return ''
  const matchedOption = field.options.find((option) => option.value === raw)
  return `${field.label}：${matchedOption?.label || raw}`
 })
 .filter(Boolean))
const resolvedSearchLabel = computed(() => resolveOptionalLabel({ key: 'searchLabel', instance, namespaces: ['efs.resourceCrud'] }) || '查询')
const resolvedResetLabel = computed(() => resolveOptionalLabel({ key: 'resetLabel', instance, namespaces: ['efs.resourceCrud'] }) || '重置')
const resolvedFilterLabel = computed(() => resolveOptionalLabel({ key: 'filterLabel', instance, namespaces: ['efs.resourceCrud'] }) || '筛选')
const resolvedEditFiltersLabel = computed(() => resolveOptionalLabel({ key: 'editFiltersLabel', instance, namespaces: ['efs.resourceCrud'] }) || '修改')
const resolvedApplyFiltersLabel = computed(() => resolveOptionalLabel({ key: 'applyFiltersLabel', instance, namespaces: ['efs.resourceCrud'] }) || '应用筛选')
const resolvedFilterConditionsLabel = computed(() => resolveOptionalLabel({ key: 'filterConditionsLabel', instance, namespaces: ['efs.resourceCrud'] }) || '筛选条件')
const resolvedFilteredSummaryPrefix = computed(() => resolveOptionalLabel({ key: 'filteredSummaryPrefix', instance, namespaces: ['efs.resourceCrud'] }) || '已筛选')
const resolvedFilteredSummarySuffix = computed(() => resolveOptionalLabel({ key: 'filteredSummarySuffix', instance, namespaces: ['efs.resourceCrud'] }) || '项')
const resolvedAllDataLabel = computed(() => resolveOptionalLabel({ key: 'allDataLabel', instance, namespaces: ['efs.resourceCrud'] }) || '全部数据')
const resolvedSetFiltersLabel = computed(() => resolveOptionalLabel({ key: 'setFiltersLabel', instance, namespaces: ['efs.resourceCrud'] }) || '点击设置筛选条件')
const resolvedSelectedLabel = computed(() => resolveOptionalLabel({ key: 'selectedLabel', instance, namespaces: ['efs.resourceCrud'] }) || '已选：')
const resolvedClearSelectionLabel = computed(() => resolveOptionalLabel({ key: 'clearSelectionLabel', instance, namespaces: ['efs.resourceCrud'] }) || '清空选择')
const resolvedCloseLabel = computed(() => resolveOptionalLabel({ key: 'closeLabel', instance, namespaces: ['efs.resourceCrud'] }) || '关闭')
const resolvedDoneLabel = computed(() => resolveOptionalLabel({ key: 'doneLabel', instance, namespaces: ['efs.resourceCrud'] }) || '完成')
const resolvedClientFilterLabel = computed(() => '滤')
const resolvedClientFilterTitle = computed(() => '本地过滤')
const resolvedClientFilterKeywordLabel = computed(() => '关键词')
const resolvedClientFilterScopeLabel = computed(() => '过滤范围')
const resolvedClientFilterAllLabel = computed(() => '全部')
const resolvedClientFilterPlaceholder = computed(() => '在当前结果中过滤')
const hasClientFilter = computed(() => normalizedFilterKeyword.value.length > 0)
const canResetClientFilter = computed(() => normalizedFilterKeyword.value.length > 0 || clientFilterState.scope !== 'all')
const resolvedClientFilterSummary = computed(() => hasClientFilter.value ? `当前结果 ${resolvedItems.value.length} 项` : '')
const resolvedDetailTitle = computed(() => resolveOptionalLabel({ key: 'detailTitle', instance, namespaces: ['efs.resourceCrud'] }) || '详情信息')
const resolvedResourceLabel = computed(() => {
 const rawTitle = props.title.trim()
 if (!rawTitle) return '资源'
 return rawTitle.replace(/(列表|管理|台账|维护)$/u, '') || rawTitle
})
const resolvedFormTitle = computed(() => `${dialogState.mode === 'edit' ? '编辑' : '新增'}${resolvedResourceLabel.value}`)
const resolvedPrimaryFormTitlePlaceholder = computed(() => resolveOptionalLabel({ key: 'primaryFormTitlePlaceholder', instance, namespaces: ['efs.resourceCrud'] }) || '请输入标题')
const resolvedDirtyLabel = computed(() => resolveOptionalLabel({ key: 'dirtyLabel', instance, namespaces: ['efs.resourceCrud'] }) || '存在未保存修改')
const resolvedSaveLabel = computed(() => resolveOptionalLabel({ key: 'saveLabel', instance, namespaces: ['efs.resourceCrud'] }) || '保存')
const resolvedPreviousLabel = computed(() => '上一项')
const resolvedNextLabel = computed(() => '下一项')
const resolvedPrintLabel = computed(() => '打印')
const resolvedBackToTopLabel = computed(() => '回到顶部')
const resolvedMoreActionsLabel = computed(() => '更多操作')
const resolvedDeleteConfirmLabel = computed(() => '确认删除当前记录吗？')
const resolvedPermissionManageLabel = computed(() => '管理权限')
const resolvedPermissionDialogTitle = computed(() => '权限设置')
const resolvedPermissionDialogSubtitle = computed(() => '按领域勾选当前角色可用的权限。')
const resolvedPermissionSearchLabel = computed(() => '筛选权限')
const resolvedPermissionSearchPlaceholder = computed(() => '搜索领域、资源、操作或权限标识')
const resolvedPermissionLoadingLabel = computed(() => '正在加载权限目录…')
const resolvedPermissionEmptyLabel = computed(() => '暂无可选权限')
const resolvedPermissionSelectDomainLabel = computed(() => '全选本组')
const resolvedPermissionClearDomainLabel = computed(() => '清空本组')
const resolvedPermissionSelectResourceLabel = computed(() => '全选本资源')
const resolvedPermissionClearResourceLabel = computed(() => '清空本资源')
const resolvedTotalSummary = computed(() => hasClientFilter.value
 ? `滤 ${resolvedItems.value.length}/${viewState.items.length} · 第 ${viewState.page}/${resolvedPageCount.value} 页`
 : `${resolvedTotal.value} 条数据 · 第 ${viewState.page}/${resolvedPageCount.value} 页`)
const mobileQuerySummaryTitle = computed(() => activeQueryCount.value > 0 ? `${resolvedFilteredSummaryPrefix.value} ${activeQueryCount.value} ${resolvedFilteredSummarySuffix.value}` : resolvedAllDataLabel.value)
const mobileQuerySummaryText = computed(() => activeQueryCount.value > 0 ? activeQuerySummaries.value.join(' · ') : resolvedSetFiltersLabel.value)
const showBatchBar = computed(() => resolvedSelectedCount.value > 0 || (!isMobile.value && visibleBatchActions.value.length > 0))
const resolvedPageCount = computed(() => Math.max(1, Math.ceil(Math.max(resolvedTotal.value, 0) / Math.max(viewState.pageSize, 1))))
const resolvedDetailFields = computed<ResourceCrudDetailField[]>(() => props.detailFields.map((field) => ({
 ...field,
 value: displayCellValue(resolvedActiveItem.value, field.key),
})))
const hasDetail = computed(() => resolvedDetailFields.value.length > 0)
const stateStorageKey = computed(() => props.storageKey ? `efs:view-state:crud:${props.storageKey}` : '')
const { syncViewStateToController } = useControllerStateSync(props.controller, () => ({
 queryValues: { ...viewState.queryValues },
 selectedRowKeys: [...viewState.selectedRowKeys],
 items: [...viewState.items],
 total: viewState.total,
 page: viewState.page,
 pageSize: viewState.pageSize,
 activeItem: viewState.activeItem,
}))
const { restoredFromSession, storageReady, hydrateSessionState, persistSessionState } = useViewSessionState<{
 queryValues?: Record<string, string>
 selectedRowKeys?: RowSelectionKey[]
 items?: Record<string, unknown>[]
 total?: number
 page?: number
 pageSize?: number
 activeItem?: Record<string, unknown> | null
}>(stateStorageKey, {
 loadState: (parsed) => {
  viewState.queryValues = { ...buildDefaultQueryValues(), ...(parsed.queryValues ?? {}) }
  viewState.selectedRowKeys = Array.isArray(parsed.selectedRowKeys) ? [...parsed.selectedRowKeys] : []
  viewState.items = Array.isArray(parsed.items) ? [...parsed.items] : []
  viewState.total = typeof parsed.total === 'number' ? parsed.total : viewState.items.length
  viewState.page = typeof parsed.page === 'number' && parsed.page > 0 ? parsed.page : viewState.page
  viewState.pageSize = typeof parsed.pageSize === 'number' && parsed.pageSize > 0 ? parsed.pageSize : viewState.pageSize
  viewState.activeItem = parsed.activeItem ?? viewState.items[0] ?? null
  syncViewStateToController()
 },
 getState: () => ({
  queryValues: viewState.queryValues,
  selectedRowKeys: viewState.selectedRowKeys,
  items: viewState.items,
  total: viewState.total,
  page: viewState.page,
  pageSize: viewState.pageSize,
  activeItem: viewState.activeItem,
 }),
})
const permissionDialogSelectedValues = computed(() => normalizePermissionSelection(editingDraft.value[permissionDialogState.fieldKey]))
const permissionDialogSelectedSet = computed(() => new Set(permissionDialogSelectedValues.value))
const filteredPermissionGroups = computed(() => {
 const keyword = permissionDialogState.keyword.trim().toLowerCase()
 const source = keyword
  ? permissionCatalog.value.filter((item) => [item.domain, item.resource, item.operation, item.label, item.meta, item.value].some((part) => part.toLowerCase().includes(keyword)))
  : permissionCatalog.value
 const groups = new Map<string, PermissionCatalogItem[]>()
 for (const item of source) {
  if (!groups.has(item.domain)) groups.set(item.domain, [])
  groups.get(item.domain)?.push(item)
 }
 return [...groups.entries()].map(([key, items]) => {
  const resourceGroups = new Map<string, PermissionCatalogItem[]>()
  for (const item of items) {
   const resourceKey = item.resource || '未分类资源'
   if (!resourceGroups.has(resourceKey)) resourceGroups.set(resourceKey, [])
   resourceGroups.get(resourceKey)?.push(item)
  }
  return {
   key,
   label: key,
   items,
   resources: [...resourceGroups.entries()].map(([resourceKey, resourceItems]) => ({
    key: `${key}:${resourceKey}`,
    label: resourceKey,
    apis: resourceItems,
   })),
  }
 })
})
const selectedPermissionDomains = computed(() => new Set(filteredPermissionGroups.value
 .filter((group) => group.items.some((item) => permissionDialogSelectedSet.value.has(item.value)))
 .map((group) => group.key)))
const collapsedPermissionDomains = computed(() => {
 const next: Record<string, boolean> = {}
 const forceExpanded = permissionDialogState.keyword.trim().length > 0
 for (const group of filteredPermissionGroups.value) {
  next[group.key] = forceExpanded
   ? false
   : selectedPermissionDomains.value.has(group.key)
    ? false
    : permissionDialogState.manualCollapsedDomains[group.key] ?? true
 }
 return next
})

watch(() => permissionDialogState.open, (open) => {
 if (open) return
 resetPermissionDialogState()
})

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
const visibleStandardHeaderActions = computed(() => visibleHeaderActions.value.filter((action) => isStandardHeaderActionKey(action.key)))
const overflowHeaderActions = computed(() => visibleHeaderActions.value.filter((action) => !isStandardHeaderActionKey(action.key)))
const compactHeaderActions = computed(() => {
 const actions = [
  {
   key: 'filter',
   label: resolvedClientFilterLabel.value,
   variant: 'ghost' as const,
   disabled: false,
   onClick: () => {
    if (isMobile.value) clientFilterState.sheetOpen = true
    else clientFilterState.barOpen = !clientFilterState.barOpen
   },
   iconName: '',
   fallback: '',
  },
 ]
 .concat(visibleStandardHeaderActions.value.map((action) => ({
  key: action.key,
  label: action.label,
  variant: action.variant === 'danger' ? 'danger' : 'ghost' as const,
  disabled: Boolean(action.disabled),
  onClick: action.onClick,
  iconName: resolveToolbarIconName(action.key),
  fallback: resolveToolbarIconFallback(action.key),
 })))
 if (normalizedQueryFields.value.length > 0) {
  actions.splice(2, 0, {
   key: 'query',
   label: activeQueryCount.value > 0 ? resolvedEditFiltersLabel.value : resolvedFilterLabel.value,
   variant: 'ghost' as const,
   disabled: resolvedBusy.value,
   onClick: () => {
    uiState.querySheetOpen = true
   },
   iconName: 'filter',
   fallback: '⌕',
  })
 }
 return actions
})
const visibleBatchActions = computed(() => normalizeResourceActions(props.controller?.actions?.batchActions ?? [], 'batch', true))

const defaultRowActions = computed<ResourceCrudRowAction[]>(() => {
 const actions: ResourceCrudRowAction[] = []
 if (hasDetail.value) actions.push({ key: 'detail' })
 actions.push({ key: 'edit' })
 if (props.controller?.handlers?.remove) {
  actions.push({ key: 'delete' })
 }
 return actions
})

const resolvedRowActions = computed(() => {
 const explicitRowActions = Array.isArray(props.controller?.actions?.rowActions) ? props.controller.actions.rowActions : undefined
 const source = explicitRowActions ?? defaultRowActions.value
 return source.map((action) => ({
  ...action,
  label: resolveActionLabel(action.key, 'row'),
  onClick: (row: Record<string, unknown>) => void dispatchAction(action.key, 'row', row),
 }))
})
const resolvedDialogTitle = computed(() => resolvedFormTitle.value)

onMounted(async () => {
 syncViewport()
 syncScrollState()
 hydrateSessionState()
 storageReady.value = true
 if (typeof window !== 'undefined') window.addEventListener('resize', syncViewport)
 if (typeof window !== 'undefined') window.addEventListener('scroll', syncScrollState, { passive: true })
 if (props.controller?.handlers?.query) {
  if (shouldRunInitialQuery()) {
   await runQuery()
   return
  }
  ensureActiveItem()
  return
 }
 ensureActiveItem()
})

function shouldRunInitialQuery() {
 return !restoredFromSession.value || viewState.items.length === 0
}

onBeforeUnmount(() => {
 if (typeof window !== 'undefined') window.removeEventListener('resize', syncViewport)
 if (typeof window !== 'undefined') window.removeEventListener('scroll', syncScrollState)
})

function syncViewport() {
 if (typeof window === 'undefined') return
 isMobile.value = window.innerWidth <= 960
 if (!isMobile.value) uiState.querySheetOpen = false
 syncScrollState()
}

function syncScrollState() {
 if (typeof window === 'undefined') return
 uiState.showBackToTop = isMobile.value && window.scrollY > Math.max(window.innerHeight * 0.9, 360)
}

function ensureActiveItem() {
 if (viewState.activeItem || viewState.items.length === 0) return
 viewState.activeItem = viewState.items[0] ?? null
}

function stringValue(value: unknown) {
 return typeof value === 'string' ? value : String(value ?? '')
}

function displayCellValue(row: Record<string, unknown> | null | undefined, key: string) {
 if (!row) return '-'
 const value = row[key]
 if (value === null || value === undefined || value === '') return '-'
 if (Array.isArray(value)) return value.map((item) => summarizeDisplayValue(item)).filter((item) => item !== '-').join('，') || '-'
 if (typeof value === 'object') {
  return summarizeDisplayValue(value as Record<string, unknown>)
 }
 return stringValue(value)
}

function summarizeDisplayValue(value: unknown): string {
 if (value === null || value === undefined || value === '') return '-'
 if (Array.isArray(value)) {
  const parts = value.map((item) => summarizeDisplayValue(item)).filter((item) => item !== '-')
  return parts.length > 0 ? parts.join('，') : '-'
 }
 if (typeof value === 'object') {
  const record = value as Record<string, unknown>
  const preferredKeys = ['label', 'name', 'title', 'displayName', 'orgCode', 'code', 'id', 'value']
  for (const key of preferredKeys) {
   const candidate = record[key]
   if (candidate !== null && candidate !== undefined && candidate !== '') return summarizeDisplayValue(candidate)
  }
  const parts = Object.entries(record)
   .map(([entryKey, entryValue]) => {
    const text = summarizeDisplayValue(entryValue)
    return text === '-' ? '' : `${entryKey}: ${text}`
   })
   .filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '-'
 }
 return stringValue(value)
}

function updateFilterKeyword(value: string) {
 clientFilterState.keyword = value
}

function setFilterScope(value: string) {
 clientFilterState.scope = value
}

function clearFilterState() {
 clientFilterState.keyword = ''
 clientFilterState.scope = 'all'
 if (!isMobile.value) clientFilterState.barOpen = false
}

function matchesClientFilter(row: Record<string, unknown>, keyword: string) {
 if (clientFilterState.scope !== 'all') {
  return stringifyFilterValue(row[clientFilterState.scope]).includes(keyword)
 }
 return Object.values(row).some((value) => stringifyFilterValue(value).includes(keyword))
}

function stringifyFilterValue(value: unknown): string {
 if (value == null) return ''
 if (Array.isArray(value)) return value.map((item) => stringifyFilterValue(item)).join(' ')
 if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map((item) => stringifyFilterValue(item)).join(' ')
 return String(value).toLowerCase()
}

function resolveToolbarIconName(key: string) {
 if (key === 'filter') return ''
 if (key === 'query') return 'settings'
 if (['create', 'add', 'new'].includes(key)) return 'add'
 if (key === 'refresh') return 'refresh'
 return 'more'
}

function resolveToolbarIconFallback(key: string) {
 if (key === 'filter') return ''
 if (key === 'query') return '⚙'
 if (['create', 'add', 'new'].includes(key)) return '+'
 if (key === 'refresh') return '↻'
 return '⋯'
}

function isStandardHeaderActionKey(key: string) {
 return ['create', 'add', 'new', 'refresh'].includes(key)
}

function isPermissionDialogField(field: { key: string }) {
 return field.key.trim().toLowerCase() === 'permissions'
}

function normalizePermissionSelection(value: unknown): string[] {
 if (!Array.isArray(value)) return []
 return value
  .map((item) => {
   if (typeof item === 'string') return item
   if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>
    return stringValue(record.permission ?? record.value ?? record.code ?? record.id ?? '')
   }
   return ''
  })
  .filter(Boolean)
}

function summarizePermissionSelection(value: unknown) {
 const selected = normalizePermissionSelection(value)
 if (selected.length === 0) return '未选择权限'
 if (selected.length === 1) return `已选 1 项权限`
 return `已选 ${selected.length} 项权限`
}

async function openPermissionDialog(field: { key: string }) {
 permissionDialogState.fieldKey = field.key
 permissionDialogState.open = true
 await ensurePermissionCatalog(field)
}

function closePermissionDialog() {
 permissionDialogState.open = false
}

function resetPermissionDialogState() {
 permissionDialogState.fieldKey = 'permissions'
 permissionDialogState.keyword = ''
 permissionDialogState.manualCollapsedDomains = {}
}

function isPermissionDomainCollapsed(key: string) {
 return collapsedPermissionDomains.value[key] ?? true
}

function togglePermissionDomainExpanded(key: string) {
 permissionDialogState.manualCollapsedDomains = {
  ...permissionDialogState.manualCollapsedDomains,
  [key]: !isPermissionDomainCollapsed(key),
 }
}

async function ensurePermissionCatalog(field: { key: string, options?: Array<{ label: string, value: string }> }) {
 if (permissionCatalog.value.length > 0) return
 permissionCatalogLoading.value = true
 try {
  const remote = await loadPermissionCatalogFromServer()
  permissionCatalog.value = remote.length > 0 ? remote : buildPermissionCatalogFromOptions(field)
 } catch {
  permissionCatalog.value = buildPermissionCatalogFromOptions(field)
 } finally {
  permissionCatalogLoading.value = false
 }
}

async function loadPermissionCatalogFromServer() {
 if (typeof window === 'undefined' || typeof fetch !== 'function') return []
 const session = loadStoredAuthSession()
 const response = await fetch('/agentos-api/admin/permission/query', {
  method: 'POST',
  headers: {
   'content-type': 'application/json',
   ...(session?.accessToken ? { Authorization: `${session.tokenType || 'Bearer'} ${session.accessToken}` } : {}),
  },
  body: JSON.stringify({
   data: {
    queryValues: {},
    page: 1,
    pageSize: 500,
   },
  }),
 })
 const payload = await response.json().catch(() => ({})) as Record<string, any>
 const data = payload?.data ?? payload
 const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
 return items.map((item) => normalizePermissionCatalogItem(item)).filter((item): item is PermissionCatalogItem => Boolean(item))
}

function normalizePermissionCatalogItem(item: unknown) {
 if (!item || typeof item !== 'object') return null
 const record = item as Record<string, unknown>
 const value = stringValue(record.permission ?? record.value ?? record.code ?? '')
 if (!value) return null
 const domain = stringValue(record.domain || '其他')
 const resource = stringValue(record.resource || inferPermissionResource(value) || '未分类资源')
 const operation = stringValue(record.operation || inferPermissionOperation(value))
 return {
  value,
  label: value,
  domain,
  resource,
  operation,
  meta: [resource, operation].filter(Boolean).join(' / '),
 }
}

function buildPermissionCatalogFromOptions(field: { options?: Array<{ label: string, value: string }> }) {
 return (field.options ?? []).map((item) => ({
  value: item.value,
  label: item.label || item.value,
  domain: inferPermissionDomain(item.value),
  resource: inferPermissionResource(item.value) || '未分类资源',
  operation: inferPermissionOperation(item.value),
  meta: item.label && item.label !== item.value ? item.label : item.value,
 }))
}

function inferPermissionDomain(value: string) {
 const [domain] = value.split(/[:./]/).filter(Boolean)
 return domain || '其他'
}

function inferPermissionResource(value: string) {
 const [, resource] = value.split(/[:./]/).filter(Boolean)
 return resource || ''
}

function inferPermissionOperation(value: string) {
 const parts = value.split(/[:./]/).filter(Boolean)
 return parts.length > 2 ? parts[parts.length - 1] ?? '' : ''
}

function normalizePermissionApiLabel(item: { operation: string, value: string }) {
 return item.operation ? item.operation.toUpperCase() : item.value
}

function togglePermissionValue(value: string) {
 const next = new Set(permissionDialogSelectedValues.value)
 if (next.has(value)) next.delete(value)
 else next.add(value)
 updateDraftValue(permissionDialogState.fieldKey, [...next])
}

function clearPermissionSelection() {
 updateDraftValue(permissionDialogState.fieldKey, [])
}

function areAllPermissionsSelected(items: Array<{ value: string }>) {
 return items.length > 0 && items.every((item) => permissionDialogSelectedSet.value.has(item.value))
}

function togglePermissionDomain(items: Array<{ value: string }>) {
 const next = new Set(permissionDialogSelectedValues.value)
 if (areAllPermissionsSelected(items)) {
  for (const item of items) next.delete(item.value)
 } else {
  for (const item of items) next.add(item.value)
 }
 updateDraftValue(permissionDialogState.fieldKey, [...next])
}

function togglePermissionResource(items: Array<{ value: string }>) {
 togglePermissionDomain(items)
}

function collectFormFieldOptions(fieldKey: string, widget: string) {
 const queryOptions = (props.queryFields.find((queryField) => queryField.key === fieldKey)?.options ?? []).map((option) => ({
  label: resolveLabel({
   key: option.key,
   instance,
   namespaces: [`resourceCrud.queryOptions.${fieldKey}`, 'resourceCrud.queryOptions', 'options'],
  }),
  value: option.value,
  disabled: option.disabled,
 }))
 if (queryOptions.length > 0) return dedupeFormFieldOptions(queryOptions)
 if (!shouldAutoCollectFormFieldOptions(fieldKey, widget)) return []
 const inferredOptions = dedupeFormFieldOptions(viewState.items.flatMap((item) => inferOptionsFromValue(item[fieldKey])))
 return inferredOptions
}

function shouldAutoCollectFormFieldOptions(fieldKey: string, widget: string) {
 if (widget === 'select') return true
 if (isRelationFieldKey(fieldKey)) return true
 if (isLikelyCollectionFieldKey(fieldKey)) return true
 return hasStructuredFormFieldValues(fieldKey)
}

function inferOptionsFromValue(value: unknown): Array<{ label: string, value: string, disabled?: boolean }> {
 if (value === null || value === undefined || value === '') return []
 if (Array.isArray(value)) return value.flatMap((item) => inferOptionsFromValue(item))
 if (typeof value === 'object') {
  return [{ label: summarizeDisplayValue(value), value: serializeChoiceValue(value) }]
 }
 return [{ label: stringValue(value), value: serializeChoiceValue(value) }]
}

function dedupeFormFieldOptions(options: Array<{ label: string, value: string, disabled?: boolean }>) {
 const seen = new Set<string>()
 return options.filter((option) => {
  if (seen.has(option.value)) return false
  seen.add(option.value)
  return true
 })
}

function resolveFieldControl(field: { key: string, widget: string, options: Array<{ label: string, value: string }> }) {
 if (field.widget === 'select' || isRelationFieldKey(field.key) || field.options.length > 0 || isLikelyCollectionFieldKey(field.key) || isStructuredFieldValue(editingDraft.value[field.key])) return 'select'
 return 'input'
}

function isMultiSelectField(field: { key: string }) {
 return isRelationMultiFieldKey(field.key) || isLikelyCollectionFieldKey(field.key) || Array.isArray(editingDraft.value[field.key]) || viewState.items.some((item) => Array.isArray(item[field.key]))
}

function isRelationFieldKey(key: string) {
 const normalizedKey = key.trim().toLowerCase()
 return normalizedKey.endsWith('_id') || normalizedKey.endsWith('id') || normalizedKey.endsWith('_ids') || normalizedKey.endsWith('ids')
}

function isRelationMultiFieldKey(key: string) {
 const normalizedKey = key.trim().toLowerCase()
 return normalizedKey.endsWith('_ids') || normalizedKey.endsWith('ids')
}

function isLikelyCollectionFieldKey(key: string) {
 const normalizedKey = key.trim().toLowerCase()
 if (isRelationMultiFieldKey(normalizedKey)) return true
 if (['status', 'business', 'address'].includes(normalizedKey)) return false
 return normalizedKey.endsWith('s') && !normalizedKey.endsWith('ss')
}

function hasStructuredFormFieldValues(fieldKey: string) {
 return viewState.items.some((item) => isStructuredFieldValue(item[fieldKey]))
}

function isStructuredFieldValue(value: unknown) {
 return (typeof value === 'object' && value !== null) || (Array.isArray(value) && value.some((item) => typeof item === 'object' && item !== null))
}

function resolveFieldInputType(field: { key: string, widget?: string }) {
 const normalizedKey = field.key.trim().toLowerCase()
 if (field.widget === 'number') return 'number'
 if (field.widget === 'date') {
  if (normalizedKey.endsWith('_month') || normalizedKey.endsWith('month')) return 'month'
  if (normalizedKey.endsWith('_datetime') || normalizedKey.endsWith('datetime')) return 'datetime-local'
  return 'date'
 }
 if (normalizedKey.endsWith('_date') || normalizedKey.endsWith('date')) return 'date'
 if (normalizedKey.endsWith('_month') || normalizedKey.endsWith('month')) return 'month'
 if (normalizedKey.endsWith('_datetime') || normalizedKey.endsWith('datetime')) return 'datetime-local'
 return 'text'
}

function serializeChoiceValue(value: unknown): string {
 if (typeof value === 'object' && value !== null) return `json:${JSON.stringify(value)}`
 return stringValue(value)
}

function serializeDraftFieldValue(value: unknown): string | string[] {
 if (Array.isArray(value)) return value.map((item) => serializeChoiceValue(item))
 return serializeChoiceValue(value)
}

function deserializeDraftFieldValue(value: string | string[]) {
 if (Array.isArray(value)) return value.map((item) => deserializeChoiceValue(item))
 return deserializeChoiceValue(value)
}

function deserializeChoiceValue(value: string) {
 if (value.startsWith('json:')) {
  try {
   return JSON.parse(value.slice(5))
  } catch {
   return value
  }
 }
 return value
}

async function handleQuickEdit(step: -1 | 1) {
 if (dialogState.mode !== 'edit') return
 const targetIndex = currentEditItemIndex.value + step
 if (targetIndex < 0 || targetIndex >= viewState.items.length) return
 await openEdit(viewState.items[targetIndex])
}

function handlePrintForm() {
 if (typeof window === 'undefined' || typeof window.print !== 'function') return
 window.print()
}

function buildCreateDraft() {
 const draft: Record<string, unknown> = {}
 for (const field of flattenedFormFields.value) {
  if (isMultiSelectField(field) || field.widget === 'tags') {
   draft[field.key] = []
   continue
  }
  if (field.options.length > 0) {
   draft[field.key] = field.options[0]?.value ?? ''
   continue
  }
  draft[field.key] = ''
 }
 return draft
}

function buildEditDraft(row: Record<string, unknown> | null) {
 if (!row) return buildCreateDraft()
 const draft: Record<string, unknown> = { ...row }
 for (const field of flattenedFormFields.value) {
  const current = draft[field.key]
  if (current === undefined || current === null) {
   draft[field.key] = field.options.length > 0 ? '' : ''
   continue
  }
  if (field.options.length > 0) {
   draft[field.key] = current
   continue
  }
  if (isMultiSelectField(field) || field.widget === 'tags') {
   draft[field.key] = normalizePermissionSelection(current)
   continue
  }
  if (Array.isArray(current)) {
   draft[field.key] = current.map((item) => summarizeDisplayValue(item)).join(', ')
   continue
  }
  if (typeof current === 'object') {
   draft[field.key] = summarizeDisplayValue(current)
  }
 }
 return draft
}

function updateDraftValue(key: string, value: unknown) {
 editingDraft.value = {
  ...editingDraft.value,
  [key]: value,
 }
 handleFormMutation()
}

function updateQueryValue(key: string, value: string) {
 const next = {
  ...viewState.queryValues,
  [key]: value,
 }
 viewState.queryValues = next
}

async function runQuery() {
 if (!props.controller?.handlers?.query) return
 runtimeState.loading = true
 runtimeState.error = false
 try {
  const result = await props.controller.handlers.query({
   queryValues: { ...viewState.queryValues },
   page: viewState.page,
   pageSize: viewState.pageSize,
  })
  viewState.items = [...(result.items ?? [])]
  viewState.total = typeof result.total === 'number' ? result.total : result.items.length
  viewState.activeItem = result.activeItem ?? result.items[0] ?? null
 } catch (error) {
  runtimeState.error = error instanceof Error ? error.message : '资源列表加载异常，请稍后重试。'
 } finally {
  runtimeState.loading = false
 }
}

async function handleSearch() {
 viewState.page = 1
 await runQuery()
 if (isMobile.value) uiState.querySheetOpen = false
}

async function handleReset() {
 const next = Object.fromEntries(normalizedQueryFields.value.map((queryField) => [queryField.key, ''])) as Record<string, string>
 viewState.queryValues = next
 viewState.page = 1
 await runQuery()
 if (isMobile.value) uiState.querySheetOpen = false
}

function handleQueryEnter(event: KeyboardEvent) {
 const target = event.target as HTMLElement | null
 if (target?.tagName === 'TEXTAREA') return
 event.preventDefault()
 void handleSearch()
}

async function handlePageChange(value: number) {
 viewState.page = value
 await runQuery()
}

async function handlePageSizeChange(value: number) {
 viewState.pageSize = value
 viewState.page = 1
 await runQuery()
}

function handleRowClick(row: Record<string, unknown>) {
 viewState.activeItem = row
}

function openDetail(row: Record<string, unknown>) {
 viewState.activeItem = row
 uiState.detailDialogOpen = true
}

function handleSelectedRowKeysChange(value: RowSelectionKey[]) {
 viewState.selectedRowKeys = [...value]
}

function clearSelectedRows() {
 handleSelectedRowKeysChange([])
}

function scrollToTop() {
 if (typeof window === 'undefined' || typeof window.scrollTo !== 'function') return
 window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetDirty() {
 runtimeState.dirty = false
}

function handleFormMutation() {
 if (!dialogState.open || resolvedBusy.value) return
 runtimeState.dirty = true
}

function createActionPayload(key: string, scope: ResourceCrudActionScope, item?: Record<string, unknown> | null): ResourceCrudActionHandlerPayload {
 return {
  key,
  scope,
  item,
  selectedRowKeys: [...viewState.selectedRowKeys],
  selectedCount: resolvedSelectedCount.value,
  queryValues: { ...viewState.queryValues },
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
 if (key === 'detail' && item) {
  openDetail(item)
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
  namespaces: [`efs.resourceCrud.${scope}Actions`, 'efs.resourceCrud.actions', 'efs.actions', `resourceCrud.${scope}Actions`, 'resourceCrud.actions', 'actions'],
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
 dialogState.mode = 'create'
 editingSourceRow.value = null
 dialogState.open = true
 resetDirty()
 await props.controller?.handlers?.create?.()
}

async function openEdit(row: Record<string, unknown>) {
 dialogState.mode = 'edit'
 const hydratedRow = await props.controller?.handlers?.edit?.(row)
 const resolvedRow = hydratedRow && typeof hydratedRow === 'object' ? hydratedRow : row
 editingSourceRow.value = resolvedRow
 dialogState.open = true
 viewState.activeItem = resolvedRow
 resetDirty()
}

function handleDialogToggle(value: boolean) {
 dialogState.open = value
}

async function handleSave() {
 if (!props.controller?.handlers?.save) {
  closeEditorDialog()
  return
 }
 runtimeState.busy = true
 try {
  const result = await props.controller.handlers.save({
   mode: dialogState.mode,
   item: { ...editingDraft.value },
   queryValues: { ...viewState.queryValues },
   page: viewState.page,
   pageSize: viewState.pageSize,
  })
  const shouldRefresh = result?.refresh ?? Boolean(props.controller?.handlers?.query)
  const shouldClose = result?.close ?? true
  if (result?.activeItem !== undefined) {
   viewState.activeItem = result.activeItem
  }
  resetDirty()
  if (shouldRefresh) await runQuery()
  if (shouldClose) closeEditorDialog()
 } finally {
  runtimeState.busy = false
 }
}

function closeEditorDialog() {
 dialogState.open = false
}

function handleCancel() {
 closeEditorDialog()
}

function requestCancel() {
 if (!shouldDiscardDirtyChanges()) return
 handleCancel()
}

function handleClose() {
 closeEditorDialog()
}

const resolvedDiscardConfirmLabel = computed(() => resolveOptionalLabel({ key: 'discardConfirmLabel', instance, namespaces: ['efs.resourceCrud'] }) || '当前有未保存修改，确认关闭吗？')

function shouldDiscardDirtyChanges() {
 if (!resolvedDirty.value || typeof window === 'undefined' || typeof window.confirm !== 'function') return true
 return window.confirm(resolvedDiscardConfirmLabel.value)
}

function handleRequestClose() {
 if (!shouldDiscardDirtyChanges()) return
 handleClose()
}

async function handleDelete(row: Record<string, unknown>) {
 if (!props.controller?.handlers?.remove) return
 if (typeof window !== 'undefined' && typeof window.confirm === 'function' && !window.confirm(resolvedDeleteConfirmLabel.value)) return
 runtimeState.busy = true
 try {
  const result = await props.controller.handlers.remove(row)
  if (result?.activeItem !== undefined) {
   viewState.activeItem = result.activeItem
  }
  if (result?.refresh ?? Boolean(props.controller?.handlers?.query)) await runQuery()
  if (editingSourceRow.value?.[props.rowKey] === row[props.rowKey]) {
   closeEditorDialog()
  }
 } finally {
  runtimeState.busy = false
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
.efs-resourcecrudpage__table-toolbar,
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

.efs-resourcecrudpage__list-action-group--compact {
 gap: 8px;
 flex-wrap: nowrap;
}

.efs-resourcecrudpage__icon-button {
 min-width: 32px;
 padding: 0 8px;
}

.efs-resourcecrudpage__overflow-menu {
 position: relative;
}

.efs-resourcecrudpage__overflow-trigger {
 list-style: none;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 min-width: 32px;
 min-height: 32px;
 padding: 0 8px;
 border-radius: 10px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 cursor: pointer;
}

.efs-resourcecrudpage__overflow-trigger::-webkit-details-marker {
 display: none;
}

.efs-resourcecrudpage__overflow-panel {
 position: absolute;
 top: calc(100% + 8px);
 right: 0;
 z-index: 40;
 min-width: 144px;
 padding: 8px;
 border-radius: 12px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
 display: grid;
 gap: 4px;
}

.efs-resourcecrudpage__overflow-item {
 min-height: 36px;
 border: 0;
 border-radius: 10px;
 background: transparent;
 text-align: left;
 padding: 0 10px;
 cursor: pointer;
}

.efs-resourcecrudpage__overflow-item:hover {
 background: var(--efs-surface-soft, #f8fafc);
}

.efs-resourcecrudpage__overflow-item:disabled {
 opacity: 0.5;
 cursor: not-allowed;
}

.efs-resourcecrudpage__button-label {
 display: inline-flex;
 align-items: center;
 font-size: 0.86rem;
 font-weight: 600;
 line-height: 1;
}

.efs-resourcecrudpage__sr-only {
 position: absolute;
 width: 1px;
 height: 1px;
 padding: 0;
 margin: -1px;
 overflow: hidden;
 clip: rect(0, 0, 0, 0);
 white-space: nowrap;
 border: 0;
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
 display: grid;
 gap: 4px;
 min-width: 0;
}

.efs-resourcecrudpage__query-summary-title {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 font-weight: 700;
}

.efs-resourcecrudpage__query-summary-text {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.88rem;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
}

.efs-resourcecrudpage__query-summary-action {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 color: var(--efs-primary, #2563eb);
 font-weight: 700;
}

.efs-resourcecrudpage__filter-count {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 min-width: 22px;
 min-height: 22px;
 padding: 0 6px;
 border-radius: 999px;
 background: rgba(37, 99, 235, 0.12);
 font-size: 0.78rem;
}

.efs-resourcecrudpage__mobile-batch-bar {
 position: sticky;
 bottom: 16px;
 z-index: 15;
 display: none;
 gap: 12px;
 padding: 14px 16px;
 border-radius: 18px;
 background: rgba(15, 23, 42, 0.92);
 color: #fff;
 box-shadow: 0 16px 32px rgba(15, 23, 42, 0.22);
 backdrop-filter: blur(14px);
}

.efs-resourcecrudpage__mobile-batch-summary {
 display: flex;
 flex-wrap: wrap;
 align-items: center;
 justify-content: space-between;
 gap: 10px;
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
