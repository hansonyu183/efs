import { baselineSchema, composeAppSchema } from '@efs/schema/index.ts'
import { appPatch } from './patch'

export const appSchema = composeAppSchema(baselineSchema, appPatch)
