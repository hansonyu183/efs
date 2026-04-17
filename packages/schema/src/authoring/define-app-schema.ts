import type { EfsAppSchema } from '../app/app-schema.ts'

export function defineAppSchema<const TSchema extends EfsAppSchema>(schema: TSchema): TSchema {
  return schema
}
