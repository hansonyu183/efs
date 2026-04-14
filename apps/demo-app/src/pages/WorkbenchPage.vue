<template>
 <EfsApp :app="demoApp" title="统一工作台">
  <PagePanel title="统一工作台" subtitle="把高频入口、治理能力和运行时页面统一到一个成熟业务后台中。">
   <DashboardCardPanel title="Overview 可访问页面" :value="7" subtitle="基于当前账号权限得到的工作入口数量。" />
   <DashboardCardPanel title="Overview 权限条目" :value="31" subtitle="当前会话已装载的权限条目总数。" />
   <DashboardCardPanel title="Overview 可切换组织" value="demo" subtitle="同一工作台中可直接切换的组织上下文。" />
  </PagePanel>
 </EfsApp>
</template>

<script setup lang="ts">
import EfsApp from '../../../../packages/vue/src/components/pages/EfsApp.vue'
import PagePanel from '../../../../packages/vue/src/components/panels/PagePanel.vue'
import DashboardCardPanel from '../../../../packages/vue/src/components/panels/DashboardCardPanel.vue'
import { demoApp } from '../runtime/demo-app'
</script>
