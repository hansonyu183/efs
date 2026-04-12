<template>
  <MainLayout title="客户列表" app-name="EFS Demo" org-code="demo-org">
    <template #sidebar>
      <DemoSidebarNav :items="demoSidebarMenus" :current-path="route.path" />
    </template>

    <PageSection title="客户列表" subtitle="标准 paginated-list 页面">
      <QueryToolbarShell title="查询工具栏" />
      <EntityListTable title="客户列表" :items="items" :columns="columns" :total="items.length" />
      <Pagination :page="1" :page-size="20" :total="items.length" />
    </PageSection>
  </MainLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import MainLayout from '../../../../packages/vue/src/components/foundation/MainLayout.vue'
import PageSection from '../../../../packages/vue/src/components/shell/PageSection.vue'
import QueryToolbarShell from '../../../../packages/vue/src/components/shell/QueryToolbarShell.vue'
import EntityListTable from '../../../../packages/vue/src/components/shell/EntityListTable.vue'
import Pagination from '../../../../packages/vue/src/components/interaction/Pagination.vue'
import DemoSidebarNav from '../components/DemoSidebarNav.vue'
import { demoSidebarMenus } from '../navigation'

const route = useRoute()
const columns = [
  { key: 'code', label: '编码' },
  { key: 'name', label: '名称' }
]
const items = [
  { code: 'C001', name: '星河科技' },
  { code: 'C002', name: '远航制造' }
]
</script>
