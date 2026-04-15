import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import DemoRoot from './DemoRoot.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/crm/customer' },
    { path: '/:domain/:res', component: DemoRoot },
    { path: '/login', component: DemoRoot },
  ],
})

createApp(DemoRoot)
  .use(router)
  .mount('#app')
