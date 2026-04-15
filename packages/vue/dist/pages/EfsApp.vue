<template>
<div class="efs-app-shell" :data-theme="theme">
 <AuthPage
  v-if="showAuthPage"
  :app-name="props.appName || resolvedBrandTitle"
  :logo-src="props.brandIcon || ''"
  :logo-alt="props.appName || resolvedBrandTitle"
  :locale="locale"
  :theme="theme"
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
 >
  <template #header>
   <div class="efs-auth-layout__title">{{ resolvedLoginTitle }}</div>
   <div v-if="resolvedLoginSubtitle" class="efs-auth-layout__subtitle">{{ resolvedLoginSubtitle }}</div>
  </template>
  <form class="efs-app__login-form" @submit.prevent="handleLogin">
   <AppField :label="resolvedLoginNameLabel">
    <AppInput
     :model-value="loginName"
     :placeholder="resolvedLoginNamePlaceholder"
     autocomplete="username"
     @update:model-value="loginName = $event"
    />
   </AppField>
   <AppField :label="resolvedLoginPasswordLabel">
    <AppInput
     :model-value="loginPwd"
     :placeholder="resolvedLoginPasswordPlaceholder"
     type="password"
     autocomplete="current-password"
     @update:model-value="loginPwd = $event"
    />
   </AppField>
   <AppField v-if="showOrgSelectField" :label="resolvedLoginOrgLabel">
    <AppSelect
     :model-value="loginOrgCode"
     :options="authOrgOptions"
     :placeholder="resolvedLoginOrgPlaceholder"
     @update:model-value="handleOrgCodeUpdate"
    />
   </AppField>
   <AppField v-else-if="showOrgInputField" :label="resolvedLoginOrgLabel">
    <AppInput
     :model-value="loginOrgCode"
     :placeholder="resolvedLoginOrgPlaceholder"
     @update:model-value="handleOrgCodeUpdate"
    />
   </AppField>
   <p v-if="authError" class="efs-app__auth-error">{{ authError }}</p>
   <AppButton variant="primary" type="submit" block :disabled="authBusy">
    {{ authBusy ? resolvedLoginSubmittingLabel : resolvedLoginSubmitLabel }}
   </AppButton>
  </form>
 </AuthPage>

 <MainPage
  v-else
  :brand-icon="props.brandIcon || ''"
  :title="resolvedMainTitle"
  :app-name="props.appName || ''"
  :brand-title="resolvedBrandTitle"
  :brand-subtitle="resolvedBrandSubtitle"
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
   <EfsSidebarNav :items="sidebarMenus" :current-path="currentPath" @navigate="handleNavigate" />
  </template>

  <slot v-if="$slots.default" />
  <ResolvedResPage
   v-else-if="runtime"
   :runtime="runtime"
   :path="currentPath"
  />
  <ErrorState v-else :title="resolvedEmptyTitle" :message="resolvedEmptySubtitle" icon="∅" />
 </MainPage>
</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import type { LegacyAppController, AuthOption, ResRuntime } from '../legacy/index'
import { flattenAppMenuNodes, splitResPath } from '../legacy/path-helpers'
import { resolveResRuntime } from '../legacy/runtime'
import type { EfsI18nConfig } from '../shared/efs-i18n'
import { EFS_I18N_CONTEXT, mergeEfsI18nConfigs, resolveEfsI18nLabel } from '../shared/efs-i18n'
import { normalizeEfsPath, useEfsNavigation } from '../shared/navigation-runtime'
import type { FlatMenuNode } from '../shared/navigation-menu'
import {
 clearStoredAuthSession,
 loadStoredAuthSession,
 normalizeAuthSession,
 persistAuthSession,
 resolveAuthStatus,
 type AuthStatus,
 type StoredAuthSession,
} from '../shared/auth-session'
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
 app: LegacyAppController
 appName?: string
 brandIcon?: string
 theme?: 'light' | 'dark'
 i18n?: EfsI18nConfig
}

const props = defineProps<EfsAppProps>()

const initialLocale = computed(() => props.i18n?.locale || 'zh-CN')
const initialTheme = computed<'light' | 'dark'>(() => props.theme === 'light' ? 'light' : 'dark')
const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('dark')
const loginName = ref('')
const loginPwd = ref('')
const loginOrgCode = ref('')
const currentOrgCode = ref('')
const authOrgOptions = ref<Array<{ title: string; value: string; disabled?: boolean }>>([])
const authToken = ref<StoredAuthSession | null>(loadStoredAuthSession())
const authBusy = ref(false)
const authError = ref('')
const authClock = ref(0)
let authClockTimer: ReturnType<typeof setInterval> | null = null

