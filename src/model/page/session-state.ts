export function loadSessionState<T>(storageKey: string): T | null {
 if (typeof window === 'undefined' || !storageKey || typeof window.localStorage === 'undefined') return null
 try {
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return null
  return JSON.parse(raw) as T
 } catch {
  return null
 }
}

export function saveSessionState<T>(storageKey: string, state: T): boolean {
 if (typeof window === 'undefined' || !storageKey || typeof window.localStorage === 'undefined') return false
 try {
  window.localStorage.setItem(storageKey, JSON.stringify(state))
  return true
 } catch {
  return false
 }
}
