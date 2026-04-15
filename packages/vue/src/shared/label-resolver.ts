import type { ComponentInternalInstance } from 'vue'
import { EFS_I18N_CONTEXT, resolveEfsI18nLabel } from './efs-i18n'

type LabelResolverOptions = {
 key: string
 overrides?: Record<string, string>
 instance?: ComponentInternalInstance | null
 namespaces?: string[]
}

type Translator = ((key: string) => unknown) | undefined

const BUILTIN_ZH_LABELS: Record<string, string> = {
 'columns.code': '编码',
 'columns.name': '名称',
 'columns.status': '状态',
 'columns.state': '状态',
 'columns.industry': '行业',
 'columns.tags': '标签',
 'columns.type': '类型',
 'columns.category': '分类',
 'columns.createdAt': '创建时间',
 'columns.updatedAt': '更新时间',
 'fields.code': '编码',
 'fields.name': '名称',
 'fields.status': '状态',
 'fields.state': '状态',
 'fields.industry': '行业',
 'fields.tags': '标签',
 'fields.type': '类型',
 'fields.category': '分类',
 'fields.createdAt': '创建时间',
 'fields.updatedAt': '更新时间',
 'resourceCrud.actions.create': '新建',
 'resourceCrud.actions.edit': '编辑',
 'resourceCrud.actions.update': '编辑',
 'resourceCrud.actions.delete': '删除',
 'resourceCrud.actions.remove': '删除',
 'resourceCrud.actions.refresh': '刷新',
 'resourceCrud.actions.export': '导出',
 'resourceCrud.actions.enable': '启用',
 'resourceCrud.actions.disable': '停用',
 'actions.create': '新建',
 'actions.edit': '编辑',
 'actions.update': '编辑',
 'actions.delete': '删除',
 'actions.remove': '删除',
 'actions.refresh': '刷新',
 'actions.export': '导出',
 'actions.enable': '启用',
 'actions.disable': '停用',
}

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

 const builtin = resolveBuiltinLabel(key, namespaces)
 if (builtin) return builtin

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

 const builtin = resolveBuiltinLabel(key, namespaces)
 if (builtin) return builtin

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

function resolveBuiltinLabel(key: string, namespaces: string[]) {
 for (const candidate of buildCandidates(key, namespaces)) {
  if (BUILTIN_ZH_LABELS[candidate]) return BUILTIN_ZH_LABELS[candidate]
 }
 return ''
}

function fallbackKey(value: string) {
 return value.includes('.') ? value.split('.').filter(Boolean).pop() ?? value : value
}

function getTranslator(instance?: ComponentInternalInstance | null): Translator {
 const provides = (instance as { provides?: Record<PropertyKey, unknown> } | null | undefined)?.provides
 const efsI18n = provides?.[EFS_I18N_CONTEXT as symbol] as { translate?: (key: string) => string; config?: { value?: unknown } } | undefined
 if (efsI18n?.translate) {
  return (key: string) => efsI18n.translate(key)
 }

 const maybeTranslator = instance?.appContext.config.globalProperties?.$t
 if (typeof maybeTranslator === 'function') return maybeTranslator

 const config = efsI18n?.config?.value
 if (config) {
  return (key: string) => resolveEfsI18nLabel({ key, config: config as never })
 }

 return undefined
}