const authStatus = computed<AuthStatus>(() => {
 authClock.value
 return resolveAuthStatus(authToken.value)
})

const authRuntime = {
 login: props.app.auth.login,
 logout: props.app.auth.logout,
 getOrgs: props.app.auth.getOrgs,
 getCurrentOrgCode: props.app.auth.getCurrentOrgCode,
 setCurrentOrgCode: props.app.auth.setCurrentOrgCode,
 status: authStatus,
 token: authToken,
}

const mergedI18n = computed(() => mergeEfsI18nConfigs(props.i18n, { locale: locale.value }))
const runtimeCache = new Map<string, ResRuntime | null>()

provide(EFS_I18N_CONTEXT, {
 config: mergedI18n,
 translate: (key: string) => resolveEfsI18nLabel({ key, config: mergedI18n.value }),
})

const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props.app))
const firstRuntimePath = computed(() => sidebarMenus.value.find((item) => item.type === 'item')?.path ?? '')
const nav = useEfsNavigation({
 initialPath: authRuntime.status.value === 'authenticated'
  ? (props.app.main.defaultPath ? `/${props.app.main.defaultPath}` : firstRuntimePath.value)
  : '/login',
 loginPath: '/login',
 firstResourcePath: firstRuntimePath.value,
})
const currentPath = computed(() => nav.currentPath.value)
// runtime originates from resolveResRuntime(props.app, currentPath.value, {}) and is memoized per path.
const runtime = computed(() => resolveRuntime(currentPath.value))
const resolvedBrandTitle = computed(() => resolveCopy('efs.brand.title', props.appName || ''))
const resolvedBrandSubtitle = computed(() => resolveCopy('efs.brand.subtitle', ''))
const resolvedEmptyTitle = computed(() => resolveCopy('efs.runtime.emptyTitle', '资源不存在'))
const resolvedEmptySubtitle = computed(() => resolveCopy('efs.runtime.emptySubtitle', '当前 path 未在 app.main.domains 中注册对应 res controller。'))
const resolvedLoginTitle = computed(() => resolveCopy('efs.auth.title', '登录到工作台'))
const resolvedLoginSubtitle = computed(() => resolveCopy('efs.auth.subtitle', '请输入账号凭证继续访问当前系统。'))
const resolvedLoginNameLabel = computed(() => resolveCopy('efs.auth.nameLabel', '用户名'))
const resolvedLoginNamePlaceholder = computed(() => resolveCopy('efs.auth.namePlaceholder', '请输入用户名'))
const resolvedLoginPasswordLabel = computed(() => resolveCopy('efs.auth.passwordLabel', '密码'))
const resolvedLoginPasswordPlaceholder = computed(() => resolveCopy('efs.auth.passwordPlaceholder', '请输入密码'))
const resolvedLoginOrgLabel = computed(() => resolveCopy('efs.auth.orgLabel', '组织'))
const resolvedLoginOrgPlaceholder = computed(() => resolveCopy('efs.auth.orgPlaceholder', '请输入组织编码'))
const resolvedLoginSubmitLabel = computed(() => resolveCopy('efs.auth.submitLabel', '登录'))
const resolvedLoginSubmittingLabel = computed(() => resolveCopy('efs.auth.submittingLabel', '登录中…'))
// legacy shape reference: const resolvedMainTitle = computed(() => runtime.value?.title || resolvedEmptyTitle.value)
const resolvedMainTitle = computed(() => resolveNavigationTitle(currentPath.value, runtime.value?.title || resolvedEmptyTitle.value))
const isLoginRoute = computed(() => nav.isLoginRoute.value)
const isAuthenticated = computed(() => authRuntime.status.value === 'authenticated')
const showAuthPage = computed(() => !isAuthenticated.value || isLoginRoute.value)
const supportsOrg = computed(() => Boolean(authRuntime.getOrgs || authRuntime.getCurrentOrgCode || authRuntime.setCurrentOrgCode))
const showOrgSelectField = computed(() => supportsOrg.value && authOrgOptions.value.length > 0)
const showOrgInputField = computed(() => supportsOrg.value && authOrgOptions.value.length === 0)

watch(initialLocale, (value) => {
 locale.value = value
}, { immediate: true })

watch(initialTheme, (value) => {
 theme.value = value
}, { immediate: true })

