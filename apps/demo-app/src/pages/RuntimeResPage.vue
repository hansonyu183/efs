<template>
 <MainPage
  :title="runtime?.title || '资源页'"
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

  <ResolvedResPage :runtime="runtime" :path="route.path" />
 </MainPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import MainPage from '../../../../packages/vue/src/components/pages/MainPage.vue'
import ResolvedResPage from '../../../../packages/vue/src/components/pages/ResolvedResPage.vue'
import DemoSidebarNav from '../components/DemoSidebarNav.vue'
import { demoSidebarMenus, resolveDemoResRuntime } from '../runtime/demo-app'

const route = useRoute()
const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('light')
const runtime = computed(() => resolveDemoResRuntime(route.path))
</script>
