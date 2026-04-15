<template>
 <AuthPage
  v-if="showAuthPage"
  :app-name="props.app.appName || resolvedBrandTitle"
  :title="resolvedLoginTitle"
  :subtitle="resolvedLoginSubtitle"
  :hero-title="resolvedLoginHeroTitle"
  :hero-subtitle="resolvedLoginHeroSubtitle"
  :locale-label="resolvedLocaleLabel"
  :theme-label="resolvedThemeLabel"
  :locale-options="resolvedLocaleOptions"
  :theme-options="resolvedThemeOptions"
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
  :mobile-menu-label="resolvedMobileMenuLabel"
  :org-label="resolvedOrgLabel"
  :locale-label="resolvedLocaleLabel"
  :theme-label="resolvedThemeLabel"
  :logout-label="resolvedLogoutLabel"
  :locale-options="resolvedLocaleOptions"
  :theme-options="resolvedThemeOptions"
  :more-label="resolvedMoreLabel"
  :agent-title="resolvedAgentTitle"
  :agent-placeholder="resolvedAgentPlaceholder"
  :agent-submit-label="resolvedAgentSubmitLabel"
  :agent-sessions-label="resolvedAgentSessionsLabel"
  :agent-sessions-empty-text="resolvedAgentSessionsEmptyText"
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
import { computed, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AppController, ResCrudRuntimeOptions, ResReportRuntimeOptions } from '../controller/index'
import { flattenAppMenuNodes } from '../controller/path-helpers'
import { resolveResRuntime } from '../controller/runtime'
import type { EfsI18nConfig } from '../shared/efs-i18n'
import { EFS_I18N_CONTEXT, mergeEfsI18nConfigs, resolveEfsI18nLabel } from '../shared/efs-i18n'
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
 i18n?: EfsI18nConfig
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
const mergedI18n = computed(() => mergeEfsI18nConfigs(props.i18n, { locale: locale.value }))

provide(EFS_I18N_CONTEXT, {
 config: mergedI18n,
 translate: (key: string) => resolveEfsI18nLabel({ key, config: mergedI18n.value }),
})

