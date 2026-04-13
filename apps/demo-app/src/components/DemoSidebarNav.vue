<template>
 <nav class="demo-sidebar-nav" aria-label="EFS demo sidebar">
  <ul class="demo-sidebar-nav__list">
   <li v-for="node in menuTree" :key="node.key" class="demo-sidebar-nav__item">
    <template v-if="node.type === 'group'">
     <div class="demo-sidebar-nav__group">
      <SemanticIcon :name="node.icon || 'folder'" size="sm" />
      <span class="demo-sidebar-nav__label">{{ node.title }}</span>
     </div>
     <DemoSidebarNav :items="node.children" :current-path="currentPath" :tree="true" />
    </template>

    <RouterLink
     v-else
     :to="node.path || '/'"
     class="demo-sidebar-nav__link efs-sidebar-link"
     :class="{
      'demo-sidebar-nav__link--active': isActive(node.path),
      'demo-sidebar-nav__link--disabled': node.disabled,
     }"
     :aria-current="isActive(node.path) ? 'page' : undefined"
    >
     <span class="efs-sidebar-link__icon" aria-hidden="true">
      <SemanticIcon :name="node.icon || 'folder'" size="sm" />
     </span>
     <span class="efs-sidebar-link__body">
      <span class="efs-sidebar-link__label">{{ node.title }}</span>
     </span>
    </RouterLink>
   </li>
  </ul>
 </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FlatMenuNode, SidebarMenuTreeNode } from '../../../../packages/vue/src/shared/NavigationMenu'
import { buildSidebarMenuTree } from '../../../../packages/vue/src/shared/NavigationMenu'
import SemanticIcon from '../../../../packages/vue/src/components/foundation/SemanticIcon.vue'

defineOptions({ name: 'DemoSidebarNav' })

type MenuInput = FlatMenuNode | SidebarMenuTreeNode

interface DemoSidebarNavProps {
 items?: MenuInput[]
 currentPath?: string
 tree?: boolean
}

const props = withDefaults(defineProps<DemoSidebarNavProps>(), {
 items: () => [],
 currentPath: '',
 tree: false,
})

const menuTree = computed<SidebarMenuTreeNode[]>(() => {
 if (props.tree) return (props.items as SidebarMenuTreeNode[]) || []
 return buildSidebarMenuTree(props.items as FlatMenuNode[])
})

function isActive(path?: string) {
 return Boolean(path && path === props.currentPath)
}
</script>

<style scoped>
.demo-sidebar-nav,
.demo-sidebar-nav__list {
 display: grid;
 gap: 6px;
}

.demo-sidebar-nav__list {
 margin: 0;
 padding: 0;
 list-style: none;
}

.demo-sidebar-nav__item {
 display: grid;
 gap: 6px;
}

.demo-sidebar-nav__group {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 padding: 6px 10px;
 color: var(--efs-text-muted, #64748b);
 font-size: 0.78rem;
 font-weight: 700;
 text-transform: uppercase;
 letter-spacing: 0.04em;
}

.demo-sidebar-nav :deep(.demo-sidebar-nav) {
 margin-left: 6px;
}

.demo-sidebar-nav__link {
 display: grid;
 grid-template-columns: 20px minmax(0, 1fr);
 align-items: center;
 gap: 10px;
 min-height: 42px;
 padding: 0 12px;
 border-radius: 12px;
 color: inherit;
 text-decoration: none;
}

.demo-sidebar-nav__link:hover,
.demo-sidebar-nav__link--active {
 background: var(--efs-surface-soft, #f4f7fb);
 color: var(--efs-primary, #2563eb);
}

.demo-sidebar-nav__link--disabled {
 opacity: 0.5;
 pointer-events: none;
}

.demo-sidebar-nav__label {
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
}
</style>
