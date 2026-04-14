<template>
 <AuthPage
  v-if="showAuthPage"
  :app-name="props.app.appName || props.brandTitle"
  :title="props.loginTitle"
  :subtitle="props.loginSubtitle"
  :hero-title="props.brandTitle || props.app.appName || props.loginHeroTitle"
  :hero-subtitle="props.brandSubtitle || props.loginHeroSubtitle"
  :locale="locale"
  :theme="theme"
  layout="split"
  show-locale-switcher
  show-theme-switcher
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
 >
  <form class="efs-app__login-form" @submit.prevent="handleLogin">
   <AppField :label="props.loginNameLabel">
    <AppInput
     :model-value="props.app.auth.name.value"
     :placeholder="props.loginNamePlaceholder"
     autocomplete="username"
     @update:model-value="props.app.auth.name.value = $event"
    />
   </AppField>
   <AppField :label="props.loginPasswordLabel">
    <AppInput
     :model-value="props.app.auth.pwd.value"
     :placeholder="props.loginPasswordPlaceholder"
     type="password"
     autocomplete="current-password"
     @update:model-value="props.app.auth.pwd.value = $event"
    />
   </AppField>
   <AppField v-if="showOrgSelectField" :label="props.loginOrgLabel">
    <AppSelect
     :model-value="props.app.auth.orgCode?.value || ''"
     :options="authOrgOptions"
     @update:model-value="handleOrgCodeUpdate"
    />
   </AppField>
   <AppField v-else-if="showOrgInputField" :label="props.loginOrgLabel">
    <AppInput
     :model-value="props.app.auth.orgCode?.value || ''"
     :placeholder="props.loginOrgPlaceholder"
     @update:model-value="handleOrgCodeUpdate"
    />
   </AppField>
   <p v-if="authError" class="efs-app__auth-error">{{ authError }}</p>
   <AppButton variant="primary" type="submit" :disabled="authBusy">
    {{ authBusy ? props.loginSubmittingLabel : props.loginSubmitLabel }}
   </AppButton>
  </form>
 </AuthPage>

 <MainPage
  v-else
  :title="runtime?.title || props.emptyTitle"
  :app-name="props.app.appName || ''"
  :brand-title="props.brandTitle"
  :brand-subtitle="props.brandSubtitle"
  :org-code="props.orgCode"
  :locale="locale"
  :theme="theme"
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
  @logout="handleLogout"
 >
  <template #sidebar>
   <EfsSidebarNav :items="sidebarMenus" :current-path="route.path" />
  </template>

  <ResolvedResPage
   v-if="runtime"
   :runtime="runtime"
   :path="route.path"
   :crud-subtitle="props.crudSubtitle"
   :report-subtitle="props.reportSubtitle"
   :unsupported-subtitle="props.unsupportedSubtitle"
   :empty-title="props.emptyTitle"
   :empty-subtitle="props.emptySubtitle"
  />
  <ErrorState v-else :title="props.emptyTitle" :message="props.emptySubtitle" icon="∅" />
 </MainPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AppController, ResCrudRuntimeOptions, ResReportRuntimeOptions } from '@efs/vue/shared/AppController'
import { flattenAppMenuNodes, resolveResRuntime } from '@efs/vue/shared/AppController'
import type { FlatMenuNode } from '../../shared/NavigationMenu'
import AppButton from '../controls/AppButton.vue'
import AppField from '../controls/AppField.vue'
import AppInput from '../controls/AppInput.vue'
import AppSelect from '../controls/AppSelect.vue'
import ErrorState from '../interaction/ErrorState.vue'
import AuthPage from './AuthPage.vue'
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
 loginTitle?: string
 loginSubtitle?: string
 loginHeroTitle?: string
 loginHeroSubtitle?: string
 loginNameLabel?: string
 loginNamePlaceholder?: string
 loginPasswordLabel?: string
 loginPasswordPlaceholder?: string
 loginOrgLabel?: string
 loginOrgPlaceholder?: string
 loginSubmitLabel?: string
 loginSubmittingLabel?: string
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
 loginTitle: '登录到工作台',
 loginSubtitle: '请输入账号凭证继续访问当前系统。',
 loginHeroTitle: 'Enterprise Frontend Shell',
 loginHeroSubtitle: '通过单一 EfsApp 入口承载认证与业务运行时。',
 loginNameLabel: '用户名',
 loginNamePlaceholder: '请输入用户名',
 loginPasswordLabel: '密码',
 loginPasswordPlaceholder: '请输入密码',
 loginOrgLabel: '组织',
 loginOrgPlaceholder: '请输入组织编码',
 loginSubmitLabel: '登录',
 loginSubmittingLabel: '登录中…',
})

const emit = defineEmits<{
 (e: 'update:locale', value: string): void
 (e: 'update:theme', value: 'light' | 'dark'): void
}>()

const route = useRoute()
const router = useRouter()
const locale = ref(props.locale)
const theme = ref<'light' | 'dark'>(props.theme)

const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props.app))
const runtime = computed(() => resolveResRuntime(props.app, route.path, props.runtimeOptions))
const normalizedPath = computed(() => route.path.replace(/^\/+|\/+$/g, ''))
const isLoginRoute = computed(() => normalizedPath.value === 'login')
const isAuthenticated = computed(() => props.app.auth.authenticated?.value ?? true)
const showAuthPage = computed(() => !isAuthenticated.value || isLoginRoute.value)
const authBusy = computed(() => props.app.auth.busy?.value ?? false)
const authError = computed(() => props.app.auth.error?.value ?? '')
const authOrgOptions = computed(() => (props.app.auth.orgOptions ?? []).map((option) => ({
 title: option.title ?? option.label ?? option.value,
 value: option.value,
 disabled: option.disabled,
})))
const showOrgSelectField = computed(() => Boolean(props.app.auth.orgCode) && authOrgOptions.value.length > 0)
const showOrgInputField = computed(() => Boolean(props.app.auth.orgCode) && authOrgOptions.value.length === 0)
const firstRuntimePath = computed(() => sidebarMenus.value.find((item) => item.type === 'item')?.path ?? '')

watch(() => route.path, (value) => {
 if (!props.app.main.currentPath) return
 const normalized = value.replace(/^\/+/, '')
 props.app.main.currentPath.value = (normalized.includes('/') ? normalized : '') as never
}, { immediate: true })

watch([isAuthenticated, isLoginRoute, firstRuntimePath], async ([authenticated, loginRoute, firstPath]) => {
 if (authenticated && loginRoute && firstPath && route.path !== firstPath) {
  await router.replace(firstPath)
 }
}, { immediate: true })

function handleLocaleUpdate(value: string) {
 locale.value = value
 emit('update:locale', value)
}

function handleThemeUpdate(value: string) {
 theme.value = value === 'light' ? 'light' : 'dark'
 emit('update:theme', theme.value)
}

function handleOrgCodeUpdate(value: string) {
 if (!props.app.auth.orgCode) return
 props.app.auth.orgCode.value = value
}

async function handleLogin() {
 await props.app.auth.login()
}

async function handleLogout() {
 await props.app.auth.logout?.()
}
</script>

<style scoped>
.efs-app__login-form {
 display: grid;
 gap: 16px;
}

.efs-app__auth-error {
 margin: 0;
 color: #b91c1c;
 font-size: 0.95rem;
 line-height: 1.5;
}
</style>
