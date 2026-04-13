import type { ComponentInternalInstance } from 'vue'

type LabelResolverOptions = {
 key: string
 overrides?: Record<string, string>
 instance?: ComponentInternalInstance | null
 namespaces?: string[]
}

type Translator = ((key: string) => unknown) | undefined

export function resolveLabel({ key, overrides = {}, instance, namespaces = ['columns', 'fields'] }: LabelResolverOptions) {
 if (overrides[key]) return overrides[key]

 const translator = getTranslator(instance)
 if (translator) {
  for (const candidate of buildCandidates(key, namespaces)) {
   const translated = translator(candidate)
   if (typeof translated === 'string' && translated && translated !== candidate) {
    return translated
   }
  }
 }

 return humanizeKey(fallbackKey(key))
}

export function resolveOptionalLabel({ key, overrides = {}, instance, namespaces = ['columns', 'fields'] }: LabelResolverOptions) {
 if (overrides[key]) return overrides[key]

 const translator = getTranslator(instance)
 if (translator) {
  for (const candidate of buildCandidates(key, namespaces)) {
   const translated = translator(candidate)
   if (typeof translated === 'string' && translated && translated !== candidate) {
    return translated
   }
  }
 }

 return ''
}

export function humanizeKey(key: string) {
 return key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/^./, (char) => char.toUpperCase())
}

function buildCandidates(key: string, namespaces: string[]) {
 return [
  ...namespaces.map((namespace) => `${namespace}.${key}`),
  key,
 ]
}

function fallbackKey(value: string) {
 return value.includes('.') ? value.split('.').filter(Boolean).pop() ?? value : value
}

function getTranslator(instance?: ComponentInternalInstance | null): Translator {
 const maybeTranslator = instance?.appContext.config.globalProperties?.$t
 return typeof maybeTranslator === 'function' ? maybeTranslator : undefined
}
