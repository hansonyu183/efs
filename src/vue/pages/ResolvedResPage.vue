<template>
 <section class="efs-resolvedrespage">
  <PagePanel v-if="crudModel">
   <EntityListView
    :key="props.path"
    :row-key="crudModel.view.rowKey"
    :title="crudModel.title"
    :query-fields="crudModel.queryFields"
    :columns="crudModel.columns"
    :detail-fields="crudModel.detailFields"
    :page-size-options="crudModel.view.pageSizeOptions ?? [10, 20, 50]"
    :selectable-rows="crudModel.view.selectableRows ?? true"
    :form-sections="crudModel.formSections"
    :controller="crudModel.controller"
    :storage-key="props.path"
   />
  </PagePanel>

  <PagePanel v-else-if="reportModel">
   <ReportView
    :key="props.path"
    :title="reportModel.title"
    :query-fields="reportModel.queryFields"
    :columns="reportModel.columns"
    :summary="reportModel.summary ?? []"
    :page-size-options="reportModel.view.pageSizeOptions ?? [10, 20, 50]"
    :controller="reportModel.controller"
    :storage-key="props.path"
   />
  </PagePanel>

  <PagePanel v-else :title="resolvedEmptyTitle" :subtitle="resolvedEmptySubtitle">
   <p v-if="props.path">当前路径：{{ props.path }}</p>
  </PagePanel>
 </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResModel } from '../../model/types/resource-model'
import PagePanel from '../panels/PagePanel.vue'
import EntityListView from '../views/EntityListView.vue'
import ReportView from '../views/ReportView.vue'
import { useT } from '../i18n'

defineOptions({ name: 'ResolvedResPage' })

interface ResolvedResPageProps {
 resourceModel?: ResModel | null
 path?: string
}

const props = withDefaults(defineProps<ResolvedResPageProps>(), {
 resourceModel: null,
 path: '',
})

const t = useT()
const crudModel = computed(() => props.resourceModel?.view.kind === 'crud' ? props.resourceModel : null)
const reportModel = computed(() => props.resourceModel?.view.kind === 'report' ? props.resourceModel : null)
const resolvedEmptyTitle = computed(() => t('efs.runtime.emptyTitle', '资源不存在'))
const resolvedEmptySubtitle = computed(() => t('efs.runtime.emptySubtitle', '当前 path 未注册对应资源。'))
</script>

<style scoped>
.efs-resolvedrespage {
 display: grid;
}
</style>
