export const alertLevels = ['info', 'warning', 'error']
export const actionTones = ['primary', 'secondary', 'danger']
export const statusTones = ['default', 'success', 'warning', 'error']

export function createAction(config) {
 return {
  id: config.id,
  label: config.label,
  tone: config.tone || 'secondary',
  permission: config.permission || null,
  disabled: Boolean(config.disabled),
  confirm: config.confirm || null
 }
}
