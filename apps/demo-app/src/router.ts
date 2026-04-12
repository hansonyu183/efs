import type { RouteRecordRaw } from 'vue-router'
import WorkbenchPage from './pages/WorkbenchPage.vue'
import CustomerListPage from './pages/CustomerListPage.vue'
import RuntimePage from './pages/RuntimePage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/workbench' },
  { path: '/workbench', component: WorkbenchPage },
  { path: '/customers', component: CustomerListPage },
  { path: '/runtime', component: RuntimePage }
]

export default routes
