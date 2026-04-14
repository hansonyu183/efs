<template>
 <section class="efs-resolvedrespage">
  <PagePanel v-if="props.runtime && props.runtime.kind === 'crud'" :title="props.runtime.title" :subtitle="props.crudSubtitle">
   <EntityListView
    :row-key="props.runtime.rowKey"
    :title="props.runtime.title"
    :query-fields="props.runtime.queryFields"
    :columns="props.runtime.columns"
    :detail-fields="props.runtime.detailFields"
    :page-size-options="props.runtime.pageSizeOptions"
    :selectable-rows="props.runtime.selectableRows"
    :form-sections="props.runtime.formSections"
    :controller="props.runtime.controller"
   />
  </PagePanel>

  <PagePanel v-else-if="props.runtime && props.runtime.kind === 'report'" :title="props.runtime.title" :subtitle="props.reportSubtitle">
   <ReportView
    :title="props.runtime.title"
    :query-fields="props.runtime.queryFields"
    :columns="props.runtime.columns"
    :page-size-options="props.runtime.pageSizeOptions"
    :controller="props.runtime.controller"
   />
  </PagePanel>

  <PagePanel v-else-if="props.runtime" :title="props.runtime.title" :subtitle="props.unsupportedSubtitle">
   <p>当前 runtime kind：{{ props.runtime.kind }}</p>
  </PagePanel>

  <PagePanel v-else :title="props.emptyTitle" :subtitle="props.emptySubtitle">
   <p v-if="props.path">当前路径：{{ props.path }}</p>
  </PagePanel>
 </section>
</template>

<script setup lang="ts">
import type { ResRuntime } from '../../shared/AppController'
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
</script>

<style scoped>
.efs-resolvedrespage {
 display: grid;
}
</style>
