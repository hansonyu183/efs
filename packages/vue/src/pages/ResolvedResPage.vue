<template>
 <section class="efs-resolvedrespage">
  <PagePanel v-if="crudRuntime" :title="crudRuntime.title" :subtitle="props.crudSubtitle">
   <EntityListView
    :row-key="crudRuntime.rowKey"
    :title="crudRuntime.title"
    :query-fields="crudRuntime.queryFields"
    :columns="crudRuntime.columns"
    :detail-fields="crudRuntime.detailFields.value"
    :page-size-options="crudRuntime.pageSizeOptions"
    :selectable-rows="crudRuntime.selectableRows"
    :form-sections="crudRuntime.formSections"
    :controller="crudRuntime.controller"
   />
  </PagePanel>

  <PagePanel v-else-if="reportRuntime" :title="reportRuntime.title" :subtitle="props.reportSubtitle">
   <ReportView
    :title="reportRuntime.title"
    :query-fields="reportRuntime.queryFields"
    :columns="reportRuntime.columns"
    :page-size-options="reportRuntime.pageSizeOptions"
    :controller="reportRuntime.controller"
   />
  </PagePanel>

  <PagePanel v-else :title="props.emptyTitle" :subtitle="props.emptySubtitle">
   <p v-if="props.path">当前路径：{{ props.path }}</p>
  </PagePanel>
 </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResRuntime } from '../controller/index'
import PagePanel from '../panels/PagePanel.vue'
import EntityListView from '../views/EntityListView.vue'
import ReportView from '../views/ReportView.vue'

defineOptions({ name: 'ResolvedResPage' })

interface ResolvedResPageProps {
 runtime?: ResRuntime | null
 path?: string
 crudSubtitle?: string
 reportSubtitle?: string
 unsupportedSubtitle?: string
 emptyTitle?: string
 emptySubtitle?: string
}

const props = withDefaults(defineProps<ResolvedResPageProps>(), {
 runtime: null,
 path: '',
 crudSubtitle: '基于 const app = useApp() 的最小运行时资源页',
 reportSubtitle: '基于 const app = useApp() 的最小运行时报表页',
 unsupportedSubtitle: '当前 runtime.kind 已解析，但页面壳尚未接入对应渲染分支。',
 emptyTitle: '资源不存在',
 emptySubtitle: '当前 path 未在 app.main.domains 中注册对应 res controller。',
})

const crudRuntime = computed(() => props.runtime?.kind === 'crud' ? props.runtime : null)
const reportRuntime = computed(() => props.runtime?.kind === 'report' ? props.runtime : null)
</script>

<style scoped>
.efs-resolvedrespage {
 display: grid;
}
</style>
