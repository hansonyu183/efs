import type { EfsAppSchema } from '../app/app-schema.js'

export function defineAppSchema<const TSchema extends EfsAppSchema>(schema: TSchema): TSchema {
  return schema
}
