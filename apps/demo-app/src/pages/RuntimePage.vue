<template>
  <MainLayout title="EFS Demo" org-code="demo-org">
    <PageSection title="运行时页面" subtitle="标准 runtime metadata page 展示">
      <pre>{{ JSON.stringify(rendered, null, 2) }}</pre>
    </PageSection>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../../../../packages/vue/src/components/foundation/MainLayout.vue'
import PageSection from '../../../../packages/vue/src/components/shell/PageSection.vue'
import { renderDynamicPage } from '../../../../packages/vue/src/runtime/DynamicPageRenderer.mjs'
import manifest from '../../../../examples/runtime-demo/enterprise-pages/order-runtime.page.json'

const rendered = renderDynamicPage(manifest, {
  table: { columns: [{ key: 'code', label: '编码' }, { key: 'name', label: '名称' }] },
  form: { fields: [{ key: 'code', label: '编码', required: true }, { key: 'name', label: '名称' }] },
  actions: [{ id: 'query', label: '查询', tone: 'primary' }]
})
</script>
