import { ref, type Ref } from 'vue'
import { loadSessionState, saveSessionState } from './session-state'

export function useViewSessionState<TState>(
 storageKey: Ref<string> | { value: string } | string,
 options: {
  loadState: (state: TState) => void
  getState: () => TState
 },
) {
 const restoredFromSession = ref(false)
 const storageReady = ref(false)

 function resolveStorageKey() {
  return typeof storageKey === 'string' ? storageKey : storageKey.value
 }

 function hydrateSessionState() {
  const parsed = loadSessionState<TState>(resolveStorageKey())
  if (!parsed) return
  options.loadState(parsed)
  restoredFromSession.value = true
 }

 function persistSessionState() {
  saveSessionState(resolveStorageKey(), options.getState())
 }

 return {
  restoredFromSession,
  storageReady,
  hydrateSessionState,
  persistSessionState,
 }
}
