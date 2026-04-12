export function normalizeActions(actions = []) {
  return actions.map((action, index) => ({
    id: action.id || `action-${index + 1}`,
    label: action.label || action.id || `Action ${index + 1}`,
    tone: action.tone || 'secondary',
    permission: action.permission || null,
    confirm: action.confirm || null,
    hidden: Boolean(action.hidden)
  }))
}

export function ActionRenderer(actions = []) {
  return {
    kind: 'actions',
    actions: normalizeActions(actions)
  }
}