const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props.app))
const runtime = computed(() => resolveResRuntime(props.app, route.path, props.runtimeOptions))
const resolvedBrandTitle = computed(() => resolveCopy('efs.brand.title', shellBrand.value.title || props.app.appName || ''))
const resolvedBrandSubtitle = computed(() => resolveCopy('efs.brand.subtitle', shellBrand.value.subtitle || ''))
const currentOrgCode = computed(() => props.app.auth.orgCode?.value || '')
const resolvedCrudSubtitle = computed(() => resolveCopy('efs.runtime.crudSubtitle', shellRuntime.value.crudSubtitle || '基于 const app = useApp() 的最小运行时资源页'))
const resolvedReportSubtitle = computed(() => resolveCopy('efs.runtime.reportSubtitle', shellRuntime.value.reportSubtitle || '基于 const app = useApp() 的最小运行时报表页'))
const resolvedUnsupportedSubtitle = computed(() => resolveCopy('efs.runtime.unsupportedSubtitle', shellRuntime.value.unsupportedSubtitle || '当前 runtime.kind 已解析，但页面壳尚未接入对应渲染分支。'))
const resolvedEmptyTitle = computed(() => resolveCopy('efs.runtime.emptyTitle', shellRuntime.value.emptyTitle || '资源不存在'))
const resolvedEmptySubtitle = computed(() => resolveCopy('efs.runtime.emptySubtitle', shellRuntime.value.emptySubtitle || '当前 path 未在 app.main.domains 中注册对应 res controller。'))
const resolvedLoginTitle = computed(() => resolveCopy('efs.auth.title', shellAuthPage.value.title || '登录到工作台'))
const resolvedLoginSubtitle = computed(() => resolveCopy('efs.auth.subtitle', shellAuthPage.value.subtitle || '请输入账号凭证继续访问当前系统。'))
const resolvedLoginHeroTitle = computed(() => resolveCopy('efs.auth.heroTitle', shellAuthPage.value.heroTitle || resolvedBrandTitle.value || props.app.appName || 'Enterprise Frontend Shell'))
const resolvedLoginHeroSubtitle = computed(() => resolveCopy('efs.auth.heroSubtitle', shellAuthPage.value.heroSubtitle || resolvedBrandSubtitle.value || '通过单一 EfsApp 入口承载认证与业务运行时。'))
const resolvedLoginNameLabel = computed(() => resolveCopy('efs.auth.nameLabel', shellAuthPage.value.nameLabel || '用户名'))
const resolvedLoginNamePlaceholder = computed(() => resolveCopy('efs.auth.namePlaceholder', shellAuthPage.value.namePlaceholder || '请输入用户名'))
const resolvedLoginPasswordLabel = computed(() => resolveCopy('efs.auth.passwordLabel', shellAuthPage.value.passwordLabel || '密码'))
const resolvedLoginPasswordPlaceholder = computed(() => resolveCopy('efs.auth.passwordPlaceholder', shellAuthPage.value.passwordPlaceholder || '请输入密码'))
const resolvedLoginOrgLabel = computed(() => resolveCopy('efs.auth.orgLabel', shellAuthPage.value.orgLabel || '组织'))
const resolvedLoginOrgPlaceholder = computed(() => resolveCopy('efs.auth.orgPlaceholder', shellAuthPage.value.orgPlaceholder || '请输入组织编码'))
const resolvedLoginSubmitLabel = computed(() => resolveCopy('efs.auth.submitLabel', shellAuthPage.value.submitLabel || '登录'))
const resolvedLoginSubmittingLabel = computed(() => resolveCopy('efs.auth.submittingLabel', shellAuthPage.value.submittingLabel || '登录中…'))
const resolvedMainTitle = computed(() => runtime.value?.title || props.title || resolvedEmptyTitle.value)
const resolvedMobileMenuLabel = computed(() => resolveCopy('efs.shell.mobileMenuLabel', '切换导航'))
const resolvedOrgLabel = computed(() => resolveCopy('efs.shell.orgLabel', '组织'))
const resolvedLocaleLabel = computed(() => resolveCopy('efs.shell.localeLabel', '语言'))
const resolvedThemeLabel = computed(() => resolveCopy('efs.shell.themeLabel', '主题'))
const resolvedLogoutLabel = computed(() => resolveCopy('efs.shell.logoutLabel', '退出登录'))
const resolvedMoreLabel = computed(() => resolveCopy('efs.shell.moreLabel', '更多'))
const resolvedAgentTitle = computed(() => resolveCopy('efs.shell.agentTitle', 'Agent'))
const resolvedAgentPlaceholder = computed(() => resolveCopy('efs.shell.agentPlaceholder', '请输入你的问题或操作指令'))
const resolvedAgentSubmitLabel = computed(() => resolveCopy('efs.shell.agentSubmitLabel', '发送'))
const resolvedAgentSessionsLabel = computed(() => resolveCopy('efs.shell.agentSessionsLabel', '会话管理'))
const resolvedAgentSessionsEmptyText = computed(() => resolveCopy('efs.shell.agentSessionsEmptyText', '暂无会话'))
const resolvedLocaleOptions = computed(() => [
 { title: resolveCopy('efs.localeOptions.zh-CN', '简体中文'), value: 'zh-CN' },
 { title: resolveCopy('efs.localeOptions.en-US', 'English'), value: 'en-US' },
])
const resolvedThemeOptions = computed(() => [
 { title: resolveCopy('efs.themeOptions.light', 'Light'), value: 'light' },
 { title: resolveCopy('efs.themeOptions.dark', 'Dark'), value: 'dark' },
])
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

function resolveCopy(key: string, fallback: string) {
 return resolveEfsI18nLabel({ key, config: mergedI18n.value }) || fallback
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
