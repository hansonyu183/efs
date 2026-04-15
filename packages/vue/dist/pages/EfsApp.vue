<template>
<AuthPage
 v-if="showAuthPage"
 :app-name="props.appName || resolvedBrandTitle"
 :logo-src="props.brandIcon || ''"
 :logo-alt="props.appName || resolvedBrandTitle"
  :title="resolvedLoginTitle"
  :subtitle="resolvedLoginSubtitle"
 :hero-title="resolvedLoginHeroTitle"
 :hero-subtitle="resolvedLoginHeroSubtitle"
 :locale="locale"
 :theme="theme"
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
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import type { AppController } from '../controller/index'
import { flattenAppMenuNodes } from '../controller/path-helpers'
import { resolveResRuntime } from '../controller/runtime'
import type { EfsI18nConfig } from '../shared/efs-i18n'
import { EFS_I18N_CONTEXT, mergeEfsI18nConfigs, resolveEfsI18nLabel } from '../shared/efs-i18n'
import { normalizeEfsPath, useEfsNavigation } from '../shared/navigation-runtime'
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
 appName?: string
 brandIcon?: string
 i18n?: EfsI18nConfig
}

const props = defineProps<EfsAppProps>()

const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('dark')
const mergedI18n = computed(() => mergeEfsI18nConfigs(props.i18n, { locale: locale.value }))

provide(EFS_I18N_CONTEXT, {
 config: mergedI18n,
 translate: (key: string) => resolveEfsI18nLabel({ key, config: mergedI18n.value }),
})

const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props.app))
const runtime = computed(() => resolveResRuntime(props.app, currentPath.value, {}))
const resolvedBrandTitle = computed(() => resolveCopy('efs.brand.title', props.appName || ''))
const resolvedBrandSubtitle = computed(() => resolveCopy('efs.brand.subtitle', ''))
const currentOrgCode = computed(() => props.app.auth.orgCode?.value || '')
const resolvedEmptyTitle = computed(() => resolveCopy('efs.runtime.emptyTitle', '资源不存在'))
const resolvedEmptySubtitle = computed(() => resolveCopy('efs.runtime.emptySubtitle', '当前 path 未在 app.main.domains 中注册对应 res controller。'))
const resolvedLoginTitle = computed(() => resolveCopy('efs.auth.title', '登录到工作台'))
const resolvedLoginSubtitle = computed(() => resolveCopy('efs.auth.subtitle', '请输入账号凭证继续访问当前系统。'))
const resolvedLoginHeroTitle = computed(() => resolveCopy('efs.auth.heroTitle', resolvedBrandTitle.value || props.appName || 'Enterprise Frontend Shell'))
const resolvedLoginHeroSubtitle = computed(() => resolveCopy('efs.auth.heroSubtitle', resolvedBrandSubtitle.value || '通过单一 EfsApp 入口承载认证与业务运行时。'))
const resolvedLoginNameLabel = computed(() => resolveCopy('efs.auth.nameLabel', '用户名'))
const resolvedLoginNamePlaceholder = computed(() => resolveCopy('efs.auth.namePlaceholder', '请输入用户名'))
const resolvedLoginPasswordLabel = computed(() => resolveCopy('efs.auth.passwordLabel', '密码'))
const resolvedLoginPasswordPlaceholder = computed(() => resolveCopy('efs.auth.passwordPlaceholder', '请输入密码'))
const resolvedLoginOrgLabel = computed(() => resolveCopy('efs.auth.orgLabel', '组织'))
const resolvedLoginOrgPlaceholder = computed(() => resolveCopy('efs.auth.orgPlaceholder', '请输入组织编码'))
const resolvedLoginSubmitLabel = computed(() => resolveCopy('efs.auth.submitLabel', '登录'))
const resolvedLoginSubmittingLabel = computed(() => resolveCopy('efs.auth.submittingLabel', '登录中…'))
const resolvedMainTitle = computed(() => runtime.value?.title || resolvedEmptyTitle.value)
const resolvedLocaleOptions = computed(() => [
 { title: resolveCopy('efs.localeOptions.zh-CN', '简体中文'), value: 'zh-CN' },
 { title: resolveCopy('efs.localeOptions.en-US', 'English'), value: 'en-US' },
])
const resolvedThemeOptions = computed(() => [
 { title: resolveCopy('efs.themeOptions.light', 'Light'), value: 'light' },
 { title: resolveCopy('efs.themeOptions.dark', 'Dark'), value: 'dark' },
])
const isAuthenticated = computed(() => props.app.auth.authenticated?.value ?? true)
const firstRuntimePath = computed(() => sidebarMenus.value.find((item) => item.type === 'item')?.path ?? '')
const nav = useEfsNavigation({
 initialPath: props.app.main.currentPath?.value ? `/${props.app.main.currentPath.value}` : (isAuthenticated.value ? firstRuntimePath.value : '/login'),
 loginPath: '/login',
 firstResourcePath: firstRuntimePath.value,
})
const currentPath = computed(() => nav.currentPath.value)
const normalizedPath = computed(() => nav.normalizedPath.value)
const isLoginRoute = computed(() => nav.isLoginRoute.value)
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
watch(() => currentPath.value, (value) => {
 if (!props.app.main.currentPath) return
 const normalized = value.replace(/^\/+/, '')
 props.app.main.currentPath.value = (normalized.includes('/') ? normalized : '') as never
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

function handleLocaleUpdate(value: string) {
 locale.value = value
}

function handleThemeUpdate(value: string) {
 theme.value = value === 'light' ? 'light' : 'dark'
}

function handleOrgCodeUpdate(value: string) {
 if (!props.app.auth.orgCode) return
 props.app.auth.orgCode.value = value
}

function handleNavigate(path: string) {
 nav.push(path)
}

function resolveCopy(key: string, fallback: string) {
 return resolveEfsI18nLabel({ key, config: mergedI18n.value }) || fallback
}

async function handleLogin() {
 await props.app.auth.login()
 const target = firstRuntimePath.value || '/'
 if (target) nav.replace(normalizeEfsPath(target))
}

async function handleLogout() {
 await props.app.auth.logout?.()
 nav.replace('/login')
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
