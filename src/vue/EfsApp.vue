<template>
<div class="efs-app-shell" :data-theme="theme">
 <AuthPage
  v-if="showAuthPage"
  :schema="props"
  :locale="locale"
  :theme="theme"
  @login-success="handleLoginSuccess"
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
 />

 <MainPage
  v-else
  :schema="props"
  :title="resolvedMainTitle"
  :locale="locale"
  :theme="theme"
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
  @logout="handleLogout"
 >
  <template #sidebar>
   <EfsSidebarNav :items="sidebarMenus" :current-path="currentPath" @navigate="handleNavigate" />
  </template>

  <slot v-if="$slots.default" />
  <ResolvedResPage
   v-else-if="resourceModel"
   :resource-model="resourceModel"
   :path="currentPath"
  />
  <ErrorState v-else :title="resolvedEmptyTitle" :message="resolvedEmptySubtitle" icon="∅" />
 </MainPage>
</div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { useTheme } from 'vuetify'
import { type EfsAppSchema } from '../schema/index.ts'
import { useEfsAppModel } from '../model/app/efs-app'
import { splitResPath } from '../model/app/navigation-paths'
import type { EfsI18nConfig } from './i18n'
import { syncSchemaI18n, useT } from './i18n'
import ErrorState from './feedback/ErrorState.vue'
import AuthPage from './pages/AuthPage.vue'
import MainPage from './pages/MainPage.vue'
import EfsSidebarNav from './pages/EfsSidebarNav.vue'
import ResolvedResPage from './pages/ResolvedResPage.vue'

defineOptions({ name: 'EfsApp' })

const props = defineProps({
 app: {
  type: Object as PropType<EfsAppSchema['app']>,
  required: true,
 },
 auth: {
  type: Object as PropType<EfsAppSchema['auth']>,
  required: false,
 },
 services: {
  type: Object as PropType<EfsAppSchema['services']>,
  required: false,
 },
 i18n: {
  type: Object as PropType<EfsAppSchema['i18n']>,
  required: false,
 },
 domains: {
  type: Array as PropType<EfsAppSchema['domains']>,
  required: true,
 },
}) as Readonly<EfsAppSchema>
const {
 locale,
 theme,
 sidebarMenus,
 currentPath,
 resourceModel,
 showAuthPage,
 handleLocaleUpdate,
 handleThemeUpdate,
 handleNavigate,
 handleLoginSuccess,
 handleLogout,
} = useEfsAppModel(props)

const t = useT()
const vuetifyTheme = useTheme()
const resolvedEmptyTitle = computed(() => t('efs.runtime.emptyTitle', '资源不存在'))
const resolvedEmptySubtitle = computed(() => t('efs.runtime.emptySubtitle', '当前 path 未注册对应资源。'))
const resolvedMainTitle = computed(() => {
 const parsed = splitResPath(currentPath.value)
 const fallback = resourceModel.value?.title || resolvedEmptyTitle.value
 if (!parsed) return fallback
 return t(`efs.resources.${parsed.domain}.${parsed.res}.title`, fallback)
})

watchEffect(() => {
 syncSchemaI18n(props.i18n as EfsI18nConfig | undefined, locale.value)
})

watchEffect(() => {
 vuetifyTheme.global.name.value = theme.value === 'light' ? 'efsLight' : 'efsDark'
})
</script>

<style scoped>
.efs-app-shell {
 --efs-surface-soft: #f4f7fb;
 --efs-surface: #ffffff;
 --efs-border: #dbe3ef;
 --efs-text: #172033;
 --efs-text-muted: #64748b;
 --efs-primary: #2563eb;
 --efs-danger: #dc2626;
 --efs-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
 color: var(--efs-text);
 background: var(--efs-surface-soft);
 min-height: 100vh;
 min-height: 100dvh;
}

.efs-app-shell[data-theme='dark'] {
 --efs-surface-soft: #0f172a;
 --efs-surface: #111827;
 --efs-border: #334155;
 --efs-text: #e5eefb;
 --efs-text-muted: #94a3b8;
 --efs-primary: #60a5fa;
 --efs-danger: #f87171;
 --efs-shadow: 0 22px 50px rgba(2, 6, 23, 0.45);
 background: var(--efs-surface-soft);
}

.efs-app-shell :deep(*),
.efs-app-shell :deep(*::before),
.efs-app-shell :deep(*::after) {
 box-sizing: border-box;
}

</style>
