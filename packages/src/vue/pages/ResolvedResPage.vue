<template>
 <section class="efs-resolvedrespage">
  <PagePanel v-if="crudModel">
   <EntityListView
    :key="props.path"
    :row-key="crudModel.rowKey"
    :title="crudModel.title"
    :query-fields="crudModel.queryFields"
    :columns="crudModel.columns"
    :detail-fields="crudModel.detailFields.value"
    :page-size-options="crudModel.pageSizeOptions"
    :selectable-rows="crudModel.selectableRows"
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
    :page-size-options="reportModel.pageSizeOptions"
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
import { computed, inject } from 'vue'
import type { ResModel } from '../../model/types/resource-model'
import PagePanel from '../panels/PagePanel.vue'
import EntityListView from '../views/EntityListView.vue'
import ReportView from '../views/ReportView.vue'
import { EFS_I18N_CONTEXT } from '../../model/app/i18n'

defineOptions({ name: 'ResolvedResPage' })

interface ResolvedResPageProps {
 resourceModel?: ResModel | null
 path?: string
}

const props = withDefaults(defineProps<ResolvedResPageProps>(), {
 resourceModel: null,
 path: '',
})

const i18nContext = inject(EFS_I18N_CONTEXT, null)
const crudModel = computed(() => props.resourceModel?.kind === 'crud' ? props.resourceModel : null)
const reportModel = computed(() => props.resourceModel?.kind === 'report' ? props.resourceModel : null)
const resolvedCrudSubtitle = computed(() => resolveCopy('efs.runtime.crudSubtitle', '基于平台 resource model 的最小资源页'))
const resolvedReportSubtitle = computed(() => resolveCopy('efs.runtime.reportSubtitle', '基于平台 resource model 的最小报表页'))
const resolvedEmptyTitle = computed(() => resolveCopy('efs.runtime.emptyTitle', '资源不存在'))
const resolvedEmptySubtitle = computed(() => resolveCopy('efs.runtime.emptySubtitle', '当前 path 未在 app.main.domains 中注册对应资源 view model。'))

function resolveCopy(key: string, fallback: string) {
 return i18nContext?.translate(key) || fallback
}
</script>

<style scoped>
.efs-resolvedrespage {
 display: grid;
}
</style>
