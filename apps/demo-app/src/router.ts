import type { RouteRecordRaw } from 'vue-router'
import LoginPage from './pages/LoginPage.vue'
import WorkbenchPage from './pages/WorkbenchPage.vue'
import CustomerListPage from './pages/CustomerListPage.vue'
import RuntimePage from './pages/RuntimePage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/workbench', component: WorkbenchPage },
  { path: '/customers', component: CustomerListPage },
  { path: '/runtime', component: RuntimePage }
]

export default routes