watch(authOrgOptions, (options) => {
 if (!Array.isArray(options) || options.length === 0) return
 const preferred = options.find((option) => option.value === currentOrgCode.value || option.value === loginOrgCode.value)
 const next = preferred?.value || options[0]?.value || ''
 if (!currentOrgCode.value) currentOrgCode.value = next
 if (!loginOrgCode.value) loginOrgCode.value = next
}, { immediate: true, deep: true })

watch(authStatus, (value) => {
 if (value !== 'expired') return
 clearStoredAuthSession()
 authToken.value = null
 authError.value = ''
}, { immediate: true })

watch([isAuthenticated, isLoginRoute, firstRuntimePath, currentPath], ([authenticated, loginRoute, firstPath, path]) => {
 if (!authenticated && path !== '/login') {
  nav.replace('/login')
  return
 }

 if (authenticated && firstPath && (loginRoute || path === '/')) {
  if (path !== firstPath) nav.replace(firstPath)
 }
}, { immediate: true })

onMounted(() => {
 authClock.value += 1
 authClockTimer = window.setInterval(() => {
  authClock.value += 1
 }, 60_000)
 void syncAuthContext()
})

onBeforeUnmount(() => {
 if (!authClockTimer) return
 clearInterval(authClockTimer)
 authClockTimer = null
})

function handleLocaleUpdate(value: string) {
 locale.value = value
}

function handleThemeUpdate(value: string) {
 theme.value = value === 'light' ? 'light' : 'dark'
}

async function handleOrgCodeUpdate(value: string) {
 if (showAuthPage.value) {
  loginOrgCode.value = value
  return
 }
  currentOrgCode.value = value
  if (!authRuntime.setCurrentOrgCode) return
  await authRuntime.setCurrentOrgCode(value)
}

function handleNavigate(path: string) {
 nav.push(path)
}

function resolveCopy(key: string, fallback: string) {
 return resolveEfsI18nLabel({ key, config: mergedI18n.value }) || fallback
}

function resolveRuntime(path: string) {
 const normalized = normalizeEfsPath(path)
 if (!runtimeCache.has(normalized)) {
  runtimeCache.set(normalized, resolveResRuntime(props.app, normalized, {}))
 }
 return runtimeCache.get(normalized) ?? null
}

function resolveNavigationTitle(path: string, fallback: string) {
 const parsed = splitResPath(path)
 if (!parsed) return fallback
 return resolveCopy(`efs.resources.${parsed.domain}.${parsed.res}.title`, fallback)
}

async function handleLogin() {
 authBusy.value = true
 authError.value = ''
 try {
  const result = await authRuntime.login({
   name: loginName.value,
   pwd: loginPwd.value,
   orgCode: loginOrgCode.value || undefined,
  })
  const nextSession = normalizeAuthSession(result)
  authToken.value = nextSession
  persistAuthSession(nextSession)
  loginPwd.value = ''
  if (loginOrgCode.value) currentOrgCode.value = loginOrgCode.value
  await syncAuthContext()
  const target = firstRuntimePath.value || '/'
  if (target) nav.replace(normalizeEfsPath(target))
 } catch (error) {
  authError.value = describeError(error)
 } finally {
  authBusy.value = false
 }
}

async function handleLogout() {
 await authRuntime.logout?.()
 clearStoredAuthSession()
 authToken.value = null
 authError.value = ''
 nav.replace('/login')
}

async function syncAuthContext() {
 try {
  const orgs = await authRuntime.getOrgs?.()
  const normalized = normalizeAuthOptions(orgs ?? [])
  if (normalized.length > 0) authOrgOptions.value = normalized
 } catch {
  if (authOrgOptions.value.length === 0 && isAuthenticated.value) authOrgOptions.value = []
 }
 const nextOrgCode = authRuntime.getCurrentOrgCode?.() || currentOrgCode.value || loginOrgCode.value || authOrgOptions.value[0]?.value || ''
 currentOrgCode.value = nextOrgCode
 if (!loginOrgCode.value) loginOrgCode.value = nextOrgCode
}

function normalizeAuthOptions(options: readonly AuthOption[]) {
 return options.map((option) => ({
  title: option.title ?? option.label ?? option.value,
  value: option.value,
  disabled: option.disabled,
 }))
}

function describeError(error: unknown) {
 if (error instanceof Error && error.message) return error.message
 if (typeof error === 'string' && error) return error
 return '登录失败，请稍后重试。'
}
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

.efs-app__login-form {
 display: grid;
 gap: 16px;
 width: 100%;
}

.efs-app__auth-error {
 margin: 0;
 color: var(--efs-danger);
 font-size: 0.95rem;
 line-height: 1.5;
}
</style>
