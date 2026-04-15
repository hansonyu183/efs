import type { EfsResourceSchema } from '../resource/resource-schema.js'
import type { EfsResourceUiSchema, EfsRuntimeActionKey } from '../resource/ui-schema.js'

export type InferredResourceViewMode = 'crud' | 'report' | 'workspace' | 'custom'

export interface InferredResourceAction {
  key: string
  kind: 'operation' | 'runtime'
  placement: 'page' | 'row' | 'batch' | 'detail'
  hidden: boolean
  label?: string
  api?: string
  runtime?: EfsRuntimeActionKey
}

export interface InferredResourceRuntime {
  mode: InferredResourceViewMode
  actions: InferredResourceAction[]
}

const DEFAULT_OPERATION_ACTIONS: Array<{ key: string; placement: InferredResourceAction['placement'] }> = [
  { key: 'create', placement: 'page' },
  { key: 'update', placement: 'row' },
  { key: 'remove', placement: 'row' },
  { key: 'export', placement: 'page' },
]

const DEFAULT_RUNTIME_ACTIONS: EfsRuntimeActionKey[] = ['filter', 'refresh']

export function inferResourceRuntime(resource: EfsResourceSchema, ui?: EfsResourceUiSchema): InferredResourceRuntime {
  const mode = inferResourceViewMode(resource, ui)
  const actions: InferredResourceAction[] = []
  const actionIndex = new Map<string, number>()
  const operationKeys = Object.keys(resource.operations || {})

  for (const { key, placement } of DEFAULT_OPERATION_ACTIONS) {
    if (!operationKeys.includes(key)) {
      continue
    }
    actionIndex.set(key, actions.length)
    actions.push({
      key,
      kind: 'operation',
      placement,
      hidden: false,
      api: key,
    })
  }

  for (const runtimeKey of DEFAULT_RUNTIME_ACTIONS) {
    if (runtimeKey === 'filter' && !supportsTableRuntime(resource, mode)) {
      continue
    }
    actionIndex.set(runtimeKey, actions.length)
    actions.push({
      key: runtimeKey,
      kind: 'runtime',
      placement: 'page',
      hidden: false,
      runtime: runtimeKey,
    })
  }

  for (const [key, override] of Object.entries(ui?.actions || {})) {
    const index = actionIndex.get(key)
    if (index == null) {
      const inferred = createActionFromOverride(key, override)
      if (inferred) {
        actionIndex.set(key, actions.length)
        actions.push(inferred)
      }
      continue
    }

    const current = actions[index]
    actions[index] = {
      ...current,
      hidden: override.hidden ?? current.hidden,
      label: override.label ?? current.label,
      placement: override.placement ?? current.placement,
      api: override.api ?? current.api,
      runtime: override.runtime ?? current.runtime,
      kind: override.api ? 'operation' : override.runtime ? 'runtime' : current.kind,
    }
  }

  return { mode, actions }
}

function inferResourceViewMode(resource: EfsResourceSchema, ui?: EfsResourceUiSchema): InferredResourceViewMode {
  if (ui?.view?.mode) {
    return ui.view.mode
  }

  if (resource.operations?.create || resource.operations?.update || resource.operations?.remove || resource.operations?.list) {
    return 'crud'
  }

  if (resource.operations?.query) {
    return 'report'
  }

  return 'custom'
}

function supportsTableRuntime(resource: EfsResourceSchema, mode: InferredResourceViewMode): boolean {
  if (mode === 'crud' || mode === 'report') {
    return true
  }

  return Boolean(resource.operations?.list || resource.operations?.query)
}

function createActionFromOverride(
  key: string,
  override: NonNullable<EfsResourceUiSchema['actions']>[string],
): InferredResourceAction | null {
  if (override.api) {
    return {
      key,
      kind: 'operation',
      placement: override.placement ?? inferPlacementFromOperation(override.api),
      hidden: override.hidden ?? false,
      label: override.label,
      api: override.api,
    }
  }

  if (override.runtime) {
    return {
      key,
      kind: 'runtime',
      placement: override.placement ?? 'page',
      hidden: override.hidden ?? false,
      label: override.label,
      runtime: override.runtime,
    }
  }

  return null
}

function inferPlacementFromOperation(operation: string): InferredResourceAction['placement'] {
  const matched = DEFAULT_OPERATION_ACTIONS.find((item) => item.key === operation)
  return matched?.placement ?? 'page'
}
