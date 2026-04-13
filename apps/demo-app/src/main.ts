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
 'columns.code': '客户编码',
 'columns.name': '客户名称',
 'columns.status': '状态',
 'columns.industry': '行业',
 'columns.tags': '标签',
 'fields.code': '客户编码',
 'fields.name': '客户名称',
 'fields.status': '状态',
 'fields.industry': '行业',
 'fields.tags': '标签',
}

app.config.globalProperties.$t = (key: string) => messages[key] ?? key

app.use(router).mount('#app')
