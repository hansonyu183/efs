import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function normalizeEfsPath(path?: string | null) {
 const normalized = `/${String(path || '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/+/g, '/')
 if (normalized === '/login') return '/login'
 const parts = normalized.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
 if (parts.length === 2) return `/${parts[0]}/${parts[1]}`
 return '/'
}

export function useEfsNavigation(options: { initialPath?: string; loginPath?: string; firstResourcePath?: string }) {
 const loginPath = options.loginPath ?? '/login'
 const currentPath = ref(resolveInitialPath(options.initialPath, loginPath))

 function syncFromLocation() {
  if (typeof window === 'undefined') return
  currentPath.value = normalizeEfsPath(window.location.pathname)
 }

 function replace(path: string) {
  const next = normalizeEfsPath(path)
  currentPath.value = next
  if (typeof window !== 'undefined') window.history.replaceState({}, '', next)
 }

 function push(path: string) {
  const next = normalizeEfsPath(path)
  if (next === currentPath.value) return
  currentPath.value = next
  if (typeof window !== 'undefined') window.history.pushState({}, '', next)
 }

 onMounted(() => {
  syncFromLocation()
  if (typeof window !== 'undefined') window.addEventListener('popstate', syncFromLocation)
 })

 onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('popstate', syncFromLocation)
 })

 const normalizedPath = computed(() => currentPath.value.replace(/^\/+|\/+$/g, ''))
 const isLoginRoute = computed(() => currentPath.value === loginPath)

 return { currentPath, normalizedPath, isLoginRoute, push, replace }
}

function resolveInitialPath(initialPath: string | undefined, loginPath: string) {
 if (typeof window !== 'undefined' && window.location?.pathname) {
  return normalizeEfsPath(window.location.pathname)
 }
 if (initialPath) return normalizeEfsPath(initialPath)
 return loginPath
}