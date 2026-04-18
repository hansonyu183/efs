import { computed, ref, watch } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { requestJson } from '../../http/index.ts'
import type { ResModel } from '../types/resource-model'
import type { EfsAppSchema } from '../../schema/index.ts'
import { normalizeEfsPath, useEfsNavigation } from './navigation'
import { flattenAppMenuNodes } from './navigation-paths'
import { buildDefaultPathFromSchema } from './default-path'
import type { FlatMenuNode } from './navigation-menu'
import type { AuthLoginResult } from '../types/auth'
import { createResModelResolver } from '../resource/resolver'
import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  normalizeAuthSession,
  persistAuthSession,
  resolveAuthStatus,
  type AuthStatus,
  type StoredAuthSession,
} from './auth-session'
import { resolvePrimaryService, resolveTransportOptions } from './service-config'

export function useEfsAppModel(props: Readonly<EfsAppSchema>) {
  // Schema is treated as immutable app bootstrap input and is only consumed once here.
  const schemaI18n = props.i18n as { locale?: string } | undefined
  const initialLocale = computed(() => schemaI18n?.locale || props.app.locale || 'zh-CN')
  const initialTheme = computed<'light' | 'dark'>(() => props.app.theme === 'light' ? 'light' : 'dark')
  const locale = ref('zh-CN')
  const theme = ref<'light' | 'dark'>('dark')
  const authToken = ref<StoredAuthSession | null>(loadStoredAuthSession())
  const authClock = ref(Date.now())

  const authStatus = computed<AuthStatus>(() => {
    authClock.value
    return resolveAuthStatus(authToken.value)
  })

  const resolveSchemaResourceModel = createResModelResolver(props, {
    getAccessToken: () => authToken.value?.accessToken,
  })

  const resourceModelCache = new Map<string, ResModel | null>()
  const sidebarMenus = computed<FlatMenuNode[]>(() => flattenAppMenuNodes(props))
  const firstResourcePath = computed(() => {
    const defaultPath = buildDefaultPathFromSchema(props)
    if (defaultPath) return normalizeEfsPath(defaultPath)
    return sidebarMenus.value.find((item) => item.type === 'item')?.path ?? ''
  })
  const nav = useEfsNavigation({
    initialPath: authStatus.value === 'authenticated'
      ? firstResourcePath.value
      : '/login',
    loginPath: '/login',
    firstResourcePath: firstResourcePath.value,
  })
  const currentPath = computed(() => nav.currentPath.value)
  const resourceModel = computed(() => resolveResourceModel(currentPath.value))
  const isAuthenticated = computed(() => authStatus.value === 'authenticated')
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

  useIntervalFn(() => {
    authClock.value = Date.now()
  }, 60_000)

  function handleLocaleUpdate(value: string) {
    locale.value = value
  }

  function handleThemeUpdate(value: string) {
    theme.value = value === 'light' ? 'light' : 'dark'
  }

  function handleNavigate(path: string) {
    nav.push(path)
  }

  function handleLoginSuccess(result: AuthLoginResult) {
    const nextSession = normalizeAuthSession(result)
    authToken.value = nextSession
    persistAuthSession(nextSession)
    clearResourceModelCache()
    const target = firstResourcePath.value || '/'
    if (target) nav.replace(normalizeEfsPath(target))
  }

  async function handleLogout() {
    try {
      await requestLogout(props, authToken.value?.accessToken)
    } catch {
      // ignore logout transport failures; local sign-out should still succeed
    }
    clearStoredAuthSession()
    clearPersistedViewState()
    clearResourceModelCache()
    authToken.value = null
    nav.replace('/login')
  }

  function resolveResourceModel(path: string) {
    const normalized = normalizeEfsPath(path)
    if (!resourceModelCache.has(normalized)) {
      resourceModelCache.set(normalized, resolveSchemaResourceModel(normalized))
    }
    return resourceModelCache.get(normalized) ?? null
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
  }
}

type RuntimeLogoutSchema = NonNullable<EfsAppSchema['auth']> & {
  logout?: { path: string; method: string }
}

async function requestLogout(schema: Readonly<EfsAppSchema>, accessToken?: string) {
  const fetcher = globalThis.fetch
  if (!fetcher) return

  const auth = schema.auth as RuntimeLogoutSchema | undefined
  if (!auth?.logout) return

  const service = resolvePrimaryService(schema)
  const baseUrl = service?.baseUrl ?? ''
  const transport = resolveTransportOptions(service)
  await requestJson(fetcher, baseUrl, transport, auth.logout, {
    accessToken,
  })
}
