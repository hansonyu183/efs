import type { ComputedRef, InjectionKey } from 'vue'

export type EfsI18nMessages = {
 [key: string]: string | EfsI18nMessages
}

export interface EfsI18nConfig {
 locale?: string
 fallbackLocale?: string
 messages?: EfsI18nMessages | Record<string, EfsI18nMessages>
}

export interface EfsI18nContext {
 config: ComputedRef<EfsI18nConfig | undefined>
 translate: (key: string) => string
}

export const EFS_I18N_CONTEXT: InjectionKey<EfsI18nContext> = Symbol('efs-i18n-context')

type ResolveMessageOptions = {
 key: string
 config?: EfsI18nConfig
}

export function mergeEfsI18nConfigs(...configs: Array<EfsI18nConfig | undefined>): EfsI18nConfig | undefined {
 const active = configs.filter(Boolean)
 if (active.length === 0) return undefined

 const merged: EfsI18nConfig = {}
 for (const config of active) {
  if (!config) continue
  if (config.locale) merged.locale = config.locale
  if (config.fallbackLocale) merged.fallbackLocale = config.fallbackLocale
  if (config.messages) {
   merged.messages = {
    ...((merged.messages as Record<string, EfsI18nMessages>) ?? {}),
    ...(config.messages as Record<string, EfsI18nMessages>),
   }
  }
 }

 return merged
}

export function resolveEfsI18nLabel({ key, config }: ResolveMessageOptions) {
 if (!config?.messages) return ''

 const candidates = resolveCandidateBundles(config)
 for (const bundle of candidates) {
  const resolved = readMessageValue(bundle, key)
  if (typeof resolved === 'string' && resolved) return resolved
 }

 return ''
}

function resolveCandidateBundles(config: EfsI18nConfig) {
 const { messages, locale, fallbackLocale } = config
 if (!messages) return []

 if (locale && isLocaleBucketMap(messages) && messages[locale]) {
  return [
   messages[locale],
   ...(fallbackLocale && fallbackLocale !== locale && messages[fallbackLocale] ? [messages[fallbackLocale]] : []),
  ]
 }

 if (fallbackLocale && isLocaleBucketMap(messages) && messages[fallbackLocale]) {
  return [messages[fallbackLocale]]
 }

 return [messages as EfsI18nMessages]
}

function isLocaleBucketMap(messages: EfsI18nMessages | Record<string, EfsI18nMessages>): messages is Record<string, EfsI18nMessages> {
 return Object.values(messages).every((value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value))
}

function readMessageValue(bundle: EfsI18nMessages, key: string): string | undefined {
 const direct = bundle[key]
 if (typeof direct === 'string') return direct

 let current: string | EfsI18nMessages | undefined = bundle
 for (const segment of key.split('.').filter(Boolean)) {
  if (!current || typeof current === 'string' || Array.isArray(current)) return undefined
  current = current[segment]
 }

 return typeof current === 'string' ? current : undefined
}