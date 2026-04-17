import { unref, type Ref } from 'vue'
import { applyControllerStatePatch } from './controller-state'

export function useControllerStateSync<TController extends { state?: Record<string, unknown> } | undefined>(
 controller: TController | Ref<TController>,
 getPatch: () => Record<string, unknown>,
) {
 function syncViewStateToController() {
  applyControllerStatePatch(unref(controller), getPatch())
 }

 return { syncViewStateToController }
}
