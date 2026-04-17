export { baselineSchema } from './baseline.ts'
export type { BaselineSchema } from './baseline.ts'

export { defineAppSchemaPatch, composeAppSchema } from './compose.ts'
export type { EfsAppSchema, EfsAppSchemaPatch, EfsDeepPartial } from './compose.ts'

export { createAuthRuntime, createResModelResolver, buildDefaultPathFromSchema } from './platform-app.ts'
export type {
  CreateSchemaRuntimeOptions,
  EfsAppI18nMessages,
  EfsAppI18nSchema,
  EfsServiceSchema,
  EfsServiceTransportSchema,
} from './platform-app.ts'
