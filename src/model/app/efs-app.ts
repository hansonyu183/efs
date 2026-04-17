import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ResModel } from '../types/resource-model'
import {
  buildDefaultPathFromSchema,
  createAuthRuntime,
  createResModelResolver,
  type EfsAppSchema,
} from '../../schema/index.ts'
import { normalizeEfsPath, useEfsNavigation } from './navigation'
import { flattenAppMenuNodes, splitResPath } from './navigation-paths'
import type { EfsI18nConfig } from './i18n'
import { mergeEfsI18nConfigs, resolveEfsI18nLabel } from './i18n'
import type { FlatMenuNode } from './navigation-menu'
import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  normalizeAuthSession,
  persistAuthSession,
  resolveAuthStatus,
  type AuthStatus,
  type StoredAuthSession,
} from './auth-session'

export function useEfsAppModel(props: Readonly<EfsAppSchema>) {
  // Schema is treated as immutable app bootstrap input and is only consumed once here.
  const appI18n = props.i18n as EfsI18nConfig | undefined
  const initialLocale = computed(() => appI18n?.locale || props.app.locale || 'zh-CN')
  const initialTheme = computed<'light' | 'dark'>(() => props.app.theme === 'light' ? 'light' : 'dark')
  const locale = ref('zh-CN')
  const theme = ref<'light' | 'dark'>('dark')
  const loginName = ref('')
  const loginPwd = ref('')
  const authToken = ref<StoredAuthSession | null>(loadStoredAuthSession())
  const authBusy = ref(false)
  const authError = ref('')
  const authClock = ref(0)
  let authClockTimer: ReturnType<typeof setInterval> | null = null

  const authStatus = computed<AuthStatus>(() => {
    authClock.value
    return resolveAuthStatus(authToken.value)
  })

  const schemaAuthRuntime = createAuthRuntime(props, {
    getAccessToken: () => authToken.value?.accessToken,
  })
  const resolveSchemaResourceModel = createResModelResolver(props, {
    getAccessToken: () => authToken.value?.accessToken,
  })

  const authRuntime = {
    login: schemaAuthRuntime.login,
    logout: schemaAuthRuntime.logout,
    status: authStatus,
    token: authToken,
  }

  const mergedI18n = computed(() => mergeEfsI18nConfigs(appI18n, { locale: locale.value }))
  const resourceModelCache = new Map<string, ResModel | null>()
  const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props))
  const firstResourcePath = computed(() => {
    const defaultPath = buildDefaultPathFromSchema(props)
    if (defaultPath) return normalizeEfsPath(defaultPath)
    return sidebarMenus.value.find((item) => item.type === 'item')?.path ?? ''
  })
  const nav = useEfsNavigation({
    initialPath: authRuntime.status.value === 'authenticated'
      ? firstResourcePath.value
      : '/login',
    loginPath: '/login',
    firstResourcePath: firstResourcePath.value,
  })
  const currentPath = computed(() => nav.currentPath.value)
  const resourceModel = computed(() => resolveResourceModel(currentPath.value))
  const resolvedBrandTitle = computed(() => resolveCopy('efs.brand.title', props.app.title || props.app.name || ''))
  const resolvedBrandSubtitle = computed(() => resolveCopy('efs.brand.subtitle', ''))
  const resolvedEmptyTitle = computed(() => resolveCopy('efs.runtime.emptyTitle', '资源不存在'))
  const resolvedEmptySubtitle = computed(() => resolveCopy('efs.runtime.emptySubtitle', '当前 path 未在 app.main.domains 中注册对应资源。'))
  const resolvedLoginTitle = computed(() => resolveCopy('efs.auth.title', '登录到工作台'))
  const resolvedLoginSubtitle = computed(() => resolveCopy('efs.auth.subtitle', '请输入账号凭证继续访问当前系统。'))
  const resolvedLoginNameLabel = computed(() => resolveCopy('efs.auth.nameLabel', '用户名'))
  const resolvedLoginNamePlaceholder = computed(() => resolveCopy('efs.auth.namePlaceholder', '请输入用户名'))
  const resolvedLoginPasswordLabel = computed(() => resolveCopy('efs.auth.passwordLabel', '密码'))
  const resolvedLoginPasswordPlaceholder = computed(() => resolveCopy('efs.auth.passwordPlaceholder', '请输入密码'))
  const resolvedLoginSubmitLabel = computed(() => resolveCopy('efs.auth.submitLabel', '登录'))
  const resolvedLoginSubmittingLabel = computed(() => resolveCopy('efs.auth.submittingLabel', '登录中…'))
  const resolvedMainTitle = computed(() => resolveNavigationTitle(currentPath.value, resourceModel.value?.title || resolvedEmptyTitle.value))
  const isAuthenticated = computed(() => authRuntime.status.value === 'authenticated')
  const showAuthPage = computed(() => !isAuthenticated.value)

  watch(initialLocale, (value) => {
    locale.value = value
  }, { immediate: true })

  watch(initialTheme, (value) => {
    theme.value = value
  }, { immediate: true })

  watch(authStatus, (value) => {
    clearResourceModelCache()
    if (value !== 'expired') return
    clearStoredAuthSession()
    authToken.value = null
    authError.value = ''
  }, { immediate: true })

  watch([isAuthenticated, currentPath, firstResourcePath], ([authenticated, path, firstPath]) => {
    if (!authenticated && path !== '/login') {
      nav.replace('/login')
      return
    }

    if (authenticated && firstPath && (path === '/login' || path === '/')) {
      if (path !== firstPath) nav.replace(firstPath)
    }
  }, { immediate: true })

  onMounted(() => {
    authClock.value += 1
    authClockTimer = window.setInterval(() => {
      authClock.value += 1
    }, 60_000)
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

  function handleNavigate(path: string) {
    nav.push(path)
  }

  async function handleLogin() {
    authBusy.value = true
    authError.value = ''
    try {
      const result = await authRuntime.login({
        name: loginName.value,
        pwd: loginPwd.value,
      })
      const nextSession = normalizeAuthSession(result)
      authToken.value = nextSession
      persistAuthSession(nextSession)
      clearResourceModelCache()
      loginPwd.value = ''
      const target = firstResourcePath.value || '/'
      if (target) nav.replace(normalizeEfsPath(target))
    } catch (error) {
      authError.value = describeError(error)
    } finally {
      authBusy.value = false
    }
  }

  async function handleLogout() {
    try {
      await authRuntime.logout?.()
    } catch {
      // ignore logout transport failures; local sign-out should still succeed
    }
    clearStoredAuthSession()
    clearPersistedViewState()
    clearResourceModelCache()
    authToken.value = null
    authError.value = ''
    loginName.value = ''
    loginPwd.value = ''
    nav.replace('/login')
  }

  function resolveCopy(key: string, fallback: string) {
    return resolveEfsI18nLabel({ key, config: mergedI18n.value }) || fallback
  }

  function resolveResourceModel(path: string) {
    const normalized = normalizeEfsPath(path)
    if (!resourceModelCache.has(normalized)) {
      resourceModelCache.set(normalized, resolveSchemaResourceModel(normalized))
    }
    return resourceModelCache.get(normalized) ?? null
  }

  function resolveNavigationTitle(path: string, fallback: string) {
    const parsed = splitResPath(path)
    if (!parsed) return fallback
    return resolveCopy(`efs.resources.${parsed.domain}.${parsed.res}.title`, fallback)
  }

  function clearPersistedViewState() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return
    const keysToRemove = Object.keys(window.localStorage).filter((key) => key.startsWith('efs:view-state:'))
    for (const key of keysToRemove) window.localStorage.removeItem(key)
  }

  function clearResourceModelCache() {
    resourceModelCache.clear()
  }

  return {
    mergedI18n,
    locale,
    theme,
    loginName,
    loginPwd,
    authBusy,
    authError,
    sidebarMenus,
    currentPath,
    resourceModel,
    resolvedBrandTitle,
    resolvedBrandSubtitle,
    resolvedEmptyTitle,
    resolvedEmptySubtitle,
    resolvedLoginTitle,
    resolvedLoginSubtitle,
    resolvedLoginNameLabel,
    resolvedLoginNamePlaceholder,
    resolvedLoginPasswordLabel,
    resolvedLoginPasswordPlaceholder,
    resolvedLoginSubmitLabel,
    resolvedLoginSubmittingLabel,
    resolvedMainTitle,
    showAuthPage,
    handleLocaleUpdate,
    handleThemeUpdate,
    handleNavigate,
    handleLogin,
    handleLogout,
  }
}

function describeError(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return '登录失败，请稍后重试。'
}
