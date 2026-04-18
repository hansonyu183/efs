/**
 * Stable schema authoring surface for app definitions.
 * Business-side schema work should start here instead of importing runtime modules.
 */
export { baselineSchema } from './baseline.ts'
export type { BaselineSchema } from './baseline.ts'

export { composeAppSchema } from './compose.ts'
export type { EfsAppSchema, EfsAppSchemaPatch, EfsDeepPartial } from './compose.ts'
