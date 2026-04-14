import type { RouteRecordRaw } from 'vue-router'
import LoginPage from './pages/LoginPage.vue'
import WorkbenchPage from './pages/WorkbenchPage.vue'
import RuntimeResPage from './pages/RuntimeResPage.vue'

const routes: RouteRecordRaw[] = [
 { path: '/', redirect: '/login' },
 { path: '/login', component: LoginPage },
 { path: '/workbench', component: WorkbenchPage },
 { path: '/:domain/:res', component: RuntimeResPage }
]

export default routes
