import { computed, readonly, ref } from 'vue'

export type AppAlertTone = 'info' | 'success' | 'warning' | 'danger'

export type AppAlertItem = {
 key: string
 tone?: AppAlertTone
 title?: string
 message?: string
 closable?: boolean
}

const alertItems = ref<AppAlertItem[]>([])

function normalizeAlert(input: Omit<AppAlertItem, 'key'> & { key?: string }) {
 return {
  key: input.key ?? createAlertKey(),
  tone: input.tone ?? 'info',
  title: input.title ?? '',
  message: input.message ?? '',
  closable: input.closable !== false,
 } satisfies AppAlertItem
}

function createAlertKey() {
 return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function push(input: Omit<AppAlertItem, 'key'> & { key?: string }) {
 const next = normalizeAlert(input)
 alertItems.value = [...alertItems.value.filter((item) => item.key !== next.key), next]
 return next.key
}

function remove(key: string) {
 alertItems.value = alertItems.value.filter((item) => item.key !== key)
}

function clear() {
 alertItems.value = []
}

export function useAppAlerts() {
 return {
  items: readonly(alertItems),
  hasItems: computed(() => alertItems.value.length > 0),
  push,
  remove,
  clear,
  info(input: Omit<AppAlertItem, 'key' | 'tone'> & { key?: string }) {
   return push({ ...input, tone: 'info' })
  },
  success(input: Omit<AppAlertItem, 'key' | 'tone'> & { key?: string }) {
   return push({ ...input, tone: 'success' })
  },
  warning(input: Omit<AppAlertItem, 'key' | 'tone'> & { key?: string }) {
   return push({ ...input, tone: 'warning' })
  },
  danger(input: Omit<AppAlertItem, 'key' | 'tone'> & { key?: string }) {
   return push({ ...input, tone: 'danger' })
  },
 }
}
