<template>
 <section class="efs-resolvedrespage">
  <PagePanel v-if="crudRuntime">
   <EntityListView
    :key="props.path"
    :row-key="crudRuntime.rowKey"
    :title="crudRuntime.title"
    :query-fields="crudRuntime.queryFields"
    :columns="crudRuntime.columns"
    :detail-fields="crudRuntime.detailFields.value"
    :page-size-options="crudRuntime.pageSizeOptions"
    :selectable-rows="crudRuntime.selectableRows"
    :form-sections="crudRuntime.formSections"
    :controller="crudRuntime.controller"
    :storage-key="props.path"
   />
  </PagePanel>

  <PagePanel v-else-if="reportRuntime">
   <ReportView
    :key="props.path"
    :title="reportRuntime.title"
    :query-fields="reportRuntime.queryFields"
    :columns="reportRuntime.columns"
    :page-size-options="reportRuntime.pageSizeOptions"
    :controller="reportRuntime.controller"
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
import type { ResRuntime } from '../legacy/index'
import PagePanel from '../panels/PagePanel.vue'
import EntityListView from '../views/EntityListView.vue'
import ReportView from '../views/ReportView.vue'
import { EFS_I18N_CONTEXT } from '../shared/efs-i18n'

defineOptions({ name: 'ResolvedResPage' })

interface ResolvedResPageProps {
 runtime?: ResRuntime | null
 path?: string
}

const props = withDefaults(defineProps<ResolvedResPageProps>(), {
 runtime: null,
 path: '',
})

const i18nContext = inject(EFS_I18N_CONTEXT, null)
const crudRuntime = computed(() => props.runtime?.kind === 'crud' ? props.runtime : null)
const reportRuntime = computed(() => props.runtime?.kind === 'report' ? props.runtime : null)
const resolvedCrudSubtitle = computed(() => resolveCopy('efs.runtime.crudSubtitle', '基于 const app = useApp() 的最小运行时资源页'))
const resolvedReportSubtitle = computed(() => resolveCopy('efs.runtime.reportSubtitle', '基于 const app = useApp() 的最小运行时报表页'))
const resolvedEmptyTitle = computed(() => resolveCopy('efs.runtime.emptyTitle', '资源不存在'))
const resolvedEmptySubtitle = computed(() => resolveCopy('efs.runtime.emptySubtitle', '当前 path 未在 app.main.domains 中注册对应 res controller。'))

function resolveCopy(key: string, fallback: string) {
 return i18nContext?.translate(key) || fallback
}
</script>

<style scoped>
.efs-resolvedrespage {
 display: grid;
}
</style>
