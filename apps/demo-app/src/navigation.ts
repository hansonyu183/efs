import type { FlatMenuNode } from '../../../packages/vue/src/runtime/NavigationMenu'

export const demoSidebarMenus: FlatMenuNode[] = [
  {
    key: 'workbench',
    title: '工作台',
    path: '/workbench',
    icon: 'workbench',
    order: 10,
    parentKey: null,
    type: 'item',
  },
  {
    key: 'operations',
    title: '运营中心',
    icon: 'folder',
    order: 20,
    parentKey: null,
    type: 'group',
  },
  {
    key: 'customers',
    title: '客户列表',
    path: '/customers',
    icon: 'users',
    order: 210,
    parentKey: 'operations',
    type: 'item',
  },
  {
    key: 'runtime',
    title: '运行时元数据',
    path: '/runtime',
    icon: 'settings',
    order: 220,
    parentKey: 'operations',
    type: 'item',
  },
]
