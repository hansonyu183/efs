import { baselineSchema } from './baseline.ts'

type BaselineDerivedSchema = typeof baselineSchema

export type EfsAppSchema = Omit<BaselineDerivedSchema, 'app'> & {
  app: BaselineDerivedSchema['app'] & {
    name?: string
  }
}

export type EfsDeepPartial<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer U)[]
      ? readonly EfsDeepPartial<U>[]
      : T extends object
        ? { [K in keyof T]?: EfsDeepPartial<T[K]> }
        : T

export type EfsAppSchemaPatch = EfsDeepPartial<EfsAppSchema>

export function composeAppSchema(base: EfsAppSchema, patch: EfsAppSchemaPatch): EfsAppSchema {
  return mergeSchemaValue(base, patch) as EfsAppSchema
}

function mergeSchemaValue(base: unknown, patch: unknown): unknown {
  if (patch === undefined) return cloneSchemaValue(base)
  if (base === undefined) return cloneSchemaValue(patch)
  if (Array.isArray(base) && Array.isArray(patch)) return mergeSchemaArray(base, patch)
  if (isPlainObject(base) && isPlainObject(patch)) return mergeSchemaObject(base, patch)
  return cloneSchemaValue(patch)
}

function mergeSchemaArray(base: readonly unknown[], patch: readonly unknown[]) {
  if (!base.every(hasStringKey) || !patch.every(hasStringKey)) {
    return patch.map((item) => cloneSchemaValue(item))
  }

  const baseItems = base.filter(hasNonEmptyStringKey)
  const patchItems = patch.filter(hasNonEmptyStringKey)
  const merged = new Map<string, unknown>()
  for (const item of baseItems) merged.set(item.key, cloneSchemaValue(item))
  for (const item of patchItems) {
    const existing = merged.get(item.key)
    merged.set(item.key, mergeSchemaValue(existing, item))
  }
  return [...merged.values()]
}

function mergeSchemaObject(base: Record<string, unknown>, patch: Record<string, unknown>) {
  const merged: Record<string, unknown> = {}
  const keys = new Set([...Object.keys(base), ...Object.keys(patch)])
  for (const key of keys) {
    merged[key] = mergeSchemaValue(base[key], patch[key])
  }
  return merged
}

function cloneSchemaValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => cloneSchemaValue(item))
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneSchemaValue(item)]))
  }
  return value
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasStringKey(value: unknown): value is { key: string } {
  return isPlainObject(value) && typeof value.key === 'string'
}

function hasNonEmptyStringKey(value: unknown): value is { key: string } {
  return hasStringKey(value) && value.key.length > 0
}
