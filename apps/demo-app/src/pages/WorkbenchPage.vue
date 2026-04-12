<template>
  <MainLayout
    title="工作台"
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

    <PageSection title="工作台" subtitle="标准 Dashboard 页面">
      <DashboardCardShell title="今日任务" :value="12" subtitle="待处理">
        <p>标准卡片页已接入。</p>
      </DashboardCardShell>
    </PageSection>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../../../../packages/vue/src/components/foundation/MainLayout.vue'
import PageSection from '../../../../packages/vue/src/components/shell/PageSection.vue'
import DashboardCardShell from '../../../../packages/vue/src/components/shell/DashboardCardShell.vue'
import DemoSidebarNav from '../components/DemoSidebarNav.vue'
import { demoSidebarMenus } from '../navigation'

const route = useRoute()
const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('light')
</script>
