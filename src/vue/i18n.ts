import { createI18n, useI18n } from 'vue-i18n'

export type EfsI18nMessages = {
  [key: string]: string | EfsI18nMessages
}

export interface EfsI18nConfig {
  locale?: string
  fallbackLocale?: string
  messages?: EfsI18nMessages | Record<string, EfsI18nMessages>
}

export const efsI18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {},
})

export function useGlobalEfsI18n() {
  return useI18n({ useScope: 'global' })
}

export function useT() {
  const { t } = useGlobalEfsI18n()
  return (key: string, fallback = '') => {
    const resolved = t(key)
    return typeof resolved === 'string' && resolved && resolved !== key ? resolved : fallback
  }
}

export function syncSchemaI18n(config?: EfsI18nConfig, locale?: string) {
  const global = efsI18n.global
  const fallbackLocale = config?.fallbackLocale || 'zh-CN'
  const nextLocale = locale || config?.locale || fallbackLocale
  const messages = normalizeMessages(config?.messages, nextLocale)

  for (const [localeKey, bundle] of Object.entries(messages)) {
    global.setLocaleMessage(localeKey, bundle)
  }

  global.fallbackLocale.value = fallbackLocale
  global.locale.value = nextLocale
}

function normalizeMessages(
  messages: EfsI18nConfig['messages'],
  locale: string,
): Record<string, EfsI18nMessages> {
  if (!messages) return {}
  if (isLocaleBucketMap(messages)) return messages
  return {
    [locale]: messages,
  }
}

function isLocaleBucketMap(messages: EfsI18nMessages | Record<string, EfsI18nMessages>): messages is Record<string, EfsI18nMessages> {
  const localePattern = /^[a-z]{2,3}(?:-[A-Z]{2})?$/
  return Object.keys(messages).every((key) => localePattern.test(key))
}
