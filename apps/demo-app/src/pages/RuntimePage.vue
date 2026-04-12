<template>
  <MainLayout
    title="运行时页面"
    app-name="EFS Demo"
    org-code="demo-org"
    :locale="locale"
    :theme="theme"
    @update:locale="locale = $event"
    @update:theme="theme = $event"
  >
    <template #sidebar>
      <DemoSidebarNav :items="demoSidebarMenus" :current-path="route.path" />
    </template>

    <PageSection title="运行时页面" subtitle="标准 runtime metadata page 展示">
      <pre>{{ JSON.stringify(rendered, null, 2) }}</pre>
    </PageSection>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../../../../packages/vue/src/components/foundation/MainLayout.vue'
import PageSection from '../../../../packages/vue/src/components/shell/PageSection.vue'
import { renderDynamicPage } from '../../../../packages/vue/src/runtime/DynamicPageRenderer.mjs'
import manifest from '../../../../examples/runtime-demo/enterprise-pages/order-runtime.page.json'
import DemoSidebarNav from '../components/DemoSidebarNav.vue'
import { demoSidebarMenus } from '../navigation'

const route = useRoute()
const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('light')
const rendered = renderDynamicPage(manifest, {
  table: { columns: [{ key: 'code', label: '编码' }, { key: 'name', label: '名称' }] },
  form: { fields: [{ key: 'code', label: '编码', required: true }, { key: 'name', label: '名称' }] },
  actions: [{ id: 'query', label: '查询', tone: 'primary' }]
})
</script>
