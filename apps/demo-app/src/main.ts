import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'

const router = createRouter({
 history: createWebHistory(),
 routes
})

const app = createApp(App)

const messages: Record<string, string> = {
 'columns.code': '用户编码',
 'columns.name': '用户名称',
 'columns.status': '状态',
 'columns.roleId': '角色',
 'columns.count': '人数',
 'columns.tags': '标签',
 'columns.createdAt': '创建时间',
 'fields.code': '用户编码',
 'fields.name': '用户名称',
 'fields.status': '状态',
 'fields.roleId': '角色',
 'fields.tags': '标签',
 'fields.createdAt': '创建时间',
 'resourceCrud.queryFields.code': '编码',
 'resourceCrud.queryFields.name': '名称',
 'resourceCrud.queryFields.status': '状态',
 'resourceCrud.queryFields.roleId': '角色',
 'resourceCrud.queryFields.count': '人数',
 'resourceCrud.queryFieldPlaceholders.code': '请输入用户编码',
 'resourceCrud.queryFieldPlaceholders.name': '请输入用户名称',
 'resourceCrud.queryOptions.status.all': '全部',
 'resourceCrud.queryOptions.status.enabled': '启用',
 'resourceCrud.queryOptions.status.pending': '待处理',
 'resourceCrud.queryOptions.status.disabled': '停用',
 'resourceCrud.queryOptions.roleId.admin': '管理员',
 'resourceCrud.queryOptions.roleId.operator': '运营',
 'resourceCrud.queryOptions.roleId.auditor': '审计',
 'resourceCrud.formSections.basic': '基础信息',
 'resourceCrud.formFields.code': '用户编码',
 'resourceCrud.formFields.name': '用户名称',
 'resourceCrud.formFields.status': '状态',
 'resourceCrud.formFields.roleId': '角色',
 'resourceCrud.formFields.tags': '标签',
 'resourceCrud.formFieldPlaceholders.code': '请输入用户编码',
 'resourceCrud.formFieldPlaceholders.name': '请输入用户名称',
 'resourceCrud.formFieldPlaceholders.tags': '多个标签请用逗号分隔',
 'resourceCrud.detailFields.code': '用户编码',
 'resourceCrud.detailFields.name': '用户名称',
 'resourceCrud.detailFields.status': '状态',
 'resourceCrud.detailFields.roleId': '角色',
 'resourceCrud.detailFields.tags': '标签',
 'resourceCrud.detailFields.createdAt': '创建时间',
 'resourceCrud.batchActions.export': '导出',
 'resourceCrud.batchActions.enable': '批量启用',
 'resourceCrud.rowActions.edit': '编辑',
 'resourceCrud.rowActions.delete': '删除',
}

app.config.globalProperties.$t = (key: string) => messages[key] ?? key

app.use(router).mount('#app')
