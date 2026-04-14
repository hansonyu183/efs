<template>
 <MainPage
  :title="runtime?.title || props.emptyTitle"
  :app-name="props.app.appName || ''"
  :brand-title="props.brandTitle"
  :brand-subtitle="props.brandSubtitle"
  :org-code="props.orgCode"
  :locale="locale"
  :theme="theme"
  @update:locale="locale = $event"
  @update:theme="theme = $event"
  @logout="handleLogout"
 >
  <template #sidebar>
   <EfsSidebarNav :items="sidebarMenus" :current-path="route.path" />
  </template>

  <ResolvedResPage
   :runtime="runtime"
   :path="route.path"
   :crud-subtitle="props.crudSubtitle"
   :report-subtitle="props.reportSubtitle"
   :unsupported-subtitle="props.unsupportedSubtitle"
   :empty-title="props.emptyTitle"
   :empty-subtitle="props.emptySubtitle"
  />
 </MainPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { AppController, ResCrudRuntimeOptions, ResReportRuntimeOptions } from '../../shared/AppController'
import { flattenAppMenuNodes, resolveResRuntime } from '../../shared/AppController'
import type { FlatMenuNode } from '../../shared/NavigationMenu'
import MainPage from './MainPage.vue'
import EfsSidebarNav from './EfsSidebarNav.vue'
import ResolvedResPage from './ResolvedResPage.vue'

defineOptions({ name: 'EfsApp' })

interface EfsAppProps {
 app: AppController
 brandTitle?: string
 brandSubtitle?: string
 orgCode?: string
 locale?: string
 theme?: 'light' | 'dark'
 runtimeOptions?: ResCrudRuntimeOptions & ResReportRuntimeOptions
 crudSubtitle?: string
 reportSubtitle?: string
 unsupportedSubtitle?: string
 emptyTitle?: string
 emptySubtitle?: string
}

const props = withDefaults(defineProps<EfsAppProps>(), {
 brandTitle: '',
 brandSubtitle: '',
 orgCode: '',
 locale: 'zh-CN',
 theme: 'dark',
 runtimeOptions: () => ({}),
 crudSubtitle: '基于 const app = useApp() 的最小运行时资源页',
 reportSubtitle: '基于 const app = useApp() 的最小运行时报表页',
 unsupportedSubtitle: '当前 runtime.kind 已解析，但页面壳尚未接入对应渲染分支。',
 emptyTitle: '资源不存在',
 emptySubtitle: '当前 path 未在 app.main.domains 中注册对应 res controller。',
})

const route = useRoute()
const locale = ref(props.locale)
const theme = ref<'light' | 'dark'>(props.theme)

const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props.app))
const runtime = computed(() => resolveResRuntime(props.app, route.path, props.runtimeOptions))

watch(() => route.path, (value) => {
 if (!props.app.main.currentPath) return
 const normalized = value.replace(/^\/+/, '')
 props.app.main.currentPath.value = (normalized.includes('/') ? normalized : '') as never
}, { immediate: true })

async function handleLogout() {
 await props.app.auth.logout?.()
}
</script>
