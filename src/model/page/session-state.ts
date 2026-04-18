import { useStorage } from '@vueuse/core'

export function loadSessionState<T>(storageKey: string): T | null {
 if (typeof window === 'undefined' || !storageKey || typeof window.localStorage === 'undefined') return null
 return createSessionStorageRef<T>(storageKey).value
}

export function saveSessionState<T>(storageKey: string, state: T): boolean {
 if (typeof window === 'undefined' || !storageKey || typeof window.localStorage === 'undefined') return false
 try {
  createSessionStorageRef<T>(storageKey).value = state
  return true
 } catch {
  return false
 }
}

function createSessionStorageRef<T>(storageKey: string) {
 return useStorage<T | null>(storageKey, null, undefined, {
  serializer: {
   read: (value: string) => {
    try {
     return JSON.parse(value) as T
    } catch {
     return null
    }
   },
   write: (value: T | null) => JSON.stringify(value),
  },
 })
}
