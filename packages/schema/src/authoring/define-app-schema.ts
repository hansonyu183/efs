import type { EfsAppSchema } from '../app/app-schema'

export function defineAppSchema<const TSchema extends EfsAppSchema>(schema: TSchema): TSchema {
  return schema
}
