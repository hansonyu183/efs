<template>
 <AuthPage
  v-if="showAuthPage"
  :app-name="props.app.appName || resolvedBrandTitle"
  :title="resolvedLoginTitle"
  :subtitle="resolvedLoginSubtitle"
  :hero-title="resolvedLoginHeroTitle"
  :hero-subtitle="resolvedLoginHeroSubtitle"
  :locale="locale"
  :theme="theme"
  layout="split"
  show-locale-switcher
  show-theme-switcher
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
 >
  <form class="efs-app__login-form" @submit.prevent="handleLogin">
   <AppField :label="resolvedLoginNameLabel">
    <AppInput
     :model-value="props.app.auth.name.value"
     :placeholder="resolvedLoginNamePlaceholder"
     autocomplete="username"
     @update:model-value="props.app.auth.name.value = $event"
    />
   </AppField>
   <AppField :label="resolvedLoginPasswordLabel">
    <AppInput
     :model-value="props.app.auth.pwd.value"
     :placeholder="resolvedLoginPasswordPlaceholder"
     type="password"
     autocomplete="current-password"
     @update:model-value="props.app.auth.pwd.value = $event"
    />
   </AppField>
   <AppField v-if="showOrgSelectField" :label="resolvedLoginOrgLabel">
    <AppSelect
     :model-value="props.app.auth.orgCode?.value || ''"
     :options="authOrgOptions"
     @update:model-value="handleOrgCodeUpdate"
    />
   </AppField>
   <AppField v-else-if="showOrgInputField" :label="resolvedLoginOrgLabel">
    <AppInput
     :model-value="props.app.auth.orgCode?.value || ''"
     :placeholder="resolvedLoginOrgPlaceholder"
     @update:model-value="handleOrgCodeUpdate"
    />
   </AppField>
   <p v-if="authError" class="efs-app__auth-error">{{ authError }}</p>
   <AppButton variant="primary" type="submit" :disabled="authBusy">
    {{ authBusy ? resolvedLoginSubmittingLabel : resolvedLoginSubmitLabel }}
   </AppButton>
  </form>
 </AuthPage>

 <MainPage
  v-else
  :title="resolvedMainTitle"
  :app-name="props.app.appName || ''"
  :brand-title="resolvedBrandTitle"
  :brand-subtitle="resolvedBrandSubtitle"
  :org-code="currentOrgCode"
  :current-org-code="currentOrgCode"
  :org-options="authOrgOptions"
  :locale="locale"
  :theme="theme"
  @update:org="handleOrgCodeUpdate"
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
  @logout="handleLogout"
 >
  <template #sidebar>
   <EfsSidebarNav :items="sidebarMenus" :current-path="route.path" />
  </template>

  <slot v-if="$slots.default" />
  <ResolvedResPage
   v-else-if="runtime"
   :runtime="runtime"
   :path="route.path"
   :crud-subtitle="resolvedCrudSubtitle"
   :report-subtitle="resolvedReportSubtitle"
   :unsupported-subtitle="resolvedUnsupportedSubtitle"
   :empty-title="resolvedEmptyTitle"
   :empty-subtitle="resolvedEmptySubtitle"
  />
  <ErrorState v-else :title="resolvedEmptyTitle" :message="resolvedEmptySubtitle" icon="∅" />
 </MainPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AppController, ResCrudRuntimeOptions, ResReportRuntimeOptions } from '../controller/index'
import { flattenAppMenuNodes } from '../controller/path-helpers'
import { resolveResRuntime } from '../controller/runtime'
import type { FlatMenuNode } from '../shared/navigation-menu'
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
 title?: string
 locale?: string
 theme?: 'light' | 'dark'
 runtimeOptions?: ResCrudRuntimeOptions & ResReportRuntimeOptions
}

const props = withDefaults(defineProps<EfsAppProps>(), {
 title: '',
  runtimeOptions: () => ({}),
})

const emit = defineEmits<{
 (e: 'update:locale', value: string): void
 (e: 'update:theme', value: 'light' | 'dark'): void
}>()

const route = useRoute()
const router = useRouter()
const shell = computed(() => props.app.shell ?? {})
const shellBrand = computed(() => shell.value.brand ?? {})
const shellAuthPage = computed(() => shell.value.authPage ?? {})
const shellRuntime = computed(() => shell.value.runtime ?? {})
const locale = ref(props.locale || shell.value.locale || 'zh-CN')
const theme = ref<'light' | 'dark'>(props.theme || shell.value.theme || 'dark')

const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props.app))
const runtime = computed(() => resolveResRuntime(props.app, route.path, props.runtimeOptions))
const resolvedBrandTitle = computed(() => shellBrand.value.title || props.app.appName || '')
const resolvedBrandSubtitle = computed(() => shellBrand.value.subtitle || '')
const currentOrgCode = computed(() => props.app.auth.orgCode?.value || '')
const resolvedCrudSubtitle = computed(() => shellRuntime.value.crudSubtitle || '基于 const app = useApp() 的最小运行时资源页')
const resolvedReportSubtitle = computed(() => shellRuntime.value.reportSubtitle || '基于 const app = useApp() 的最小运行时报表页')
const resolvedUnsupportedSubtitle = computed(() => shellRuntime.value.unsupportedSubtitle || '当前 runtime.kind 已解析，但页面壳尚未接入对应渲染分支。')
const resolvedEmptyTitle = computed(() => shellRuntime.value.emptyTitle || '资源不存在')
const resolvedEmptySubtitle = computed(() => shellRuntime.value.emptySubtitle || '当前 path 未在 app.main.domains 中注册对应 res controller。')
const resolvedLoginTitle = computed(() => shellAuthPage.value.title || '登录到工作台')
const resolvedLoginSubtitle = computed(() => shellAuthPage.value.subtitle || '请输入账号凭证继续访问当前系统。')
const resolvedLoginHeroTitle = computed(() => shellAuthPage.value.heroTitle || resolvedBrandTitle.value || props.app.appName || 'Enterprise Frontend Shell')
const resolvedLoginHeroSubtitle = computed(() => shellAuthPage.value.heroSubtitle || resolvedBrandSubtitle.value || '通过单一 EfsApp 入口承载认证与业务运行时。')
const resolvedLoginNameLabel = computed(() => shellAuthPage.value.nameLabel || '用户名')
const resolvedLoginNamePlaceholder = computed(() => shellAuthPage.value.namePlaceholder || '请输入用户名')
const resolvedLoginPasswordLabel = computed(() => shellAuthPage.value.passwordLabel || '密码')
const resolvedLoginPasswordPlaceholder = computed(() => shellAuthPage.value.passwordPlaceholder || '请输入密码')
const resolvedLoginOrgLabel = computed(() => shellAuthPage.value.orgLabel || '组织')
const resolvedLoginOrgPlaceholder = computed(() => shellAuthPage.value.orgPlaceholder || '请输入组织编码')
const resolvedLoginSubmitLabel = computed(() => shellAuthPage.value.submitLabel || '登录')
const resolvedLoginSubmittingLabel = computed(() => shellAuthPage.value.submittingLabel || '登录中…')
const resolvedMainTitle = computed(() => runtime.value?.title || props.title || resolvedEmptyTitle.value)
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
