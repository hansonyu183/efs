<template>
  <MainLayout title="EFS Demo" org-code="demo-org">
    <PageSection title="工作台" subtitle="标准 Dashboard 页面">
      <DashboardCardShell title="今日任务" :value="12" subtitle="待处理">
        <p>标准卡片页已接入。</p>
      </DashboardCardShell>
    </PageSection>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../../../../packages/vue/src/components/foundation/MainLayout.vue'
import PageSection from '../../../../packages/vue/src/components/shell/PageSection.vue'
import DashboardCardShell from '../../../../packages/vue/src/components/shell/DashboardCardShell.vue'
</script>
