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
 'efs.crudDialog.closeLabel': '关闭',
 'efs.crudDialog.footer.dirtyLabel': '存在未保存修改',
 'efs.crudDialog.footer.submitLabel': '保存',
 'efs.crudDialog.footer.savingLabel': '保存中...',
 'efs.crudDialog.footer.cancelLabel': '取消',
 'efs.reportPanel.exportLabel': '导出',
 'efs.reportPanel.queryTitle': '查询条件',
 'efs.reportPanel.queryEmptyText': '未配置报表查询条件。',
 'efs.reportPanel.resultTitle': '结果列表',
 'efs.reportPanel.resultEmptyText': '暂无报表结果。',
 'efs.detailPanel.fieldsLabel': '字段数：',
 'efs.detailPanel.emptyText': '暂无详情字段。',
 'efs.masterDetail.masterTitle': '主列表',
 'efs.masterDetail.detailTitle': '详情',
 'efs.masterDetail.detailEmptyTitle': '请选择一条记录',
 'efs.masterDetail.detailEmptyDescription': '选中主列表记录后展示详情内容。',
 'efs.simpleTable.rowsLabel': '当前行数：',
 'efs.pagination.pageSizeLabel': '每页条数',
 'efs.pagination.summaryLabel': '页码',
 'efs.pagination.previousLabel': '上一页',
 'efs.pagination.nextLabel': '下一页',
 'efs.columnSettings.label': '列设置',
 'efs.columnSettings.resetLabel': '重置',
 'efs.columnSettings.showAllLabel': '显示全部',
 'efs.dataTable.actionsLabel': '操作',
 'efs.dataTable.selectionLabel': '选择行',
 'efs.state.loading.default.title': '正在加载数据',
 'efs.state.loading.default.message': '请稍候，系统正在准备当前资源内容。',
 'efs.state.loading.resource.title': '正在加载数据',
 'efs.state.loading.resource.message': '请稍候，资源列表正在同步。',
 'efs.state.loading.report.title': '正在加载报表',
 'efs.state.loading.report.message': '请稍候，结果正在刷新。',
 'efs.state.empty.default.title': '暂无数据',
 'efs.state.empty.default.description': '当前没有可展示内容。',
 'efs.state.empty.default.icon': '○',
 'efs.state.empty.resource.title': '暂无数据',
 'efs.state.empty.resource.description': '当前没有可展示的资源记录。',
 'efs.state.empty.resource.icon': '○',
 'efs.state.empty.report.title': '暂无结果',
 'efs.state.empty.report.description': '当前条件下没有可展示的报表结果。',
 'efs.state.empty.report.icon': '○',
 'efs.state.error.default.title': '加载失败',
 'efs.state.error.default.message': '请求未成功，请稍后重试。',
 'efs.state.error.default.icon': '!',
 'efs.state.error.resource.title': '加载失败',
 'efs.state.error.resource.icon': '!',
 'efs.state.error.report.title': '报表加载失败',
 'efs.state.error.report.icon': '!',
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
